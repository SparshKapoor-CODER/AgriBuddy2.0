import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scipy.spatial import cKDTree
from dotenv import load_dotenv
from groq import Groq
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AgriBuddy AI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

# Load encoders and scaler
le_crop = joblib.load(os.path.join(MODEL_DIR, "le_crop.pkl"))
le_season = joblib.load(os.path.join(MODEL_DIR, "le_season.pkl"))
le_state = joblib.load(os.path.join(MODEL_DIR, "le_state.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))

# Load Random Forest model
rf_model = joblib.load(os.path.join(MODEL_DIR, "yield_model_median_rf.pkl"))
logger.info(f"Random Forest expects {rf_model.n_features_in_} features")

# Load geo lookup (created by 05_geo_lookup_prep.ipynb)
geo_lookup = joblib.load(os.path.join(BASE_DIR, "geo_lookup.pkl"))
geo_tree = geo_lookup["tree"]
geo_climate = geo_lookup["values_climate"]   # shape (n, 2): [avg_rainfall_mm, soil_ph]
geo_npk = geo_lookup["values_NPK"]           # shape (n, 3): [Nitrogen, Phosphorous, Potassium]

# Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
else:
    groq_client = None
    logger.warning("GROQ_API_KEY not set – chatbot will not work.")

class SoilRequest(BaseModel):
    lat: float
    lon: float

class PredictionRequest(BaseModel):
    crop: str
    season: str
    state: str
    lat: float
    lon: float
    fertilizer: float
    pesticide: float
    # The following fields are kept for compatibility but will be overridden by geo lookup
    nitrogen: float = None   # optional, ignored
    phosphorus: float = None
    potassium: float = None
    soil_ph: float = None

class ChatRequest(BaseModel):
    message: str
    context: dict

def robust_encode(encoder, value, name="unknown"):
    cleaned = value.strip().upper()
    try:
        return encoder.transform([cleaned])[0]
    except ValueError:
        pass
    classes = encoder.classes_
    for i, cls in enumerate(classes):
        if cls.strip().upper() == cleaned:
            logger.warning(f"Case‑insensitive match for {name}: '{value}' -> '{cls}'")
            return i
    logger.warning(f"Value '{value}' not found in {name}, using first class {classes[0]}")
    return 0

def get_season_dummies(season_enc):
    """
    Map season label to 3 one‑hot dummies.
    The training used: Kharif → [1,0,0], Rabi → [0,1,0], Summer → [0,0,1],
    Autumn and others → [0,0,0].
    (Assumes season_enc values correspond to: 1=Kharif, 2=Rabi, 3=Summer)
    """
    dummies = [0, 0, 0]
    if season_enc == 1:   # Kharif
        dummies = [1, 0, 0]
    elif season_enc == 2: # Rabi
        dummies = [0, 1, 0]
    elif season_enc == 3: # Summer
        dummies = [0, 0, 1]
    # Autumn and others remain [0,0,0]
    return dummies

def prepare_features(crop, season, state, fertilizer, pesticide, nitrogen, phosphorus, potassium, soil_ph, area_ha=1.0):
    # 1. Encode categoricals
    crop_enc = robust_encode(le_crop, crop, "crop")
    season_enc = robust_encode(le_season, season, "season")
    state_enc = robust_encode(le_state, state, "state")

    # 2. Season dummies (3 features)
    season_dummies = get_season_dummies(season_enc)

    # 3. Numerical features (7 features)
    fertilizer_per_ha = fertilizer / area_ha
    pesticide_per_ha = pesticide / area_ha
    log_area = np.log1p(area_ha)
    num_raw = np.array([fertilizer_per_ha, pesticide_per_ha, log_area,
                        nitrogen, phosphorus, potassium, soil_ph]).reshape(1, -1)
    num_scaled = scaler.transform(num_raw).flatten()

    # 4. Combine: crop_enc, season_enc, state_enc, 3 dummies, 7 numericals → total 13
    features = np.concatenate([
        [crop_enc, season_enc, state_enc],
        season_dummies,
        num_scaled
    ])
    return features.reshape(1, -1)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/get-soil-by-latlon")
async def get_soil_by_latlon(req: SoilRequest):
    try:
        dist, idx = geo_tree.query([[req.lon, req.lat]])
        rainfall, ph = geo_climate[idx[0]]
        return {"source": "GEE grid", "avg_rainfall_mm": float(rainfall), "soil_ph": float(ph)}
    except Exception as e:
        logger.error(f"Geo lookup failed: {e}")
        raise HTTPException(status_code=500, detail="Geo lookup error")

@app.post("/predict")
async def predict_yield(req: PredictionRequest):
    try:
        # Find nearest GEE point
        dist, idx = geo_tree.query([[req.lon, req.lat]])
        # Get NPK and soil pH from the lookup (override user inputs)
        rainfall, soil_ph = geo_climate[idx[0]]
        nitrogen, phosphorus, potassium = geo_npk[idx[0]]
        
        logger.info(f"Using geo values: pH={soil_ph:.2f}, N={nitrogen:.2f}, P={phosphorus:.2f}, K={potassium:.2f}")
        
        X = prepare_features(
            crop=req.crop, season=req.season, state=req.state,
            fertilizer=req.fertilizer, pesticide=req.pesticide,
            nitrogen=float(nitrogen),
            phosphorus=float(phosphorus),
            potassium=float(potassium),
            soil_ph=float(soil_ph)
        )
        median = float(rf_model.predict(X)[0])
        # Yield range as ±2 tons/ha
        lower = max(0, median - 2.0)
        upper = median + 2.0
        return {
            "status": "success",
            "prediction": {
                "min_yield": round(lower, 2),
                "median_yield": round(median, 2),
                "max_yield": round(upper, 2),
                "unit": "tons/hectare"
            },
            "soil_data": {   # optional: return the actual values used
                "soil_ph": float(soil_ph),
                "nitrogen": float(nitrogen),
                "phosphorus": float(phosphorus),
                "potassium": float(potassium),
                "avg_rainfall_mm": float(rainfall)
            }
        }
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(req: ChatRequest):
    if not groq_client:
        raise HTTPException(status_code=503, detail="Chatbot not configured")
    try:
        system_prompt = f"""You are an agricultural expert assistant. The farmer currently has:
- Crop: {req.context.get('crop', 'unknown')}
- State: {req.context.get('state', 'unknown')}
- Predicted yield range: {req.context.get('yield_min', 0)} – {req.context.get('yield_max', 0)} tons/ha
- Soil pH: {req.context.get('soil_ph', 0):.1f}
- Average annual rainfall: {req.context.get('rainfall', 0):.0f} mm

Provide concise, practical advice tailored to these conditions. Answer in 2‑3 sentences.
"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.message}
        ]
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=256
        )
        answer = response.choices[0].message.content
        return {"response": answer}
    except Exception as e:
        logger.error(f"Groq error: {e}")
        raise HTTPException(status_code=500, detail="Chatbot error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
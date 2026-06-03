import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AgriTwin AI Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION & PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

# --- LOAD ARTIFACTS ---
try:
    model = joblib.load(os.path.join(MODEL_DIR, "yield_model.pkl"))
    le_crop = joblib.load(os.path.join(MODEL_DIR, "le_crop.pkl"))
    le_state = joblib.load(os.path.join(MODEL_DIR, "le_state.pkl"))
    le_season = joblib.load(os.path.join(MODEL_DIR, "le_season.pkl"))
    
    # Load Datasets for Smart Defaults
    # 1. High-resolution District data
    district_soil_df = pd.read_csv(os.path.join(DATA_DIR, "district_soil_lookup.csv"))
    # 2. Training data to calculate State-wise means
    state_training_df = pd.read_csv(os.path.join(DATA_DIR, "final_training_data.csv"))
    
    # Pre-calculate state means for faster lookup
    state_means = state_training_df.groupby('State')[['Nitrogen', 'Phosphorus', 'Potassium', 'Soil Ph']].mean().to_dict('index')
    
    print("✅ All models and datasets loaded successfully.")
except Exception as e:
    print(f"❌ Error during initialization: {e}")

# --- DATA MODELS ---
class SoilRequest(BaseModel):
    district: str
    state: str

class PredictionRequest(BaseModel):
    state: str
    season: str
    crop: str
    n: float
    p: float
    k: float
    ph: float
    fertilizer: float
    pesticide: float
    rainfall: float

# --- ENDPOINTS ---

@app.post("/get-soil-defaults")
async def get_soil_defaults(req: SoilRequest):
    """
    Logic: District Lookup -> State Mean Fallback -> National Default
    """
    d_name = req.district.strip().lower()
    s_name = req.state.strip().lower()

    # 1. Try District Match
    dist_match = district_soil_df[district_soil_df['district_name'].str.lower() == d_name]
    if not dist_match.empty:
        return {
            "source": "district_name",
            "n": float(dist_match.iloc[0]['Nitrogen']),
            "p": float(dist_match.iloc[0]['Phosphorus']),
            "k": float(dist_match.iloc[0]['Potassium']),
            "ph": float(dist_match.iloc[0]['Soil Ph'])
        }

    # 2. Try State Mean Fallback
    # Note: Using fuzzy match or direct lookup based on your training data keys
    for state_key in state_means.keys():
        if state_key.lower() == s_name:
            means = state_means[state_key]
            return {
                "source": "state_average",
                "n": round(means['Nitrogen'], 2),
                "p": round(means['Phosphorus'], 2),
                "k": round(means['Potassium'], 2),
                "ph": round(means['Soil Ph'], 2)
            }

    # 3. Ultimate Fallback
    return {
        "source": "default",
        "n": 50.0, "p": 50.0, "k": 50.0, "ph": 7.0
    }

@app.post("/predict")
async def predict_yield(req: PredictionRequest):
    try:
        # 1. Standardize Inputs: Trim spaces and force Uppercase
        # If 'Kharif' has 5 spaces in your model, we MUST add them back 
        # OR fix the model (see step 2). For now, let's fix the strings:
        
        def clean_param(val):
            return str(val).strip().upper()

        state_input = clean_param(req.state)  # "PUNJAB"
        crop_input = clean_param(req.crop).capitalize() # "Rice" (if model uses First-Letter caps)
        season_input = clean_param(req.season).capitalize() # "KHARIF"

        # 2. Handling the "5 Spaces" Issue
        # If your LabelEncoder literally expects "KHARIF     ", 
        # you have to append those spaces manually:
        if season_input in ["Kharif", "Rabi", "Summer"]:
            season_input = season_input.ljust(len(season_input) + 5)

        try:
            encoded_state = le_state.transform([state_input])[0]
            encoded_crop = le_crop.transform([crop_input])[0]
            encoded_season = le_season.transform([season_input])[0]
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=f"Category not recognized: {str(ve)}")

        CURRENT_YEAR = 2024 

        features = np.array([[
            encoded_crop,      # Cropokay 
            encoded_season,    # Season
            encoded_state,     # State
            req.rainfall,      # Annual_Rainfall
            req.fertilizer,    # Fertilizer
            req.pesticide,     # Pesticide
            req.n,             # Nitrogen
            req.p,             # Phosphorus
            req.k,             # Potassium
            req.ph             # Soil Ph
        ]])

        # Inference
        raw_prediction = model.predict(features)
        yield_result = max(0, float(raw_prediction[0])) # Ensure no negative yield

        # Economic Analysis (Basic Example)
        # Revenue = Yield * Price (Price index can be expanded)
        estimated_revenue = yield_result * 2200 # Avg price per unit
        
        return {
            "status": "success",
            "prediction": {
                "yield": round(yield_result, 3),
                "unit": "Tons/Hectare",
                "revenue_est": round(estimated_revenue, 2)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
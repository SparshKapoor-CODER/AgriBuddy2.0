import pandas as pd
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

# 1. Load the merged data
df = pd.read_csv('data/final_training_data.csv')

# 2. Encode categorical text into numbers
le_crop = LabelEncoder()
le_season = LabelEncoder()
le_state = LabelEncoder()

df['Crop_Enc'] = le_crop.fit_transform(df['Crop'])
df['Season_Enc'] = le_season.fit_transform(df['Season'])
df['State_Enc'] = le_state.fit_transform(df['state_name'])

# 3. Define Features and Target
# Features: The inputs (Rainfall, N, P, K, pH, etc.)
# Target: The output (Yield)
features = [
    'Crop_Enc', 'Season_Enc', 'State_Enc', 
    'Annual_Rainfall', 'Fertilizer', 'Pesticide', 
    'Nitrogen', 'Phosphorus', 'Potassium', 'Soil Ph'
]
X = df[features]
y = df['Yield']

# 4. Train the Model
model = XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1)
model.fit(X, y)

# 5. SAVE EVERYTHING (Crucial for the Backend)
joblib.dump(model, 'models/yield_model.pkl')
joblib.dump(le_crop, 'models/le_crop.pkl')
joblib.dump(le_state, 'models/le_state.pkl')
joblib.dump(le_season, 'models/le_season.pkl')

print("Phase 1 Complete: Model and Encoders saved to /models folder.")
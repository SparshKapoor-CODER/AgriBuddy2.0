import pandas as pd

# Load your two processed files
yield_df = pd.read_csv('data/india_crop_yield.csv') # Features: Crop, State, Rainfall, Yield
soil_df = pd.read_csv('data/state_soil_for_training.csv') # Features: state_name, Nitrogen, Phosphorus, Potassium, pH

# IMPORTANT: Standardize State Names to uppercase to avoid mismatches
yield_df['state_name'] = yield_df['State'].str.upper().str.strip()
soil_df['state_name'] = soil_df['state_name'].str.upper().str.strip()

# Join the datasets on 'state_name'
# This adds the average N, P, K, pH columns to every row of your yield data
final_df = pd.merge(yield_df, soil_df, on='state_name', how='inner')

# Save the combined dataset for training
final_df.to_csv('data/final_training_data.csv', index=False)
print(f"Successfully joined! New dataset has {final_df.shape[0]} rows.")
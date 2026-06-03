import pandas as pd

# 1. Load only the columns we need to save memory
cols = ['state_name', 'district_name', 'nutrient_name', 'value']
print("Reading 1 crore rows... hold tight.")
df = pd.read_csv('data/soil_health_card.csv', usecols=cols)

# 2. Keep only the core nutrients your model needs
# Note: Check your CSV to see if it's 'Nitrogen' or 'N' and adjust accordingly
important_nutrients = ['Nitrogen', 'Phosphorus', 'Potassium', 'Soil Ph']
df = df[df['nutrient_name'].isin(important_nutrients)]

# 3. PIVOT: This turns 'nutrient_name' rows into individual columns
print("Pivoting data to create N, P, K columns...")
soil_wide = df.pivot_table(
    index=['state_name', 'district_name'], 
    columns='nutrient_name', 
    values='value', 
    aggfunc='mean'
).reset_index()

# 4. Save the "State Profile" for training (matches your Yield data)
state_soil_profile = soil_wide.groupby('state_name').mean(numeric_only=True).reset_index()
state_soil_profile.to_csv('data/state_soil_for_training.csv', index=False)

# 5. Save the "District Profile" for your App's UI
soil_wide.to_csv('data/district_soil_lookup.csv', index=False)

print("Done! You now have clean soil data for your ML model.")
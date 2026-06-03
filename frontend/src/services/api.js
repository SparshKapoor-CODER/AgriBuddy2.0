import axios from 'axios';

// Create an instance with your FastAPI base URL
const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches default NPK and pH values based on the selected location.
 */
export const getSoilDefaults = async (district, state) => {
  try {
    const res = await API.post('/get-soil-defaults', { district, state });
    return res.data;
  } catch (err) {
    console.error("Error fetching soil defaults:", err);
    // Return fallback values so the app doesn't crash
    return { n: 50, p: 50, k: 50, ph: 7.0 };
  }
};

/**
 * Sends the 10-feature vector to the XGBoost model for prediction.
 */
export const getYieldPrediction = async (farmData) => {
  try {
    // 1. Destructure to separate the UI-only fields (district) from the model fields
    const { district, annual_rainfall, ...otherFeatures } = farmData;

    // 2. Construct the payload exactly as the FastAPI PredictionRequest expects
    const payload = {
      ...otherFeatures,
      rainfall: parseFloat(annual_rainfall), // Mapping name and ensuring it's a number
      n: parseFloat(farmData.n),
      p: parseFloat(farmData.p),
      k: parseFloat(farmData.k),
      ph: parseFloat(farmData.ph),
      fertilizer: parseFloat(farmData.fertilizer),
      pesticide: parseFloat(farmData.pesticide),
    };

    const res = await API.post('/predict', payload);
    return res.data; // Should return { yield_prediction: X.XX }
  } catch (err) {
    console.error("Prediction API Error:", err.response?.data || err.message);
    throw err;
  }
};

export default API;
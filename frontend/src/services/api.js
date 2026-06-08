// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetch soil pH and average rainfall for a given location.
 */
export const getSoilByLatLon = async (lat, lon) => {
  try {
    const res = await API.post('/get-soil-by-latlon', { lat, lon });
    return res.data; // { avg_rainfall_mm, soil_ph }
  } catch (err) {
    console.error('Error fetching soil data:', err);
    // Fallback values so the app doesn't break
    return { avg_rainfall_mm: 1000, soil_ph: 7.0 };
  }
};

/**
 * Send prediction request to the backend.
 */
export const getYieldPrediction = async (farmData) => {
  try {
    const payload = {
      crop: farmData.crop,
      season: farmData.season,
      state: farmData.state,
      lat: parseFloat(farmData.lat),
      lon: parseFloat(farmData.lon),
      fertilizer: parseFloat(farmData.fertilizer),
      pesticide: parseFloat(farmData.pesticide),
      nitrogen: parseFloat(farmData.nitrogen),
      phosphorus: parseFloat(farmData.phosphorus),
      potassium: parseFloat(farmData.potassium),
      soil_ph: parseFloat(farmData.soil_ph),
    };
    const res = await API.post('/predict', payload);
    return res.data; // { status, prediction: { min_yield, median_yield, max_yield, unit } }
  } catch (err) {
    console.error('Prediction API Error:', err.response?.data || err.message);
    throw err;
  }
};

export default API;
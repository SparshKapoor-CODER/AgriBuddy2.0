// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FarmMap from './components/FarmMap';
import InputPanel from './components/InputPanel';
import AnalysisBoard from './components/AnalysisBoard';
import ChatBot from './components/ChatBot';
import { getSoilByLatLon, getYieldPrediction } from './services/api';

function App() {
  const [farmData, setFarmData] = useState({
    crop: 'Rice',
    season: 'Kharif',
    state: 'Punjab',
    district: 'Rupnagar',
    lat: 30.97,
    lon: 76.53,
    annual_rainfall: 1100,
    soil_ph: 7.0,
    fertilizer: 150,
    pesticide: 10,
    reportLanguage: 'Hindi',      // default
    reportScript: 'Native script' // default
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleLocationFound = async (location) => {
    const { lat, lng, district, state } = location;
    try {
      const soilData = await getSoilByLatLon(lat, lng);
      setFarmData((prev) => ({
        ...prev,
        lat,
        lon: lng,
        district: district || prev.district,
        state: state || prev.state,
        annual_rainfall: soilData.avg_rainfall_mm,
        soil_ph: soilData.soil_ph,
      }));
    } catch (err) {
      console.warn('Could not fetch soil data, using fallback values.');
      setFarmData((prev) => ({
        ...prev,
        lat,
        lon: lng,
        district: district || prev.district,
        state: state || prev.state,
      }));
    }
  };

  // Debounced prediction whenever relevant fields change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (farmData.crop && farmData.state && farmData.lat && farmData.lon) {
        fetchPrediction();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [farmData.crop, farmData.season, farmData.state, farmData.lat, farmData.lon, farmData.fertilizer, farmData.pesticide]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const result = await getYieldPrediction(farmData);
      if (result.status === 'success' && result.prediction) {
        setPrediction(result.prediction.median_yield);
      } else {
        setPrediction(0);
      }
    } catch (err) {
      console.error('Prediction failed:', err);
      setPrediction(0);
    } finally {
      setLoading(false);
    }
  };

  // Generate report and open in new tab
const generateReport = async () => {
  setLoadingReport(true);
  try {
    const response = await axios.post(
      'http://localhost:8000/generate-report',
      {
        crop: farmData.crop,
        season: farmData.season,
        state: farmData.state,
        lat: farmData.lat,
        lon: farmData.lon,
        fertilizer: farmData.fertilizer,
        pesticide: farmData.pesticide,
        language: farmData.reportLanguage,
        script: farmData.reportScript
      },
      { responseType: 'blob' }
    );

    // Create a blob URL from the HTML response
    const blob = new Blob([response.data], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    // Open the report in a new tab
    window.open(url, '_blank');
    
    // Clean up the blob URL after a short delay (to allow the tab to load)
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    
  } catch (err) {
    console.error('Report generation failed:', err);
    alert('Could not generate report. Please check if the backend server is running and try again.');
  } finally {
    setLoadingReport(false);
  }
};

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--emerald-400)', marginBottom: '4px' }}>
            AgriBuddy AI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
            Smart Farming Simulation Platform
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ color: 'var(--emerald-500)', marginBottom: '2px' }}>SYSTEM STATUS: OPERATIONAL</div>
          IIT ROPAR • SCHOOL OF AIDE
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="map-wrapper">
          <FarmMap onLocationFound={handleLocationFound} />
        </div>
        <div>
          <InputPanel
            farmData={farmData}
            setFarmData={setFarmData}
            onGenerateReport={generateReport}
            loadingReport={loadingReport}
          />
        </div>
        <div>
          <AnalysisBoard
            prediction={prediction}
            loading={loading}
            farmData={farmData}
          />
        </div>
      </div>

      <ChatBot farmData={farmData} prediction={prediction} />
    </div>
  );
}

export default App;
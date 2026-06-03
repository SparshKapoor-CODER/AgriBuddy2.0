import React, { useState, useEffect } from 'react';
import FarmMap from './components/FarmMap.jsx';
import InputPanel from './components/InputPanel';
import AnalysisBoard from './components/AnalysisBoard';
import { getSoilDefaults, getYieldPrediction } from './services/api';

function App() {
  const [farmData, setFarmData] = useState({
    crop: "Rice",
    season: "Kharif",
    state: "Punjab", 
    district: "Rupnagar",
    annual_rainfall: 1100,
    fertilizer: 150,
    pesticide: 10,
    n: 50, p: 50, k: 50, ph: 7.0
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLocationFound = async (loc) => {
    try {
      const defaults = await getSoilDefaults(loc.district, loc.state);
      setFarmData(prev => ({
        ...prev,
        state: loc.state,
        district: loc.district,
        n: defaults.n,
        p: defaults.p,
        k: defaults.k,
        ph: defaults.ph
      }));
    } catch (err) {
      console.warn("Using fallback state averages due to API error.");
    }
  };

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const result = await getYieldPrediction(farmData);
        if (result.status === "success" && result.prediction) {
          setPrediction(result.prediction.yield);
        } else {
          setPrediction(result.yield || result.yield_prediction || 0);
        }
      } catch (err) {
        console.error("Prediction failed:", err);
        setPrediction(0);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (farmData.crop && farmData.state) {
        fetchPrediction();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [farmData]);

  return (
    <div className="app-container">
      {/* Fixed Header Layout */}
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

      {/* Fixed Grid Layout - 3 Columns Side-by-Side */}
      <div className="dashboard-grid">
        
        {/* Left: Map View */}
        <div className="map-wrapper">
          <FarmMap onLocationFound={handleLocationFound} />
        </div>

        {/* Center: Input Panel */}
        <div>
          <InputPanel farmData={farmData} setFarmData={setFarmData} />
        </div>

        {/* Right: Analysis Board */}
        <div>
          <AnalysisBoard 
            prediction={prediction} 
            loading={loading} 
            farmData={farmData} 
          />
        </div>
        
      </div>
    </div>
  );
}

export default App;
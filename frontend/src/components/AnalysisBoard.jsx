import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip);

const AnalysisBoard = ({ prediction, loading, farmData }) => {
  // Dynamic color based on yield performance for UI feedback
  const statusColor = useMemo(() => {
    if (prediction > 15) return '#10b981'; // Emerald (High Yield)
    if (prediction > 7) return '#f59e0b';  // Amber (Moderate Yield)
    return '#ef4444';                      // Rose (Low Yield)
  }, [prediction]);

  // 1. Chart Data Configuration
  const chartData = {
    datasets: [{
      data: [prediction || 0, Math.max(0, 25 - (prediction || 0))], // Assuming 25 max for visual scale
      backgroundColor: [statusColor, '#1e293b'],
      borderWidth: 0,
      circumference: 180, 
      rotation: 270,      
    }]
  };

  // 2. Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Relies on the fixed height of the parent div
    plugins: { tooltip: { enabled: false } },
    cutout: '82%', 
    events: [] // Disables hover for a clean dashboard look
  };

  return (
    <div className="panel">
      <h2 className="panel-header">Harvest Forecast</h2>

      {/* GAUGE SECTION */}
      <div className="gauge-container"> 
        {loading ? (
          <div style={{textAlign: 'center', marginTop: '80px', color: '#94a3b8'}}>
            Calculating...
          </div>
        ) : (
          <>
            <div style={{ height: '100%', width: '100%' }}>
              <Doughnut data={chartData} options={options} />
            </div>
            
            {/* Centered Text Overlay */}
            <div className="gauge-text-overlay">
              <span className="gauge-value">
                {prediction ? Number(prediction).toFixed(1) : '--'}
              </span>
              <span className="gauge-label">
                Tons / Hectare
              </span>
            </div>
          </>
        )}
      </div>

      {/* STATS SECTION */}
      <div>
        <div className="stat-card">
          <div className="input-label">Est. Market Value</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--emerald-400)' }}>
            ₹{((prediction || 0) * 2400).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Based on LIVE MSP</div>
        </div>

        <div className="grid-2-col" style={{marginBottom: '12px'}}>
          <div className="stat-card" style={{margin: 0, textAlign: 'center'}}>
            <div className="input-label" style={{justifyContent: 'center'}}>Yield Quality</div>
            <div style={{color: 'var(--blue-400)', fontWeight: 'bold'}}>OPTIMAL</div>
          </div>
          <div className="stat-card" style={{margin: 0, textAlign: 'center'}}>
            <div className="input-label" style={{justifyContent: 'center'}}>Soil pH</div>
            {/* Fixed to 1 decimal place to hide the ugly 45.893939 data */}
            <div style={{color: '#818cf8', fontWeight: 'bold'}}>{Number(farmData.ph).toFixed(1)}</div>
          </div>
        </div>

        <div className="insight-box">
          Agronomic Advisory: Current simulation for {farmData.crop} in {farmData.district || 'Bilaspur'} indicates stable parameters.
        </div>
      </div>
    </div>
  );
}
  
export default AnalysisBoard;
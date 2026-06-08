// src/components/AnalysisBoard.jsx
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const AnalysisBoard = ({ prediction, loading, farmData }) => {
  const statusColor = useMemo(() => {
    if (prediction > 15) return '#10b981';
    if (prediction > 7) return '#f59e0b';
    return '#ef4444';
  }, [prediction]);

  const chartData = {
    datasets: [{
      data: [prediction || 0, Math.max(0, 25 - (prediction || 0))],
      backgroundColor: [statusColor, '#1e293b'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { tooltip: { enabled: false } },
    cutout: '82%',
    events: [],
  };

  return (
    <div className="panel">
      <h2 className="panel-header">Harvest Forecast</h2>

      <div className="gauge-container">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#94a3b8' }}>Calculating...</div>
        ) : (
          <>
            <div style={{ height: '100%', width: '100%' }}>
              <Doughnut data={chartData} options={options} />
            </div>
            <div className="gauge-text-overlay">
              <span className="gauge-value">{prediction ? Number(prediction).toFixed(1) : '--'}</span>
              <span className="gauge-label">Tons / Hectare</span>
            </div>
          </>
        )}
      </div>

      <div>
        <div className="stat-card">
          <div className="input-label">Est. Market Value</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--emerald-400)' }}>
            ₹{((prediction || 0) * 2400).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Based on LIVE MSP</div>
        </div>

        <div className="grid-2-col" style={{ marginBottom: '12px' }}>
          <div className="stat-card" style={{ margin: 0, textAlign: 'center' }}>
            <div className="input-label" style={{ justifyContent: 'center' }}>Yield Quality</div>
            <div style={{ color: 'var(--blue-400)', fontWeight: 'bold' }}>OPTIMAL</div>
          </div>
          <div className="stat-card" style={{ margin: 0, textAlign: 'center' }}>
            <div className="input-label" style={{ justifyContent: 'center' }}>Soil pH</div>
            <div style={{ color: '#818cf8', fontWeight: 'bold' }}>{Number(farmData.soil_ph).toFixed(1)}</div>
          </div>
        </div>

        <div className="insight-box">
          Agronomic Advisory: Current simulation for {farmData.crop} in {farmData.district || 'Bilaspur'} indicates stable parameters.
        </div>
      </div>
    </div>
  );
};

export default AnalysisBoard;
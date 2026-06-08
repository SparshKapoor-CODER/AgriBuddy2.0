// src/components/InputPanel.jsx
import React from 'react';

const InputPanel = ({ farmData, setFarmData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFarmData({ ...farmData, [name]: value });
  };

  return (
    <div className="panel">
      <h2 className="panel-header">
        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '8px' }}>⚙️</span>
        Simulation Controls
      </h2>

      <div className="custom-scrollbar" style={{ overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Environment Section */}
        <div className="input-group">
          <div className="input-label">
            <span>Annual Rainfall (mm)</span>
            <span style={{ color: 'var(--emerald-400)', fontFamily: 'monospace', fontSize: '1rem' }}>
              {farmData.annual_rainfall}
            </span>
          </div>
          <input
            type="range"
            name="annual_rainfall"
            min="200"
            max="3500"
            step="10"
            value={farmData.annual_rainfall}
            onChange={handleChange}
          />
        </div>

        {/* Soil Nutrients (N, P, K, pH) */}
        <div className="grid-2-col">
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Nitrogen (kg/ha)</label>
            <input
              type="number"
              name="nitrogen"
              value={farmData.nitrogen}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Phosphorus (kg/ha)</label>
            <input
              type="number"
              name="phosphorus"
              value={farmData.phosphorus}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Potassium (kg/ha)</label>
            <input
              type="number"
              name="potassium"
              value={farmData.potassium}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Soil pH</label>
            <input
              type="number"
              name="soil_ph"
              step="0.1"
              value={farmData.soil_ph}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Farming Inputs */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <div className="input-label">
              <span>FERTILIZER INTENSITY (kg)</span>
              <span style={{ color: 'var(--blue-400)', fontFamily: 'monospace' }}>{farmData.fertilizer}</span>
            </div>
            <input type="range" name="fertilizer" min="0" max="3000" value={farmData.fertilizer} onChange={handleChange} />
          </div>
          <div className="input-group">
            <div className="input-label">
              <span>PESTICIDE USAGE (kg)</span>
              <span style={{ color: 'var(--orange-400)', fontFamily: 'monospace' }}>{farmData.pesticide}</span>
            </div>
            <input type="range" name="pesticide" min="0" max="10" step="0.5" value={farmData.pesticide} onChange={handleChange} />
          </div>
        </div>

        {/* Categorical Dropdowns */}
        <div className="grid-2-col" style={{ paddingTop: '10px' }}>
          <select name="crop" value={farmData.crop} onChange={handleChange} className="input-field">
            <option value="Rice">Rice</option>
            <option value="Maize">Maize</option>
            <option value="Wheat">Wheat</option>
          </select>
          <select name="season" value={farmData.season} onChange={handleChange} className="input-field">
            <option value="Kharif">Kharif</option>
            <option value="Rabi">Rabi</option>
            <option value="Summer">Summer</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
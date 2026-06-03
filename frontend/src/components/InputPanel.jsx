import React from 'react';

const InputPanel = ({ farmData, setFarmData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFarmData({ 
      ...farmData, 
      [name]: value 
    });
  };

  return (
    <div className="panel">
      <h2 className="panel-header">
        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '8px' }}>⚙️</span>
        Simulation Controls
      </h2>

      {/* Main Form Area */}
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
            min="200" max="3500" step="10"
            value={farmData.annual_rainfall} 
            onChange={handleChange}
          />
        </div>

        {/* Soil Parameters Section */}
        <div className="grid-2-col">
          {['n', 'p', 'k', 'ph'].map((key) => (
            <div key={key} className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'block' }}>
                {key === 'ph' ? 'Soil pH' : `Nutrient ${key.toUpperCase()}`}
              </label>
              <input 
                type="number" 
                name={key} 
                value={farmData[key]} 
                onChange={handleChange}
                className="input-field"
              />
            </div>
          ))}
        </div>

        {/* Farming Inputs (Fertilizer & Pesticide) */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <div className="input-label">
              <span>FERTILIZER INTENSITY</span>
              <span style={{ color: 'var(--blue-400)', fontFamily: 'monospace' }}>{farmData.fertilizer} kg</span>
            </div>
            <input 
              type="range" 
              name="fertilizer" 
              min="0" max="3000"
              value={farmData.fertilizer} 
              onChange={handleChange}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <div className="input-label">
              <span>PESTICIDE USAGE</span>
              <span style={{ color: 'var(--orange-400)', fontFamily: 'monospace' }}>{farmData.pesticide} kg</span>
            </div>
            <input 
              type="range" 
              name="pesticide" 
              min="0" max="10" step="0.5"
              value={farmData.pesticide} 
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Categorical Dropdowns */}
        <div className="grid-2-col" style={{ paddingTop: '10px' }}>
          <select 
            name="crop" 
            value={farmData.crop} 
            onChange={handleChange} 
            className="input-field"
          >
            <option value="Rice">Rice</option>
            <option value="Maize">Maize</option>
            <option value="Wheat">Wheat</option>
          </select>
          
          <select 
            name="season" 
            value={farmData.season} 
            onChange={handleChange} 
            className="input-field"
          >
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
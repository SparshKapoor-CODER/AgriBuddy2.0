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
        {/* Rainfall is now read-only, shown in AnalysisBoard */}
        <div className="input-group">
          <div className="input-label">
            <span>Location</span>
            <span style={{ color: 'var(--emerald-400)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {farmData.district}, {farmData.state}
            </span>
          </div>
        </div>

        {/* Fertilizer & Pesticide sliders */}
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

        {/* Crop & Season dropdowns - UPDATED with 55 crops */}
        <div className="grid-2-col" style={{ paddingTop: '10px' }}>
          <select name="crop" value={farmData.crop} onChange={handleChange} className="input-field">
            <option value="">Select Crop</option>
            <option value="Arecanut">Arecanut</option>
            <option value="Arhar/Tur">Arhar/Tur</option>
            <option value="Bajra">Bajra</option>
            <option value="Banana">Banana</option>
            <option value="Barley">Barley</option>
            <option value="Black pepper">Black pepper</option>
            <option value="Cardamom">Cardamom</option>
            <option value="Cashewnut">Cashewnut</option>
            <option value="Castor seed">Castor seed</option>
            <option value="Coconut">Coconut</option>
            <option value="Coriander">Coriander</option>
            <option value="Cotton(lint)">Cotton(lint)</option>
            <option value="Cowpea(Lobia)">Cowpea(Lobia)</option>
            <option value="Dry chillies">Dry chillies</option>
            <option value="Garlic">Garlic</option>
            <option value="Ginger">Ginger</option>
            <option value="Gram">Gram</option>
            <option value="Groundnut">Groundnut</option>
            <option value="Guar seed">Guar seed</option>
            <option value="Horse-gram">Horse-gram</option>
            <option value="Jowar">Jowar</option>
            <option value="Jute">Jute</option>
            <option value="Khesari">Khesari</option>
            <option value="Linseed">Linseed</option>
            <option value="Maize">Maize</option>
            <option value="Masoor">Masoor</option>
            <option value="Mesta">Mesta</option>
            <option value="Moong(Green Gram)">Moong(Green Gram)</option>
            <option value="Moth">Moth</option>
            <option value="Niger seed">Niger seed</option>
            <option value="Oilseeds total">Oilseeds total</option>
            <option value="Onion">Onion</option>
            <option value="Other Rabi pulses">Other Rabi pulses</option>
            <option value="Other Cereals">Other Cereals</option>
            <option value="Other Kharif pulses">Other Kharif pulses</option>
            <option value="Other Summer Pulses">Other Summer Pulses</option>
            <option value="Peas & beans (Pulses)">Peas & beans (Pulses)</option>
            <option value="Potato">Potato</option>
            <option value="Ragi">Ragi</option>
            <option value="Rapeseed &Mustard">Rapeseed &Mustard</option>
            <option value="Rice">Rice</option>
            <option value="Safflower">Safflower</option>
            <option value="Sannhamp">Sannhamp</option>
            <option value="Sesamum">Sesamum</option>
            <option value="Small millets">Small millets</option>
            <option value="Soyabean">Soyabean</option>
            <option value="Sugarcane">Sugarcane</option>
            <option value="Sunflower">Sunflower</option>
            <option value="Sweet potato">Sweet potato</option>
            <option value="Tapioca">Tapioca</option>
            <option value="Tobacco">Tobacco</option>
            <option value="Turmeric">Turmeric</option>
            <option value="Urad">Urad</option>
            <option value="Wheat">Wheat</option>
            <option value="other oilseeds">other oilseeds</option>
          </select>
          
          <select name="season" value={farmData.season} onChange={handleChange} className="input-field">
            <option value="Kharif">Kharif</option>
            <option value="Rabi">Rabi</option>
            <option value="Summer">Whole Year</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
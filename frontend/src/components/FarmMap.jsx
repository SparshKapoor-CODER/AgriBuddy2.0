import React from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// This sub-component handles the click logic
function LocationMarker({ onLocationFound }) {
  const [position, setPosition] = React.useState(null);
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng); // Visual marker placement
      map.flyTo(e.latlng, map.getZoom()); // Smooth zoom effect
      
      try {
        // 1. Reverse Geocode via OpenStreetMap
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        
        // Extracting location details
        const district = data.address.state_district || data.address.county || "Unknown District";
        const state = data.address.state || "Unknown State";

        // 2. Callback to App.jsx
        onLocationFound({ lat, lng, district, state });
      } catch (error) {
        console.error("Geocoding failed:", error);
      }
    },
  });

    return position === null ? null : (
    <Marker position={position}></Marker>
    );
}

// The main component that App.jsx expects to import
const FarmMap = ({ onLocationFound }) => {
  // Default center (e.g., near Ropar/Punjab)
  const center = [30.97, 76.53]; 

  return (
  <div style={{ height: '500px', width: '100%' }}>
    <MapContainer 
      center={center} 
      zoom={7} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationFound={onLocationFound} />
    </MapContainer>
   </div>
  );
};


export default FarmMap;
// src/components/FarmMap.jsx
import React from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function LocationMarker({ onLocationFound }) {
  const [position, setPosition] = React.useState(null);
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        const district = data.address.state_district || data.address.county || 'Unknown District';
        const state = data.address.state || 'Unknown State';

        onLocationFound({ lat, lng, district, state });
      } catch (error) {
        console.error('Geocoding failed:', error);
        onLocationFound({ lat, lng, district: 'Unknown', state: 'Unknown' });
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const FarmMap = ({ onLocationFound }) => {
  const center = [30.97, 76.53]; // near Ropar, Punjab
  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationFound={onLocationFound} />
      </MapContainer>
    </div>
  );
};

export default FarmMap;
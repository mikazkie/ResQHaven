// src/components/Map.jsx
import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { getRequest } from '../../API/API';

// Fix Leaflet marker icon bug in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import EvacuationCenter from '../../assets/images/house.png'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Safe route component
const SafeRoute = ({ start, end }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!start || !end) return;

    const drawRoute = async () => {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/` +
        `${start.lng},${start.lat};${end.lng},${end.lat}` +
        `?overview=full&geometries=geojson`
      );

      const coords = response.data
        .routes[0]
        .geometry
        .coordinates
        .map(([lng, lat]) => [lat, lng]);

      // Remove old route if exists
      map.eachLayer(layer => {
        if (layer.options.className === 'safe-route') {
          map.removeLayer(layer);
        }
      });

      // Draw green route
      L.polyline(coords, {
        color: '#22c55e',
        weight: 5,
        opacity: 0.8,
        className: 'safe-route'
      }).addTo(map);

      map.fitBounds(
        L.polyline(coords).getBounds()
      );
    };

    drawRoute();
  }, [start, end]);

  return null;
};

export default function Map() {
  const [userLocation, setUserLocation] = 
    useState(null);
  const [centers, setCenters] = 
    useState([]);
  const [hazardZones, setHazardZones] = 
    useState([]);
  const [selectedCenter, setSelectedCenter] = 
    useState(null);

  // Get user GPS location
 useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    },
    (err) => {
      console.error('GPS error:', err);
      // Default to Cebu City
      setUserLocation({
        lat: 10.3157,
        lng: 123.8854
      });
    },
    {
      // ↓ ADD THESE OPTIONS!
      enableHighAccuracy: true, 
      // Forces GPS satellite
      timeout: 10000,           
      // Wait up to 10 seconds
      maximumAge: 0             
      // Don't use cached location
    }
  );
}, []);

  // Fetch data from your backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, h] = await Promise.all([
          getRequest('api/evacuations'),
          getRequest('api/hazards')
        ]);
        setCenters(c);
        setHazardZones(h)
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  // Colors for hazard zones
  const hazardColors = {
    very_high: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22c55e'
  };

  // Custom user icon (blue dot)
  const userIcon = L.divIcon({
    html: `
      <div style="
        background: #3b82f6;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 8px 
          rgba(59,130,246,0.8);
      "></div>
    `,
    iconSize: [16, 16],
    className: ''
  });

  // Custom center icon
const centerIcon = (percentage) => new L.Icon({
  iconUrl: EvacuationCenter,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
})

  if (!userLocation) {
    return (
      <div style={styles.loading}>
        📍 Getting your location...
      </div>
    );
  }


  
  
  return (

    <div style={styles.container}>
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        style={styles.map}
        zoomControl={true}
      >
        {/* Map Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />

        {/* User Location */}
        <Marker
          position={[
            userLocation.lat,
            userLocation.lng
          ]}
          icon={userIcon}
        >
          <Popup>
            <b>📍 You are here</b>
          </Popup>
        </Marker>

        {/* Hazard Zones */}
        {hazardZones.map((zone, i) => (
          <Circle
            key={i}
            center={[
              zone.latitude,
              zone.longitude
            ]}
            radius={500}
            pathOptions={{
              color: hazardColors[zone.flood_risk],
              fillColor: hazardColors[zone.flood_risk],
              fillOpacity: 0.25,
              weight: 2
            }}
          >
            <Popup>
              <b>⚠️ {zone.barangay}</b><br />
              Risk: <b style={{ 
                color: hazardColors[zone.flood_risk] 
              }}>
                {zone.flood_risk.toUpperCase()}
              </b>
              <br/>
              Type: <b>{zone.disaster_type}</b>
            </Popup>
          </Circle>
        ))}

        {/* Evacuation Centers */}
        {centers.map((center, i) => {
          const percentage = Math.round(
            (center.current_occupancy /
              center.capacity) * 100
          );
          return (
            <Marker
              key={i}
              position={[
                center.latitude,
                center.longitude
              ]}
              icon={centerIcon(percentage)}
            >
              <Popup>
                <div style={styles.popup}>
                  <b>🏠 {center.name}</b>
                  <p>
                    👥 {percentage}% Full<br />
                    ({center.current_occupancy}/
                    {center.capacity} people)
                  </p>
                  <p>
                    Status: <b style={{
                      color: center.status === 'open'
                        ? '#22c55e' : '#ef4444'
                    }}>
                      {center.status.toUpperCase()}
                    </b>
                  </p>
                  {center.status === 'open' && (
                    <button
                      style={styles.routeBtn}
                      onClick={() =>
                        setSelectedCenter(center)
                      }
                    >
                      🗺️ Get Safe Route
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}


{centers.map((center, i) => {
        const percentage = Math.round(
          (center.current_occupancy /
            center.capacity) * 100
        );
        return (
          <Marker
            key={i}
            position={[
              center.latitude,
              center.longitude
            ]}
            icon={centerIcon(percentage)}
          >
            <Popup>
              <div style={styles.popup}>
                <b>🏠 {center.name}</b>
                <p>
                  👥 {percentage}% Full<br />
                  ({center.current_occupancy}/
                  {center.capacity} people)
                </p>
                <p>
                  Status: <b style={{
                    color: center.status === 'open'
                      ? '#22c55e' : '#ef4444'
                  }}>
                    {center.status.toUpperCase()}
                  </b>
                </p>
                {center.status === 'open' && (
                  <button
                    style={styles.routeBtn}
                    onClick={() =>
                      setSelectedCenter(center)
                    }
                  >
                    🗺️ Get Safe Route
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}


        {/* Safe Route */}
        {selectedCenter && (
          <SafeRoute
            start={userLocation}
            end={{
              lat: selectedCenter.latitude,
              lng: selectedCenter.longitude
            }}
          />
        )}
        

      </MapContainer>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: 16,
    color: '#6b7280'
  },
  legend: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: '10px 12px',
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    minWidth: 110
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0
  },
  popup: {
    fontSize: 13,
    minWidth: 160
  },
  routeBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: 12,
    width: '100%',
    marginTop: 6
  }
};


import { useEffect, useMemo, useState } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { getRequest } from '../../API/API'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import EvacuationCenter from '../../assets/images/house.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const DEFAULT_LOCATION = {
  lat: 10.6765,
  lng: 122.9509,
  label: 'Bacolod City'
}

const hazardColors = {
  very_high: '#dc2626',
  high: '#f97316',
  moderate: '#eab308',
  low: '#22c55e'
}

const hazardHeatConfig = {
  very_high: {
    radii: [1500, 1100, 700],
    opacities: [0.1, 0.18, 0.28]
  },
  high: {
    radii: [1300, 900, 550],
    opacities: [0.08, 0.14, 0.22]
  },
  moderate: {
    radii: [1000, 700, 420],
    opacities: [0.07, 0.11, 0.18]
  },
  low: {
    radii: [800, 520, 280],
    opacities: [0.05, 0.08, 0.12]
  }
}

function getDistanceInKm(start, end) {
  const toRad = (value) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRad(end.lat - start.lat)
  const dLng = toRad(end.lng - start.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(start.lat)) *
      Math.cos(toRad(end.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

const SafeRoute = ({ start, end }) => {
  const map = useMap()

  useEffect(() => {
    if (!start || !end) return

    const drawRoute = async () => {
      try {
        const response = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        )

        const coords = response.data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])

        map.eachLayer((layer) => {
          if (layer.options?.className === 'safe-route') {
            map.removeLayer(layer)
          }
        })

        const route = L.polyline(coords, {
          color: '#16a34a',
          weight: 5,
          opacity: 0.8,
          className: 'safe-route'
        }).addTo(map)

        map.fitBounds(route.getBounds(), { padding: [32, 32] })
      } catch (error) {
        console.log(error)
      }
    }

    drawRoute()
  }, [end, map, start])

  return null
}

const FocusOnLocation = ({ location }) => {
  const map = useMap()

  useEffect(() => {
    if (!location) return

    map.flyTo([location.lat, location.lng], 15, {
      duration: 1.2
    })
  }, [location, map])

  return null
}

function MapHud() {
  return (
    <div style={styles.legend}>
      <div style={styles.legendTitle}>Hazard Levels</div>
      {Object.entries(hazardColors).map(([key, color]) => (
        <div key={key} style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: color }} />
          <span>{key.replace('_', ' ')}</span>
        </div>
      ))}
    </div>
  )
}

function createPopupContent(center, occupancy, distanceKm) {
  return `
    <div style="min-width:190px;font-size:13px;">
      <strong>${center.name}</strong>
      <p style="margin:6px 0;color:#64748b;">
        ${center.address || center.barangay || 'Location unavailable'}
      </p>
      <div>Distance: ${distanceKm.toFixed(1)} km</div>
      <div>${center.current_occupancy}/${center.capacity} occupants</div>
      <div>Status: ${center.status}</div>
      <div>Occupancy: ${occupancy}%</div>
      ${center.status === 'open' ? `
        <button
          class="map-route-btn"
          data-center-id="${center.id}"
          style="
            width:100%;
            margin-top:10px;
            border:none;
            border-radius:12px;
            background:#0f172a;
            color:#ffffff;
            padding:10px 12px;
            font-size:12px;
            font-weight:700;
            cursor:pointer;
          "
        >
          Show Safe Route
        </button>
      ` : ''}
    </div>
  `
}

function HazardHeatLayer({ hazardZones }) {
  return (
    <>
      {hazardZones.map((zone) => {
        const level = zone.level || zone.flood_risk || 'low'
        const color = hazardColors[level] || '#94a3b8'
        const config = hazardHeatConfig[level] || hazardHeatConfig.low

        return config.radii.map((radius, index) => (
          <Circle
            key={`${zone.id || `${zone.latitude}-${zone.longitude}`}-heat-${index}`}
            center={[zone.latitude, zone.longitude]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: config.opacities[index] || 0.08,
              opacity: index === config.radii.length - 1 ? 0.55 : 0,
              weight: index === config.radii.length - 1 ? 1.2 : 0
            }}
          >
            {index === config.radii.length - 1 ? (
              <Popup>
                <strong>{zone.barangay || 'Hazard Area'}</strong>
                <div>Risk: {level.replace('_', ' ')}</div>
                <div>Type: {zone.disaster_type || 'General hazard'}</div>
              </Popup>
            ) : null}
          </Circle>
        ))
      })}
    </>
  )
}

function ClusteredCenters({ centers, centerIcon, onSelectCenter, userLocation }) {
  const map = useMap()

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 56,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()

        return L.divIcon({
          html: `
            <div style="
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: rgba(238, 156, 49, 0.92);
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              font-weight: 800;
              border: 3px solid rgba(255,255,255,0.95);
              box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
            ">${count}</div>
          `,
          className: '',
          iconSize: [30, 30]
        })
      }
    })

    centers.forEach((center) => {
      const occupancy = center.capacity
        ? Math.round((center.current_occupancy / center.capacity) * 100)
        : 0
      const distanceKm = getDistanceInKm(userLocation, {
        lat: Number(center.latitude),
        lng: Number(center.longitude)
      })

      const marker = L.marker(
        [center.latitude, center.longitude],
        { icon: centerIcon }
      )

      marker.bindPopup(createPopupContent(center, occupancy, distanceKm))
      marker.on('popupopen', () => {
        const button = document.querySelector(`.map-route-btn[data-center-id="${center.id}"]`)
        if (button) {
          button.onclick = (event) => {
            event.preventDefault()
            onSelectCenter(center)
          }
        }
      })

      clusterGroup.addLayer(marker)
    })

    map.addLayer(clusterGroup)

    return () => {
      map.removeLayer(clusterGroup)
    }
  }, [centerIcon, centers, map, onSelectCenter, userLocation])

  return null
}

export default function Map() {
  const [userLocation, setUserLocation] = useState(null)
  const [centers, setCenters] = useState([])
  const [hazardZones, setHazardZones] = useState([])
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Current location'
        })
      },
      () => {
        setUserLocation(DEFAULT_LOCATION)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centersResponse, hazardsResponse] = await Promise.all([
          getRequest('api/evacuations'),
          getRequest('api/hazards')
        ])

        setCenters(Array.isArray(centersResponse) ? centersResponse : [])
        setHazardZones(Array.isArray(hazardsResponse) ? hazardsResponse : [])
      } catch (error) {
        console.log(error)
      }
    }

    fetchData()
  }, [])

  const userIcon = useMemo(() => L.divIcon({
    html: `
      <div style="
        background: #2563eb;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.14);
      "></div>
    `,
    iconSize: [18, 18],
    className: ''
  }), [])

  const centerIcon = useMemo(() => new L.Icon({
    iconUrl: EvacuationCenter,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34]
  }), [])

  if (!userLocation) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingCard}>
          <i className='bi bi-geo-alt' />
          <span>Getting your location</span>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <style>{`
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 18px !important;
          overflow: hidden;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          width: 42px;
        }

        .leaflet-control-zoom a {
          border-radius: 0 !important;
          border: none !important;
          width: 35px !important;
          height: 35px !important;
          line-height: 42px !important;
          font-size: 18px !important;
        }

        .leaflet-control-zoom a:first-child {
          border-top-left-radius: 18px !important;
          border-top-right-radius: 18px !important;
        }

        .leaflet-control-zoom a:last-child {
          border-bottom-left-radius: 18px !important;
          border-bottom-right-radius: 18px !important;
        }

        @media (max-width: 768px) {
          .leaflet-control-zoom {
            width: 40px;
          }

          .leaflet-control-zoom a {
            width: 33px !important;
            height: 33px !important;
            line-height: 34px !important;
            font-size: 17px !important;
          }
        }
      `}</style>

      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={styles.map}
        zoomControl
      >
        <FocusOnLocation location={userLocation} />

        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='© OpenStreetMap'
        />

        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <strong>Your location</strong>
          </Popup>
        </Marker>

        <HazardHeatLayer hazardZones={hazardZones} />

        <ClusteredCenters
          centers={centers}
          centerIcon={centerIcon}
          onSelectCenter={setSelectedCenter}
          userLocation={userLocation}
        />

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

      {!isMobile ? (
        <MapHud />
      ) : (
        <div style={styles.mobileLegendWrap}>
          <div style={styles.mobileLegend}>
            <div style={styles.legendTitle}>Hazard Levels</div>
            {Object.entries(hazardColors).map(([key, color]) => (
              <div key={key} style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: color }} />
                <span>{key.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    background: '#e2e8f0'
  },
  loadingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 18px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.94)',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
    color: '#0f172a',
    fontWeight: 700
  },
  legend: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    zIndex: 500,
    padding: '14px 16px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.94)',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)'
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 8,
    color: '#0f172a'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize'
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%'
  },
  mobileLegendWrap: {
    marginTop: 10
  },
  mobileLegend: {
    padding: '14px 16px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.96)',
    border: '1px solid #dbe4f0',
    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)'
  },
}

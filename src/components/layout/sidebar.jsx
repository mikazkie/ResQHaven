import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getRequest } from '../../API/API'
import '../styles/Sidebar.css'
import ResQHavenLogo from '../../assets/images/RESQHAVEN.png'

const DISASTER_CONFIG = {
  typhoon: {
    icon: 'bi-cloud-lightning-rain',
    color: '#f59e0b',
    label: 'Typhoon'
  },
  earthquake: {
    icon: 'bi-globe-asia-australia',
    color: '#ef4444',
    label: 'Earthquake'
  },
  tsunami: {
    icon: 'bi-water',
    color: '#0ea5e9',
    label: 'Tsunami'
  },
  fire: {
    icon: 'bi-fire',
    color: '#dc2626',
    label: 'Fire'
  },
  flood: {
    icon: 'bi-droplet-half',
    color: '#2563eb',
    label: 'Flood'
  }
}

export default function Sidebar({ user, profile, onSignOut }) {
  const [alerts, setAlerts] = useState([])
  const [centers, setCenters] = useState([])
  const [hazards, setHazards] = useState([])
  const [weather, setWeather] = useState(null)
  const [hotlines, setHotlines] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)
  const isEndUser = !user || user.role === 'user'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsResponse, centersResponse, hazardsResponse, weatherResponse, hotlinesResponse] = await Promise.all([
          getRequest('api/alerts'),
          getRequest('api/evacuations'),
          getRequest('api/hazards'),
          getRequest('api/weather/pagasa'),
          getRequest('api/hotlines')
        ])

        setAlerts(alertsResponse.data || [])
        setCenters(Array.isArray(centersResponse) ? centersResponse : [])
        setHazards(Array.isArray(hazardsResponse) ? hazardsResponse : [])
        setWeather(weatherResponse.weather || null)
        setHotlines(hotlinesResponse.data || [])
      } catch (error) {
        console.log(error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          label: 'Current location',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      () => {
        setCurrentLocation(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [])

  const availableCenters = useMemo(() => {
    return [...centers]
      .sort((a, b) => a.current_occupancy - b.current_occupancy)
      .slice(0, 3)
  }, [centers])

  const displayName = `${user?.firstname || profile?.firstName || 'Guest'} ${user?.lastname || profile?.lastName || ''}`.trim()
  const currentAreaLabel = currentLocation?.label || [
    profile?.barangay,
    profile?.city || profile?.municipality,
    profile?.province
  ].filter(Boolean).join(', ') || 'Unavailable'
  const openCentersCount = centers.filter((center) => center.status === 'open').length

  return (
    <div className='user-sidebar-shell'>
      <div className='user-sidebar-card user-sidebar-hero'>
        <div className='user-sidebar-brand'>
          <img src={ResQHavenLogo} style={{width: "200px"}} alt='ResQHaven' className='user-sidebar-brand-logo' />
        </div>
        <div className='user-sidebar-hero-copy'>
          <span className='user-sidebar-kicker'>ResQHaven</span>
          <h2>{displayName}</h2>
          <p>
            Review alerts, weather, and your evacuation access tools from one panel.
          </p>
        </div>
        <div className='user-sidebar-hero-actions'>
          {user ? (
            <div className='d-grid gap-2 w-100'>
              <span className='user-sidebar-badge'>Signed in</span>
              {isEndUser ? (
                <Link to='/family-registration' className='btn btn-primary w-100'>
                  Family Registration
                </Link>
              ) : null}
              <button
                type='button'
                className='btn btn-outline-secondary w-100'
                onClick={onSignOut}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className='d-grid gap-2 w-100'>
              <Link to='/family-registration' className='btn btn-primary w-100'>
                Family Registration
              </Link>
              <Link to='/login' className='btn btn-outline-secondary w-100'>Sign in</Link>
              <Link to='/signUp' className='btn btn-light w-100 border'>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className='user-sidebar-card'>
        <div className='user-sidebar-section-head'>
          <h3>Area Summary</h3>
          <span className='user-sidebar-caption'>Live map data</span>
        </div>

        <div className='user-summary-grid'>
          <div className='user-summary-item user-summary-item-wide'>
            <span className='user-data-label'>Current Area</span>
            <strong>{currentAreaLabel}</strong>
          </div>
          <div className='user-summary-item'>
            <span className='user-data-label'>Open Centers</span>
            <strong>{openCentersCount}</strong>
          </div>
          <div className='user-summary-item'>
            <span className='user-data-label'>Hazard Zones</span>
            <strong>{hazards.length}</strong>
          </div>
        </div>
      </div>

      <div className='user-sidebar-card'>
        <div className='user-sidebar-section-head'>
          <h3>Current Location</h3>
          <span className='user-sidebar-caption'>Device GPS</span>
        </div>

        {currentLocation ? (
          <div className='user-weather-card'>
            <div className='user-weather-main'>
              <strong>{currentLocation.label}</strong>
              <span>Available</span>
            </div>
            <div className='user-weather-meta'>
              <div>
                <span className='user-data-label'>Latitude</span>
                <strong>{currentLocation.latitude.toFixed(5)}</strong>
              </div>
              <div>
                <span className='user-data-label'>Longitude</span>
                <strong>{currentLocation.longitude.toFixed(5)}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className='user-sidebar-empty'>Current location is unavailable.</div>
        )}
      </div>

      <div className='user-sidebar-card'>
        <div className='user-sidebar-section-head'>
          <h3>PAGASA Weather</h3>
          <span className='user-sidebar-caption'>Bacolod / Negros</span>
        </div>

        {weather ? (
          <div className='user-weather-card'>
            <div className='user-weather-main'>
              <strong>{weather.location}</strong>
              <span>{weather.condition}</span>
            </div>
            <div className='user-weather-meta'>
              <div>
                <span className='user-data-label'>Issued</span>
                <strong>{weather.issuedAt || 'Unavailable'}</strong>
              </div>
              <div>
                <span className='user-data-label'>Cause</span>
                <strong>{weather.causedBy}</strong>
              </div>
            </div>
            <p>{weather.impacts}</p>
            <small>{weather.note}</small>
            <a href={weather.sourceUrl} target='_blank' rel='noreferrer'>
              View official bulletin
            </a>
          </div>
        ) : (
          <div className='user-sidebar-empty'>Weather data is loading.</div>
        )}
      </div>

      <div className='user-sidebar-card'>
        <div className='user-sidebar-section-head'>
          <h3>Active Alerts</h3>
          <span className='user-sidebar-badge subtle'>{alerts.length}</span>
        </div>

        <div className='user-alert-list'>
          {alerts.length > 0 ? alerts.slice(0, 4).map((alert) => {
            const config = DISASTER_CONFIG[alert.type] || {
              icon: 'bi-exclamation-triangle',
              color: '#64748b',
              label: alert.type
            }

            return (
              <div key={alert.id} className='user-alert-item'>
                <div className='user-alert-icon' style={{ color: config.color }}>
                  <i className={`bi ${config.icon}`} />
                </div>
                <div>
                  <strong>{alert.name}</strong>
                  <span>{alert.severity}</span>
                  <p>{alert.affected_areas}</p>
                </div>
              </div>
            )
          }) : (
            <div className='user-sidebar-empty'>No active alerts at the moment.</div>
          )}
        </div>
      </div>

      <div className='user-sidebar-card'>
        <div className='user-sidebar-section-head'>
          <h3>Emergency Hotlines</h3>
          <span className='user-sidebar-badge subtle'>{hotlines.length}</span>
        </div>

        <div className='user-center-list'>
          {hotlines.length > 0 ? hotlines.slice(0, 5).map((hotline) => (
            <div key={hotline.id} className='user-center-item'>
              <div className='d-flex align-items-start justify-content-between gap-2'>
                <div>
                  <strong>{hotline.name}</strong>
                  <p>{[hotline.type, hotline.city || hotline.province].filter(Boolean).join(' • ') || 'Emergency hotline'}</p>
                </div>
                <span className='user-status-pill open'>
                  Call
                </span>
              </div>
              <div className='mt-2 d-flex flex-column gap-1'>
                <a href={`tel:${hotline.phone_number}`} className='text-decoration-none fw-semibold'>
                  {hotline.phone_number}
                </a>
                {hotline.alternative_number ? (
                  <a href={`tel:${hotline.alternative_number}`} className='text-decoration-none text-muted' style={{ fontSize: 13 }}>
                    Alt: {hotline.alternative_number}
                  </a>
                ) : null}
                {hotline.address ? (
                  <small>{hotline.address}</small>
                ) : null}
              </div>
            </div>
          )) : (
            <div className='user-sidebar-empty'>No emergency hotlines available right now.</div>
          )}
        </div>
      </div>

      <div className='user-sidebar-card'>
        <div className='user-sidebar-section-head'>
          <h3>Evacuation Centers</h3>
        </div>

        <div className='user-center-list'>
          {availableCenters.map((center) => {
            const occupancy = center.capacity
              ? Math.round((center.current_occupancy / center.capacity) * 100)
              : 0

            return (
              <div key={center.id} className='user-center-item'>
                <div className='d-flex align-items-start justify-content-between gap-2'>
                  <div>
                    <strong>{center.name}</strong>
                    <p>{center.address || center.barangay || 'Location unavailable'}</p>
                  </div>
                  <span className={`user-status-pill ${center.status === 'open' ? 'open' : 'closed'}`}>
                    {center.status}
                  </span>
                </div>
                <div className='user-center-bar'>
                  <span style={{ width: `${occupancy}%` }} />
                </div>
                <small>{center.current_occupancy} / {center.capacity} occupants</small>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

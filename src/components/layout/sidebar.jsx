 import React from 'react'
import '../styles/Sidebar.css'

function Sidebar() {

  const hazardZones = [
    { color: '#ef4444', label: 'Very High' },
    { color: '#f97316', label: 'High' },
    { color: '#eab308', label: 'Moderate' },
    { color: '#22c55e', label: 'Low' },
  ];

  const centerStatus = [
    { color: '#22c55e', label: 'Available' },
    { color: '#f97316', label: 'Almost Full' },
    { color: '#ef4444', label: 'Full' },
  ];

  return (
    <div className='d-flex flex-column p-3 bg-white h-100 overflow-auto'>

      {/* Header */}
      <div className='d-flex align-items-center 
        gap-2 p-3 rounded-3 mb-3'
        style={{ background: '#ef4444' }}
      >
        <span style={{ fontSize: 28 }}>🛡️</span>
        <div>
          <div className='fw-bold text-white'
            style={{ fontSize: 16 }}
          >
            DisasterPH
          </div>
          <div className='text-white opacity-75'
            style={{ fontSize: 10 }}
          >
            Early Warning System
          </div>
        </div>
      </div>

      {/* Hazard Zones */}
<div className='mb-2'>
  <p className='fw-bold mb-2'
    style={{ fontSize: 13 }}
  >
    ⚠️ Hazard Zones
  </p>

  <div className='progress'
    style={{ height: 10, borderRadius: 6 }}
  >
    <div className='progress-bar'
      style={{ width: '25%', background: '#22c55e' }}
    />
    <div className='progress-bar'
      style={{ width: '25%', background: '#eab308' }}
    />
    <div className='progress-bar'
      style={{ width: '25%', background: '#f97316' }}
    />
    <div className='progress-bar'
      style={{ width: '25%', background: '#ef4444' }}
    />
  </div>

  <div className='d-flex justify-content-between mt-1'>
    <span style={{ fontSize: 10, color: '#22c55e' }}>● Low</span>
    <span style={{ fontSize: 10, color: '#eab308' }}>● Moderate</span>
    <span style={{ fontSize: 10, color: '#f97316' }}>● High</span>
    <span style={{ fontSize: 10, color: '#ef4444' }}>● Very High</span>
  </div>
</div>

      <hr className='my-2' />

      {/* Center Status */}
<div className='mb-2'>
  <p className='fw-bold mb-2'
    style={{ fontSize: 13 }}
  >
    🏠 Center Status
  </p>

  <div className='progress'
    style={{ height: 10, borderRadius: 6 }}
  >
    <div className='progress-bar'
      style={{ width: '34%', background: '#22c55e' }}
    />
    <div className='progress-bar'
      style={{ width: '33%', background: '#f97316' }}
    />
    <div className='progress-bar'
      style={{ width: '33%', background: '#ef4444' }}
    />
  </div>

  <div className='d-flex justify-content-between mt-1'>
    <span style={{ fontSize: 10, color: '#22c55e' }}>● Available</span>
    <span style={{ fontSize: 10, color: '#f97316' }}>● Almost Full</span>
    <span style={{ fontSize: 10, color: '#ef4444' }}>● Full</span>
  </div>
</div>

      <hr className='my-2' />

      {/* Active Alerts */}
      <div className='mb-2'>
        <p className='fw-bold mb-2'
          style={{ fontSize: 13 }}
        >
          🚨 Active Alerts
        </p>

        <div className='d-flex align-items-center 
          gap-2 bg-light rounded-2 p-2 mb-2'
          style={{ borderLeft: '3px solid #f59e0b' }}
        >
          <span style={{ fontSize: 20 }}>🌀</span>
          <div>
            <div className='fw-bold'
              style={{ fontSize: 13 }}
            >
              Typhoon
            </div>
            <div className='fw-semibold'
              style={{ fontSize: 11, color: '#f59e0b' }}
            >
              Signal 2
            </div>
            <div className='text-muted'
              style={{ fontSize: 11 }}
            >
              📍 Northern Cebu
            </div>
          </div>
        </div>

        <div className='d-flex align-items-center 
          gap-2 bg-light rounded-2 p-2 mb-2'
          style={{ borderLeft: '3px solid #3b82f6' }}
        >
          <span style={{ fontSize: 20 }}>🌊</span>
          <div>
            <div className='fw-bold'
              style={{ fontSize: 13 }}
            >
              Flood
            </div>
            <div className='fw-semibold'
              style={{ fontSize: 11, color: '#3b82f6' }}
            >
              High Risk
            </div>
            <div className='text-muted'
              style={{ fontSize: 11 }}
            >
              📍 Mambaling
            </div>
          </div>
        </div>

      </div>

      <hr className='my-2' />

      {/* Nearest Centers */}
      <div className='mb-2'>
        <p className='fw-bold mb-2'
          style={{ fontSize: 13 }}
        >
          🏠 Nearest Centers
        </p>

        {[
          {
            name: 'Mambaling Elementary',
            distance: '0.5km',
            capacity: 80,
            status: 'open'
          },
          {
            name: 'Cebu Sports Center',
            distance: '1.2km',
            capacity: 95,
            status: 'full'
          },
          {
            name: 'Talamban National HS',
            distance: '2.1km',
            capacity: 45,
            status: 'open'
          },
        ].map((center, i) => (
          <div key={i}
            className='bg-light rounded-2 p-2 mb-2 border'
          >
            <div className='fw-bold'
              style={{ fontSize: 12 }}
            >
              {center.name}
            </div>
            <div className='text-muted mb-1'
              style={{ fontSize: 11 }}
            >
              📍 {center.distance} away
            </div>

            {/* Capacity Bar */}
            <div className='progress mb-1'
              style={{ height: 6 }}
            >
              <div
                className='progress-bar'
                style={{
                  width: `${center.capacity}%`,
                  background:
                    center.capacity >= 90 ? '#ef4444' :
                    center.capacity >= 70 ? '#f97316' :
                    '#22c55e'
                }}
              />
            </div>

            <div className='d-flex 
              justify-content-between 
              align-items-center'
            >
              <span className='text-muted'
                style={{ fontSize: 10 }}
              >
                {center.capacity}% Full
              </span>
              <span className={`badge ${
                center.status === 'open'
                  ? 'text-success bg-success-subtle'
                  : 'text-danger bg-danger-subtle'
              }`}
                style={{ fontSize: 10 }}
              >
                {center.status === 'open'
                  ? '✅ Open' : '❌ Full'}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}


export default Sidebar
import { useState } from 'react'
import { postRequest } from '../../../../API/API'

const SIMULATIONS = [
  {
    id: 'typhoon',
    icon: '🌀',
    name: 'Typhoon',
    color: 'primary',
    description: 'Simulate a typhoon signal warning',
    scenarios: [
      {
        label: 'Signal No. 1',
        severity: 'Low',
        data: {
          type: 'typhoon',
          name: 'Typhoon SIMULATION-HENRY',
          severity: 'Signal No. 1',
          wind_speed: 60,
          affected_areas: 'Cebu City, Mandaue, Lapu-Lapu',
          source: 'PAGASA SIMULATION'
        }
      },
      {
        label: 'Signal No. 3',
        severity: 'High',
        data: {
          type: 'typhoon',
          name: 'Super Typhoon SIMULATION-HENRY',
          severity: 'Signal No. 3',
          wind_speed: 185,
          affected_areas: 'Entire Cebu Province',
          source: 'PAGASA SIMULATION'
        }
      }
    ]
  },
  {
    id: 'earthquake',
    icon: '🌍',
    name: 'Earthquake',
    color: 'warning',
    description: 'Simulate an earthquake alert',
    scenarios: [
      {
        label: 'Magnitude 5.0',
        severity: 'Moderate',
        data: {
          type: 'earthquake',
          name: 'SIMULATION Earthquake',
          severity: 'Moderate',
          magnitude: 5.0,
          latitude: 10.3157,
          longitude: 123.8854,
          affected_areas: 'Cebu City, Talisay',
          source: 'PHIVOLCS SIMULATION'
        }
      },
      {
        label: 'Magnitude 7.2',
        severity: 'Destructive',
        data: {
          type: 'earthquake',
          name: 'SIMULATION Major Earthquake',
          severity: 'Destructive',
          magnitude: 7.2,
          latitude: 10.3157,
          longitude: 123.8854,
          affected_areas: 'Entire Metro Cebu',
          source: 'PHIVOLCS SIMULATION'
        }
      }
    ]
  },
  {
    id: 'tsunami',
    icon: '🌊',
    name: 'Tsunami',
    color: 'info',
    description: 'Simulate a tsunami warning',
    scenarios: [
      {
        label: 'Advisory',
        severity: 'Watch',
        data: {
          type: 'tsunami',
          name: 'SIMULATION Tsunami Advisory',
          severity: 'Watch',
          affected_areas: 'Cebu Coastline, Mactan',
          source: 'NOAA SIMULATION'
        }
      },
      {
        label: 'Warning',
        severity: 'Critical',
        data: {
          type: 'tsunami',
          name: 'SIMULATION Tsunami Warning',
          severity: 'Warning',
          affected_areas: 'All Coastal Barangays Cebu',
          source: 'NOAA SIMULATION'
        }
      }
    ]
  },
  {
    id: 'volcanic',
    icon: '🌋',
    name: 'Volcanic Eruption',
    color: 'danger',
    description: 'Simulate a volcanic eruption alert',
    scenarios: [
      {
        label: 'Alert Level 2',
        severity: 'Moderate',
        data: {
          type: 'flood',
          name: 'SIMULATION Volcanic Unrest',
          severity: 'Alert Level 2',
          affected_areas: 'Camotes, Danao City',
          source: 'PHIVOLCS SIMULATION'
        }
      },
      {
        label: 'Alert Level 4',
        severity: 'Critical',
        data: {
          type: 'flood',
          name: 'SIMULATION Volcanic Eruption',
          severity: 'Alert Level 4 - Hazardous Eruption',
          affected_areas: 'Northern Cebu, Bohol Strait',
          source: 'PHIVOLCS SIMULATION'
        }
      }
    ]
  },
  {
    id: 'flood',
    icon: '💧',
    name: 'Flood',
    color: 'success',
    description: 'Simulate a flood warning',
    scenarios: [
      {
        label: 'Yellow Warning',
        severity: 'Moderate',
        data: {
          type: 'flood',
          name: 'SIMULATION Flood Warning',
          severity: 'Yellow - Moderate',
          affected_areas: 'Mambaling, Pasil, Labangon',
          source: 'PAGASA SIMULATION'
        }
      },
      {
        label: 'Red Warning',
        severity: 'Critical',
        data: {
          type: 'flood',
          name: 'SIMULATION Severe Flooding',
          severity: 'Red - Critical',
          affected_areas: 'Low-lying areas Cebu City',
          source: 'PAGASA SIMULATION'
        }
      }
    ]
  },
  {
    id: 'fire',
    icon: '🔥',
    name: 'Fire',
    color: 'danger',
    description: 'Simulate a fire alert',
    scenarios: [
      {
        label: 'First Alarm',
        severity: 'Moderate',
        data: {
          type: 'fire',
          name: 'SIMULATION Structure Fire',
          severity: 'First Alarm',
          affected_areas: 'Barangay Luz, Cebu City',
          source: 'BFP SIMULATION'
        }
      },
      {
        label: 'Fourth Alarm',
        severity: 'Critical',
        data: {
          type: 'fire',
          name: 'SIMULATION Major Fire',
          severity: 'Fourth Alarm - General',
          affected_areas: 'Carbon Market Area, Cebu City',
          source: 'BFP SIMULATION'
        }
      }
    ]
  }
]

export default function DisasterSimulation() {
  const [activeSimulation, setActiveSimulation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [runningAlert, setRunningAlert] = useState(null)

  const handleSimulate = async (scenario, disasterType) => {
    setLoading(true)
    setResult(null)
    setError('')
    setRunningAlert(disasterType.id)

    try {
      const response = await postRequest(
        'auth/simulate',
        scenario.data
      )

      if (response.success) {
        setResult({
          type: disasterType.name,
          icon: disasterType.icon,
          scenario: scenario.label,
          severity: scenario.severity,
          alertId: response.alertId,
          message: response.message
        })
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Simulation failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    if (!result?.alertId) return

    try {
      setLoading(true)
      await postRequest('auth/simulate/resolve', {
        alertId: result.alertId
      })
      setResult(null)
      setRunningAlert(null)
    } catch (err) {
      setError('Failed to resolve alert.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-4'>

      {/* Header */}
      <div className='mb-4'>
        <div className='d-flex align-items-center
          gap-2 mb-1'
        >
          <h4 className='fw-bold mb-0'>
            🎮 Disaster Simulation
          </h4>
          <span className='badge bg-warning
            text-dark'
          >
            DEMO MODE
          </span>
        </div>
        <p className='text-muted mb-0'
          style={{ fontSize: 13 }}
        >
          Simulate disaster alerts for
          hackathon showcase purposes only.
          All simulations are clearly marked
          and do not send real alerts.
        </p>
      </div>

      {/* ── Active Result ── */}
      {result && (
        <div className='alert alert-danger
          d-flex align-items-start gap-3
          mb-4'
          style={{ borderLeft: '4px solid #dc3545' }}
        >
          <div style={{ fontSize: '2rem' }}>
            {result.icon}
          </div>
          <div className='flex-grow-1'>
            <div className='fw-bold mb-1'>
              🚨 SIMULATION ACTIVE —{' '}
              {result.type} {result.scenario}
            </div>
            <div style={{ fontSize: 13 }}>
              Severity: <strong>{result.severity}</strong>
            </div>
            <div style={{ fontSize: 13 }}>
              Alert ID: #{result.alertId}
            </div>
            <div className='mt-2'>
              <button
                className='btn btn-sm
                  btn-outline-danger'
                onClick={handleResolve}
                disabled={loading}
              >
                ✅ Resolve Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className='alert alert-danger
          py-2 mb-4'
          style={{ fontSize: 13 }}
        >
          ❌ {error}
        </div>
      )}

      {/* ── Simulation Cards ── */}
      <div className='row g-3'>
        {SIMULATIONS.map(disaster => (
          <div key={disaster.id}
            className='col-md-6 col-lg-4'
          >
            <div
              className={`card border-0
                shadow-sm h-100 ${
                runningAlert === disaster.id
                  ? `border border-${disaster.color}`
                  : ''
              }`}
            >
              <div className='card-body p-4'>

                {/* Icon + Name */}
                <div className='d-flex
                  align-items-center gap-2 mb-2'
                >
                  <span style={{ fontSize: '2rem' }}>
                    {disaster.icon}
                  </span>
                  <div>
                    <h6 className='fw-bold mb-0'>
                      {disaster.name}
                    </h6>
                    <div className='text-muted'
                      style={{ fontSize: 12 }}
                    >
                      {disaster.description}
                    </div>
                  </div>
                </div>

                {/* Active Badge */}
                {runningAlert === disaster.id && (
                  <div className='mb-2'>
                    <span className='badge
                      bg-danger'
                    >
                      <span className='me-1'>●</span>
                      SIMULATION RUNNING
                    </span>
                  </div>
                )}

                <hr className='my-3' />

                {/* Scenarios */}
                <div className='d-flex
                  flex-column gap-2'
                >
                  {disaster.scenarios.map(
                    (scenario, i) => (
                      <button
                        key={i}
                        className={`btn btn-sm
                          btn-outline-${disaster.color}
                          d-flex align-items-center
                          justify-content-between`}
                        onClick={() =>
                          handleSimulate(
                            scenario, disaster
                          )
                        }
                        disabled={
                          loading ||
                          runningAlert !== null
                        }
                      >
                        <span>{scenario.label}</span>
                        <span className={`badge
                          bg-${
                            scenario.severity === 'Critical'
                              ? 'danger'
                              : scenario.severity === 'High'
                              ? 'warning text-dark'
                              : 'secondary'
                          }`}
                        >
                          {scenario.severity}
                        </span>
                      </button>
                    )
                  )}
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Loading Overlay ── */}
      {loading && (
        <div
          className='position-fixed top-0
            start-0 w-100 h-100
            d-flex align-items-center
            justify-content-center'
          style={{
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999
          }}
        >
          <div className='card border-0
            shadow p-4 text-center'
          >
            <div className='spinner-border
              text-danger mx-auto mb-3'
            />
            <div className='fw-semibold'>
              Running Simulation...
            </div>
            <div className='text-muted'
              style={{ fontSize: 13 }}
            >
              Please wait
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className='alert alert-warning
        mt-4 py-2'
        style={{ fontSize: 12 }}
      >
        ⚠️ <strong>DISCLAIMER:</strong> All
        simulations are for demonstration
        purposes only. No real SMS or email
        alerts are sent during simulation.
      </div>

    </div>
  )
}

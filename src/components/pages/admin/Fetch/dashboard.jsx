import { useEffect, useState } from 'react'
import { getRequest } from '../../../../API/API'
import { Link } from 'react-router'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCenters: 0,
    openCenters: 0,
    totalEvacuees: 0,
    activeAlerts: 0,
  })
  const [centers, setCenters] = useState([])
  const [needs, setNeeds] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centersRes, need] = await Promise.all([
          getRequest('api/evacuations'),
          getRequest('api/needs'),
        ])

        setCenters(centersRes)
        setNeeds(need)

        setStats({
          totalCenters: centersRes.length,
          openCenters: centersRes.filter(c => c.status === 'open').length,
          totalEvacuees: centersRes.reduce(
            (sum, c) => sum + c.current_occupancy, 0
          ),
          activeAlerts: 0
        })

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ minHeight: 400 }}>
        <div className='spinner-border text-danger' />
      </div>
    )
  }

  return (
    <div className='p-4' style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <div className='mb-4'>
        <h4 className='fw-semibold mb-1'>Dashboard</h4>
        <p className='text-muted' style={{ fontSize: 13 }}>
          Disaster Response Overview
        </p>
      </div>

      {/* 🔥 STAT CARDS */}
      <div className='row g-3 mb-4'>
        {[
          {
            label: 'Centers',
            value: stats.totalCenters,
            sub: `${stats.openCenters} open`,
            icon: <i class="bi bi-houses"></i>
          },
          {
            label: 'Evacuees',
            value: stats.totalEvacuees,
            icon: <i class="bi bi-person"></i>
          },
          {
            label: 'Alerts',
            value: stats.activeAlerts,
            icon: <i class="bi bi-exclamation-diamond"></i>
          },
          {
            label: 'Needs',
            value: needs?.count?.[0]?.count || 0,
            icon: <i class="bi bi-megaphone"></i>
          }
        ].map((card, i) => (
          <div key={i} className='col-6 col-md-3'>
            <div
              className='p-3 rounded-4 shadow-sm h-100'
              style={{
                background: '#ffffff',
                border: '1px solid #f1f1f1'
              }}
            >
              <div style={{ fontSize: 22 }}>{card.icon}</div>
              <div className='fw-bold fs-4 mt-1'>{card.value}</div>
              <div className='text-muted' style={{ fontSize: 13 }}>
                {card.label}
              </div>
              {card.sub && (
                <div className='text-success' style={{ fontSize: 12 }}>
                  {card.sub}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className='row g-3'>

        {/* 🏠 CENTERS */}
        <div className='col-md-8'>
          <div className='p-3 rounded-4 shadow-sm bg-white'>

            <div className='d-flex justify-content-between mb-3'>
              <h6 className='fw-semibold mb-0'>Evacuation Centers</h6>
              <Link to='/evacuation' className='text-decoration-none small text-danger'>
                View all →
              </Link>
            </div>

            <table className='table align-middle mb-0' style={{ fontSize: 13 }}>
              <thead className='text-muted'>
                <tr>
                  <th>Center</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {centers.slice(0, 5).map(c => {
                  const pct = Math.round((c.current_occupancy / c.capacity) * 100)

                  return (
                    <tr key={c.id}>
                      <td>
                        <div className='fw-medium'>{c.name}</div>
                        <div className='text-muted small'>{c.barangay}</div>
                      </td>

                      <td style={{ width: 180 }}>
                        <div className='d-flex align-items-center gap-2'>
                          <div className='progress flex-grow-1' style={{ height: 6 }}>
                            <div
                              className='progress-bar'
                              style={{
                                width: `${pct}%`,
                                background:
                                  pct >= 90 ? '#dc3545' :
                                  pct >= 70 ? '#ffc107' :
                                  '#198754'
                              }}
                            />
                          </div>
                          <small>{c.current_occupancy}/{c.capacity}</small>
                        </div>
                      </td>

                      <td>
                        <span
                          className='px-2 py-1 rounded-pill small'
                          style={{
                            background:
                              c.status === 'open'
                                ? '#e6f4ea'
                                : c.status === 'full'
                                ? '#fdecea'
                                : '#f1f1f1',
                            color:
                              c.status === 'open'
                                ? '#198754'
                                : c.status === 'full'
                                ? '#dc3545'
                                : '#6c757d'
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

          </div>
        </div>

        {/* 🆘 NEEDS */}
        <div className='col-md-4'>
          <div className='p-3 rounded-4 shadow-sm bg-white'>

            <h6 className='fw-semibold mb-3'>Needs Summary</h6>

            {[
              { label: 'Food', icon: <i class="bi bi-fork-knife"></i>, value: needs?.foods?.[0]?.foodCount },
              { label: 'Water', icon: <i class="bi bi-droplet"></i>, value: needs?.foods?.[0]?.foodCount },
              { label: 'Medical', icon:<i class="bi bi-capsule"></i>, value: needs?.medCount?.[0]?.medCount },
              { label: 'Special', icon: <i class="bi bi-bag-plus"></i>, value: needs?.special?.[0]?.specialCount },
            ].map((item, i) => (
              <div
                key={i}
                className='d-flex justify-content-between align-items-center py-2 border-bottom'
              >
                <div className='d-flex align-items-center gap-2'>
                  <span>{item.icon}</span>
                  <span style={{ fontSize: 13 }}>{item.label}</span>
                </div>
                <span className='fw-semibold'>
                  {item.value || 0}
                </span>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  )
}
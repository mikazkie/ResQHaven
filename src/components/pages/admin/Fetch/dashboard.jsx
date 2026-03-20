// src/pages/admin/Dashboard.jsx
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
  const [active, setActive] = useState(null)
  const [recentCheckins, setRecentCheckins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch centers
        const [centersRes, need, ac] = await Promise.all([
        getRequest('api/evacuations'),
        getRequest('api/needs'),
        getRequest('api/active')
        ])
        console.log(need.count);
                
        
        setCenters(centersRes)
        setNeeds(need)
        setActive(ac.active)

        // Calculate stats
        setStats({
          totalCenters: centersRes.length,
          openCenters: centersRes.filter(
            c => c.status === 'open'
          ).length,
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
      <div className='d-flex justify-content-center
        align-items-center'
        style={{ minHeight: 400 }}
      >
        <div className='spinner-border text-danger' />
      </div>
    )
  }

  return (
    <div className='p-4'>

      {/* Header */}
      <div className='mb-4'>
        <h4 className='fw-bold mb-1'>
          Dashboard
        </h4>
        <p className='text-muted mb-0'
          style={{ fontSize: 13 }}
        >
          ResQHaven Disaster Response Overview
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className='row g-3 mb-4'>

        <div className='col-6 col-md-3'>
          <div className='card border-0 shadow-sm h-100'>
            <div className='card-body p-3'>
              <div style={{ fontSize: '2rem' }}>
                🏠
              </div>
              <div className='fw-bold fs-4
                text-danger mt-1'
              >
                {stats.totalCenters}
              </div>
              <div className='text-muted'
                style={{ fontSize: 13 }}
              >
                Total Centers
              </div>
              <div className='mt-1'>
                <span className='badge bg-success'>
                  {stats.openCenters} Open
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='col-6 col-md-3'>
          <div className='card border-0 shadow-sm h-100'>
            <div className='card-body p-3'>
              <div style={{ fontSize: '2rem' }}>
                👥
              </div>
              <div className='fw-bold fs-4
                text-primary mt-1'
              >
                {stats.totalEvacuees}
              </div>
              <div className='text-muted'
                style={{ fontSize: 13 }}
              >
                Total Evacuees
              </div>
            </div>
          </div>
        </div>

        <div className='col-6 col-md-3'>
          <div className='card border-0 shadow-sm h-100'>
            <div className='card-body p-3'>
              <div style={{ fontSize: '2rem' }}>
                ⚠️
              </div>
              <div className='fw-bold fs-4
                text-warning mt-1'
              >
                {active[0].count}
              </div>
              <div className='text-muted'
                style={{ fontSize: 13 }}
              >
                Active Alerts
              </div>
            </div>
          </div>
        </div>

        <div className='col-6 col-md-3'>
          <div className='card border-0 shadow-sm h-100'>
            <div className='card-body p-3'>
              <div style={{ fontSize: '2rem' }}>
                🆘
              </div>
              <div className='fw-bold fs-4
                text-danger mt-1'
              >
                {needs.count[0].count}
              </div>
              <div className='text-muted'
                style={{ fontSize: 13 }}
              >
                Pending Needs
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className='row g-3'>

        {/* ── Evacuation Centers ── */}
        <div className='col-md-8'>
          <div className='card border-0 shadow-sm'>
            <div className='card-body p-4'>
              <div className='d-flex
                align-items-center
                justify-content-between mb-3'
              >
                <h6 className='fw-bold mb-0'>
                  🏠 Evacuation Centers
                </h6>
                <Link
                  to='/evacuation'
                  className='btn btn-sm btn-outline-danger'
                >
                  View All
                </Link>
              </div>

              <div className='table-responsive'>
                <table className='table
                  table-hover mb-0'
                  style={{ fontSize: 13 }}
                >
                  <thead className='table-light'>
                    <tr>
                      <th>Center</th>
                      <th>Capacity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centers.slice(0, 5).map(c => {
                      const pct = Math.round(
                        (c.current_occupancy /
                          c.capacity) * 100
                      )
                      return (
                        <tr key={c.id}>
                          <td className='fw-medium'>
                            {c.name}
                            <div className='text-muted'
                              style={{ fontSize: 11 }}
                            >
                              {c.barangay}
                            </div>
                          </td>
                          <td>
                            <div className='d-flex
                              align-items-center gap-2'
                            >
                              <div className='progress
                                flex-grow-1'
                                style={{ height: 6 }}
                              >
                                <div
                                  className={`progress-bar ${
                                    pct >= 90
                                      ? 'bg-danger'
                                      : pct >= 70
                                      ? 'bg-warning'
                                      : 'bg-success'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span style={{ fontSize: 11 }}>
                                {c.current_occupancy}/
                                {c.capacity}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              c.status === 'open'
                                ? 'bg-success'
                                : c.status === 'full'
                                ? 'bg-danger'
                                : 'bg-secondary'
                            }`}>
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
          </div>
        </div>

        {/* ── Needs Summary ── */}
        <div className='col-md-4'>
          <div className='card border-0 shadow-sm'>
            <div className='card-body p-4'>
              <h6 className='fw-bold mb-3'>
                🆘 Needs Summary
              </h6>

              {[
                { icon: '🍚', label: 'Food', count: needs.foods[0].foodCount, color: 'warning' },
                { icon: '💧', label: 'Water', count: needs.foods[0].foodCount, color: 'primary' },
                { icon: '🏥', label: 'Medical', count: needs.medCount[0].medCount, color: 'danger' },
                { icon: '♿', label: 'Special', count:  needs.special[0].specialCount, color: 'info' },
              ].map(item => (
                <div
                  key={item.label}
                  className='d-flex align-items-center
                    justify-content-between py-2
                    border-bottom'
                >
                  <div className='d-flex
                    align-items-center gap-2'
                  >
                    <span>{item.icon}</span>
                    <span style={{ fontSize: 13 }}>
                      {item.label}
                    </span>
                  </div>
                  <span className={`badge
                    bg-${item.color}
                    bg-opacity-10
                    text-${item.color}`}
                    style={{ fontSize: 12 }}
                  >
                    {item.count} needed
                  </span>
                </div>
              ))}

            </div>
          </div>

          {/* Quick Actions */}
          <div className='card border-0
            shadow-sm mt-3'
          >
            <div className='card-body p-4'>
              <h6 className='fw-bold mb-3'>
                ⚡ Quick Actions
              </h6>
              <div className='d-flex
                flex-column gap-2'
              >
                <Link
                  to='/check-reg'
                  className='btn btn-danger
                    btn-sm w-100 text-start'
                >
                  👥 Check In Evacuee
                </Link>
                <Link
                  to='/evacuation-reg'
                  className='btn btn-outline-danger
                    btn-sm w-100 text-start'
                >
                  🏠 Add Evacuation Center
                </Link>
                <Link
                  to='/qr-checkin'
                  className='btn btn-outline-secondary
                    btn-sm w-100 text-start'
                >
                  📷 QR Check In
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

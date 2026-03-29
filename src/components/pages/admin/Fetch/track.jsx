import { useEffect, useState } from 'react'
import { getRequest, postRequest } from '../../../../API/API'
import { useNavigate } from 'react-router'
import ConfirmModal from '../../../layout/confirmationModal'

const PRIMARY_STATUS_CONFIG = {
  safe: { label: 'Safe', color: 'bg-success' },
  at_risk: { label: 'At Risk', color: 'bg-warning text-dark' },
  evacuation_requested: { label: 'Evac Requested', color: 'bg-orange text-white' },
  evacuated: { label: 'Evacuated', color: 'bg-primary' },
  checked_in: { label: 'Checked-in', color: 'bg-info text-dark' },
  missing: { label: 'Missing', color: 'bg-warning text-dark' },
  found: { label: 'Found', color: 'bg-success' },
  dead: { label: 'Dead', color: 'bg-danger' }
}

export default function Track() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rowStep, setRowStep] = useState(10)
  const [visibleRows, setVisibleRows] = useState(10)
  const [showAll, setShowAll] = useState(false)

  const [barangay, setBarangay] = useState('')
  const [city, setMunicipality] = useState('')
  const [province, setProvince] = useState('')

  const [modal, setModal] = useState({
    show: false,
    userId: null,
    newStatus: '',
    userName: ''
  })
  const [confirmLoading, setConfirmLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch()
    }, 400)

    return () => clearTimeout(delay)
  }, [search, barangay, city, province])

  useEffect(() => {
    setVisibleRows(rowStep)
    setShowAll(false)
  }, [rowStep, search, barangay, city, province])

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await getRequest(
        `api/track?search=${search.trim()}&barangay=${barangay.trim()}&city=${city.trim()}&province=${province.trim()}`
      )

      setUsers(res.users || [])
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusClick = (e, user, newStatus) => {
    e.stopPropagation()
    setModal({
      show: true,
      userId: user.id,
      newStatus,
      userName: `${user.firstName} ${user.lastName}`
    })
  }

  const confirmUpdateStatus = async () => {
    try {
      setConfirmLoading(true)

      await postRequest('/auth/track/update-status', {
        userId: modal.userId,
        status: modal.newStatus
      })

      setUsers(prev =>
        prev.map(u =>
          u.id === modal.userId
            ? { ...u, primary_status: modal.newStatus }
            : u
        )
      )

      setModal({
        show: false,
        userId: null,
        newStatus: '',
        userName: ''
      })
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setConfirmLoading(false)
    }
  }

  const normalizedRowStep =
    Number.isFinite(Number(rowStep)) && Number(rowStep) > 0
      ? Number(rowStep)
      : 10

  const displayedUsers = showAll
    ? users
    : users.slice(0, visibleRows)

  const canShowMore = !showAll && displayedUsers.length < users.length
  const canShowLess = showAll || visibleRows > normalizedRowStep

  return (
    <div
      className='container py-4'
      style={{ maxWidth: 950 }}
    >
      <ConfirmModal
        show={modal.show}
        title='Update Status'
        message={`Mark ${modal.userName} as "${modal.newStatus}"?`}
        confirmText='Yes, Update'
        onConfirm={confirmUpdateStatus}
        onClose={() =>
          setModal({
            show: false,
            userId: null,
            newStatus: '',
            userName: ''
          })
        }
        loading={confirmLoading}
      />

      <div className='mb-4'>
        <h4 className='fw-semibold mb-1'>Track Person</h4>
        <p className='text-muted small mb-3'>
          Search and monitor evacuee status
        </p>

        <input
          type='text'
          className='form-control rounded-pill shadow-sm px-3 py-2 mb-2'
          placeholder='Search name, email, or phone...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className='row g-2'>
          <div className='col-md-4'>
            <input
              type='text'
              className='form-control form-control-sm rounded-pill'
              placeholder='Barangay'
              value={barangay}
              onChange={e => setBarangay(e.target.value)}
            />
          </div>
          <div className='col-md-4'>
            <input
              type='text'
              className='form-control form-control-sm rounded-pill'
              placeholder='Municipality'
              value={city}
              onChange={e => setMunicipality(e.target.value)}
            />
          </div>
          <div className='col-md-4'>
            <input
              type='text'
              className='form-control form-control-sm rounded-pill'
              placeholder='Province'
              value={province}
              onChange={e => setProvince(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className='alert alert-danger py-2'>
          {error}
        </div>
      )}

      <div className='bg-white rounded-4 shadow-sm p-3'>
        <div className='d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap'>
          <h6 className='mb-0 text-muted'>
            Results
            <span className='badge bg-danger ms-2'>
              {users.length}
            </span>
          </h6>

          <div className='d-flex align-items-center gap-2'>
            <label
              className='text-muted mb-0'
              style={{ fontSize: 12 }}
            >
              Rows per load
            </label>
            <input
              type='number'
              min='1'
              className='form-control form-control-sm rounded-pill text-center'
              style={{ width: 90 }}
              value={rowStep}
              onChange={e =>
                setRowStep(Math.max(1, Number(e.target.value) || 1))
              }
            />
            {loading ? (
              <span className='spinner-border spinner-border-sm text-danger' />
            ) : null}
          </div>
        </div>

        <div className='table-responsive'>
          <table className='table align-middle'>
            <thead className='text-muted small'>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {displayedUsers.length > 0 ? (
                displayedUsers.map(user => {
                  const statusConfig =
                    PRIMARY_STATUS_CONFIG[user.primary_status] || {
                      label: user.primary_status || 'Unknown',
                      color: 'bg-secondary'
                    }

                  return (
                    <tr
                      key={user.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`user/${user.id}`)}
                    >
                      <td>
                        <div className='fw-medium'>
                          {user.firstName} {user.lastName}
                        </div>
                        <div
                          className='text-muted'
                          style={{ fontSize: 11 }}
                        >
                          {user.email}
                        </div>
                      </td>

                      <td
                        className='text-muted'
                        style={{ fontSize: 13 }}
                      >
                        {user.phone}
                      </td>

                      <td className='text-muted small'>
                        {user.barangay}, {user.city}, {user.province}
                      </td>

                      <td>
                        <span className={`badge rounded-pill px-3 py-2 ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>

                      <td>
                        <div className='d-flex gap-1 flex-wrap'>
                          <button
                            className='btn btn-sm btn-outline-warning rounded-pill'
                            onClick={e =>
                              handleStatusClick(e, user, 'missing')
                            }
                          >
                            Missing
                          </button>

                          <button
                            className='btn btn-sm btn-outline-success rounded-pill'
                            onClick={e =>
                              handleStatusClick(e, user, 'found')
                            }
                          >
                            Found
                          </button>

                          <button
                            className='btn btn-sm btn-outline-danger rounded-pill'
                            onClick={e =>
                              handleStatusClick(e, user, 'dead')
                            }
                          >
                            Dead
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan='5'
                    className='text-center text-muted py-4'
                  >
                    {loading ? 'Loading...' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3'>
          <div
            className='text-muted'
            style={{ fontSize: 12 }}
          >
            Showing {displayedUsers.length} of {users.length} rows
          </div>

          <div className='d-flex flex-wrap gap-2'>
            <button
              type='button'
              className='btn btn-outline-secondary btn-sm rounded-pill px-3'
              onClick={() => {
                if (showAll) {
                  setShowAll(false)
                  setVisibleRows(Math.max(normalizedRowStep, users.length - normalizedRowStep))
                  return
                }

                setVisibleRows(prev => Math.max(normalizedRowStep, prev - normalizedRowStep))
              }}
              disabled={!canShowLess || users.length === 0}
            >
              Show Less
            </button>

            <button
              type='button'
              className='btn btn-outline-primary btn-sm rounded-pill px-3'
              onClick={() =>
                setVisibleRows(prev => prev + normalizedRowStep)
              }
              disabled={!canShowMore}
            >
              Show More
            </button>

            <button
              type='button'
              className='btn btn-outline-secondary btn-sm rounded-pill px-3'
              onClick={() => setShowAll(true)}
              disabled={showAll || users.length === 0}
            >
              Show All
            </button>
          </div>
        </div>
      </div>

      <button
        type='button'
        className='btn btn-dark rounded-pill shadow position-fixed'
        style={{
          right: 24,
          bottom: 24,
          zIndex: 1030
        }}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
      >
        Top
      </button>
    </div>
  )
}

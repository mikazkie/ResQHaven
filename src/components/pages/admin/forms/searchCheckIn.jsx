import { useEffect, useState } from 'react'
import { getRequest, postRequest } from '../../../../API/API'
import { useNavigate } from 'react-router'

export default function SearchCheckin() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim() !== '') {
        handleSearch()
      } else {
        setUsers([])
      }
    }, 400)

    return () => clearTimeout(delay)
  }, [search])

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await getRequest(`/api/track?search=${search}`)
      setUsers(res.users || [])
    } catch (err) {
      setError('Failed to fetch data.')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (userId, status, event) => {
    event.stopPropagation()

    try {
      await postRequest('/auth/track/update-status', { userId, status })
      setUsers((prev) =>
        prev.map((user) => (
          user.id === userId ? { ...user, status } : user
        ))
      )
    } catch (err) {
      setError('Failed to update status.')
    }
  }

  return (
    <div className='admin-form-page'>
      <div className='admin-form-shell'>
        <div className='admin-form-header'>
          <div>
            <span className='admin-form-kicker'>Tracking</span>
            <h1 className='admin-form-title'>Search Check-In Records</h1>
            <p className='admin-form-subtitle'>
              Search evacuees quickly and update their status from a cleaner results view.
            </p>
          </div>
          {loading && <span className='admin-form-tag'>Searching</span>}
        </div>

        <div className='card admin-form-card'>
          <div className='card-body'>
            <div className='admin-form-section'>Search</div>
            <div className='mt-4'>
              <input
                type='text'
                className='form-control'
                placeholder='Search by name, email, or phone number'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <small className='text-muted d-block mt-2'>
                Results update automatically as you type.
              </small>
            </div>

            {error && (
              <div className='alert alert-danger py-3 px-4 mt-4 mb-0'>
                {error}
              </div>
            )}
          </div>
        </div>

        <div className='card admin-form-card mt-4'>
          <div className='card-body'>
            <div className='admin-form-toolbar mb-3'>
              <div className='admin-form-section mb-0 border-0 p-0'>Results</div>
              <span className='admin-form-tag'>{users.length} record{users.length === 1 ? '' : 's'}</span>
            </div>

            <div className='table-responsive'>
              <table className='table align-middle mb-0'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th className='text-end'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`user/${user.id}`)}
                      >
                        <td className='fw-medium'>{user.firstName} {user.lastName}</td>
                        <td className='text-muted'>{user.email}</td>
                        <td className='text-muted'>{user.phone}</td>
                        <td>
                          <span className={`badge rounded-pill px-3 py-2 ${
                            user.status === 'check In'
                              ? 'bg-success-subtle text-success'
                              : user.status === 'missing'
                                ? 'bg-warning-subtle text-warning'
                                : user.status === 'dead'
                                  ? 'bg-danger-subtle text-danger'
                                  : 'bg-secondary-subtle text-secondary'
                          }`}>
                            {user.status || 'safe'}
                          </span>
                        </td>
                        <td>
                          <div className='d-flex gap-2 justify-content-end'>
                            <button
                              className='btn btn-sm btn-outline-warning px-3'
                              onClick={(event) => updateStatus(user.id, 'missing', event)}
                            >
                              Missing
                            </button>
                            <button
                              className='btn btn-sm btn-outline-danger px-3'
                              onClick={(event) => updateStatus(user.id, 'dead', event)}
                            >
                              Dead
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='5' className='text-center py-5'>
                        <div className='admin-form-results-empty py-4 px-3'>
                          {search ? 'No results found for the current search.' : 'Start typing to search records.'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

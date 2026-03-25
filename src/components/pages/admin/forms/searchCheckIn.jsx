import { useEffect, useState } from 'react'
import { getRequest, postRequest } from '../../../../API/API'
import { useParams, useNavigate, Link } from "react-router"

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
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (userId, status) => {
    try {
      await postRequest('/auth/track/update-status', { userId, status })

      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, status } : u
        )
      )
    } catch (err) {
      alert('Failed to update status')
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>

      <div className="mb-4">
        <h4 className="fw-semibold mb-2">Track Person</h4>
        <input
          type="text"
          className="form-control rounded-pill shadow-sm px-3 py-2"
          placeholder="Search name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <small className="text-muted">
          Start typing to search automatically
        </small>
      </div>

      {error && (
        <div className="alert alert-danger py-2">{error}</div>
      )}

      <div className="bg-white rounded-4 shadow-sm p-3">

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 text-muted">Results</h6>
          {loading && <span className="spinner-border spinner-border-sm"></span>}
        </div>

        <div className="table-responsive">
          <table className="table align-middle">

            <thead className="text-muted small">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id} 
                  style={{ cursor: 'pointer' }}
                      onClick={() =>
                        navigate(`user/${user.id}`)
                      }
                  >

                    <td className="fw-medium">
                      {user.firstName} {user.lastName}
                    </td>

                    <td className="text-muted">{user.email}</td>
                    <td className="text-muted">{user.phone}</td>

                    <td>
                      <span className={`badge rounded-pill px-3 py-2
                        ${user.status === 'check In'
                          ? 'bg-success'
                          : user.status === 'missing'
                          ? 'bg-warning text-dark'
                          : 'bg-success'
                        }`}
                      >
                        {user.status || 'safe'}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-warning rounded-pill"
                          onClick={() => updateStatus(user.id, 'missing')}
                        >
                          Missing
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill"
                          onClick={() => updateStatus(user.id, 'dead')}
                        >
                          Dead
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    {search ? 'No results found' : 'Start typing to search'}
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  )
}
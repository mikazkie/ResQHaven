import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { getRequest } from '../../../../API/API'

const ROLE_OPTIONS = [
  { value: 'barangay_official', label: 'Barangay Official' },
  { value: 'dswd', label: 'DSWD' }
]

const formatRole = (role) => {
  if (!role) return 'Unassigned'
  if (role === 'dswd') return 'DSWD'
  if (role === 'barangay_official') return 'Barangay Official'

  return role
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function Employees() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [centerFilter, setCenterFilter] = useState('')
  const [selectedRoles, setSelectedRoles] = useState([])
  const [employees, setEmployees] = useState([])
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchEmployees()
    }, 250)

    return () => clearTimeout(delay)
  }, [search, centerFilter, selectedRoles])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')

      const roleParams = selectedRoles.join(',')
      const response = await getRequest(
        `/api/employees?search=${encodeURIComponent(search.trim())}&center=${encodeURIComponent(centerFilter.trim())}&roles=${encodeURIComponent(roleParams)}`
      )

      if (response.success) {
        setEmployees(response.employees || [])
        setCenters(response.centers || [])
      }
    } catch (err) {
      setError('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = (roleValue) => {
    setSelectedRoles(prev =>
      prev.includes(roleValue)
        ? prev.filter(role => role !== roleValue)
        : [...prev, roleValue]
    )
  }

  const centerSuggestions = useMemo(
    () => centers.map(center => center.name).filter(Boolean),
    [centers]
  )

  return (
    <div
      className='container py-4'
      style={{ maxWidth: 1100 }}
    >
      <div className='mb-4'>
        <h4 className='fw-semibold mb-1'>Employees</h4>
        <p className='text-muted small mb-3'>
          Search employees, filter by assigned evacuation center, and review assignment details.
        </p>

        <input
          type='text'
          className='form-control rounded-pill shadow-sm px-3 py-2 mb-3'
          placeholder='Search name or email...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className='row g-3 align-items-end'>
          <div className='col-md-7'>
            <label
              className='form-label text-muted small mb-1'
              htmlFor='employee-center-filter'
            >
              Assigned Evacuation Center
            </label>
            <input
              id='employee-center-filter'
              list='employee-center-options'
              type='text'
              className='form-control rounded-pill px-3'
              placeholder='Search center...'
              value={centerFilter}
              onChange={e => setCenterFilter(e.target.value)}
            />
            <datalist id='employee-center-options'>
              {centerSuggestions.map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className='col-md-5'>
            <div className='text-muted small mb-2'>Role Filter</div>
            <div className='d-flex flex-wrap gap-2'>
              {ROLE_OPTIONS.map(option => {
                const checked = selectedRoles.includes(option.value)

                return (
                  <label
                    key={option.value}
                    className={`btn btn-sm rounded-pill px-3 ${
                      checked
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                  >
                    <input
                      type='checkbox'
                      className='d-none'
                      checked={checked}
                      onChange={() => toggleRole(option.value)}
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className='alert alert-danger py-2'>{error}</div>
      ) : null}

      <div className='bg-white rounded-4 shadow-sm p-3'>
        <div className='d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap'>
          <h6 className='mb-0 text-muted'>
            Results
            <span className='badge bg-danger ms-2'>
              {employees.length}
            </span>
          </h6>

          {loading ? (
            <span className='spinner-border spinner-border-sm text-danger' />
          ) : null}
        </div>

        <div className='table-responsive'>
          <table className='table align-middle'>
            <thead className='text-muted small'>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned Evacuation Center</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map(employee => (
                  <tr
                    key={employee.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/employees/${employee.id}`)}
                  >
                    <td className='fw-medium'>
                      {employee.firstName} {employee.lastName}
                    </td>
                    <td className='text-muted'>{employee.email}</td>
                    <td>
                      <span className='badge bg-light text-dark border rounded-pill px-3 py-2'>
                        {formatRole(employee.role)}
                      </span>
                    </td>
                    <td onClick={event => event.stopPropagation()}>
                      {employee.assigned_center_id ? (
                        <button
                          type='button'
                          className='btn btn-link p-0 text-decoration-none'
                          onClick={() =>
                            navigate(`/evacuation/evac-list/${employee.assigned_center_id}`)
                          }
                        >
                          {employee.assigned_center_name || `Center #${employee.assigned_center_id}`}
                        </button>
                      ) : (
                        <span className='text-muted'>No assigned center</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan='4'
                    className='text-center text-muted py-4'
                  >
                    {loading ? 'Loading...' : 'No employees found'}
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

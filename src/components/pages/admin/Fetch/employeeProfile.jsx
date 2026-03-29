import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getRequest, putRequest } from '../../../../API/API'

const formatRole = (role) => {
  if (!role) return 'Unassigned'
  if (role === 'dswd') return 'DSWD'
  if (role === 'barangay_official') return 'Barangay Official'

  return role
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [centers, setCenters] = useState([])
  const [assignedCenterId, setAssignedCenterId] = useState('0')
  const [assignedCenterSearch, setAssignedCenterSearch] = useState('')
  const [isReassigning, setIsReassigning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const [employeeResponse, centersResponse] = await Promise.all([
          getRequest(`/api/employees/${id}`),
          getRequest('/api/evacuations')
        ])

        if (employeeResponse.success) {
          setEmployee(employeeResponse.employee)
          setAssignedCenterId(String(employeeResponse.employee.assigned_center_id || 0))
          setAssignedCenterSearch(employeeResponse.employee.assigned_center_name || '')
        }

        setCenters(Array.isArray(centersResponse) ? centersResponse : [])
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [id])

  const fullName = useMemo(() => {
    if (!employee) return ''
    return `${employee.firstName} ${employee.lastName}`
  }, [employee])

  const createdDate = employee?.created_at
    ? new Date(employee.created_at).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A'

  const centerLabel = employee?.assigned_center_name
    ? `${employee.assigned_center_name}${employee.assigned_center_city ? `, ${employee.assigned_center_city}` : ''}`
    : 'No assigned center'

  const filteredCenters = useMemo(() => {
    const query = assignedCenterSearch.trim().toLowerCase()

    const normalizedCenters = centers.map((center) => ({
      ...center,
      label: [center.name, center.barangay, center.city].filter(Boolean).join(', ')
    }))

    if (!query) {
      return normalizedCenters.slice(0, 8)
    }

    return normalizedCenters
      .filter((center) =>
        center.label.toLowerCase().includes(query)
      )
      .slice(0, 8)
  }, [assignedCenterSearch, centers])

  const openReassignModal = () => {
    setAssignedCenterId(String(employee?.assigned_center_id || 0))
    setAssignedCenterSearch(
      employee?.assigned_center_name
        ? [employee.assigned_center_name, employee.assigned_center_city]
            .filter(Boolean)
            .join(', ')
        : ''
    )
    setIsReassigning(true)
    setFeedback(null)
  }

  const closeReassignModal = () => {
    setIsReassigning(false)
    setAssignedCenterId(String(employee?.assigned_center_id || 0))
    setAssignedCenterSearch(
      employee?.assigned_center_name
        ? [employee.assigned_center_name, employee.assigned_center_city]
            .filter(Boolean)
            .join(', ')
        : ''
    )
  }

  const handleCenterSearchChange = (event) => {
    const nextValue = event.target.value
    setAssignedCenterSearch(nextValue)

    const matchedCenter = centers.find((center) =>
      [center.name, center.barangay, center.city]
        .filter(Boolean)
        .join(', ')
        .toLowerCase() === nextValue.trim().toLowerCase()
    )

    setAssignedCenterId(String(matchedCenter?.id || 0))
  }

  const handleCenterSelect = (center) => {
    setAssignedCenterId(String(center.id))
    setAssignedCenterSearch([center.name, center.barangay, center.city].filter(Boolean).join(', '))
  }

  const handleSaveAssignedCenter = async () => {
    try {
      setSaving(true)
      setFeedback(null)

      const response = await putRequest(
        `auth/admins/${id}/assigned-center`,
        { assignedCenter: Number(assignedCenterId) || 0 }
      )

      if (response.success) {
        const selectedCenter = centers.find(
          (center) => Number(center.id) === Number(assignedCenterId)
        )

        setEmployee((prev) => ({
          ...prev,
          assigned_center_id: Number(assignedCenterId) || 0,
          assigned_center_name: selectedCenter?.name || null,
          assigned_center_barangay: selectedCenter?.barangay || null,
          assigned_center_city: selectedCenter?.city || null,
          assigned_center_province: selectedCenter?.province || null
        }))

        setAssignedCenterSearch(selectedCenter?.name || '')
        setIsReassigning(false)

        setFeedback({
          tone: 'success',
          message: 'Assigned evacuation center updated.'
        })
      }
    } catch (error) {
      console.log(error)
      setFeedback({
        tone: 'danger',
        message: error?.response?.data?.message || 'Failed to update assigned evacuation center.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ minHeight: 400 }}
      >
        <div className='spinner-border text-danger' />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className='p-4 text-center'>
        <p className='text-muted'>Employee not found.</p>
      </div>
    )
  }

  return (
    <div className='p-4'>
      <div className='mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2'>
        <div>
          <Link
            to='/employees'
            className='btn btn-outline-secondary btn-sm rounded-pill px-3 mb-3'
          >
            Back to Employees
          </Link>
          <h4 className='fw-semibold mb-1'>Employee Details</h4>
          <p className='text-muted mb-0' style={{ fontSize: 13 }}>
            Review employee assignment information and record details.
          </p>
        </div>
      </div>

      <div className='row g-3'>
        <div className='col-md-4'>
          <div className='card border-0 shadow-sm mb-3'>
            <div className='card-body p-4 text-center'>
              <div
                className='rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3'
                style={{
                  width: 92,
                  height: 92,
                  fontSize: '2rem',
                  color: '#b91c1c'
                }}
              >
                {fullName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(name => name.charAt(0).toUpperCase())
                  .join('')}
              </div>

              <h5 className='fw-bold mb-1'>{fullName}</h5>
              <p className='text-muted mb-2' style={{ fontSize: 13 }}>
                {employee.email}
              </p>
              <span className='badge bg-light text-dark border rounded-pill px-3 py-2'>
                {formatRole(employee.role)}
              </span>
            </div>
          </div>
        </div>

        <div className='col-md-8'>
          <div className='card border-0 shadow-sm mb-3'>
            <div className='card-body p-4'>
              <h6 className='fw-bold mb-3 border-bottom pb-2'>
                Employee Information
              </h6>

              {feedback ? (
                <div className={`alert alert-${feedback.tone} py-2`} style={{ fontSize: 13 }}>
                  {feedback.message}
                </div>
              ) : null}

              <div className='row g-3'>
                <DetailItem label='Full Name' value={fullName} />
                <DetailItem label='Email' value={employee.email || 'N/A'} />
                <DetailItem label='Role' value={formatRole(employee.role)} />
                <div className='col-md-6'>
                  <div className='text-muted' style={{ fontSize: 12 }}>
                    Assigned Evacuation Center
                  </div>
                  <div className='d-flex flex-wrap align-items-center gap-2'>
                    <div className='fw-medium' style={{ fontSize: 14 }}>
                      {employee.assigned_center_id ? (
                        <button
                          type='button'
                          className='btn btn-link p-0 text-decoration-none align-baseline'
                          onClick={() =>
                            navigate(`/evacuation/evac-list/${employee.assigned_center_id}`)
                          }
                        >
                          {centerLabel}
                        </button>
                      ) : (
                        'No assigned center'
                      )}
                    </div>
                    <button
                      type='button'
                      className='btn btn-outline-primary btn-sm rounded-pill px-3'
                      onClick={openReassignModal}
                    >
                      Reassign
                    </button>
                  </div>
                </div>
                <DetailItem label='Created At' value={createdDate} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isReassigning ? (
        <div
          className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3'
          style={{ background: 'rgba(15, 23, 42, 0.42)', zIndex: 1080 }}
          onClick={closeReassignModal}
        >
          <div
            className='card border-0 shadow-lg w-100'
            style={{ maxWidth: 560, borderRadius: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className='card-body p-4 p-md-5'>
              <div className='d-flex align-items-start justify-content-between gap-3 mb-3'>
                <div>
                  <div
                    className='text-uppercase fw-bold text-muted mb-2'
                    style={{ fontSize: 11, letterSpacing: '0.08em' }}
                  >
                    Reassign Employee
                  </div>
                  <h5 className='fw-bold mb-1'>Change assigned evacuation center</h5>
                  <p className='text-muted mb-0' style={{ fontSize: 14 }}>
                    Search for an evacuation center, then select a suggestion to update this employee.
                  </p>
                </div>
                <button
                  type='button'
                  className='btn btn-light border rounded-circle d-inline-flex align-items-center justify-content-center'
                  style={{ width: 40, height: 40 }}
                  onClick={closeReassignModal}
                  disabled={saving}
                >
                  <i className='bi bi-x-lg' />
                </button>
              </div>

              <div className='mb-3'>
                <label className='form-label'>Search evacuation center</label>
                <input
                  type='text'
                  className='form-control'
                  value={assignedCenterSearch}
                  onChange={handleCenterSearchChange}
                  onFocus={(event) => event.target.select()}
                  onClick={(event) => event.target.select()}
                  placeholder='Type center name, barangay, or city'
                />
              </div>

              <div className='border rounded-4 overflow-hidden mb-4' style={{ borderColor: '#e2e8f0' }}>
                <div
                  className='px-3 py-2 border-bottom text-muted fw-semibold'
                  style={{ fontSize: 12, background: '#f8fafc', borderColor: '#e2e8f0' }}
                >
                  Suggested evacuation centers
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  <button
                    type='button'
                    className={`btn w-100 text-start border-0 rounded-0 px-3 py-3 ${assignedCenterId === '0' ? 'bg-light' : ''}`}
                    onClick={() => {
                      setAssignedCenterId('0')
                      setAssignedCenterSearch('No assigned center')
                    }}
                  >
                    <div className='fw-semibold'>No assigned center</div>
                    <div className='text-muted' style={{ fontSize: 12 }}>
                      Remove the current evacuation center assignment.
                    </div>
                  </button>

                  {filteredCenters.length ? (
                    filteredCenters.map((center) => {
                      const label = [center.name, center.barangay, center.city].filter(Boolean).join(', ')

                      return (
                        <button
                          key={center.id}
                          type='button'
                          className={`btn w-100 text-start border-top border-0 rounded-0 px-3 py-3 ${assignedCenterId === String(center.id) ? 'bg-light' : ''}`}
                          style={{ borderColor: '#e2e8f0' }}
                          onClick={() => handleCenterSelect(center)}
                        >
                          <div className='fw-semibold'>{center.name}</div>
                          <div className='text-muted' style={{ fontSize: 12 }}>
                            {label}
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <div className='px-3 py-4 text-center text-muted' style={{ fontSize: 13 }}>
                      No evacuation centers matched your search.
                    </div>
                  )}
                </div>
              </div>

              <div className='d-flex flex-wrap justify-content-end gap-2'>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={closeReassignModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleSaveAssignedCenter}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save reassignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className='col-md-6'>
      <div className='text-muted' style={{ fontSize: 12 }}>
        {label}
      </div>
      <div className='fw-medium' style={{ fontSize: 14 }}>
        {value}
      </div>
    </div>
  )
}

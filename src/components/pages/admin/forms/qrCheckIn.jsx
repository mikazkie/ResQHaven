import { useState } from 'react'
import QRScanner from '../../../../components/QR/scan'
import { postRequest, getRequest } from '../../../../API/API'
import '../../../styles/familyCheckIn.css'

const SECONDARY_STATUS = [
  { value: 'injured', label: 'Injured' },
  { value: 'chronic_illness', label: 'With Chronic Illness' },
  { value: 'critical_condition', label: 'Critical Condition' },
  { value: 'senior_citizen', label: 'Senior Citizen' },
  { value: 'pwd', label: 'Person with Disability' },
  { value: 'pregnant', label: 'Pregnant Woman' },
  { value: 'infant_child', label: 'Infant / Child' },
  { value: 'lactating', label: 'Lactating Mother' },
  { value: 'others', label: 'Others' }
]

const TYPE_BADGE = {
  medicine: { label: 'Medicine', bg: 'bg-primary-subtle text-primary' },
  special_food: { label: 'Special Food', bg: 'bg-success-subtle text-success' },
  allergy: { label: 'Allergy', bg: 'bg-danger-subtle text-danger' }
}

const STATUS_NEEDS_MAP = {
  senior_citizen: {
    special_needs: [
      { type: 'medicine', name: 'Maintenance Medicine', quantity: 1 },
      { type: 'special_food', name: 'Soft Food', quantity: 1 }
    ]
  },
  pregnant: {
    special_needs: [
      { type: 'medicine', name: 'Prenatal Vitamins', quantity: 1 },
      { type: 'special_food', name: 'Nutritious Meals', quantity: 3 }
    ]
  },
  infant_child: {
    special_needs: [
      { type: 'special_food', name: 'Milk/Formula', quantity: 1 }
    ]
  },
  lactating: {
    special_needs: [
      { type: 'special_food', name: 'Nutritious Meals', quantity: 3 }
    ]
  },
  chronic_illness: {
    special_needs: [
      { type: 'medicine', name: 'Maintenance Medicine', quantity: 1 }
    ]
  },
  injured: {
    special_needs: [
      { type: 'medicine', name: 'Pain Reliever', quantity: 1 }
    ]
  }
}

export default function QRCheckIn() {
  const [isOnline] = useState(navigator.onLine)
  const [mode, setMode] = useState('choose')
  const [scannedUser, setScannedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [othersText, setOthersText] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState([])
  const [needInput, setNeedInput] = useState({
    type: 'medicine',
    name: '',
    quantity: ''
  })

  const applyPresetNeeds = (status) => {
    const preset = STATUS_NEEDS_MAP[status]
    if (!preset) return

    setSpecialNeeds((prev) => {
      const newItems = preset.special_needs.filter(
        (item) => !prev.some((existing) =>
          existing.name === item.name && existing.type === item.type
        )
      )

      return [
        ...prev,
        ...newItems.map((item) => ({
          ...item,
          id: Date.now() + Math.random()
        }))
      ]
    })
  }

  const handleStatusToggle = (value) => {
    setSelectedStatuses((prev) => {
      const exists = prev.includes(value)
      if (!exists) applyPresetNeeds(value)
      return exists ? prev.filter((status) => status !== value) : [...prev, value]
    })
  }

  const handleAddNeed = () => {
    if (!needInput.name.trim()) return

    setSpecialNeeds((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: needInput.type,
        name: needInput.name,
        quantity: needInput.type === 'allergy'
          ? 0
          : Number(needInput.quantity) || 1
      }
    ])

    setNeedInput((prev) => ({ ...prev, name: '', quantity: '' }))
  }

  const handleRemoveNeed = (id) => {
    setSpecialNeeds((prev) => prev.filter((item) => item.id !== id))
  }

  const resetSelections = () => {
    setSpecialNeeds([])
    setSelectedStatuses([])
    setOthersText('')
    setNeedInput({ type: 'medicine', name: '', quantity: '' })
    setScannedUser(null)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setError('')

    try {
      const response = await getRequest(`api/search-user?query=${searchQuery}`)
      setSearchResults(response.data || [])

      if ((response.data || []).length === 0) {
        setError('No users found. Try another name or phone.')
      }
    } catch (err) {
      console.log(err)
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectUser = (user) => {
    setScannedUser({
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      barangay: user.barangay,
      municipality: user.municipality,
      phone: user.phone
    })
    setSearchResults([])
    setSearchQuery('')
    setError('')
  }

  const handleScan = (userData) => {
    setScannedUser(userData)
    setSuccess('')
    setError('')
    setSpecialNeeds([])
    setSelectedStatuses([])
    setOthersText('')
    setNeedInput({ type: 'medicine', name: '', quantity: '' })
    setSearchResults([])
    setSearchQuery('')
  }

  const saveOffline = (data) => {
    const existing = JSON.parse(localStorage.getItem('offline_checkins') || '[]')
    existing.push({ ...data, offlineId: Date.now() })
    localStorage.setItem('offline_checkins', JSON.stringify(existing))
  }

  const syncOffline = async () => {
    const offline = JSON.parse(localStorage.getItem('offline_checkins') || '[]')
    if (offline.length === 0) return

    const failed = []
    let syncedCount = 0
    let skippedCount = 0

    for (const item of offline) {
      try {
        await postRequest('auth/qr-checkin', item)
        syncedCount += 1
      } catch (error) {
        const statusCode = error?.response?.status

        // Drop invalid/duplicate records from the queue so sync does not get stuck forever.
        if (statusCode && statusCode >= 400 && statusCode < 500) {
          skippedCount += 1
          continue
        }

        failed.push(item)
      }
    }

    localStorage.setItem('offline_checkins', JSON.stringify(failed))

    if (syncedCount > 0 || skippedCount > 0) {
      setSuccess(
        `Synced ${syncedCount} offline record${syncedCount === 1 ? '' : 's'}${
          skippedCount > 0
            ? ` and skipped ${skippedCount} invalid or duplicate record${skippedCount === 1 ? '' : 's'}`
            : ''
        }.`
      )
      return
    }

    setError('Offline sync could not complete right now. Please try again.')
  }

  const handleCheckIn = async () => {
    if (!scannedUser) return

    const checkInData = {
      user_id: scannedUser.userId,
      primary_status: 'checked_in',
      second_status: selectedStatuses,
      second_status_others: othersText,
      special_needs: specialNeeds
    }

    if (navigator.onLine) {
      try {
        setLoading(true)
        await postRequest('auth/qr-checkin', checkInData)
        setSuccess(`${scannedUser.name} checked in successfully.`)
        resetSelections()
        setMode('choose')
      } catch (err) {
        setError(err.response?.data?.message || 'Check-in failed.')
        if (!err?.response) {
          saveOffline(checkInData)
        }
      } finally {
        setLoading(false)
      }
    } else {
      saveOffline(checkInData)
      setSuccess(`${scannedUser.name} was saved for offline sync.`)
      resetSelections()
      setMode('choose')
    }
  }

  const pendingCount = JSON.parse(localStorage.getItem('offline_checkins') || '[]').length
  const medicineCount = specialNeeds.filter((item) => item.type === 'medicine').length
  const foodCount = specialNeeds.filter((item) => item.type === 'special_food').length
  const allergyCount = specialNeeds.filter((item) => item.type === 'allergy').length

  return (
    <div className='admin-form-page'>
      <div className='admin-form-shell'>
        <div className='admin-form-header'>
          <div>
            <span className='admin-form-kicker'>Evacuee Intake</span>
            <h1 className='admin-form-title'>Check In</h1>
            <p className='admin-form-subtitle'>
              Find the evacuee, review special conditions, and record the check-in with a simpler layout.
            </p>
          </div>
          <div className='admin-form-inline-note'>
            {isOnline ? 'Online: records save directly to the database.' : 'Offline: records are saved locally until sync.'}
          </div>
        </div>

        {pendingCount > 0 && isOnline && (
          <div className='alert alert-info d-flex align-items-center justify-content-between py-3 px-4 mb-4'>
            <span>{pendingCount} pending offline record{pendingCount === 1 ? '' : 's'} ready to sync.</span>
            <button className='btn btn-sm btn-primary px-3' onClick={syncOffline}>
              Sync now
            </button>
          </div>
        )}

        {success && (
          <div className='alert alert-success py-3 px-4 mb-4 d-flex align-items-center justify-content-between'>
            <span>{success}</span>
            <button className='btn btn-sm btn-outline-success px-3' onClick={() => setSuccess('')}>
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className='alert alert-danger py-3 px-4 mb-4 d-flex align-items-center justify-content-between'>
            <span>{error}</span>
            <button className='btn btn-sm btn-outline-danger px-3' onClick={() => setError('')}>
              Dismiss
            </button>
          </div>
        )}

        {mode === 'choose' && !scannedUser && (
          <div className='admin-form-card card'>
            <div className='card-body'>
              <div className='admin-form-section'>Find Evacuee</div>
              <div className='admin-form-mode-grid mt-4'>
                <button
                  type='button'
                  className='admin-form-mode-card text-start'
                  onClick={() => setMode('qr')}
                >
                  <div className='admin-form-mode-icon'>
                    <i className='bi bi-qr-code-scan' />
                  </div>
                  <h6 className='fw-bold mb-2'>Scan QR Code</h6>
                  <p className='text-muted mb-0'>
                    Use the evacuee QR code for the fastest check-in flow.
                  </p>
                </button>

                <button
                  type='button'
                  className='admin-form-mode-card text-start'
                  onClick={() => setMode('search')}
                >
                  <div className='admin-form-mode-icon'>
                    <i className='bi bi-search' />
                  </div>
                  <h6 className='fw-bold mb-2'>Search by Name</h6>
                  <p className='text-muted mb-0'>
                    Search the evacuee record by name or phone if no QR is available.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'qr' && !scannedUser && (
          <div className='card admin-form-card'>
            <div className='card-body'>
              <div className='admin-form-toolbar mb-3'>
                <button className='btn btn-outline-secondary px-3' onClick={() => setMode('choose')}>
                  Back
                </button>
                <span className='admin-form-tag'>QR Check-In</span>
              </div>
              <div className='admin-form-section'>Scan Code</div>
              <p className='text-muted mt-3 mb-4'>
                Ask the evacuee to open their QR code, then scan it to load their record.
              </p>
              <QRScanner onScan={handleScan} />
              <div className='mt-4 text-center text-muted'>
                Need another method?
                <button
                  className='btn btn-link btn-sm text-decoration-none ms-2'
                  onClick={() => setMode('search')}
                >
                  Search manually
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'search' && !scannedUser && (
          <div className='card admin-form-card'>
            <div className='card-body'>
              <div className='admin-form-toolbar mb-3'>
                <button
                  className='btn btn-outline-secondary px-3'
                  onClick={() => {
                    setMode('choose')
                    setSearchResults([])
                    setSearchQuery('')
                    setError('')
                  }}
                >
                  Back
                </button>
                <span className='admin-form-tag'>Manual Search</span>
              </div>
              <div className='admin-form-section'>Search Evacuee</div>
              <p className='text-muted mt-3 mb-4'>
                Search registered evacuees by name or phone number.
              </p>

              <div className='input-group mb-4'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Enter a name or phone number'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                />
                <button
                  className='btn btn-primary px-4'
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                >
                  {searching ? <span className='spinner-border spinner-border-sm' /> : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className='d-flex flex-column gap-3'>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className='admin-form-soft-block p-3 d-flex flex-wrap align-items-center justify-content-between gap-3'
                    >
                      <div>
                        <div className='fw-semibold'>{user.firstName} {user.lastName}</div>
                        <div className='text-muted small'>{user.phone}</div>
                        <div className='text-muted small'>{user.barangay}, {user.municipality}</div>
                      </div>
                      <button
                        className='btn btn-primary px-3'
                        onClick={() => handleSelectUser(user)}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && searchQuery && !searching && (
                <div className='admin-form-results-empty text-center py-4 px-3'>
                  No users found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        )}

        {scannedUser && (
          <>
            <div className='card admin-form-card mb-4'>
              <div className='card-body'>
                <div className='admin-form-section'>Selected Evacuee</div>
                <div className='mt-4 d-flex flex-wrap align-items-start justify-content-between gap-3'>
                  <div>
                    <h5 className='fw-bold mb-1'>{scannedUser.name}</h5>
                    <p className='text-muted mb-1'>{scannedUser.barangay}, {scannedUser.municipality}</p>
                    {scannedUser.phone && (
                      <p className='text-muted mb-0'>{scannedUser.phone}</p>
                    )}
                  </div>
                  <span className='admin-form-tag'>Primary status: Checked in</span>
                </div>
              </div>
            </div>

            <div className='card admin-form-card mb-4'>
              <div className='card-body'>
                <div className='admin-form-section'>Second Condition</div>

                <div className='admin-form-chip-group mt-4 mb-3'>
                  <button
                    type='button'
                    className={`admin-form-chip admin-form-chip-neutral ${selectedStatuses.length === 0 ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedStatuses([])
                      setOthersText('')
                    }}
                  >
                    None
                  </button>

                  {SECONDARY_STATUS.map((status) => (
                    <button
                      key={status.value}
                      type='button'
                      className={`admin-form-chip ${selectedStatuses.includes(status.value) ? 'active' : ''}`}
                      onClick={() => handleStatusToggle(status.value)}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>

                {selectedStatuses.includes('others') && (
                  <input
                    type='text'
                    className='form-control admin-form-compact mt-2'
                    placeholder='Specify the other condition'
                    value={othersText}
                    onChange={(e) => setOthersText(e.target.value)}
                  />
                )}

                {selectedStatuses.length > 0 && (
                  <div className='admin-form-inline-note mt-3'>
                    <div className='text-muted small mb-2'>Selected condition</div>
                    <div className='d-flex flex-wrap gap-2'>
                      {selectedStatuses.map((value) => {
                        const current = SECONDARY_STATUS.find((item) => item.value === value)
                        return (
                          <span key={value} className='admin-form-tag'>
                            {current?.label}
                            {value === 'others' && othersText ? `: ${othersText}` : ''}
                          </span>
                        )
                      })}
                    </div>
                    {specialNeeds.length > 0 && (
                      <div className='text-muted small mt-2'>Suggested needs were added based on the selected condition.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className='card admin-form-card mb-4'>
              <div className='card-body'>
                <div className='admin-form-section'>Special Needs</div>

                {specialNeeds.length > 0 && (
                  <div className='row g-3 mt-1 mb-4'>
                    <div className='col-sm-4'>
                      <div className='admin-form-soft-block text-center p-3'>
                        <div className='fw-bold text-primary'>{medicineCount}</div>
                        <div className='text-muted small'>Medicine</div>
                      </div>
                    </div>
                    <div className='col-sm-4'>
                      <div className='admin-form-soft-block text-center p-3'>
                        <div className='fw-bold text-success'>{foodCount}</div>
                        <div className='text-muted small'>Special Food</div>
                      </div>
                    </div>
                    <div className='col-sm-4'>
                      <div className='admin-form-soft-block text-center p-3'>
                        <div className='fw-bold text-danger'>{allergyCount}</div>
                        <div className='text-muted small'>Allergy</div>
                      </div>
                    </div>
                  </div>
                )}

                <label className='form-label mt-3'>Add special need</label>
                <div className='d-flex gap-2 mb-4 flex-wrap flex-md-nowrap'>
                  <select
                    className='form-select'
                    style={{ maxWidth: 180 }}
                    value={needInput.type}
                    onChange={(e) => setNeedInput({ ...needInput, type: e.target.value })}
                  >
                    <option value='medicine'>Medicine</option>
                    <option value='special_food'>Special Food</option>
                    <option value='allergy'>Allergy</option>
                  </select>

                  <input
                    type='text'
                    className='form-control'
                    placeholder={
                      needInput.type === 'medicine'
                        ? 'Enter medicine name'
                        : needInput.type === 'special_food'
                          ? 'Enter food item'
                          : 'Enter allergy detail'
                    }
                    value={needInput.name}
                    onChange={(e) => setNeedInput({ ...needInput, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddNeed()
                      }
                    }}
                  />

                  {needInput.type !== 'allergy' && (
                    <input
                      type='number'
                      className='form-control'
                      placeholder='Qty'
                      style={{ maxWidth: 100 }}
                      min={1}
                      value={needInput.quantity}
                      onChange={(e) => setNeedInput({ ...needInput, quantity: e.target.value })}
                    />
                  )}

                  <button type='button' className='btn btn-primary px-4 flex-shrink-0' onClick={handleAddNeed}>
                    Add
                  </button>
                </div>

                {specialNeeds.length > 0 ? (
                  <div className='table-responsive'>
                    <table className='table align-middle mb-0'>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Type</th>
                          <th>Name</th>
                          <th>Qty</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {specialNeeds.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>
                              <span className={`badge rounded-pill ${TYPE_BADGE[item.type]?.bg}`}>
                                {TYPE_BADGE[item.type]?.label}
                              </span>
                            </td>
                            <td className='fw-medium'>{item.name}</td>
                            <td>{item.type === 'allergy' ? '-' : item.quantity}</td>
                            <td className='text-end'>
                              <button
                                type='button'
                                className='btn btn-sm btn-outline-danger px-3'
                                onClick={() => handleRemoveNeed(item.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='admin-form-results-empty text-center py-4 px-3'>
                    No special needs added yet.
                  </div>
                )}
              </div>
            </div>

            <div className='d-flex gap-2'>
              <button className='btn btn-primary flex-grow-1 py-3' onClick={handleCheckIn} disabled={loading}>
                {loading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' />
                    Saving check-in
                  </>
                ) : 'Confirm Check-In'}
              </button>
              <button
                className='btn btn-outline-secondary px-4'
                onClick={() => {
                  resetSelections()
                  setMode('choose')
                  setError('')
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

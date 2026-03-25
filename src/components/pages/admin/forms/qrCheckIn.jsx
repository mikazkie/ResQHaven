import { useState } from 'react'
import QRScanner from '../../../../components/QR/scan'
import { postRequest, getRequest }
  from '../../../../API/API'
import "../../../styles/familyCheckIn.css"

// ✅ Secondary status config
const SECONDARY_STATUS = [
  { value: 'injured', label: 'Injured', icon: '🤕' },
  { value: 'chronic_illness', label: 'With Chronic Illness', icon: '💊' },
  { value: 'critical_condition', label: 'Critical Condition', icon: '🚨' },
  { value: 'senior_citizen', label: 'Senior Citizen', icon: '👴' },
  { value: 'pwd', label: 'Person with Disability', icon: '♿' },
  { value: 'pregnant', label: 'Pregnant Woman', icon: '🤰' },
  { value: 'infant_child', label: 'Infant / Child', icon: '👶' },
  { value: 'lactating', label: 'Lactating Mother', icon: '🍼' },
  { value: 'others', label: 'Others...', icon: '📝' }
]

// ✅ Type badge config
const TYPE_BADGE = {
  medicine: { label: '💊 Medicine', bg: 'bg-primary' },
  special_food: { label: '🍽️ Food', bg: 'bg-success' },
  allergy: { label: '🤧 Allergy', bg: 'bg-danger' }
}

// ✅ Auto-suggest needs
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

  // ✅ Mode: 'choose' | 'qr' | 'search'
  const [mode, setMode] = useState('choose')

  const [scannedUser, setScannedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // ✅ Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  // ✅ Secondary status
  const [selectedStatuses, setSelectedStatuses] =
    useState([])
  const [othersText, setOthersText] = useState('')

  // ✅ Special needs
  const [specialNeeds, setSpecialNeeds] = useState([])
  const [needInput, setNeedInput] = useState({
    type: 'medicine', name: '', quantity: ''
  })

  // ✅ Auto-suggest needs
  const applyPresetNeeds = (status) => {
    const preset = STATUS_NEEDS_MAP[status]
    if (!preset) return
    setSpecialNeeds(prev => {
      const newItems = preset.special_needs.filter(
        n => !prev.some(
          p => p.name === n.name && p.type === n.type
        )
      )
      return [...prev, ...newItems.map(item => ({
        ...item, id: Date.now() + Math.random()
      }))]
    })
  }

  const handleStatusToggle = (value) => {
    setSelectedStatuses(prev => {
      const exists = prev.includes(value)
      if (!exists) applyPresetNeeds(value)
      return exists
        ? prev.filter(s => s !== value)
        : [...prev, value]
    })
  }

  const handleAddNeed = () => {
    if (!needInput.name.trim()) return
    setSpecialNeeds(prev => [...prev, {
      id: Date.now(),
      type: needInput.type,
      name: needInput.name,
      quantity: needInput.type === 'allergy'
        ? 0 : Number(needInput.quantity) || 1
    }])
    setNeedInput({ ...needInput, name: '', quantity: '' })
  }

  const handleRemoveNeed = (id) =>
    setSpecialNeeds(prev =>
      prev.filter(n => n.id !== id)
    )

  const resetAll = () => {
    setSpecialNeeds([])
    setSelectedStatuses([])
    setOthersText('')
    setNeedInput({ type: 'medicine', name: '', quantity: '' })
    setScannedUser(null)
    setSearchQuery('')
    setSearchResults([])
  }

  // ✅ Search users by name/phone
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setError('')
    try {
      const response = await getRequest(
        `api/search-user?query=${searchQuery}`
      )
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

  // ✅ Select user from search
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

  // ✅ QR scanned
  const handleScan = (userData) => {
    setScannedUser(userData)
    setSuccess('')
    setError('')
    resetAll()
  }

  // ✅ Save offline
  const saveOffline = (data) => {
    const existing = JSON.parse(
      localStorage.getItem('offline_checkins') || '[]'
    )
    existing.push({ ...data, offlineId: Date.now() })
    localStorage.setItem(
      'offline_checkins',
      JSON.stringify(existing)
    )
  }

  // ✅ Sync offline
  const syncOffline = async () => {
    const offline = JSON.parse(
      localStorage.getItem('offline_checkins') || '[]'
    )
    if (offline.length === 0) return
    const failed = []
    for (const item of offline) {
      try {
        await postRequest('auth/qr-checkin', item)
      } catch {
        failed.push(item)
      }
    }
    localStorage.setItem(
      'offline_checkins',
      JSON.stringify(failed)
    )
    alert(`✅ Synced ${
      offline.length - failed.length
    } records!`)
  }

  // ✅ Confirm check-in
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
        setSuccess(`✅ ${scannedUser.name} checked in!`)
        resetAll()
        setMode('choose')
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Check-in failed!'
        )
        saveOffline(checkInData)
      } finally {
        setLoading(false)
      }
    } else {
      saveOffline(checkInData)
      setSuccess(
        `📵 ${scannedUser.name} saved offline!`
      )
      resetAll()
      setMode('choose')
    }
  }

  const pendingCount = JSON.parse(
    localStorage.getItem('offline_checkins') || '[]'
  ).length

  const medicineCount = specialNeeds
    .filter(n => n.type === 'medicine').length
  const foodCount = specialNeeds
    .filter(n => n.type === 'special_food').length
  const allergyCount = specialNeeds
    .filter(n => n.type === 'allergy').length

  return (
    <div className='p-4'>

      {/* Online indicator */}
      <div className={`alert py-2 mb-3 ${
        isOnline ? 'alert-success' : 'alert-warning'
      }`} style={{ fontSize: 13 }}>
        {isOnline
          ? '🟢 Online — saving to database'
          : '🔴 Offline — saving locally'
        }
      </div>

      {/* Pending sync */}
      {pendingCount > 0 && isOnline && (
        <div className='alert alert-info d-flex
          align-items-center
          justify-content-between py-2 mb-3'
        >
          <span style={{ fontSize: 13 }}>
            ⏳ {pendingCount} pending sync
          </span>
          <button
            className='btn btn-sm btn-primary'
            onClick={syncOffline}
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className='alert alert-success py-2 mb-3'
          style={{ fontSize: 13 }}
        >
          {success}
          <button
            className='btn btn-sm btn-outline-success ms-2'
            onClick={() => setSuccess('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='alert alert-danger py-2 mb-3'
          style={{ fontSize: 13 }}
        >
          ❌ {error}
          <button
            className='btn btn-sm btn-outline-danger ms-2'
            onClick={() => setError('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Mode Selection ── */}
      {mode === 'choose' && !scannedUser && (
        <div>
          <h5 className='fw-bold mb-1'>
            Check-in Evacuee
          </h5>
          <p className='text-muted mb-4'
            style={{ fontSize: 13 }}
          >
            Choose how to find the evacuee
          </p>

          <div className='row g-3'>
            {/* QR Scan */}
            <div className='col-md-6'>
              <div
                className='card border-0 shadow-sm
                  text-center p-4 h-100 hover-success'
                style={{ cursor: 'pointer' }}
                onClick={() => setMode('qr')}
              >
                <div style={{ fontSize: '3rem' }}>
                  📷
                </div>
                <h6 className='fw-bold mt-3 mb-1'>
                  Scan QR Code
                </h6>
                <p className='text-muted mb-2'
                  style={{ fontSize: 13 }}
                >
                  For evacuees with QR code
                  in the app
                </p>
                <span className='badge bg-success
                  align-self-center'
                >
                  ✅ Fastest way
                </span>
              </div>
            </div>

            {/* Search by name */}
            <div className='col-md-6'>
              <div
                className='card border-0 shadow-sm
                  text-center p-4 h-100 hover-primary'
                style={{ cursor: 'pointer' }}
                onClick={() => setMode('search')}
              >
                <div style={{ fontSize: '3rem' }}>
                  🔍
                </div>
                <h6 className='fw-bold mt-3 mb-1'>
                  Search by Name
                </h6>
                <p className='text-muted mb-2'
                  style={{ fontSize: 13 }}
                >
                  No QR code? Search by name
                  or phone number
                </p>
                <span className='badge bg-primary
                  align-self-center'
                >
                  📝 Manual lookup
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── QR Scanner Mode ── */}
      {mode === 'qr' && !scannedUser && (
        <div className='card border-0 shadow-sm'>
          <div className='card-body p-4'>
            <div className='d-flex
              align-items-center gap-2 mb-3'
            >
              <button
                className='btn btn-sm
                  btn-outline-secondary'
                onClick={() => setMode('choose')}
              >
                ← Back
              </button>
              <h6 className='fw-bold mb-0'>
                📷 Scan QR Code
              </h6>
            </div>
            <p className='text-muted mb-3'
              style={{ fontSize: 13 }}
            >
              Ask the evacuee to show their
              QR code from the app
            </p>
            <QRScanner onScan={handleScan} />

            {/* Fallback to search */}
            <div className='text-center mt-3'>
              <span className='text-muted'
                style={{ fontSize: 13 }}
              >
                No QR code?{' '}
              </span>
              <button
                className='btn btn-link btn-sm p-0'
                style={{ fontSize: 13 }}
                onClick={() => setMode('search')}
              >
                Search by name instead →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Search Mode ── */}
      {mode === 'search' && !scannedUser && (
        <div className='card border-0 shadow-sm'>
          <div className='card-body p-4'>

            <div className='d-flex
              align-items-center gap-2 mb-3'
            >
              <button
                className='btn btn-sm
                  btn-outline-secondary'
                onClick={() => {
                  setMode('choose')
                  setSearchResults([])
                  setSearchQuery('')
                  setError('')
                }}
              >
                ← Back
              </button>
              <h6 className='fw-bold mb-0'>
                🔍 Search Evacuee
              </h6>
            </div>

            <p className='text-muted mb-3'
              style={{ fontSize: 13 }}
            >
              Search registered evacuees
              by name or phone number
            </p>

            {/* Search input */}
            <div className='input-group mb-3'>
              <input
                type='text'
                className='form-control'
                placeholder='e.g. Juan Dela Cruz or 0917...'
                value={searchQuery}
                onChange={e =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch()
                }}
              />
              <button
                className='btn btn-danger'
                onClick={handleSearch}
                disabled={searching ||
                  !searchQuery.trim()
                }
              >
                {searching ? (
                  <span className='spinner-border
                    spinner-border-sm'
                  />
                ) : '🔍 Search'}
              </button>
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div>
                <div className='text-muted mb-2'
                  style={{ fontSize: 12 }}
                >
                  Found {searchResults.length} result(s):
                </div>
                <div className='d-flex flex-column gap-2'>
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      className='d-flex align-items-center
                        justify-content-between p-3
                        border rounded'
                      style={{ fontSize: 13 }}
                    >
                      <div className='d-flex
                        align-items-center gap-3'
                      >
                        <div
                          className='rounded-circle
                            bg-danger bg-opacity-10
                            d-flex align-items-center
                            justify-content-center
                            flex-shrink-0'
                          style={{
                            width: 40, height: 40,
                            fontSize: '1.2rem'
                          }}
                        >
                          {user.sex === 'male'
                            ? '👨' : '👩'}
                        </div>
                        <div>
                          <div className='fw-medium'>
                            {user.firstName}{' '}
                            {user.lastName}
                          </div>
                          <div className='text-muted'
                            style={{ fontSize: 11 }}
                          >
                            📱 {user.phone}
                          </div>
                          <div className='text-muted'
                            style={{ fontSize: 11 }}
                          >
                            📍 {user.barangay},{' '}
                            {user.municipality}
                          </div>
                        </div>
                      </div>

                      <button
                        className='btn btn-sm
                          btn-danger flex-shrink-0'
                        onClick={() =>
                          handleSelectUser(user)
                        }
                      >
                        Select →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {searchResults.length === 0 &&
             searchQuery &&
             !searching && (
              <div className='text-center
                text-muted py-3 bg-light rounded'
                style={{ fontSize: 13 }}
              >
                No users found for "{searchQuery}"
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── User Selected — Confirm + Status + Needs ── */}
      {scannedUser && (
        <>
          {/* User card */}
          <div className='card border-0 shadow-sm mb-3'>
            <div className='card-body p-4 text-center'>
              <div style={{
                fontSize: '3rem', marginBottom: 12
              }}>
                👤
              </div>
              <h5 className='fw-bold mb-1'>
                {scannedUser.name}
              </h5>
              <p className='text-muted mb-1'
                style={{ fontSize: 13 }}
              >
                {scannedUser.barangay},{' '}
                {scannedUser.municipality}
              </p>
              {scannedUser.phone && (
                <p className='text-muted mb-2'
                  style={{ fontSize: 12 }}
                >
                  📱 {scannedUser.phone}
                </p>
              )}
              <span className='badge bg-success mb-2'>
                ✅ Registered User
              </span>

              {/* Primary status */}
              <div className='d-flex align-items-center
                gap-2 p-2 rounded mt-2'
                style={{
                  background: '#dbeafe',
                  border: '1px solid #93c5fd'
                }}
              >
                <span style={{ fontSize: '1rem' }}>
                  🏠
                </span>
                <div className='flex-grow-1 text-start'>
                  <div className='fw-semibold'
                    style={{
                      fontSize: 12,
                      color: '#1d4ed8'
                    }}
                  >
                    Primary: Checked-in
                    (Active Evacuee)
                  </div>
                </div>
                <span className='badge bg-primary'
                  style={{ fontSize: 10 }}
                >
                  Auto ✓
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Status */}
          <div className='card border-0 shadow-sm mb-3'>
            <div className='card-body p-4'>

              <div className='fw-semibold text-muted
                border-bottom pb-2 mb-3'
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
              >
                Special Conditions
              </div>

              {/* None */}
              <div
                className='d-flex align-items-center
                  gap-2 p-2 rounded border mb-2'
                style={{
                  cursor: 'pointer', fontSize: 13,
                  background: selectedStatuses.length === 0
                    ? '#d1fae5' : '#f8f9fa',
                  borderColor: selectedStatuses.length === 0
                    ? '#22c55e' : '#dee2e6',
                  color: selectedStatuses.length === 0
                    ? '#15803d' : '#6c757d',
                  userSelect: 'none'
                }}
                onClick={() => {
                  setSelectedStatuses([])
                  setOthersText('')
                }}
              >
                <span>✅</span>
                <span className='fw-medium'>
                  None — No special condition
                </span>
                {selectedStatuses.length === 0 && (
                  <span className='ms-auto fw-bold
                    text-success'
                  >
                    ✓
                  </span>
                )}
              </div>

              {/* Status chips */}
              <div className='d-flex flex-wrap gap-2 mb-2'>
                {SECONDARY_STATUS.map(status => {
                  const isSelected =
                    selectedStatuses.includes(status.value)
                  return (
                    <div key={status.value}
                      className='px-3 py-2 rounded border
                        d-flex align-items-center gap-1'
                      style={{
                        cursor: 'pointer',
                        fontSize: 12,
                        background: isSelected
                          ? '#fff3cd' : '#f8f9fa',
                        borderColor: isSelected
                          ? '#ffc107' : '#dee2e6',
                        color: isSelected
                          ? '#856404' : '#6c757d',
                        transition: 'all 0.15s',
                        userSelect: 'none'
                      }}
                      onClick={() =>
                        handleStatusToggle(status.value)
                      }
                    >
                      <span>{status.icon}</span>
                      <span>{status.label}</span>
                      {isSelected && (
                        <span className='ms-1 fw-bold'>
                          ✓
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedStatuses.includes('others') && (
                <input type='text'
                  className='form-control
                    form-control-sm mt-1'
                  placeholder='Please specify...'
                  value={othersText}
                  onChange={e =>
                    setOthersText(e.target.value)
                  }
                />
              )}

              {selectedStatuses.length > 0 && (
                <div className='mt-2 p-2 rounded
                  bg-warning bg-opacity-10
                  border border-warning-subtle'
                >
                  <div className='text-muted mb-1'
                    style={{ fontSize: 11 }}
                  >
                    Selected:
                  </div>
                  <div className='d-flex flex-wrap gap-1'>
                    {selectedStatuses.map(s => {
                      const found = SECONDARY_STATUS
                        .find(x => x.value === s)
                      return (
                        <span key={s}
                          className='badge
                            bg-warning text-dark'
                        >
                          {found?.icon} {found?.label}
                          {s === 'others' && othersText
                            ? `: ${othersText}` : ''}
                        </span>
                      )
                    })}
                  </div>
                  {specialNeeds.length > 0 && (
                    <div className='mt-1 text-muted'
                      style={{ fontSize: 11 }}
                    >
                      💡 Needs auto-suggested
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Special Needs */}
          <div className='card border-0 shadow-sm mb-3'>
            <div className='card-body p-4'>

              <div className='fw-semibold text-muted
                border-bottom pb-2 mb-3'
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
              >
                Special Needs
              </div>

              {/* Summary cards */}
              {specialNeeds.length > 0 && (
                <div className='row g-2 mb-3'>
                  <div className='col-4'>
                    <div className='card border-0
                      bg-primary bg-opacity-10
                      text-center p-2'
                    >
                      <div className='fw-bold text-primary'>
                        {medicineCount}
                      </div>
                      <div className='text-muted'
                        style={{ fontSize: 11 }}
                      >
                        💊 Medicines
                      </div>
                    </div>
                  </div>
                  <div className='col-4'>
                    <div className='card border-0
                      bg-success bg-opacity-10
                      text-center p-2'
                    >
                      <div className='fw-bold text-success'>
                        {foodCount}
                      </div>
                      <div className='text-muted'
                        style={{ fontSize: 11 }}
                      >
                        🍽️ Foods
                      </div>
                    </div>
                  </div>
                  <div className='col-4'>
                    <div className='card border-0
                      bg-danger bg-opacity-10
                      text-center p-2'
                    >
                      <div className='fw-bold text-danger'>
                        {allergyCount}
                      </div>
                      <div className='text-muted'
                        style={{ fontSize: 11 }}
                      >
                        🤧 Allergies
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Input */}
              <label className='form-label fw-medium'
                style={{ fontSize: 13 }}
              >
                🆘 Add Special Need
              </label>

              <div className='d-flex gap-2 mb-3
                flex-wrap flex-md-nowrap'
              >
                <select
                  className='form-select'
                  style={{ maxWidth: 160 }}
                  value={needInput.type}
                  onChange={e => setNeedInput({
                    ...needInput, type: e.target.value
                  })}
                >
                  <option value='medicine'>
                    💊 Medicine
                  </option>
                  <option value='special_food'>
                    🍽️ Special Food
                  </option>
                  <option value='allergy'>
                    🤧 Allergy
                  </option>
                </select>

                <input type='text'
                  className='form-control'
                  placeholder={
                    needInput.type === 'medicine'
                      ? 'e.g. Bioflu'
                      : needInput.type === 'special_food'
                      ? 'e.g. Milk'
                      : 'e.g. Chicken'
                  }
                  value={needInput.name}
                  onChange={e => setNeedInput({
                    ...needInput, name: e.target.value
                  })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddNeed()
                    }
                  }}
                />

                {needInput.type !== 'allergy' && (
                  <input type='number'
                    className='form-control'
                    placeholder='Qty'
                    style={{ maxWidth: 80 }}
                    value={needInput.quantity}
                    min={1}
                    onChange={e => setNeedInput({
                      ...needInput,
                      quantity: e.target.value
                    })}
                  />
                )}

                <button type='button'
                  className='btn btn-danger flex-shrink-0'
                  onClick={handleAddNeed}
                >
                  + Add
                </button>
              </div>

              {/* Table */}
              {specialNeeds.length > 0 ? (
                <div className='table-responsive'>
                  <table className='table table-bordered
                    table-hover mb-0'
                    style={{ fontSize: 13 }}
                  >
                    <thead className='table-light'>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th style={{ width: 120 }}>Type</th>
                        <th>Name</th>
                        <th style={{ width: 80 }}>Qty</th>
                        <th style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {specialNeeds.map((item, index) => (
                        <tr key={item.id}>
                          <td className='text-muted
                            text-center'
                          >
                            {index + 1}
                          </td>
                          <td>
                            <span className={`badge ${
                              TYPE_BADGE[item.type]?.bg
                            }`}>
                              {TYPE_BADGE[item.type]?.label}
                            </span>
                          </td>
                          <td className='fw-medium'>
                            {item.name}
                          </td>
                          <td className='text-center'>
                            {item.type === 'allergy'
                              ? <span className='text-muted'>—</span>
                              : <span className='badge bg-secondary'>
                                  x{item.quantity}
                                </span>
                            }
                          </td>
                          <td className='text-center'>
                            <button type='button'
                              className='btn btn-sm
                                btn-outline-danger py-0'
                              onClick={() =>
                                handleRemoveNeed(item.id)
                              }
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className='table-light'>
                      <tr>
                        <td colSpan='5'
                          style={{ fontSize: 12 }}
                        >
                          <span className='text-muted'>
                            💊 {medicineCount} •{' '}
                            🍽️ {foodCount} •{' '}
                            🤧 {allergyCount} •{' '}
                            Total: {specialNeeds.length}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className='text-center text-muted
                  py-3 border rounded bg-light'
                  style={{ fontSize: 13 }}
                >
                  No special needs added yet
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className='d-flex gap-2'>
            <button
              className='btn btn-danger flex-grow-1'
              onClick={handleCheckIn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className='spinner-border
                    spinner-border-sm me-2'
                  />
                  Checking in...
                </>
              ) : '✅ Confirm Check-in'}
            </button>
            <button
              className='btn btn-outline-secondary'
              onClick={() => {
                resetAll()
                setMode('choose')
                setError('')
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </>
      )}

    </div>
  )
}
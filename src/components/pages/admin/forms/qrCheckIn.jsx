import { useState } from 'react'
import QRScanner from '../../../../components/QR/scan'
import { postRequest } from '../../../../API/API'

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

// ✅ Auto-suggest needs based on status
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
  const [scannedUser, setScannedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // ✅ Secondary status
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [othersText, setOthersText] = useState('')

  // ✅ Unified special needs
  const [specialNeeds, setSpecialNeeds] = useState([])
  const [needInput, setNeedInput] = useState({
    type: 'medicine', name: '', quantity: ''
  })

  // ✅ Auto-suggest needs from status
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

  // ✅ Toggle secondary status
  const handleStatusToggle = (value) => {
    setSelectedStatuses(prev => {
      const exists = prev.includes(value)
      if (exists) return prev.filter(s => s !== value)
      applyPresetNeeds(value)
      return [...prev, value]
    })
  }

  // ✅ Add special need
  const handleAddNeed = () => {
    if (!needInput.name.trim()) return
    setSpecialNeeds([...specialNeeds, {
      id: Date.now(),
      type: needInput.type,
      name: needInput.name,
      quantity: needInput.type === 'allergy'
        ? 0 : Number(needInput.quantity) || 1
    }])
    setNeedInput({ ...needInput, name: '', quantity: '' })
  }

  // ✅ Remove special need
  const handleRemoveNeed = (id) =>
    setSpecialNeeds(specialNeeds.filter(n => n.id !== id))

  // ✅ Reset all needs
  const resetAll = () => {
    setSpecialNeeds([])
    setSelectedStatuses([])
    setOthersText('')
    setNeedInput({ type: 'medicine', name: '', quantity: '' })
  }

  // ✅ When QR is scanned
  const handleScan = (userData) => {
    setScannedUser(userData)
    setSuccess('')
    setError('')
    resetAll()
  }

  // ✅ Save to localStorage (offline)
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

  // ✅ Sync offline data
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
    alert(`✅ Synced ${offline.length - failed.length} records!`)
  }

  // ✅ Confirm Check-in
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
        setScannedUser(null)
        resetAll()
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
      setSuccess(`📵 ${scannedUser.name} saved offline!`)
      setScannedUser(null)
      resetAll()
    }
  }

  const pendingCount = JSON.parse(
    localStorage.getItem('offline_checkins') || '[]'
  ).length

  // Summary counts
  const medicineCount = specialNeeds.filter(n => n.type === 'medicine').length
  const foodCount = specialNeeds.filter(n => n.type === 'special_food').length
  const allergyCount = specialNeeds.filter(n => n.type === 'allergy').length

  return (
    <div className='p-4'>

      {/* Online Status */}
      <div className={`alert py-2 mb-3 ${
        isOnline ? 'alert-success' : 'alert-warning'
      }`} style={{ fontSize: 13 }}>
        {isOnline
          ? '🟢 Online — saving to database'
          : '🔴 Offline — saving locally'
        }
      </div>

      {/* Pending Sync */}
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
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='alert alert-danger py-2 mb-3'
          style={{ fontSize: 13 }}
        >
          ❌ {error}
        </div>
      )}

      {/* QR Scanner */}
      {!scannedUser && (
        <div className='card border-0 shadow-sm mb-4'>
          <div className='card-body p-4'>
            <h5 className='fw-bold mb-1'>
              📷 Scan QR Code
            </h5>
            <p className='text-muted mb-3'
              style={{ fontSize: 13 }}
            >
              Scan evacuee QR code to check in
            </p>
            <QRScanner onScan={handleScan} />
          </div>
        </div>
      )}

      {/* Scanned User + Details */}
      {scannedUser && (
        <>
          {/* User Info */}
          <div className='card border-0 shadow-sm mb-3'>
            <div className='card-body p-4 text-center'>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>
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
              <span className='badge bg-success mb-2'>
                Registered User ✓
              </span>

              {/* Primary Status — auto */}
              <div className='d-flex align-items-center
                gap-2 p-2 rounded mt-3'
                style={{
                  background: '#dbeafe',
                  border: '1px solid #93c5fd'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>🏠</span>
                <div className='flex-grow-1 text-start'>
                  <div className='fw-semibold'
                    style={{ fontSize: 12, color: '#1d4ed8' }}
                  >
                    Primary: Checked-in (Active Evacuee)
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

          {/* ── Secondary Status ── */}
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

              {/* None option */}
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
                  <span className='ms-auto fw-bold text-success'>✓</span>
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
                        cursor: 'pointer', fontSize: 12,
                        background: isSelected ? '#fff3cd' : '#f8f9fa',
                        borderColor: isSelected ? '#ffc107' : '#dee2e6',
                        color: isSelected ? '#856404' : '#6c757d',
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
                        <span className='ms-1 fw-bold'>✓</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Others text */}
              {selectedStatuses.includes('others') && (
                <input type='text'
                  className='form-control form-control-sm mt-1'
                  placeholder='Please specify condition...'
                  value={othersText}
                  onChange={(e) => setOthersText(e.target.value)}
                />
              )}

              {/* Selected summary */}
              {selectedStatuses.length > 0 && (
                <div className='mt-2 p-2 rounded
                  bg-warning bg-opacity-10
                  border border-warning-subtle'
                >
                  <div className='text-muted mb-1'
                    style={{ fontSize: 11 }}
                  >
                    Selected conditions:
                  </div>
                  <div className='d-flex flex-wrap gap-1'>
                    {selectedStatuses.map(s => {
                      const found = SECONDARY_STATUS
                        .find(x => x.value === s)
                      return (
                        <span key={s}
                          className='badge bg-warning text-dark'
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
                      💡 Needs auto-suggested based
                      on selected conditions
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ── Special Needs ── */}
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
                      bg-primary bg-opacity-10 text-center p-2'
                    >
                      <div className='fw-bold text-primary fs-5'>
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
                      bg-success bg-opacity-10 text-center p-2'
                    >
                      <div className='fw-bold text-success fs-5'>
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
                      bg-danger bg-opacity-10 text-center p-2'
                    >
                      <div className='fw-bold text-danger fs-5'>
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

              {/* Input row */}
              <label className='form-label fw-medium'>
                🆘 Add Special Need
                <span className='text-muted ms-2'
                  style={{ fontSize: 11 }}
                >
                  (medicines, food, allergies)
                </span>
              </label>

              <div className='d-flex gap-2 mb-3
                flex-wrap flex-md-nowrap'
              >
                <select
                  className='form-select'
                  style={{ maxWidth: 160 }}
                  value={needInput.type}
                  onChange={(e) => setNeedInput({
                    ...needInput, type: e.target.value
                  })}
                >
                  <option value='medicine'>💊 Medicine</option>
                  <option value='special_food'>🍽️ Special Food</option>
                  <option value='allergy'>🤧 Allergy</option>
                </select>

                <input type='text'
                  className='form-control'
                  placeholder={
                    needInput.type === 'medicine' ? 'e.g. Bioflu'
                    : needInput.type === 'special_food' ? 'e.g. Milk'
                    : 'e.g. Chicken'
                  }
                  value={needInput.name}
                  onChange={(e) => setNeedInput({
                    ...needInput, name: e.target.value
                  })}
                  onKeyDown={(e) => {
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
                    value={needInput.quantity} min={1}
                    onChange={(e) => setNeedInput({
                      ...needInput, quantity: e.target.value
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

              {/* ✅ Table display */}
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
                        <th style={{ width: 60 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specialNeeds.map((item, index) => (
                        <tr key={item.id}>
                          <td className='text-muted text-center'>
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
                            {item.type === 'allergy' ? (
                              <span className='text-muted'>—</span>
                            ) : (
                              <span className='badge bg-secondary'>
                                x{item.quantity}
                              </span>
                            )}
                          </td>
                          <td className='text-center'>
                            <button
                              type='button'
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
                          <div className='d-flex gap-3 text-muted'>
                            <span>💊 {medicineCount} medicine(s)</span>
                            <span>🍽️ {foodCount} food(s)</span>
                            <span>🤧 {allergyCount} allergy(ies)</span>
                            <span className='ms-auto fw-medium text-dark'>
                              Total: {specialNeeds.length} item(s)
                            </span>
                          </div>
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

          {/* Action Buttons */}
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
                setScannedUser(null)
                resetAll()
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
import { useState } from 'react'
import QRScanner from '../../../../components/QR/scan'
import { postRequest } from '../../../../API/API'

// ✅ Reusable ListItem component
const ListItem = ({ item, onRemove, color, showQty }) => (
  <div
    className='d-flex align-items-center
      justify-content-between px-3 py-2 rounded'
    style={{
      background: color.bg,
      border: `1px solid ${color.border}`,
      fontSize: 13
    }}
  >
    <div className='d-flex align-items-center gap-2'>
      <span className='fw-medium'>{item.name}</span>
      {showQty && (
        <span
          className='badge'
          style={{
            background: color.badge,
            color: color.badgeText
          }}
        >
          x{item.quantity}
        </span>
      )}
    </div>
    <button
      type='button'
      className='btn btn-sm p-0'
      style={{ color: color.remove, fontSize: 15 }}
      onClick={() => onRemove(item.id)}
    >
      ✕
    </button>
  </div>
)

export default function CheckIn() {
  const [isOnline] = useState(navigator.onLine)
  const [scannedUser, setScannedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // ✅ Special Foods
  const [specialFoods, setSpecialFoods] = useState([])
  const [specialInput, setSpecialInput] = useState({
    name: '', quantity: ''
  })

  // ✅ Allergies
  const [allergies, setAllergies] = useState([])
  const [allergyInput, setAllergyInput] = useState('')

  // ✅ Medicines
  const [medicines, setMedicines] = useState([])
  const [medicineInput, setMedicineInput] = useState({
    name: '', quantity: ''
  })

  // ── Special Foods handlers ──
  const handleAddSpecial = () => {
    if (!specialInput.name ||
      !specialInput.quantity) return
    setSpecialFoods([...specialFoods, {
      id: Date.now(),
      name: specialInput.name,
      quantity: specialInput.quantity
    }])
    setSpecialInput({ name: '', quantity: '' })
  }
  const handleRemoveSpecial = (id) =>
    setSpecialFoods(specialFoods.filter(i => i.id !== id))

  // ── Allergy handlers ──
  const handleAddAllergy = () => {
    if (!allergyInput.trim()) return
    setAllergies([...allergies, {
      id: Date.now(),
      name: allergyInput
    }])
    setAllergyInput('')
  }
  const handleRemoveAllergy = (id) =>
    setAllergies(allergies.filter(i => i.id !== id))

  // ── Medicine handlers ──
  const handleAddMedicine = () => {
    if (!medicineInput.name ||
      !medicineInput.quantity) return
    setMedicines([...medicines, {
      id: Date.now(),
      name: medicineInput.name,
      quantity: medicineInput.quantity
    }])
    setMedicineInput({ name: '', quantity: '' })
  }
  const handleRemoveMedicine = (id) =>
    setMedicines(medicines.filter(i => i.id !== id))

  // ── Reset needs ──
  const resetNeeds = () => {
    setAllergies([])
    setMedicines([])
    setSpecialFoods([])
  }

  // ── When QR is scanned ──
  const handleScan = (userData) => {
    setScannedUser(userData)
    setSuccess('')
    setError('')
  }

  // ── Save to localStorage ──
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

  // ── Sync offline data ──
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

  // ── Confirm Check-in ──
  const handleCheckIn = async () => {
    if (!scannedUser) return

    const checkInData = {
      user_id: scannedUser.userId,
      allergies,
      medicines,
      special_foods: specialFoods
    }

    if (navigator.onLine) {
      try {
        setLoading(true)
        await postRequest('auth/qr-checkin', checkInData)
        setSuccess(`✅ ${scannedUser.firstname} checked in!`)
        setScannedUser(null)
        resetNeeds()
      } catch (err) {
        setError(
          err.response?.message ||
          'Check-in failed!'
        )
        saveOffline(checkInData)
      } finally {
        setLoading(false)
      }
    } else {
      saveOffline(checkInData)
      setSuccess(`📵 ${scannedUser.firstname} saved offline!`)
      setScannedUser(null)
      resetNeeds()
    }
  }

  const pendingCount = JSON.parse(
    localStorage.getItem('offline_checkins') || '[]'
  ).length

  return (
    <div className='p-4'>

      {/* ── Online Status ── */}
      <div className={`alert py-2 mb-3 ${
        isOnline ? 'alert-success' : 'alert-warning'
      }`} style={{ fontSize: 13 }}
      >
        {isOnline
          ? '🟢 Online — saving to database'
          : '🔴 Offline — saving locally'
        }
      </div>

      {/* ── Pending Sync ── */}
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

      {/* ── Success ── */}
      {success && (
        <div className='alert alert-success
          py-2 mb-3'
          style={{ fontSize: 13 }}
        >
          {success}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className='alert alert-danger
          py-2 mb-3'
          style={{ fontSize: 13 }}
        >
          ❌ {error}
        </div>
      )}

      {/* ── QR Scanner ── */}
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

      {/* ── Scanned User + Needs ── */}
      {scannedUser && (
        <>
          {/* User Info Card */}
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
              <span className='badge bg-success mb-3'>
                Registered User ✓
              </span>
            </div>
          </div>

          {/* Needs Card */}
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
                Medical &amp; Food Needs
              </div>

              <div className='d-flex flex-column gap-3'>

                {/* ── Allergies ── */}
                <div>
                  <label className='form-label fw-medium'>
                    🤧 Allergies
                  </label>
                  <div className='d-flex gap-2 mb-2'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='e.g. Chicken'
                      value={allergyInput}
                      onChange={(e) =>
                        setAllergyInput(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddAllergy()
                        }
                      }}
                    />
                    <button
                      type='button'
                      className='btn btn-danger flex-shrink-0'
                      onClick={handleAddAllergy}
                    >
                      + Add
                    </button>
                  </div>
                  {allergies.length > 0 && (
                    <div className='d-flex flex-column gap-1'>
                      {allergies.map(item => (
                        <ListItem
                          key={item.id}
                          item={item}
                          onRemove={handleRemoveAllergy}
                          showQty={false}
                          color={{
                            bg: '#fff1f2',
                            border: '#fecdd3',
                            remove: '#ef4444'
                          }}
                        />
                      ))}
                      <div className='text-muted mt-1'
                        style={{ fontSize: 12 }}
                      >
                        {allergies.length} allerg
                        {allergies.length > 1
                          ? 'ies' : 'y'} added
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Medicines ── */}
                <div>
                  <label className='form-label fw-medium'>
                    💊 Medicine
                  </label>
                  <div className='d-flex gap-2 mb-2'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='e.g. Bioflu'
                      value={medicineInput.name}
                      onChange={(e) => setMedicineInput({
                        ...medicineInput,
                        name: e.target.value
                      })}
                    />
                    <input
                      type='number'
                      className='form-control'
                      placeholder='Qty'
                      style={{ maxWidth: 90 }}
                      value={medicineInput.quantity}
                      min={1}
                      onChange={(e) => setMedicineInput({
                        ...medicineInput,
                        quantity: e.target.value
                      })}
                    />
                    <button
                      type='button'
                      className='btn btn-danger flex-shrink-0'
                      onClick={handleAddMedicine}
                    >
                      + Add
                    </button>
                  </div>
                  {medicines.length > 0 && (
                    <div className='d-flex flex-column gap-1'>
                      {medicines.map(item => (
                        <ListItem
                          key={item.id}
                          item={item}
                          onRemove={handleRemoveMedicine}
                          showQty={true}
                          color={{
                            bg: '#eff6ff',
                            border: '#bfdbfe',
                            badge: '#dbeafe',
                            badgeText: '#1d4ed8',
                            remove: '#3b82f6'
                          }}
                        />
                      ))}
                      <div className='text-muted mt-1'
                        style={{ fontSize: 12 }}
                      >
                        {medicines.length} medicine
                        {medicines.length > 1
                          ? 's' : ''} added
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Special Foods ── */}
                <div>
                  <label className='form-label fw-medium'>
                    🍽️ Special Foods
                  </label>
                  <div className='d-flex gap-2 mb-2'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='e.g. Milk'
                      value={specialInput.name}
                      onChange={(e) => setSpecialInput({
                        ...specialInput,
                        name: e.target.value
                      })}
                    />
                    <input
                      type='number'
                      className='form-control'
                      placeholder='Qty'
                      style={{ maxWidth: 90 }}
                      value={specialInput.quantity}
                      min={1}
                      onChange={(e) => setSpecialInput({
                        ...specialInput,
                        quantity: e.target.value
                      })}
                    />
                    <button
                      type='button'
                      className='btn btn-danger flex-shrink-0'
                      onClick={handleAddSpecial}
                    >
                      + Add
                    </button>
                  </div>
                  {specialFoods.length > 0 && (
                    <div className='d-flex flex-column gap-1'>
                      {specialFoods.map(item => (
                        <ListItem
                          key={item.id}
                          item={item}
                          onRemove={handleRemoveSpecial}
                          showQty={true}
                          color={{
                            bg: '#f0fdf4',
                            border: '#bbf7d0',
                            badge: '#dcfce7',
                            badgeText: '#15803d',
                            remove: '#22c55e'
                          }}
                        />
                      ))}
                      <div className='text-muted mt-1'
                        style={{ fontSize: 12 }}
                      >
                        {specialFoods.length} item
                        {specialFoods.length > 1
                          ? 's' : ''} added
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className='d-flex gap-2'>
            <button
              className='btn btn-danger flex-grow-1'
              onClick={handleCheckIn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className='spinner-border
                    spinner-border-sm me-2' />
                  Checking in...
                </>
              ) : '✅ Confirm Check-in'}
            </button>
            <button
              className='btn btn-outline-secondary'
              onClick={() => {
                setScannedUser(null)
                resetNeeds()
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
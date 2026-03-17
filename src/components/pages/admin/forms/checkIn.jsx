import { useOfflineCheckin } from '../../../../hooks/checkOffline'
import { useState } from 'react';
import { Link } from 'react-router';


export default function CheckIn() {
  const { isOnline, saveCheckin } = useOfflineCheckin()

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    sex: '',
    birthday: '',
    phone: '',
    email: '',
    password: '',
    barangay: '',
    municipality: '',
    province: '',
    people: 0,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Special Foods handlers
  const handleAddSpecial = () => {
    if (!specialInput.name || !specialInput.quantity) return
    setSpecialFoods([...specialFoods, {
      id: Date.now(),
      name: specialInput.name,
      quantity: specialInput.quantity
    }])
    setSpecialInput({ name: '', quantity: '' })
  }
  const handleRemoveSpecial = (id) => {
    setSpecialFoods(specialFoods.filter(i => i.id !== id))
  }

  // ✅ Allergy handlers
  const handleAddAllergy = () => {
    if (!allergyInput.trim()) return
    setAllergies([...allergies, {
      id: Date.now(),
      name: allergyInput
    }])
    setAllergyInput('')
  }
  const handleRemoveAllergy = (id) => {
    setAllergies(allergies.filter(i => i.id !== id))
  }

  // ✅ Medicine handlers
  const handleAddMedicine = () => {
    if (!medicineInput.name || !medicineInput.quantity) return
    setMedicines([...medicines, {
      id: Date.now(),
      name: medicineInput.name,
      quantity: medicineInput.quantity
    }])
    setMedicineInput({ name: '', quantity: '' })
  }
  const handleRemoveMedicine = (id) => {
    setMedicines(medicines.filter(i => i.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      setLoading(true)
      const result = await saveCheckin({
        ...formData,
        special_foods: specialFoods,
        allergies: allergies,
        medicines: medicines
      })

      if (result.success) {
        setSuccess(
          result.online
            ? '✅ Saved to database!'
            : '📵 Saved offline! Will sync when internet returns.'
        )
        setFormData({
          firstname: '', lastname: '',
          sex: '', birthday: '',
          phone: '', email: '',
          password: '', barangay: '',
          municipality: '', province: '',
          people: 0,
        })
        setSpecialFoods([])
        setAllergies([])
        setMedicines([])
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Check-in failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ✅ Reusable list item component
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

  return (
    <div>
      {/* Online/Offline indicator */}
      <div className={`alert ${isOnline
        ? 'alert-success' : 'alert-warning'} py-2`}
      >
        {isOnline
          ? '🟢 Online — saving to database'
          : '🔴 Offline — saving locally'
        }
      </div>

      <div className='container-fluid'>
        <div className='card border-0 shadow-sm'>
          <div className='card-body p-4 p-md-5'>

            {/* Header */}
            <div className='mb-4'>
              <h4 className='fw-semibold mb-1'>
                Evacuee Check In
              </h4>
              <p className='text-muted mb-0'
                style={{ fontSize: 13 }}
              >
                Fill in evacuee details below
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className='alert alert-danger
                d-flex align-items-center gap-2 py-2'
              >
                <span>❌</span>
                <span style={{ fontSize: 14 }}>
                  {error}
                </span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className='alert alert-success
                d-flex align-items-center gap-2 py-2'
              >
                <span>✅</span>
                <span style={{ fontSize: 14 }}>
                  {success}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className='d-flex flex-column gap-3'>

                {/* ── Personal Info Section ── */}
                <div className='fw-semibold
                  text-muted border-bottom pb-2'
                  style={{ fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1 }}
                >
                  Personal Information
                </div>

                {/* First + Last Name */}
                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      First Name
                      <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text' name='firstname'
                      className='form-control'
                      placeholder='e.g. Juan'
                      value={formData.firstname}
                      onChange={handleChange} required
                    />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Last Name
                      <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text' name='lastname'
                      className='form-control'
                      placeholder='e.g. Dela Cruz'
                      value={formData.lastname}
                      onChange={handleChange} required
                    />
                  </div>
                </div>

                {/* Sex + Birthday */}
                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Sex <span className='text-danger'>*</span>
                    </label>
                    <select name='sex'
                      className='form-select'
                      value={formData.sex}
                      onChange={handleChange} required
                    >
                      <option value=''>Select sex</option>
                      <option value='male'>Male</option>
                      <option value='female'>Female</option>
                    </select>
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Birthday <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='date' name='birthday'
                      className='form-control'
                      value={formData.birthday}
                      onChange={handleChange} required
                    />
                  </div>
                </div>

                {/* Phone + Email */}
                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Phone Number
                      <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text' name='phone'
                      className='form-control'
                      placeholder='e.g. 09123456789'
                      value={formData.phone}
                      onChange={handleChange} required
                    />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Email <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='email' name='email'
                      className='form-control'
                      placeholder='Enter your email'
                      value={formData.email}
                      onChange={handleChange} required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className='form-label fw-medium'>
                    Password <span className='text-danger'>*</span>
                  </label>
                  <div className='input-group'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      className='form-control'
                      placeholder='Enter password'
                      value={formData.password}
                      onChange={handleChange} required
                    />
                    <button type='button'
                      className='btn btn-outline-secondary'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                {/* Barangay */}
                <div>
                  <label className='form-label fw-medium'>
                    Barangay <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='text' name='barangay'
                    className='form-control'
                    placeholder='e.g. Mambaling'
                    value={formData.barangay}
                    onChange={handleChange} required
                  />
                </div>

                {/* Municipality + Province */}
                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Municipality / City
                      <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text' name='municipality'
                      className='form-control'
                      placeholder='e.g. Cebu City'
                      value={formData.municipality}
                      onChange={handleChange} required
                    />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Province <span className='text-danger'>*</span>
                    </label>
                    <input
                      type='text' name='province'
                      className='form-control'
                      placeholder='e.g. Cebu'
                      value={formData.province}
                      onChange={handleChange} required
                    />
                  </div>
                </div>

                {/* ── Needs Section ── */}
                <div className='fw-semibold
                  text-muted border-bottom pb-2 mt-2'
                  style={{ fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1 }}
                >
                  Medical &amp; Food Needs
                </div>

                {/* ── Allergies ── */}
                <div>
                  <label className='form-label fw-medium'>
                    Allergies
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
                        {allergies.length > 1 ? 'ies' : 'y'} added
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Medicines ── */}
                <div>
                  <label className='form-label fw-medium'>
                    Medicine
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
                        {medicines.length > 1 ? 's' : ''} added
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Special Foods ── */}
                <div>
                  <label className='form-label fw-medium'>
                    Special Foods
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
                        {specialFoods.length > 1 ? 's' : ''} added
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  className='btn btn-danger w-100 py-2 mt-2'
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border
                        spinner-border-sm me-2' />
                      Processing...
                    </>
                  ) : (
                    'Check In Evacuee 🛡️'
                  )}
                </button>

              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}
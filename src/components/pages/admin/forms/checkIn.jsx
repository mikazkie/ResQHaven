import { useOfflineCheckin } from '../../../../hooks/checkOffline'
import { useState, useEffect } from 'react'

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

const TYPE_BADGE = {
  medicine: { label: '💊 Medicine', bg: 'bg-primary' },
  special_food: { label: '🍽️ Food', bg: 'bg-success' },
  allergy: { label: '🤧 Allergy', bg: 'bg-danger' }
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

export default function CheckIn() {
  const { isOnline, saveCheckin } = useOfflineCheckin()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [othersText, setOthersText] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState([])
  const [needInput, setNeedInput] = useState({
    type: 'medicine', name: '', quantity: ''
  })

  const [formData, setFormData] = useState({
    firstname: '', lastname: '',
    sex: '', birthday: '',
    phone: '', email: '',
    password: '', barangay: '',
    municipality: '', province: '',
    people: 1,
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const getAge = (birthday) => {
    if (!birthday) return null
    return Math.floor(
      (new Date() - new Date(birthday)) /
      (365.25 * 24 * 60 * 60 * 1000)
    )
  }

  useEffect(() => {
    if (!formData.birthday) return
    const age = getAge(formData.birthday)
    if (age >= 60 && !selectedStatuses.includes('senior_citizen')) {
      setSelectedStatuses(prev => [...prev, 'senior_citizen'])
      applyPresetNeeds('senior_citizen')
    }
  }, [formData.birthday])

  const applyPresetNeeds = (status) => {
    const preset = STATUS_NEEDS_MAP[status]
    if (!preset) return
    setSpecialNeeds(prev => {
      const newItems = preset.special_needs.filter(
        n => !prev.some(p => p.name === n.name && p.type === n.type)
      )
      return [...prev, ...newItems.map(item => ({
        ...item, id: Date.now() + Math.random()
      }))]
    })
  }

  const handleStatusToggle = (value) => {
    setSelectedStatuses(prev => {
      const exists = prev.includes(value)
      if (exists) return prev.filter(s => s !== value)
      applyPresetNeeds(value)
      return [...prev, value]
    })
  }

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

  const handleRemoveNeed = (id) =>
    setSpecialNeeds(specialNeeds.filter(n => n.id !== id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      setLoading(true)
      const result = await saveCheckin({
        ...formData,
        primary_status: 'checked_in',
        second_status: selectedStatuses,
        second_status_others: othersText,
        special_needs: specialNeeds
      })
      if (result.success) {
        setSuccess(result.online
          ? '✅ Saved to database!'
          : '📵 Saved offline! Will sync when internet returns.'
        )
        setFormData({
          firstname: '', lastname: '',
          sex: '', birthday: '',
          phone: '', email: '',
          password: '', barangay: '',
          municipality: '', province: '',
          people: 1,
        })
        setSpecialNeeds([])
        setSelectedStatuses([])
        setOthersText('')
        setNeedInput({ type: 'medicine', name: '', quantity: '' })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed.')
    } finally {
      setLoading(false)
    }
  }

  const age = getAge(formData.birthday)

  // Summary counts
  const medicineCount = specialNeeds.filter(n => n.type === 'medicine').length
  const foodCount = specialNeeds.filter(n => n.type === 'special_food').length
  const allergyCount = specialNeeds.filter(n => n.type === 'allergy').length

  return (
    <div>
      <div className={`alert py-2 ${isOnline ? 'alert-success' : 'alert-warning'}`}>
        {isOnline ? '🟢 Online — saving to database' : '🔴 Offline — saving locally'}
      </div>

      <div className='container-fluid'>
        <div className='card border-0 shadow-sm'>
          <div className='card-body p-4 p-md-5'>

            <div className='mb-4'>
              <h4 className='fw-semibold mb-1'>Evacuee Check In</h4>
              <p className='text-muted mb-0' style={{ fontSize: 13 }}>
                Fill in evacuee details below
              </p>
            </div>

            {error && (
              <div className='alert alert-danger d-flex align-items-center gap-2 py-2'>
                <span>❌</span>
                <span style={{ fontSize: 14 }}>{error}</span>
              </div>
            )}
            {success && (
              <div className='alert alert-success d-flex align-items-center gap-2 py-2'>
                <span>✅</span>
                <span style={{ fontSize: 14 }}>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className='d-flex flex-column gap-3'>

                {/* Personal Info */}
                <div className='fw-semibold text-muted border-bottom pb-2'
                  style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  Personal Information
                </div>

                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      First Name <span className='text-danger'>*</span>
                    </label>
                    <input type='text' name='firstname' className='form-control'
                      placeholder='e.g. Juan' value={formData.firstname}
                      onChange={handleChange} required
                    />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Last Name <span className='text-danger'>*</span>
                    </label>
                    <input type='text' name='lastname' className='form-control'
                      placeholder='e.g. Dela Cruz' value={formData.lastname}
                      onChange={handleChange} required
                    />
                  </div>
                </div>

                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Sex <span className='text-danger'>*</span>
                    </label>
                    <select name='sex' className='form-select'
                      value={formData.sex} onChange={handleChange} required
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
                    <input type='date' name='birthday' className='form-control'
                      value={formData.birthday} onChange={handleChange} required
                    />
                    {formData.birthday && age !== null && (
                      <div className='d-flex align-items-center flex-wrap gap-1 mt-1'>
                        <span className='text-muted' style={{ fontSize: 12 }}>
                          Age: {age} years old
                        </span>
                        {age >= 60 && (
                          <span className='badge bg-warning text-dark'>
                            👴 Senior Citizen
                          </span>
                        )}
                        {age < 18 && (
                          <span className='badge bg-info text-dark'>
                            👶 Minor
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Phone Number <span className='text-danger'>*</span>
                    </label>
                    <input type='text' name='phone' className='form-control'
                      placeholder='e.g. 09123456789' value={formData.phone}
                      onChange={handleChange} required
                    />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Email <span className='text-danger'>*</span>
                    </label>
                    <input type='email' name='email' className='form-control'
                      placeholder='Enter your email' value={formData.email}
                      onChange={handleChange} required
                    />
                  </div>
                </div>

                <div>
                  <label className='form-label fw-medium'>
                    Password <span className='text-danger'>*</span>
                  </label>
                  <div className='input-group'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name='password' className='form-control'
                      placeholder='Enter password' value={formData.password}
                      onChange={handleChange} required
                    />
                    <button type='button' className='btn btn-outline-secondary'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className='form-label fw-medium'>
                    Barangay <span className='text-danger'>*</span>
                  </label>
                  <input type='text' name='barangay' className='form-control'
                    placeholder='e.g. Mambaling' value={formData.barangay}
                    onChange={handleChange} required
                  />
                </div>

                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Municipality / City <span className='text-danger'>*</span>
                    </label>
                    <input type='text' name='municipality' className='form-control'
                      placeholder='e.g. Cebu City' value={formData.municipality}
                      onChange={handleChange} required
                    />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-medium'>
                      Province <span className='text-danger'>*</span>
                    </label>
                    <input type='text' name='province' className='form-control'
                      placeholder='e.g. Cebu' value={formData.province}
                      onChange={handleChange} required
                    />
                  </div>
                </div>

                <div>
                  <label className='form-label fw-medium'>
                    Number of People
                  </label>
                  <input type='number' name='people' className='form-control'
                    min={1} value={formData.people} onChange={handleChange}
                  />
                </div>

                {/* Status Section */}
                <div className='fw-semibold text-muted border-bottom pb-2 mt-2'
                  style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  Status
                </div>

                {/* Primary Status */}
                <div className='d-flex align-items-center gap-2 p-3 rounded'
                  style={{ background: '#dbeafe', border: '1px solid #93c5fd' }}
                >
                  <span style={{ fontSize: '1.3rem' }}>🏠</span>
                  <div className='flex-grow-1'>
                    <div className='fw-semibold'
                      style={{ fontSize: 13, color: '#1d4ed8' }}
                    >
                      Primary Status: Checked-in (Active Evacuee)
                    </div>
                    <div className='text-muted' style={{ fontSize: 11 }}>
                      Automatically set when checking in
                    </div>
                  </div>
                  <span className='badge bg-primary'>Auto ✓</span>
                </div>

                {/* Secondary Status */}
                <div>
                  <label className='form-label fw-medium'>
                    🟡 Special Conditions
                    <span className='text-muted ms-2' style={{ fontSize: 11 }}>
                      (select all that apply)
                    </span>
                  </label>

                  <div
                    className='d-flex align-items-center gap-2 p-2 rounded border mb-2'
                    style={{
                      cursor: 'pointer', fontSize: 13,
                      background: selectedStatuses.length === 0 ? '#d1fae5' : '#f8f9fa',
                      borderColor: selectedStatuses.length === 0 ? '#22c55e' : '#dee2e6',
                      color: selectedStatuses.length === 0 ? '#15803d' : '#6c757d',
                      userSelect: 'none'
                    }}
                    onClick={() => { setSelectedStatuses([]); setOthersText('') }}
                  >
                    <span>✅</span>
                    <span className='fw-medium'>None — No special condition</span>
                    {selectedStatuses.length === 0 && (
                      <span className='ms-auto fw-bold text-success'>✓</span>
                    )}
                  </div>

                  <div className='d-flex flex-wrap gap-2 mb-2'>
                    {SECONDARY_STATUS.map(status => {
                      const isSelected = selectedStatuses.includes(status.value)
                      return (
                        <div key={status.value}
                          className='px-3 py-2 rounded border d-flex align-items-center gap-1'
                          style={{
                            cursor: 'pointer', fontSize: 12,
                            background: isSelected ? '#fff3cd' : '#f8f9fa',
                            borderColor: isSelected ? '#ffc107' : '#dee2e6',
                            color: isSelected ? '#856404' : '#6c757d',
                            transition: 'all 0.15s', userSelect: 'none'
                          }}
                          onClick={() => handleStatusToggle(status.value)}
                        >
                          <span>{status.icon}</span>
                          <span>{status.label}</span>
                          {isSelected && <span className='ms-1 fw-bold'>✓</span>}
                        </div>
                      )
                    })}
                  </div>

                  {selectedStatuses.includes('others') && (
                    <input type='text'
                      className='form-control form-control-sm mt-1'
                      placeholder='Please specify condition...'
                      value={othersText}
                      onChange={(e) => setOthersText(e.target.value)}
                    />
                  )}

                  {selectedStatuses.length > 0 && (
                    <div className='mt-2 p-2 rounded bg-warning bg-opacity-10 border border-warning-subtle'>
                      <div className='text-muted mb-1' style={{ fontSize: 11 }}>
                        Selected conditions:
                      </div>
                      <div className='d-flex flex-wrap gap-1'>
                        {selectedStatuses.map(s => {
                          const found = SECONDARY_STATUS.find(x => x.value === s)
                          return (
                            <span key={s} className='badge bg-warning text-dark'>
                              {found?.icon} {found?.label}
                              {s === 'others' && othersText ? `: ${othersText}` : ''}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Special Needs Section ── */}
                <div className='fw-semibold text-muted border-bottom pb-2 mt-2'
                  style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  Special Needs
                </div>

                {/* Summary cards */}
                {specialNeeds.length > 0 && (
                  <div className='row g-2 mb-2'>
                    <div className='col-4'>
                      <div className='card border-0 bg-primary bg-opacity-10 text-center p-2'>
                        <div className='fw-bold text-primary fs-5'>
                          {medicineCount}
                        </div>
                        <div className='text-muted' style={{ fontSize: 11 }}>
                          💊 Medicines
                        </div>
                      </div>
                    </div>
                    <div className='col-4'>
                      <div className='card border-0 bg-success bg-opacity-10 text-center p-2'>
                        <div className='fw-bold text-success fs-5'>
                          {foodCount}
                        </div>
                        <div className='text-muted' style={{ fontSize: 11 }}>
                          🍽️ Foods
                        </div>
                      </div>
                    </div>
                    <div className='col-4'>
                      <div className='card border-0 bg-danger bg-opacity-10 text-center p-2'>
                        <div className='fw-bold text-danger fs-5'>
                          {allergyCount}
                        </div>
                        <div className='text-muted' style={{ fontSize: 11 }}>
                          🤧 Allergies
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input row */}
                <div>
                  <label className='form-label fw-medium'>
                    🆘 Add Special Need
                    <span className='text-muted ms-2' style={{ fontSize: 11 }}>
                      (medicines, food, allergies)
                    </span>
                  </label>

                  <div className='d-flex gap-2 mb-3 flex-wrap flex-md-nowrap'>
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

                    <input type='text' className='form-control'
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
                      <input type='number' className='form-control'
                        placeholder='Qty' style={{ maxWidth: 80 }}
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
                      <table className='table table-bordered table-hover mb-0'
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
                                <span className={`badge ${TYPE_BADGE[item.type]?.bg}`}>
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
                                  className='btn btn-sm btn-outline-danger py-0'
                                  onClick={() => handleRemoveNeed(item.id)}
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>

                        {/* Table footer summary */}
                        <tfoot className='table-light'>
                          <tr>
                            <td colSpan='5' style={{ fontSize: 12 }}>
                              <div className='d-flex gap-3 text-muted'>
                                <span>
                                  💊 {medicineCount} medicine(s)
                                </span>
                                <span>
                                  🍽️ {foodCount} food(s)
                                </span>
                                <span>
                                  🤧 {allergyCount} allergy(ies)
                                </span>
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
                    <div className='text-center text-muted py-3 border rounded bg-light'
                      style={{ fontSize: 13 }}
                    >
                      No special needs added yet
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button type='submit'
                  className='btn btn-danger w-100 py-2 mt-2'
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' />
                      Processing...
                    </>
                  ) : 'Check In Evacuee 🛡️'}
                </button>

              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
// src/pages/admin/forms/FamilyCheckIn.jsx
import { useState } from 'react'
import { postRequest, getRequest }
  from '../../../../API/API'
import { SECONDARY_STATUS } from '../../../dropdownData/data'



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

// ── Secondary Status Selector ──
function StatusSelector({ selected, setSelected, othersText, setOthersText }) {
  const applyPreset = (value, currentNeeds, setNeeds) => {
    const preset = STATUS_NEEDS_MAP[value]
    if (!preset) return
    setNeeds(prev => {
      const newItems = preset.special_needs.filter(
        n => !prev.some(p => p.name === n.name && p.type === n.type)
      )
      return [...prev, ...newItems.map(i => ({
        ...i, id: Date.now() + Math.random()
      }))]
    })
  }

  const toggle = (value, setNeeds) => {
    setSelected(prev => {
      const exists = prev.includes(value)
      if (!exists) applyPreset(value, [], setNeeds)
      return exists
        ? prev.filter(s => s !== value)
        : [...prev, value]
    })
  }

  return (
    <div>
      <label className='form-label fw-medium'
        style={{ fontSize: 13 }}
      >
        🟡 Special Conditions
        <span className='text-muted ms-2'
          style={{ fontSize: 11 }}
        >
          (select all that apply)
        </span>
      </label>

      {/* None */}
      <div
        className='d-flex align-items-center
          gap-2 p-2 rounded border mb-2'
        style={{
          cursor: 'pointer', fontSize: 13,
          background: selected.length === 0
            ? '#d1fae5' : '#f8f9fa',
          borderColor: selected.length === 0
            ? '#22c55e' : '#dee2e6',
          color: selected.length === 0
            ? '#15803d' : '#6c757d',
          userSelect: 'none'
        }}
        onClick={() => {
          setSelected([])
          setOthersText('')
        }}
      >
        <span>✅</span>
        <span className='fw-medium'>
          None — No special condition
        </span>
        {selected.length === 0 && (
          <span className='ms-auto fw-bold text-success'>✓</span>
        )}
      </div>

      {/* Chips */}
      <div className='d-flex flex-wrap gap-2 mb-2'>
        {SECONDARY_STATUS.map(s => {
          const isSelected = selected.includes(s.value)
          return (
            <div key={s.value}
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
              onClick={() => toggle(s.value)}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
              {isSelected && <span className='ms-1 fw-bold'>✓</span>}
            </div>
          )
        })}
      </div>

      {/* Others input */}
      {selected.includes('others') && (
        <input type='text'
          className='form-control form-control-sm mt-1'
          placeholder='Please specify condition...'
          value={othersText}
          onChange={e => setOthersText(e.target.value)}
        />
      )}

      {/* Summary */}
      {selected.length > 0 && (
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
            {selected.map(s => {
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
        </div>
      )}
    </div>
  )
}

// ── Special Needs Input ──
function NeedsInput({ specialNeeds, setSpecialNeeds }) {
  const [needInput, setNeedInput] = useState({
    type: 'medicine', name: '', quantity: ''
  })

  const handleAdd = () => {
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

  const handleRemove = (id) =>
    setSpecialNeeds(prev => prev.filter(n => n.id !== id))

  const medCount = specialNeeds.filter(n => n.type === 'medicine').length
  const foodCount = specialNeeds.filter(n => n.type === 'special_food').length
  const allergyCount = specialNeeds.filter(n => n.type === 'allergy').length

  return (
    <div>
      <label className='form-label fw-medium'
        style={{ fontSize: 13 }}
      >
        🆘 Special Needs
        <span className='text-muted ms-2'
          style={{ fontSize: 11 }}
        >
          (medicines, food, allergies)
        </span>
      </label>

      {/* Summary cards */}
      {specialNeeds.length > 0 && (
        <div className='row g-2 mb-2'>
          <div className='col-4'>
            <div className='card border-0
              bg-primary bg-opacity-10 text-center p-2'
            >
              <div className='fw-bold text-primary'>
                {medCount}
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
              bg-danger bg-opacity-10 text-center p-2'
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
      <div className='d-flex gap-2 mb-2
        flex-wrap flex-md-nowrap'
      >
        <select
          className='form-select form-select-sm'
          style={{ maxWidth: 160 }}
          value={needInput.type}
          onChange={e => setNeedInput({
            ...needInput, type: e.target.value
          })}
        >
          <option value='medicine'>💊 Medicine</option>
          <option value='special_food'>🍽️ Food</option>
          <option value='allergy'>🤧 Allergy</option>
        </select>

        <input type='text'
          className='form-control form-control-sm'
          placeholder={
            needInput.type === 'medicine' ? 'e.g. Bioflu'
            : needInput.type === 'special_food' ? 'e.g. Milk'
            : 'e.g. Chicken'
          }
          value={needInput.name}
          onChange={e => setNeedInput({
            ...needInput, name: e.target.value
          })}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
        />

        {needInput.type !== 'allergy' && (
          <input type='number'
            className='form-control form-control-sm'
            placeholder='Qty'
            style={{ maxWidth: 70 }}
            value={needInput.quantity}
            min={1}
            onChange={e => setNeedInput({
              ...needInput, quantity: e.target.value
            })}
          />
        )}

        <button type='button'
          className='btn btn-sm btn-danger flex-shrink-0'
          onClick={handleAdd}
        >
          + Add
        </button>
      </div>

      {/* Table */}
      {specialNeeds.length > 0 ? (
        <div className='table-responsive'>
          <table className='table table-sm
            table-bordered table-hover mb-0'
            style={{ fontSize: 12 }}
          >
            <thead className='table-light'>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Name</th>
                <th>Qty</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {specialNeeds.map((item, i) => (
                <tr key={item.id}>
                  <td className='text-muted text-center'>
                    {i + 1}
                  </td>
                  <td>
                    <span className={`badge ${
                      TYPE_BADGE[item.type]?.bg
                    }`}
                      style={{ fontSize: 10 }}
                    >
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
                        btn-outline-danger py-0 px-1'
                      style={{ fontSize: 11 }}
                      onClick={() => handleRemove(item.id)}
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
                  style={{ fontSize: 11 }}
                >
                  <span className='text-muted'>
                    💊 {medCount} •{' '}
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
          py-2 border rounded bg-light'
          style={{ fontSize: 12 }}
        >
          No special needs added yet
        </div>
      )}
    </div>
  )
}

// ── Member Card ──
function MemberCard({ member, index, onRemove }) {
  return (
    <div className='d-flex align-items-center
      justify-content-between p-3
      border rounded mb-2'
    >
      <div className='d-flex align-items-center gap-2'>
        <div
          className='rounded-circle d-flex
            align-items-center justify-content-center
            flex-shrink-0'
          style={{
            width: 36, height: 36,
            background: member.type === 'existing'
              ? '#d1fae5' : '#dbeafe',
            fontSize: '1rem'
          }}
        >
          {member.type === 'existing' ? '✅' : '👤'}
        </div>
        <div>
          <div className='fw-medium' style={{ fontSize: 14 }}>
            {member.firstname} {member.lastname}
          </div>
          <div className='text-muted' style={{ fontSize: 12 }}>
            {member.relationship} •{' '}
            <span className={
              member.type === 'existing'
                ? 'text-success' : 'text-primary'
            }>
              {member.type === 'existing'
                ? 'Registered ✅' : 'New User'}
            </span>
          </div>
          {/* Show status badges */}
          {member.second_status?.length > 0 && (
            <div className='d-flex flex-wrap gap-1 mt-1'>
              {member.second_status.map(s => {
                const found = SECONDARY_STATUS
                  .find(x => x.value === s)
                return (
                  <span key={s}
                    className='badge bg-warning
                      text-dark'
                    style={{ fontSize: 9 }}
                  >
                    {found?.icon} {found?.label}
                  </span>
                )
              })}
            </div>
          )}
          {/* Show needs count */}
          {member.special_needs?.length > 0 && (
            <div className='text-muted mt-1'
              style={{ fontSize: 11 }}
            >
              🆘 {member.special_needs.length} need(s)
            </div>
          )}
        </div>
      </div>
      <button
        className='btn btn-sm text-danger border-0'
        onClick={() => onRemove(index)}
      >
        ✕
      </button>
    </div>
  )
}

// ── Search User ──
function SearchUser({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const response = await getRequest(
        `api/search-user?query=${query}`
      )
      setResults(response.data || [])
    } catch (err) {
      console.log(err)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      <div className='input-group mb-2'>
        <input type='text'
          className='form-control'
          placeholder='Search by name or phone...'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch()
          }}
        />
        <button
          className='btn btn-outline-danger'
          onClick={handleSearch}
          disabled={searching}
        >
          {searching
            ? <span className='spinner-border spinner-border-sm' />
            : '🔍'
          }
        </button>
      </div>

      {results.map(user => (
        <div key={user.id}
          className='d-flex align-items-center
            justify-content-between p-2
            border rounded mb-1'
          style={{ fontSize: 13 }}
        >
          <div>
            <div className='fw-medium'>
              {user.firstName} {user.lastName}
            </div>
            <div className='text-muted'
              style={{ fontSize: 11 }}
            >
              {user.phone} • {user.barangay}
            </div>
          </div>
          <button
            className='btn btn-sm btn-success'
            onClick={() => {
              onSelect({
                type: 'existing',
                userId: user.id,
                firstname: user.firstName,
                lastname: user.lastName,
                phone: user.phone,
                barangay: user.barangay,
                municipality: user.municipality,
                province: user.province,
              })
              setResults([])
              setQuery('')
            }}
          >
            + Add
          </button>
        </div>
      ))}

      {results.length === 0 && query && !searching && (
        <p className='text-muted mb-0'
          style={{ fontSize: 12 }}
        >
          No users found. Add as new member below.
        </p>
      )}
    </div>
  )
}

// ── Member Form with Status + Needs ──
function MemberForm({ onSave, onClose }) {
  const [data, setData] = useState({
    firstname: '', lastname: '',
    sex: '', birthday: '', relationship: ''
  })
  const [selectedStatuses, setSelectedStatuses] =
    useState([])
  const [othersText, setOthersText] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState([])

  return (
    <div className='mt-3 p-3 bg-light rounded'>
      <div className='d-flex justify-content-between mb-3'>
        <span className='fw-medium' style={{ fontSize: 13 }}>
          New Member Details
        </span>
        <button
          className='btn btn-sm btn-outline-secondary'
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className='row g-2 mb-3'>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='First Name *'
            value={data.firstname}
            onChange={e => setData({
              ...data, firstname: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Last Name *'
            value={data.lastname}
            onChange={e => setData({
              ...data, lastname: e.target.value
            })}
          />
        </div>
        <div className='col-4'>
          <select
            className='form-select form-select-sm'
            value={data.sex}
            onChange={e => setData({
              ...data, sex: e.target.value
            })}
          >
            <option value=''>Sex</option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
          </select>
        </div>
        <div className='col-4'>
          <input type='date'
            className='form-control form-control-sm'
            value={data.birthday}
            onChange={e => setData({
              ...data, birthday: e.target.value
            })}
          />
        </div>
        <div className='col-4'>
          <select
            className='form-select form-select-sm'
            value={data.relationship}
            onChange={e => setData({
              ...data, relationship: e.target.value
            })}
          >
            <option value=''>Relationship</option>
            <option value='Spouse'>Spouse</option>
            <option value='Child'>Child</option>
            <option value='Parent'>Parent</option>
            <option value='Sibling'>Sibling</option>
            <option value='Other'>Other</option>
          </select>
        </div>
      </div>

      {/* ✅ Status + Needs for new member */}
      <div className='mb-3'>
        <StatusSelector
          selected={selectedStatuses}
          setSelected={setSelectedStatuses}
          othersText={othersText}
          setOthersText={setOthersText}
        />
      </div>

      <div className='mb-3'>
        <NeedsInput
          specialNeeds={specialNeeds}
          setSpecialNeeds={setSpecialNeeds}
        />
      </div>

      <button
        className='btn btn-danger btn-sm w-100'
        onClick={() => {
          if (!data.firstname) return
          onSave({
            type: 'new',
            ...data,
            second_status: selectedStatuses,
            second_status_others: othersText,
            special_needs: specialNeeds
          })
        }}
      >
        + Add Member
      </button>
    </div>
  )
}

// ── Head Form ──
function HeadForm({ onSave }) {
  const [data, setData] = useState({
    firstname: '', lastname: '',
    sex: '', birthday: '',
    phone: '', email: '',
    barangay: '', municipality: '',
    province: ''
  })
  const [selectedStatuses, setSelectedStatuses] =
    useState([])
  const [othersText, setOthersText] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState([])

  return (
    <div className='d-flex flex-column gap-3'>
      <div className='row g-2'>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='First Name *'
            value={data.firstname}
            onChange={e => setData({
              ...data, firstname: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Last Name *'
            value={data.lastname}
            onChange={e => setData({
              ...data, lastname: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <select
            className='form-select form-select-sm'
            value={data.sex}
            onChange={e => setData({
              ...data, sex: e.target.value
            })}
          >
            <option value=''>Sex</option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
          </select>
        </div>
        <div className='col-6'>
          <input type='date'
            className='form-control form-control-sm'
            value={data.birthday}
            onChange={e => setData({
              ...data, birthday: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Phone *'
            value={data.phone}
            onChange={e => setData({
              ...data, phone: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='email'
            className='form-control form-control-sm'
            placeholder='Email'
            value={data.email}
            onChange={e => setData({
              ...data, email: e.target.value
            })}
          />
        </div>
        <div className='col-12'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Barangay *'
            value={data.barangay}
            onChange={e => setData({
              ...data, barangay: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Municipality *'
            value={data.municipality}
            onChange={e => setData({
              ...data, municipality: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Province *'
            value={data.province}
            onChange={e => setData({
              ...data, province: e.target.value
            })}
          />
        </div>
      </div>

      {/* ✅ Status + Needs for head */}
      <StatusSelector
        selected={selectedStatuses}
        setSelected={setSelectedStatuses}
        othersText={othersText}
        setOthersText={setOthersText}
      />

      <NeedsInput
        specialNeeds={specialNeeds}
        setSpecialNeeds={setSpecialNeeds}
      />

      <button
        className='btn btn-danger btn-sm w-100'
        onClick={() => {
          if (!data.firstname || !data.phone) return
          onSave({
            ...data,
            second_status: selectedStatuses,
            second_status_others: othersText,
            special_needs: specialNeeds
          })
        }}
      >
        ✅ Set as Head
      </button>
    </div>
  )
}

// ── Main Component ──
export default function FamilyCheckIn() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [familyId, setFamilyId] = useState(null)
  const [totalMembers, setTotalMembers] = useState(0)

  const [headType, setHeadType] = useState(null)
  const [head, setHead] = useState(null)
  const [members, setMembers] = useState([])
  const [showNewMember, setShowNewMember] =
    useState(false)
  const [newMemberRelationship, setNewMemberRelationship] =
    useState('')

  // ✅ Head status + needs
  const [headStatuses, setHeadStatuses] = useState([])
  const [headOthersText, setHeadOthersText] = useState('')
  const [headSpecialNeeds, setHeadSpecialNeeds] =
    useState([])

  const handleAddMember = (member) => {
    setMembers(prev => [...prev, {
      ...member, id: Date.now()
    }])
  }

  const handleRemoveMember = (index) => {
    setMembers(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!head) {
      setError('Please add head of family!')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await postRequest(
        'auth/family-checkin',
        {
          head: {
            ...head,
            second_status: headStatuses,
            second_status_others: headOthersText,
            special_needs: headSpecialNeeds
          },
          members
        }
      )
      if (response.success) {
        setFamilyId(response.familyId)
        setTotalMembers(response.totalMembers)
        setStep(3)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Check-in failed!'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-4'>

      <div className='mb-4'>
        <h4 className='fw-bold mb-1'>
          👨‍👩‍👧‍👦 Family Check-in
        </h4>
        <p className='text-muted mb-0'
          style={{ fontSize: 13 }}
        >
          Register family for evacuation
        </p>
      </div>

      {error && (
        <div className='alert alert-danger py-2 mb-3'
          style={{ fontSize: 13 }}
        >
          ❌ {error}
        </div>
      )}

      {/* ── Step 1: Head ── */}
      {step === 1 && (
        <div className='card border-0 shadow-sm'>
          <div className='card-body p-4'>

            <h6 className='fw-bold mb-3 border-bottom pb-2'>
              👤 Step 1 — Head of Family
            </h6>

            {!head ? (
              <>
                {!headType && (
                  <div className='row g-3 mb-3'>
                    <div className='col-6'>
                      <div
                        className='card border-success
                          text-center p-3'
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          setHeadType('existing')
                        }
                      >
                        <div style={{ fontSize: '2rem' }}>✅</div>
                        <div className='fw-medium mt-1
                          text-success'
                          style={{ fontSize: 13 }}
                        >
                          Already Registered
                        </div>
                        <div className='text-muted'
                          style={{ fontSize: 11 }}
                        >
                          Search by name or phone
                        </div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div
                        className='card border-primary
                          text-center p-3'
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          setHeadType('new')
                        }
                      >
                        <div style={{ fontSize: '2rem' }}>📝</div>
                        <div className='fw-medium mt-1
                          text-primary'
                          style={{ fontSize: 13 }}
                        >
                          New User
                        </div>
                        <div className='text-muted'
                          style={{ fontSize: 11 }}
                        >
                          Fill form manually
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {headType === 'existing' && (
                  <div>
                    <div className='d-flex
                      align-items-center gap-2 mb-3'
                    >
                      <button
                        className='btn btn-sm
                          btn-outline-secondary'
                        onClick={() => setHeadType(null)}
                      >
                        ← Back
                      </button>
                      <span className='fw-medium'
                        style={{ fontSize: 13 }}
                      >
                        Search Registered User
                      </span>
                    </div>
                    <SearchUser
                      onSelect={(user) => {
                        setHead({
                          ...user,
                          relationship: 'Head'
                        })
                        setHeadType(null)
                      }}
                    />
                    {/* ✅ Status + Needs for existing head */}
                    <div className='mt-3 border-top pt-3'>
                      <StatusSelector
                        selected={headStatuses}
                        setSelected={setHeadStatuses}
                        othersText={headOthersText}
                        setOthersText={setHeadOthersText}
                      />
                      <div className='mt-3'>
                        <NeedsInput
                          specialNeeds={headSpecialNeeds}
                          setSpecialNeeds={setHeadSpecialNeeds}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {headType === 'new' && (
                  <div>
                    <div className='d-flex
                      align-items-center gap-2 mb-3'
                    >
                      <button
                        className='btn btn-sm
                          btn-outline-secondary'
                        onClick={() => setHeadType(null)}
                      >
                        ← Back
                      </button>
                      <span className='fw-medium'
                        style={{ fontSize: 13 }}
                      >
                        New User Registration
                      </span>
                    </div>
                    <HeadForm
                      onSave={(data) => {
                        setHead({
                          type: 'new',
                          ...data,
                          relationship: 'Head'
                        })
                        setHeadStatuses(
                          data.second_status || []
                        )
                        setHeadOthersText(
                          data.second_status_others || ''
                        )
                        setHeadSpecialNeeds(
                          data.special_needs || []
                        )
                        setHeadType(null)
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div>
                <div className='d-flex align-items-center
                  justify-content-between p-3 border
                  rounded bg-success bg-opacity-10 mb-3'
                >
                  <div className='d-flex
                    align-items-center gap-2'
                  >
                    <span style={{ fontSize: '1.5rem' }}>
                      {head.type === 'existing' ? '✅' : '👤'}
                    </span>
                    <div>
                      <div className='fw-bold'
                        style={{ fontSize: 14 }}
                      >
                        {head.firstname} {head.lastname}
                        <span className='badge bg-danger ms-2'>
                          Head
                        </span>
                      </div>
                      <div className='text-muted'
                        style={{ fontSize: 12 }}
                      >
                        {head.type === 'existing'
                          ? '✅ Registered'
                          : '📝 New User'
                        }
                        {head.barangay
                          ? ` • ${head.barangay}` : ''
                        }
                      </div>
                      {headStatuses.length > 0 && (
                        <div className='d-flex
                          flex-wrap gap-1 mt-1'
                        >
                          {headStatuses.map(s => {
                            const found = SECONDARY_STATUS
                              .find(x => x.value === s)
                            return (
                              <span key={s}
                                className='badge
                                  bg-warning text-dark'
                                style={{ fontSize: 9 }}
                              >
                                {found?.icon} {found?.label}
                              </span>
                            )
                          })}
                        </div>
                      )}
                      {headSpecialNeeds.length > 0 && (
                        <div className='text-muted'
                          style={{ fontSize: 11 }}
                        >
                          🆘 {headSpecialNeeds.length} need(s)
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className='btn btn-sm text-danger border-0'
                    onClick={() => setHead(null)}
                  >
                    ✕
                  </button>
                </div>

                <button
                  className='btn btn-danger w-100'
                  onClick={() => setStep(2)}
                >
                  Next → Add Members
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Members ── */}
      {step === 2 && (
        <div className='card border-0 shadow-sm'>
          <div className='card-body p-4'>

            <h6 className='fw-bold mb-3 border-bottom pb-2'>
              👨‍👩‍👧 Step 2 — Family Members
              <span className='badge bg-danger ms-2'>
                {members.length} added
              </span>
            </h6>

            <div className='alert alert-success py-2 mb-3'
              style={{ fontSize: 13 }}
            >
              <strong>Head:</strong>{' '}
              {head.firstname} {head.lastname} —{' '}
              {head.type === 'existing'
                ? '✅ Registered'
                : '📝 New User'
              }
            </div>

            {members.map((m, i) => (
              <MemberCard
                key={m.id}
                member={m}
                index={i}
                onRemove={handleRemoveMember}
              />
            ))}

            {/* Add options */}
            {!showNewMember && (
              <div className='row g-2 mt-2'>
                <div className='col-6'>
                  <div
                    className='card border-success
                      text-center p-3'
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      setShowNewMember('search')
                    }
                  >
                    <div>✅ Already Registered</div>
                    <div className='text-muted'
                      style={{ fontSize: 11 }}
                    >
                      Search user
                    </div>
                  </div>
                </div>
                <div className='col-6'>
                  <div
                    className='card border-primary
                      text-center p-3'
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      setShowNewMember('new')
                    }
                  >
                    <div>📝 New Member</div>
                    <div className='text-muted'
                      style={{ fontSize: 11 }}
                    >
                      Fill form
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search existing member */}
            {showNewMember === 'search' && (
              <div className='mt-3 p-3 bg-light rounded'>
                <div className='d-flex
                  justify-content-between mb-2'
                >
                  <span className='fw-medium'
                    style={{ fontSize: 13 }}
                  >
                    Search Member
                  </span>
                  <button
                    className='btn btn-sm
                      btn-outline-secondary'
                    onClick={() =>
                      setShowNewMember(false)
                    }
                  >
                    ✕
                  </button>
                </div>

                <select
                  className='form-select
                    form-select-sm mb-2'
                  value={newMemberRelationship}
                  onChange={e =>
                    setNewMemberRelationship(e.target.value)
                  }
                >
                  <option value=''>Relationship</option>
                  <option value='Spouse'>Spouse</option>
                  <option value='Child'>Child</option>
                  <option value='Parent'>Parent</option>
                  <option value='Sibling'>Sibling</option>
                  <option value='Other'>Other</option>
                </select>

                <SearchUser
                  onSelect={(user) => {
                    handleAddMember({
                      ...user,
                      relationship:
                        newMemberRelationship || 'Member',
                      second_status: [],
                      special_needs: []
                    })
                    setShowNewMember(false)
                    setNewMemberRelationship('')
                  }}
                />
              </div>
            )}

            {/* ✅ New member form with status+needs */}
            {showNewMember === 'new' && (
              <MemberForm
                onSave={(data) => {
                  handleAddMember(data)
                  setShowNewMember(false)
                }}
                onClose={() => setShowNewMember(false)}
              />
            )}

            <div className='d-flex gap-2 mt-3'>
              <button
                className='btn btn-outline-secondary'
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                className='btn btn-danger flex-grow-1'
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className='spinner-border
                      spinner-border-sm me-2'
                    />
                    Saving...
                  </>
                ) : '✅ Complete Family Check-in'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Step 3: Success ── */}
      {step === 3 && (
        <div className='card border-0 shadow-sm
          text-center'
        >
          <div className='card-body p-5'>
            <div style={{ fontSize: '4rem' }}>🎉</div>
            <h4 className='fw-bold text-success mt-3'>
              Family Checked In!
            </h4>
            <p className='text-muted mb-1'
              style={{ fontSize: 13 }}
            >
              Family ID:
              <strong className='text-danger ms-1'>
                {familyId}
              </strong>
            </p>
            <p className='text-muted mb-4'
              style={{ fontSize: 13 }}
            >
              <strong>{totalMembers}</strong>{' '}
              member(s) successfully registered
            </p>
            <button
              className='btn btn-danger'
              onClick={() => {
                setStep(1)
                setHead(null)
                setMembers([])
                setFamilyId(null)
                setTotalMembers(0)
                setHeadStatuses([])
                setHeadSpecialNeeds([])
                setHeadOthersText('')
              }}
            >
              + Register Another Family
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
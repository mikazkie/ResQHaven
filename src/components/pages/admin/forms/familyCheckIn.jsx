// src/pages/admin/forms/FamilyCheckIn.jsx
import { useState } from 'react'
import { postRequest, getRequest }
  from '../../../../API/API'
import "../../../styles/familyCheckIn.css"
// ── Member Card Component ──
function MemberCard({
  member, index, onRemove
}) {
  return (
    <div className='d-flex align-items-center
      justify-content-between p-3
      border rounded mb-2'
    >
      <div className='d-flex
        align-items-center gap-2'
      >
        <div
          className={`rounded-circle
            d-flex align-items-center
            justify-content-center
            flex-shrink-0`}
          style={{
            width: 36, height: 36,
            background: member.type === 'existing'
              ? '#d1fae5' : '#dbeafe',
            fontSize: '1rem'
          }}
        >
          {member.type === 'existing'
            ? '✅' : '👤'}
        </div>
        <div>
          <div className='fw-medium'
            style={{ fontSize: 14 }}
          >
            {member.firstname}{' '}
            {member.lastname}
          </div>
          <div className='text-muted'
            style={{ fontSize: 12 }}
          >
            {member.relationship} •{' '}
            <span className={
              member.type === 'existing'
                ? 'text-success'
                : 'text-primary'
            }>
              {member.type === 'existing'
                ? 'Registered ✅'
                : 'New User'
              }
            </span>
          </div>
        </div>
      </div>
      <button
        className='btn btn-sm
          text-danger border-0'
        onClick={() => onRemove(index)}
      >
        ✕
      </button>
    </div>
  )
}

// ── Search User Component ──
function SearchUser({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] =
    useState(false)

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
        <input
          type='text'
          className='form-control'
          placeholder='Search by name or phone...'
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
        />
        <button
          className='btn btn-outline-danger'
          onClick={handleSearch}
          disabled={searching}
        >
          {searching ? (
            <span className='spinner-border
              spinner-border-sm'
            />
          ) : '🔍'}
        </button>
      </div>

      {/* Results */}
      {results.map(user => (
        <div
          key={user.id}
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
              {user.phone} •{' '}
              {user.barangay}
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
                municipality: user.city,
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

      {results.length === 0 && query && (
        <p className='text-muted mb-0'
          style={{ fontSize: 12 }}
        >
          No users found.
          Add as new member below.
        </p>
      )}
    </div>
  )
}

export default function FamilyCheckIn() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [familyId, setFamilyId] = useState(null)
  const [totalMembers, setTotalMembers] =
    useState(0)

  // Head state
  const [headType, setHeadType] =
    useState(null)
  // 'existing' or 'new'
  const [head, setHead] = useState(null)

  // Members
  const [members, setMembers] = useState([])

  // New member form
  const [showNewMember, setShowNewMember] =
    useState(false)
  const [newMember, setNewMember] = useState({
    firstname: '', lastname: '',
    sex: '', birthday: '',
    relationship: ''
  })

  const handleAddMember = (member) => {
    setMembers([...members, {
      ...member,
      id: Date.now()
    }])
  }

  const handleRemoveMember = (index) => {
    setMembers(members.filter(
      (_, i) => i !== index
    ))
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
        { head, members }
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

      {/* Header */}
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

      {/* Error */}
      {error && (
        <div className='alert alert-danger
          py-2 mb-3'
          style={{ fontSize: 13 }}
        >
          ❌ {error}
        </div>
      )}

      {/* ── Step 1: Head of Family ── */}
      {step === 1 && (
        <div className='card border-0 shadow-sm'>
          <div className='card-body p-4'>

            <h6 className='fw-bold mb-3
              border-bottom pb-2'
            >
              👤 Step 1 — Head of Family
            </h6>

            {!head ? (
              <>
                {/* Choice buttons */}
                {!headType && (
                  <div className='row g-3 mb-3'>
                    <div className='col-6'>
                      <div
                      className='card border-success 
                      text-center p-3 
                      hover-success'
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          setHeadType('existing')
                        }
                      >
                        <div style={{
                          fontSize: '2rem'
                        }}>
                          ✅
                        </div>
                        <div className='fw-medium
                          mt-1 text-success'
                          style={{ fontSize: 13 }}
                        >
                          Already Registered
                        </div>
                        <div className='text-muted'
                          style={{ fontSize: 11 }}
                        >
                          Search by name
                          or phone
                        </div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div
                      className='card border-primary 
                      text-center p-3 
                      hover-primary'
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          setHeadType('new')
                        }
                      >
                        <div style={{
                          fontSize: '2rem'
                        }}>
                          📝
                        </div>
                        <div className='fw-medium
                          mt-1 text-primary'
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

                {/* Search existing */}
                {headType === 'existing' && (
                  <div>
                    <div className='d-flex
                      align-items-center
                      gap-2 mb-3'
                    >
                      <button
                        className='btn btn-sm
                          btn-outline-secondary'
                        onClick={() =>
                          setHeadType(null)
                        }
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
                  </div>
                )}

                {/* New head form */}
                {headType === 'new' && (
                  <div>
                    <div className='d-flex
                      align-items-center
                      gap-2 mb-3'
                    >
                      <button
                        className='btn btn-sm
                          btn-outline-secondary'
                        onClick={() =>
                          setHeadType(null)
                        }
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
                        setHeadType(null)
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              /* Head Selected */
              <div>
                <div className='d-flex
                  align-items-center
                  justify-content-between
                  p-3 border rounded
                  bg-success bg-opacity-10
                  mb-3'
                >
                  <div className='d-flex
                    align-items-center gap-2'
                  >
                    <span style={{
                      fontSize: '1.5rem'
                    }}>
                      {head.type === 'existing'
                        ? '✅' : '👤'}
                    </span>
                    <div>
                      <div className='fw-bold'
                        style={{ fontSize: 14 }}
                      >
                        {head.firstname}{' '}
                        {head.lastname}
                        <span className='badge
                          bg-danger ms-2'
                        >
                          Head
                        </span>
                      </div>
                      <div className='text-muted'
                        style={{ fontSize: 12 }}
                      >
                        {head.type === 'existing'
                          ? '✅ Registered User'
                          : '📝 New User'
                        }
                        {head.barangay
                          ? ` • ${head.barangay}`
                          : ''
                        }
                      </div>
                    </div>
                  </div>
                  <button
                    className='btn btn-sm
                      text-danger border-0'
                    onClick={() => setHead(null)}
                  >
                    ✕
                  </button>
                </div>

                <button
                  className='btn btn-danger
                    w-100'
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

            <h6 className='fw-bold mb-3
              border-bottom pb-2'
            >
              👨‍👩‍👧 Step 2 — Family Members
              <span className='badge
                bg-danger ms-2'
              >
                {members.length} added
              </span>
            </h6>

            {/* Head summary */}
            <div className='alert
              alert-success py-2 mb-3'
              style={{ fontSize: 13 }}
            >
              <strong>Head:</strong>{' '}
              {head.firstname}{' '}
              {head.lastname} —{' '}
              {head.type === 'existing'
                ? '✅ Registered'
                : '📝 New User'
              }
            </div>

            {/* Members list */}
            {members.map((m, i) => (
              <MemberCard
                key={m.id}
                member={m}
                index={i}
                onRemove={handleRemoveMember}
              />
            ))}

            {/* Add member options */}
            {!showNewMember && (
              <div className='row g-2 mt-2'>
                <div className='col-6'>
                  <div
                    className='card
                      border-success
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
                    className='card
                      border-primary
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
              <div className='mt-3 p-3
                bg-light rounded'
              >
                <div className='d-flex
                  justify-content-between
                  mb-2'
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

                {/* Relationship */}
                <select
                  className='form-select
                    form-select-sm mb-2'
                  value={newMember.relationship}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      relationship: e.target.value
                    })
                  }
                >
                  <option value=''>
                    Select Relationship
                  </option>
                  <option value='Spouse'>
                    Spouse
                  </option>
                  <option value='Child'>
                    Child
                  </option>
                  <option value='Parent'>
                    Parent
                  </option>
                  <option value='Sibling'>
                    Sibling
                  </option>
                  <option value='Other'>
                    Other
                  </option>
                </select>

                <SearchUser
                  onSelect={(user) => {
                    handleAddMember({
                      ...user,
                      relationship:
                        newMember.relationship
                        || 'Member'
                    })
                    setShowNewMember(false)
                    setNewMember({
                      firstname: '',
                      lastname: '',
                      sex: '', birthday: '',
                      relationship: ''
                    })
                  }}
                />
              </div>
            )}

            {/* New member form */}
            {showNewMember === 'new' && (
              <div className='mt-3 p-3
                bg-light rounded'
              >
                <div className='d-flex
                  justify-content-between mb-2'
                >
                  <span className='fw-medium'
                    style={{ fontSize: 13 }}
                  >
                    New Member Details
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

                <div className='row g-2'>
                  <div className='col-6'>
                    <input
                      type='text'
                      className='form-control
                        form-control-sm'
                      placeholder='First Name'
                      value={newMember.firstname}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          firstname: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className='col-6'>
                    <input
                      type='text'
                      className='form-control
                        form-control-sm'
                      placeholder='Last Name'
                      value={newMember.lastname}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          lastname: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className='col-4'>
                    <select
                      className='form-select
                        form-select-sm'
                      value={newMember.sex}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          sex: e.target.value
                        })
                      }
                    >
                      <option value=''>Sex</option>
                      <option value='male'>
                        Male
                      </option>
                      <option value='female'>
                        Female
                      </option>
                    </select>
                  </div>
                  <div className='col-4'>
                    <input
                      type='date'
                      className='form-control
                        form-control-sm'
                      value={newMember.birthday}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          birthday: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className='col-4'>
                    <select
                      className='form-select
                        form-select-sm'
                      value={newMember.relationship}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          relationship: e.target.value
                        })
                      }
                    >
                      <option value=''>
                        Relationship
                      </option>
                      <option value='Spouse'>
                        Spouse
                      </option>
                      <option value='Child'>
                        Child
                      </option>
                      <option value='Parent'>
                        Parent
                      </option>
                      <option value='Sibling'>
                        Sibling
                      </option>
                      <option value='Other'>
                        Other
                      </option>
                    </select>
                  </div>
                </div>

                <button
                  className='btn btn-primary
                    btn-sm w-100 mt-2'
                  onClick={() => {
                    if (!newMember.firstname)
                      return
                    handleAddMember({
                      type: 'new',
                      ...newMember
                    })
                    setShowNewMember(false)
                    setNewMember({
                      firstname: '',
                      lastname: '',
                      sex: '', birthday: '',
                      relationship: ''
                    })
                  }}
                >
                  + Add Member
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className='d-flex gap-2 mt-3'>
              <button
                className='btn
                  btn-outline-secondary'
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                className='btn btn-danger
                  flex-grow-1'
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
        <div className='card border-0
          shadow-sm text-center'
        >
          <div className='card-body p-5'>
            <div style={{ fontSize: '4rem' }}>
              🎉
            </div>
            <h4 className='fw-bold
              text-success mt-3'
            >
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

// ── Head Form Component ──
function HeadForm({ onSave }) {
  const [data, setData] = useState({
    firstname: '', lastname: '',
    sex: '', birthday: '',
    phone: '', email: '',
    barangay: '', municipality: '',
    province: ''
  })

  return (
    <div className='d-flex flex-column gap-2'>
      <div className='row g-2'>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='First Name *'
            value={data.firstname}
            onChange={(e) => setData({
              ...data, firstname: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Last Name *'
            value={data.lastname}
            onChange={(e) => setData({
              ...data, lastname: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <select
            className='form-select form-select-sm'
            value={data.sex}
            onChange={(e) => setData({
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
            onChange={(e) => setData({
              ...data, birthday: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Phone *'
            value={data.phone}
            onChange={(e) => setData({
              ...data, phone: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='email'
            className='form-control form-control-sm'
            placeholder='Email'
            value={data.email}
            onChange={(e) => setData({
              ...data, email: e.target.value
            })}
          />
        </div>
        <div className='col-12'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Barangay *'
            value={data.barangay}
            onChange={(e) => setData({
              ...data, barangay: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Municipality *'
            value={data.municipality}
            onChange={(e) => setData({
              ...data, municipality: e.target.value
            })}
          />
        </div>
        <div className='col-6'>
          <input type='text'
            className='form-control form-control-sm'
            placeholder='Province *'
            value={data.province}
            onChange={(e) => setData({
              ...data, province: e.target.value
            })}
          />
        </div>
      </div>
      <button
        className='btn btn-danger btn-sm w-100'
        onClick={() => {
          if (!data.firstname || !data.phone)
            return
          onSave(data)
        }}
      >
        ✅ Set as Head
      </button>
    </div>
  )
}
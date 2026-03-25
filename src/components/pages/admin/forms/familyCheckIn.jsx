// src/pages/admin/forms/FamilyCheckIn.jsx
import { useState } from 'react'
import { postRequest, getRequest } from '../../../../API/API'
import "../../../styles/familyCheckIn.css"
import { SECONDARY_STATUS } from '../../../dropdownData/data'

// ── Member Card ──
function MemberCard({ member, index, onRemove }) {
  return (
    <div className='d-flex align-items-center justify-content-between p-3 border rounded mb-2'>
      <div className='d-flex align-items-center gap-2'>
        <div
          className='rounded-circle d-flex align-items-center justify-content-center flex-shrink-0'
          style={{
            width: 36,
            height: 36,
            background: member.type === 'existing'
              ? '#d1fae5'
              : '#dbeafe'
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
                ? 'text-success'
                : 'text-primary'
            }>
              {member.type === 'existing'
                ? 'Registered ✅'
                : 'New User'}
            </span>
          </div>
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
      const res = await getRequest(`api/search-user?query=${query}`)
      setResults(res.data || [])
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
          className='form-control'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder='Search user...'
        />
        <button
          className='btn btn-outline-danger'
          onClick={handleSearch}
        >
          🔍
        </button>
      </div>

      {results.map(user => (
        <div key={user.id}
          className='d-flex justify-content-between p-2 border rounded mb-1'
        >
          <div>
            {user.firstName} {user.lastName}
          </div>

          <button
            className='btn btn-sm btn-success'
            onClick={() => {
              onSelect({
                type: 'existing',
                userId: user.id,
                firstname: user.firstName,
                lastname: user.lastName
              })
              setResults([])
            }}
          >
            + Add
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Main ──
export default function FamilyCheckIn() {
  const [step, setStep] = useState(1)
  const [headType, setHeadType] = useState(null)
  const [head, setHead] = useState(null)
  const [members, setMembers] = useState([])

  const addMember = (m) => {
    setMembers(prev => [...prev, { ...m, id: Date.now() }])
  }

  return (
    <div className='p-4'>

      <h4 className='fw-bold'>👨‍👩‍👧‍👦 Family Check-in</h4>

      {step === 1 && (
        <div className='card p-4'>

          {!head && !headType && (
            <div className='row g-3'>
              <div className='col-6'>
                <div
                  className='card border-success text-center p-3 hover-success'
                  onClick={() => setHeadType('existing')}
                >
                  <div>✅</div>
                  <div className='text-success'>Already Registered</div>
                </div>
              </div>

              <div className='col-6'>
                <div
                  className='card border-primary text-center p-3 hover-primary'
                  onClick={() => setHeadType('new')}
                >
                  <div>📝</div>
                  <div className='text-primary'>New User</div>
                </div>
              </div>
            </div>
          )}

          {headType === 'existing' && (
            <SearchUser
              onSelect={(user) => {
                setHead(user)
                setHeadType(null)
              }}
            />
          )}

          {head && (
            <>
              <div className='mt-3'>
                Head: {head.firstname} {head.lastname}
              </div>

              <button
                className='btn btn-danger mt-3'
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className='card p-4'>
          {members.map((m, i) => (
            <MemberCard
              key={m.id}
              member={m}
              index={i}
              onRemove={(i) =>
                setMembers(prev => prev.filter((_, x) => x !== i))
              }
            />
          ))}

          <SearchUser onSelect={addMember} />
        </div>
      )}
    </div>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { getRequest, postRequest } from '../../../API/API'
import { useAuth } from '../../../authentication/AuthContext'
import Sidebar from '../../layout/sidebar'
import UserBottomNav from '../../layout/UserBottomNav'
import '../../styles/Home.css'

const RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Grandparent',
  'Relative',
  'Other'
]

const emptyManualMember = {
  firstname: '',
  lastname: '',
  sex: '',
  birthday: '',
  relationship: '',
  phone: '',
  email: ''
}

const formatFullName = (person) =>
  [person?.firstName || person?.firstname, person?.lastName || person?.lastname]
    .filter(Boolean)
    .join(' ')

export default function FamilyRegistration() {
  const { user, setUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [familyHead, setFamilyHead] = useState(null)
  const [members, setMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualMember, setManualMember] = useState(emptyManualMember)

  const fromOnboarding = Boolean(location.state?.onboarding)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1100) {
        setIsSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, navigate, user])

  useEffect(() => {
    if (!authLoading && user && user.role !== 'user') {
      navigate('/', { replace: true })
    }
  }, [authLoading, navigate, user])

  useEffect(() => {
    if (!user) return

    const fetchFamily = async () => {
      try {
        const response = await getRequest('api/family-registration')

        if (response.success) {
          setFamilyHead(response.family.head)
          setMembers(
            (response.family.members || []).map((member) => ({
              type: 'existing',
              userId: member.id,
              firstname: member.firstName,
              lastname: member.lastName,
              sex: member.sex,
              birthday: member.birthday ? String(member.birthday).slice(0, 10) : '',
              relationship: member.relationship || 'Member',
              phone: member.phone || '',
              email: member.email || '',
              persisted: true
            }))
          )
        }
      } catch (error) {
        console.log(error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchFamily()
  }, [user])

  const handleTabChange = (tab) => {
    if (!user && (tab === 'qr' || tab === 'profile')) {
      navigate('/login', {
        state: {
          requestedTab: tab
        }
      })
      return
    }

    navigate('/', {
      state: {
        requestedTab: tab
      }
    })
  }

  const handleSkipToDashboard = () => {
    navigate('/', {
      state: {
        requestedTab: 'dashboard'
      },
      replace: true
    })
  }

  const handleSignOut = async () => {
    try {
      await postRequest('auth/logout', {})
    } catch (error) {
      console.log(error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      navigate('/login')
    }
  }

  const headName = useMemo(() => formatFullName(familyHead || user), [familyHead, user])

  const headAddress = useMemo(() => {
    const source = familyHead || user
    return [source?.barangay, source?.city, source?.province].filter(Boolean).join(', ')
  }, [familyHead, user])

  const selectedIds = useMemo(
    () => new Set([Number(user?.id), ...members.map((member) => Number(member.userId)).filter(Boolean)]),
    [members, user]
  )

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const response = await getRequest(`api/search-user?query=${encodeURIComponent(searchQuery.trim())}`)
      const nextResults = (response.data || []).filter((result) => !selectedIds.has(Number(result.id)))
      setSearchResults(nextResults)
    } catch (error) {
      console.log(error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddExistingMember = (result) => {
    setMembers((current) => [
      ...current,
      {
        type: 'existing',
        userId: result.id,
        firstname: result.firstName,
        lastname: result.lastName,
        sex: result.sex || '',
        birthday: result.birthday ? String(result.birthday).slice(0, 10) : '',
        relationship: 'Member',
        phone: result.phone || '',
        email: result.email || ''
      }
    ])

    setSearchResults((current) => current.filter((item) => item.id !== result.id))
    setSearchQuery('')
    setFeedback(null)
  }

  const handleAddManualMember = () => {
    if (
      !manualMember.firstname.trim() ||
      !manualMember.lastname.trim() ||
      !manualMember.sex ||
      !manualMember.birthday
    ) {
      setFeedback({
        tone: 'danger',
        message: 'Please complete the first name, last name, sex, and birthday for the family member.'
      })
      return
    }

    setMembers((current) => [
      ...current,
      {
        ...manualMember,
        type: 'new',
        id: `new-${Date.now()}`
      }
    ])

    setManualMember(emptyManualMember)
    setShowManualForm(false)
    setFeedback(null)
  }

  const handleMemberChange = (index, field, value) => {
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? { ...member, [field]: value }
          : member
      )
    )
  }

  const handleRemoveMember = (index) => {
    setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index))
  }

  const handleSaveFamily = async () => {
    try {
      setSaving(true)
      setFeedback(null)

      const payload = {
        members: members.map((member) => ({
          type: member.type,
          userId: member.userId || null,
          firstname: member.firstname,
          lastname: member.lastname,
          sex: member.sex,
          birthday: member.birthday,
          relationship: member.relationship || 'Member',
          phone: member.phone || '',
          email: member.email || ''
        }))
      }

      const response = await postRequest('auth/family-register', payload)

      if (response.success) {
        const latest = await getRequest('api/family-registration')

        if (latest.success) {
          setFamilyHead(latest.family.head)
          setMembers(
            (latest.family.members || []).map((member) => ({
              type: 'existing',
              userId: member.id,
              firstname: member.firstName,
              lastname: member.lastName,
              sex: member.sex,
              birthday: member.birthday ? String(member.birthday).slice(0, 10) : '',
              relationship: member.relationship || 'Member',
              phone: member.phone || '',
              email: member.email || '',
              persisted: true
            }))
          )
        }

        setSearchQuery('')
        setSearchResults([])
        setShowManualForm(false)
        setManualMember(emptyManualMember)
        setFeedback({
          tone: 'success',
          message: 'Family registration saved. Your account is now the family head.'
        })
      }
    } catch (error) {
      console.log(error)
      setFeedback({
        tone: 'danger',
        message: error?.response?.data?.message || 'Unable to save the family registration.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || pageLoading) {
    return (
      <div className='user-home-shell'>
        <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
          <div className='spinner-border text-danger' />
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'user') {
    return null
  }

  return (
    <div className='user-home-shell'>
      <div className='user-home-content'>
        <main className='user-main-panel'>
          <div className='user-main-topbar'>
            <button
              type='button'
              className='user-overlay-toggle'
              onClick={() => setIsSidebarOpen((current) => !current)}
            >
              <i className={`bi ${isSidebarOpen ? 'bi-x-lg' : 'bi-layout-sidebar-inset'}`} />
              <span>{isSidebarOpen ? 'Hide panel' : 'Show panel'}</span>
            </button>

            <UserBottomNav activeTab='family-registration' onTabChange={handleTabChange} />
          </div>

          <div className='user-panel-card'>
            <div className='user-panel-kicker'>Family Registration</div>
            <h2>Register Your Family</h2>
            <p>
              Your account is automatically the family head. Add existing registered users or
              manually enter family members, and their address will follow your current address.
            </p>

            {fromOnboarding && members.length === 0 ? (
              <div
                className='border rounded-4 px-3 py-3 mt-4 d-flex flex-wrap align-items-center justify-content-between gap-3'
                style={{ borderColor: '#dce7f3', background: '#fbfdff' }}
              >
                <div>
                  <div className='fw-semibold mb-1'>Set up your family now or skip for later</div>
                  <div className='text-muted' style={{ fontSize: 14 }}>
                    If you do not have family members to add yet, you can skip this step and go straight to the dashboard.
                  </div>
                </div>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={handleSkipToDashboard}
                >
                  Skip for now
                </button>
              </div>
            ) : null}

            {feedback ? (
              <div className={`alert alert-${feedback.tone} mt-4 mb-0`}>
                {feedback.message}
              </div>
            ) : null}

            <div className='row g-3 mt-1'>
              <div className='col-12'>
                <div className='border rounded-4 p-4 h-100' style={{ borderColor: '#dce7f3', background: '#fbfdff' }}>
                  <div className='d-flex align-items-start justify-content-between gap-3 flex-wrap'>
                    <div>
                      <div className='text-uppercase fw-bold text-muted mb-2' style={{ fontSize: 11, letterSpacing: '0.08em' }}>
                        Family Head
                      </div>
                      <h4 className='fw-bold mb-1'>{headName}</h4>
                      <p className='mb-2'>{user.email || 'No email on file'}</p>
                      <div className='d-flex flex-wrap gap-2'>
                        <span className='badge rounded-pill text-bg-dark px-3 py-2'>Head of Family</span>
                        <span className='badge rounded-pill bg-light text-dark border px-3 py-2'>
                          Address shared with all family members
                        </span>
                      </div>
                    </div>

                    <div className='border rounded-4 px-3 py-3' style={{ minWidth: 260, borderColor: '#dce7f3', background: '#fff' }}>
                      <div className='text-muted fw-semibold mb-2' style={{ fontSize: 12 }}>
                        Family address
                      </div>
                      <div className='fw-medium'>{headAddress || 'No saved address yet'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='col-lg-5'>
                <div className='border rounded-4 p-4 h-100' style={{ borderColor: '#dce7f3', background: '#fff' }}>
                  <div className='d-flex align-items-center justify-content-between gap-2 mb-3'>
                    <div>
                      <h5 className='fw-bold mb-1'>Add Existing Member</h5>
                      <p className='mb-0' style={{ fontSize: 14 }}>
                        Search a registered user and attach them to your family.
                      </p>
                    </div>
                    <span className='badge bg-light text-dark border rounded-pill px-3 py-2'>
                      Registered Users
                    </span>
                  </div>

                  <div className='input-group mb-3'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Search by name, phone, or email'
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleSearch()
                        }
                      }}
                    />
                    <button
                      type='button'
                      className='btn btn-outline-secondary'
                      onClick={handleSearch}
                      disabled={searching}
                    >
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  <div className='border rounded-4 overflow-hidden' style={{ borderColor: '#e2e8f0' }}>
                    <div className='px-3 py-2 border-bottom bg-light text-muted fw-semibold' style={{ fontSize: 12 }}>
                      Search results
                    </div>
                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                      {searchResults.length > 0 ? (
                        searchResults.map((result) => (
                          <div
                            key={result.id}
                            className='d-flex justify-content-between align-items-start gap-3 px-3 py-3 border-top'
                            style={{ borderColor: '#e2e8f0' }}
                          >
                            <div>
                              <div className='fw-semibold'>{result.firstName} {result.lastName}</div>
                              <div className='text-muted' style={{ fontSize: 12 }}>
                                {[result.phone, result.email].filter(Boolean).join(' • ')}
                              </div>
                              <div className='text-muted' style={{ fontSize: 12 }}>
                                {[result.barangay, result.city, result.province].filter(Boolean).join(', ')}
                              </div>
                            </div>
                            <button
                              type='button'
                              className='btn btn-sm btn-primary'
                              onClick={() => handleAddExistingMember(result)}
                            >
                              Add
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className='px-3 py-4 text-center text-muted' style={{ fontSize: 13 }}>
                          Search for a registered user to add them as a family member.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='col-lg-7'>
                <div className='border rounded-4 p-4 h-100' style={{ borderColor: '#dce7f3', background: '#fff' }}>
                  <div className='d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap'>
                    <div>
                      <h5 className='fw-bold mb-1'>Add Manual Member</h5>
                      <p className='mb-0' style={{ fontSize: 14 }}>
                        Use this if the family member is not yet registered. Their address will inherit from the family head.
                      </p>
                    </div>
                    <button
                      type='button'
                      className='btn btn-outline-secondary'
                      onClick={() => setShowManualForm((current) => !current)}
                    >
                      {showManualForm ? 'Hide form' : 'Manual entry'}
                    </button>
                  </div>

                  {showManualForm ? (
                    <div className='row g-3'>
                      <div className='col-md-6'>
                        <label className='form-label'>First Name</label>
                        <input
                          type='text'
                          className='form-control'
                          value={manualMember.firstname}
                          onChange={(event) =>
                            setManualMember((current) => ({ ...current, firstname: event.target.value }))
                          }
                        />
                      </div>
                      <div className='col-md-6'>
                        <label className='form-label'>Last Name</label>
                        <input
                          type='text'
                          className='form-control'
                          value={manualMember.lastname}
                          onChange={(event) =>
                            setManualMember((current) => ({ ...current, lastname: event.target.value }))
                          }
                        />
                      </div>
                      <div className='col-md-4'>
                        <label className='form-label'>Sex</label>
                        <select
                          className='form-select'
                          value={manualMember.sex}
                          onChange={(event) =>
                            setManualMember((current) => ({ ...current, sex: event.target.value }))
                          }
                        >
                          <option value=''>Select sex</option>
                          <option value='male'>Male</option>
                          <option value='female'>Female</option>
                        </select>
                      </div>
                      <div className='col-md-4'>
                        <label className='form-label'>Birthday</label>
                        <input
                          type='date'
                          className='form-control'
                          value={manualMember.birthday}
                          onChange={(event) =>
                            setManualMember((current) => ({ ...current, birthday: event.target.value }))
                          }
                        />
                      </div>
                      <div className='col-md-4'>
                        <label className='form-label'>Relationship</label>
                        <select
                          className='form-select'
                          value={manualMember.relationship}
                          onChange={(event) =>
                            setManualMember((current) => ({ ...current, relationship: event.target.value }))
                          }
                        >
                          <option value=''>Select relationship</option>
                          {RELATIONSHIP_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div className='col-md-6'>
                        <label className='form-label'>Phone</label>
                        <input
                          type='text'
                          className='form-control'
                          placeholder='Optional'
                          value={manualMember.phone}
                          onChange={(event) =>
                            setManualMember((current) => ({ ...current, phone: event.target.value }))
                          }
                        />
                      </div>
                      <div className='col-md-6'>
                        <label className='form-label'>Email</label>
                        <input
                          type='email'
                          className='form-control'
                          placeholder='Optional'
                          value={manualMember.email}
                          onChange={(event) =>
                            setManualMember((current) => ({ ...current, email: event.target.value }))
                          }
                        />
                      </div>
                      <div className='col-12'>
                        <div className='border rounded-4 px-3 py-3 mb-3' style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                          <div className='text-muted fw-semibold mb-1' style={{ fontSize: 12 }}>Inherited address</div>
                          <div className='fw-medium'>{headAddress || 'No saved family head address yet'}</div>
                        </div>
                        <button type='button' className='btn btn-primary' onClick={handleAddManualMember}>
                          Add family member
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='border rounded-4 px-3 py-4 text-center text-muted' style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                      Open the manual form when a family member is not yet registered in the system.
                    </div>
                  )}
                </div>
              </div>

              <div className='col-12'>
                <div className='border rounded-4 p-4' style={{ borderColor: '#dce7f3', background: '#fff' }}>
                  <div className='d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3'>
                    <div>
                      <h5 className='fw-bold mb-1'>Family Members</h5>
                      <p className='mb-0' style={{ fontSize: 14 }}>
                        Review the list before saving. You can update each member relationship here.
                      </p>
                    </div>
                    <span className='badge bg-light text-dark border rounded-pill px-3 py-2'>
                      {members.length} member{members.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {members.length > 0 ? (
                    <div className='d-grid gap-3'>
                      {members.map((member, index) => (
                        <div
                          key={member.userId || member.id || `${member.firstname}-${index}`}
                          className='border rounded-4 p-3'
                          style={{ borderColor: '#e2e8f0', background: '#fbfdff' }}
                        >
                          <div className='d-flex justify-content-between align-items-start gap-3 flex-wrap'>
                            <div>
                              <div className='fw-semibold mb-1'>
                                {member.firstname} {member.lastname}
                              </div>
                              <div className='text-muted' style={{ fontSize: 12 }}>
                                {member.type === 'existing' ? 'Registered user' : 'Manual family member'}
                              </div>
                              <div className='text-muted' style={{ fontSize: 12 }}>
                                {[member.phone, member.email].filter(Boolean).join(' • ') || 'No contact details provided'}
                              </div>
                            </div>

                            <button
                              type='button'
                              className='btn btn-sm btn-outline-danger'
                              onClick={() => handleRemoveMember(index)}
                            >
                              Remove
                            </button>
                          </div>

                          <div className='row g-3 mt-1'>
                            <div className='col-md-4'>
                              <label className='form-label'>Relationship</label>
                              <select
                                className='form-select'
                                value={member.relationship || ''}
                                onChange={(event) =>
                                  handleMemberChange(index, 'relationship', event.target.value)
                                }
                              >
                                <option value=''>Select relationship</option>
                                {RELATIONSHIP_OPTIONS.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>
                            <div className='col-md-4'>
                              <label className='form-label'>Sex</label>
                              <input
                                type='text'
                                className='form-control'
                                value={member.sex || 'Not provided'}
                                disabled
                              />
                            </div>
                            <div className='col-md-4'>
                              <label className='form-label'>Birthday</label>
                              <input
                                type='text'
                                className='form-control'
                                value={member.birthday || 'Not provided'}
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='border rounded-4 px-3 py-4 text-center text-muted' style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                      No family members added yet. Add existing users or create new manual entries.
                    </div>
                  )}

                  <div className='d-flex justify-content-end mt-4'>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={handleSaveFamily}
                      disabled={saving}
                    >
                      {saving ? 'Saving family...' : 'Save family registration'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className={`user-sidebar-panel ${isSidebarOpen ? 'is-open' : ''}`}>
          <Sidebar
            user={user}
            profile={null}
            onSignOut={handleSignOut}
          />
        </aside>
      </div>

      {isSidebarOpen && (
        <button
          type='button'
          className='user-sidebar-backdrop'
          aria-label='Close information panel'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Map from '../../map/map'
import Sidebar from '../../layout/sidebar'
import UserBottomNav from '../../layout/UserBottomNav'
import Chat from '../user/chatBot'
import QrCode from '../../QR/qr'
import { useAuth } from '../../../authentication/AuthContext'
import { getRequest, postRequest } from '../../../API/API'
import '../../styles/Home.css'

function ProfilePanel({ user, profile, family }) {
  if (!user) {
    return (
      <div className='user-panel-card user-panel-empty'>
        <i className='bi bi-person-circle' />
        <h3>Sign in to view your profile</h3>
        <p>Your account details and evacuation information will appear here.</p>
        <div className='d-flex justify-content-center gap-2'>
          <Link to='/login' className='btn btn-primary'>Sign in</Link>
          <Link to='/signUp' className='btn btn-outline-secondary'>Create account</Link>
        </div>
      </div>
    )
  }

  const fullName = `${user.firstname || profile?.firstName || ''} ${user.lastname || profile?.lastName || ''}`.trim()
  const address = [
    user.barangay || profile?.barangay,
    user.municipality || profile?.city,
    user.province || profile?.province
  ].filter(Boolean).join(', ')
  const familyMembers = family?.members || []
  const canManageFamily = user?.role === 'user'

  return (
    <div className='user-panel-card'>
      <div className='user-panel-header'>
        <div>
          <span className='user-panel-kicker'>My Profile</span>
          <h2>{fullName || 'User Profile'}</h2>
          <p>View your registered account and current evacuation information.</p>
        </div>
      </div>

      <div className='user-profile-grid'>
        <div className='user-profile-card'>
          <span className='user-data-label'>Email</span>
          <strong>{user.email || 'Not available'}</strong>
        </div>
        <div className='user-profile-card'>
          <span className='user-data-label'>Phone</span>
          <strong>{user.phone || 'Not available'}</strong>
        </div>
        <div className='user-profile-card'>
          <span className='user-data-label'>Address</span>
          <strong>{address || 'Not available'}</strong>
        </div>
        <div className='user-profile-card'>
          <span className='user-data-label'>Primary Status</span>
          <strong>{profile?.primary_status || 'Not checked in'}</strong>
        </div>
        <div className='user-profile-card'>
          <span className='user-data-label'>Evacuation Center</span>
          <strong>{profile?.center_name || 'Not assigned'}</strong>
        </div>
        <div className='user-profile-card'>
          <span className='user-data-label'>Check-In Time</span>
          <strong>{profile?.checkin_at ? new Date(profile.checkin_at).toLocaleString() : 'Not available'}</strong>
        </div>
      </div>

      <div className='user-profile-family-section mt-4'>
        <div className='d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3'>
          <div>
            <span className='user-data-label'>Family</span>
            <h5 className='fw-semibold mb-1'>Registered Family Members</h5>
            <p className='mb-0'>
              {canManageFamily
                ? 'Review your saved family members and manage them from the family registration page.'
                : 'Review the saved family members linked to this account.'}
            </p>
          </div>

          {canManageFamily ? (
            <Link to='/family-registration' className='btn btn-outline-secondary'>
              Manage Family
            </Link>
          ) : null}
        </div>

        {familyMembers.length > 0 ? (
          <div className='user-family-list'>
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className='user-profile-card user-family-member-card'
              >
                <div className='d-flex flex-wrap align-items-start justify-content-between gap-2'>
                  <div>
                    <strong>{member.firstName} {member.lastName}</strong>
                    <div className='text-muted' style={{ fontSize: 13 }}>
                      {member.relationship || 'Member'}
                    </div>
                  </div>
                  <span className='badge bg-light text-dark border rounded-pill px-3 py-2'>
                    {member.sex || 'N/A'}
                  </span>
                </div>
                <div className='mt-2 text-muted' style={{ fontSize: 13 }}>
                  {member.birthday ? new Date(member.birthday).toLocaleDateString() : 'Birthday not available'}
                </div>
                <div className='mt-1 text-muted' style={{ fontSize: 13 }}>
                  {[member.phone, member.email].filter(Boolean).join(' • ') || 'No contact details available'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='user-profile-card'>
            <span className='user-data-label'>No Family Added Yet</span>
            <strong>No family members are linked to this account yet.</strong>
            <p className='mb-0 mt-2'>
              {canManageFamily
                ? 'Use the manage button to add family members or complete your family registration.'
                : 'No family registration tools are available for this account.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function QrPanel({ user }) {
  if (!user) {
    return (
      <div className='user-panel-card user-panel-empty'>
        <i className='bi bi-qr-code' />
        <h3>Sign in to view your QR code</h3>
        <p>Your personal QR code will be shown here for evacuation check-in.</p>
        <Link to='/login' className='btn btn-primary'>Sign in</Link>
      </div>
    )
  }

  return (
    <div className='user-panel-card'>
      <div className='user-panel-header'>
        <div>
          <span className='user-panel-kicker'>Quick Access</span>
          <h2>My QR Code</h2>
          <p>Present this code to barangay staff during check-in.</p>
        </div>
      </div>
      <QrCode user={user} />
    </div>
  )
}

function DashboardPanel() {
  return (
    <div className='user-dashboard-panel'>
      <div className='user-map-card user-map-card-noah'>
        <div className='user-map-frame'>
          <Map />
          <div className='user-chat-shell'>
            <Chat />
          </div>
        </div>
      </div>
    </div>
  )
}

function Home() {
  const { user, setUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(
    location.state?.requestedTab || 'dashboard'
  )
  const [profile, setProfile] = useState(null)
  const [family, setFamily] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isAdminViewer = Boolean(user?.role && user.role !== 'user')

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfile(null)
        setFamily(null)
        return
      }

      try {
        const [profileResponse, familyResponse] = await Promise.all([
          getRequest(`/api/profile/${user.id}`),
          getRequest('api/family-registration')
        ])

        if (profileResponse.success) {
          setProfile(profileResponse.evacuee)
        }

        if (familyResponse.success) {
          setFamily(familyResponse.family)
        }
      } catch (error) {
        setProfile(null)
        setFamily(null)
      }
    }

    fetchProfile()
  }, [user?.id])

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
    if (location.state?.requestedTab) {
      setActiveTab(location.state.requestedTab)
    }
  }, [location.state])

  const mainContent = useMemo(() => {
    if (activeTab === 'qr') {
      return <QrPanel user={user} />
    }

    if (activeTab === 'profile') {
      return <ProfilePanel user={user} profile={profile} family={family} />
    }

    return <DashboardPanel />
  }, [activeTab, family, profile, user])

  const handleTabChange = (tab) => {
    if (!user && (tab === 'qr' || tab === 'profile')) {
      navigate('/login', {
        state: {
          requestedTab: tab
        }
      })
      return
    }

    setActiveTab(tab)
  }

  const handleSignOut = async () => {
    try {
      await postRequest('auth/logout', {})
    } catch (error) {
      console.log(error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setProfile(null)
      setFamily(null)
      setActiveTab('dashboard')
      
    }
  }

  return (
    <div className={`user-home-shell ${isSidebarOpen ? 'panel-open' : ''}`}>
      <div className='user-home-content'>
        <main className='user-main-panel'>
          <div className='user-main-topbar'>
            <div className='d-flex align-items-center gap-2 flex-wrap'>
              <button
                type='button'
                className='user-overlay-toggle'
                onClick={() => setIsSidebarOpen((current) => !current)}
              >
                <i className={`bi ${isSidebarOpen ? 'bi-x-lg' : 'bi-layout-sidebar-inset'}`} />
                <span>{isSidebarOpen ? 'Hide panel' : 'Show panel'}</span>
              </button>

              {isAdminViewer ? (
                <button
                  type='button'
                  className='user-overlay-toggle'
                  onClick={() => navigate('/dashboard')}
                >
                  <i className='bi bi-arrow-left' />
                  <span>Back to admin</span>
                </button>
              ) : null}
            </div>

            <UserBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          {mainContent}
        </main>

        <aside className={`user-sidebar-panel ${isSidebarOpen ? 'is-open' : ''}`}>
          <Sidebar
            user={user}
            profile={profile}
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

export default Home

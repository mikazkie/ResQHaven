import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { postRequest } from "../../../API/API";
import { useAuth } from "../../../authentication/AuthContext";
import UserBottomNav from "../../layout/UserBottomNav";
import '../../styles/Home.css'

export default function SignInForm() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const activeGuestTab = location.state?.requestedTab || 'dashboard'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await postRequest('auth/login', formData)

      if (response.success) {
        localStorage.setItem("token", response.token)
        setUser(response.user)

        if (response.user.role === 'super_admin') {
          navigate('/dashboard')
        } else if (response.user.role === 'dswd') {
          navigate('/distribution-requests')
        } else if (response.user.role === 'drrmo') {
          navigate('/dashboard')
        } else if (response.user.role === 'barangay_official') {
          navigate('/check-reg')
        } else {
          navigate('/', {
            state: {
              requestedTab:
                activeGuestTab === 'qr' || activeGuestTab === 'profile'
                  ? activeGuestTab
                  : 'dashboard'
            }
          })
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestTabChange = (tab) => {
    if (tab === 'dashboard') {
      navigate('/')
      return
    }

    navigate('/login', {
      replace: true,
      state: {
        requestedTab: tab
      }
    })
  }

  return (
    <div className='user-auth-page'>
      <div className='user-auth-stack'>
        <div className='user-auth-topbar'>
          <UserBottomNav
            activeTab={activeGuestTab}
            onTabChange={handleGuestTabChange}
          />
        </div>

        <div className='user-auth-card'>
          <div className='user-auth-card-inner'>
            <div className='user-auth-back'>
              <Link to='/' className='text-decoration-none'>
                Back to dashboard
              </Link>
            </div>

            <div className='user-auth-header'>
              <span className='user-panel-kicker'>User Access</span>
              <h1>Sign In</h1>
              <p>
                Access your dashboard, QR code, profile, and family registration in one place.
              </p>
            </div>

            {error && (
              <div className='alert alert-danger py-2'>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className='d-flex flex-column gap-3'>
                <div>
                  <label className='form-label fw-medium'>
                    Email
                    <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='email'
                    name='email'
                    className='form-control'
                    placeholder='Enter your email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className='form-label fw-medium'>
                    Password
                    <span className='text-danger'>*</span>
                  </label>
                  <div className='input-group user-auth-input-group'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      className='form-control'
                      placeholder='Enter your password'
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type='button'
                      className='btn btn-outline-secondary'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`} />
                    </button>
                  </div>
                </div>

                <button
                  type='submit'
                  className='btn btn-danger w-100'
                  disabled={loading}
                >
                  {loading
                    ? <>
                        <span className='spinner-border spinner-border-sm me-2' />
                        Signing in...
                      </>
                    : 'Sign In'
                  }
                </button>
              </div>
            </form>

            <div className='user-auth-footer'>
              <p>
                Don&apos;t have an account?{" "}
                <Link to='/signUp'>
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

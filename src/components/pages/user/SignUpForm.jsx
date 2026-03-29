import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { postRequest } from "../../../API/API";
import { useAuth } from "../../../authentication/AuthContext";
import '../../styles/Home.css'

export default function RegisterForm() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    is_subscribed: true
  });

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
      const signInPassword = formData.password

      const response = await postRequest('auth/user-reg', formData)

      if (!response.success) {
        return
      }

      const loginResponse = await postRequest('auth/login', {
        email: formData.email,
        password: signInPassword
      })

      if (loginResponse.success) {
        localStorage.setItem("token", loginResponse.token)
        setUser(loginResponse.user)
        navigate('/family-registration', {
          state: {
            onboarding: true
          }
        })
      } else {
        setError('Account created, but automatic sign in failed. Please sign in manually.')
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='user-auth-page'>
      <div className='user-auth-card user-auth-card-wide'>
        <div className='user-auth-card-inner'>
          <div className='user-auth-back'>
            <Link to='/' className='text-decoration-none'>
              Back to dashboard
            </Link>
          </div>

          <div className='user-auth-header'>
            <span className='user-panel-kicker'>Create Account</span>
            <h1>Register</h1>
            <p>
              Create your ResQHaven account to receive alerts and continue with family registration.
            </p>
          </div>

          {error && (
            <div className='alert alert-danger py-2'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className='row g-3'>
              <div className='col-md-6'>
                <label className='form-label fw-medium'>
                  First Name
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  name='firstname'
                  className='form-control'
                  placeholder='e.g. Juan'
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-medium'>
                  Last Name
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  name='lastname'
                  className='form-control'
                  placeholder='e.g. Dela Cruz'
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-medium'>
                  Sex
                  <span className='text-danger'>*</span>
                </label>
                <select
                  name='sex'
                  className='form-select'
                  value={formData.sex}
                  onChange={handleChange}
                  required
                >
                  <option value=''>Select sex</option>
                  <option value='male'>Male</option>
                  <option value='female'>Female</option>
                </select>
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-medium'>
                  Birthday
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='date'
                  name='birthday'
                  className='form-control'
                  value={formData.birthday}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-medium'>
                  Phone Number
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  name='phone'
                  className='form-control'
                  placeholder='e.g. 09123456789'
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-6'>
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

              <div className='col-12'>
                <label className='form-label fw-medium'>
                  Password
                  <span className='text-danger'>*</span>
                </label>
                <div className='input-group user-auth-input-group'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    className='form-control'
                    placeholder='Create a password'
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

              <div className='col-md-4'>
                <label className='form-label fw-medium'>
                  Barangay
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  name='barangay'
                  className='form-control'
                  placeholder='Barangay'
                  value={formData.barangay}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-4'>
                <label className='form-label fw-medium'>
                  Municipality / City
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  name='municipality'
                  className='form-control'
                  placeholder='City'
                  value={formData.municipality}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-4'>
                <label className='form-label fw-medium'>
                  Province
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  name='province'
                  className='form-control'
                  placeholder='Province'
                  value={formData.province}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-12'>
                <button
                  type='submit'
                  className='btn btn-danger w-100'
                  disabled={loading}
                >
                  {loading
                    ? <>
                        <span className='spinner-border spinner-border-sm me-2' />
                        Creating Account...
                      </>
                    : 'Create Account'
                  }
                </button>
              </div>
            </div>
          </form>

          <div className='user-auth-footer'>
            <p>
              Already have an account?{" "}
              <Link to='/login'>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

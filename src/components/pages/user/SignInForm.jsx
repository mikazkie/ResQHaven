import { useState } from "react";
import { Link, useNavigate } from "react-router"; // ✅ add useNavigate
import { postRequest } from "../../../API/API";
import { useAuth } from "../../../authentication/AuthContext"; // ✅ add this

import showPass from '../../../assets/images/showPass.png'
import hidePassword from '../../../assets/images/hidePass.png'

export default function SignInForm() {
  const { setUser } = useAuth() // ✅ add this
  const navigate = useNavigate() // ✅ add this

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const response = await postRequest(
        'auth/login', formData
      )

      if (response.success) {

        localStorage.setItem("token", response.token)

        setUser(response.user) 
        
        if(response.user.role != 'user'){
        navigate('/admin-reg')
        }
        else{
          navigate('/')
        }        
      }

    } catch (err) {
      setError(
        err.response?.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ rest of your JSX stays exactly the same!
  return (
    <div className='min-vh-100 d-flex
      align-items-center justify-content-center
      bg-light'
    >
      <div className='card border-0 shadow-sm'
        style={{ width: '100%', maxWidth: 448 }}
      >
        <div className='card-body p-4 p-md-5'>

          <div className='mb-4'>
            <Link
              to='/'
              className='text-muted text-decoration-none'
              style={{ fontSize: 14 }}
            >
              ← Back to dashboard
            </Link>
          </div>

          <div className='mb-4'>
            <h1 className='fw-semibold mb-1'
              style={{ fontSize: 24 }}
            >
              Sign In
            </h1>
            <p className='text-muted mb-0'
              style={{ fontSize: 14 }}
            >
              Enter your email and password
              to sign in!
            </p>
          </div>

          {error && (
            <div className='alert alert-danger
              d-flex align-items-center
              gap-2 py-2'
            >
              <span>❌</span>
              <span style={{ fontSize: 14 }}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className='d-flex flex-column gap-3'>

              <div>
                <label className='form-label fw-medium'
                  style={{ fontSize: 14 }}
                >
                  Email
                  <span className='text-danger'>*</span>
                </label>
                <input
                  type='email'
                  name='email'
                  className='form-control'
                  placeholder='info@gmail.com'
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className='form-label fw-medium'
                  style={{ fontSize: 14 }}
                >
                  Password
                  <span className='text-danger'>*</span>
                </label>
                <div className='input-group'>
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
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword
                      ? <img src={showPass} alt="Show" />
                      : <img src={hidePassword} alt="Hide" />
                    }
                  </button>
                </div>
              </div>

              <div className='d-flex align-items-center
                justify-content-between'
              >
                <div className='form-check mb-0'>
                  <input
                    type='checkbox'
                    className='form-check-input'
                    id='remember'
                    checked={isChecked}
                    onChange={(e) =>
                      setIsChecked(e.target.checked)
                    }
                  />
                  <label
                    className='form-check-label text-muted'
                    htmlFor='remember'
                    style={{ fontSize: 14 }}
                  >
                    Keep me logged in
                  </label>
                </div>
                <Link
                  to='/reset-password'
                  className='text-danger text-decoration-none'
                  style={{ fontSize: 14 }}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type='submit'
                className='btn btn-danger w-100'
                disabled={loading}
              >
                {loading
                  ? <>
                      <span className='spinner-border
                        spinner-border-sm me-2'
                      />
                      Signing in...
                    </>
                  : 'Sign In'
                }
              </button>

            </div>
          </form>

          <div className='mt-4 text-center'>
            <p className='text-muted mb-0'
              style={{ fontSize: 14 }}
            >
              Don't have an account?{" "}
              <Link
                to='/signUp'
                className='text-danger
                  text-decoration-none fw-medium'
              >
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { postRequest } from "../../../API/API";
import { QRCodeSVG } from 'qrcode.react'
import QrCode from '../../QR/qr'

export default function RegisterForm() {

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null)


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
    setSuccess('');

    if (!isChecked) {
      setError(
        'Please agree to the Terms and Conditions!'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await postRequest(
        'auth/user-reg',
        formData
      )

      if (response.success) {
        setRegisteredUser(response.user)
        setSuccess(
          'Account created successfully! You can now sign in.'
        );
        setFormData({
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
        setIsChecked(false);
      }

    } catch (err) {
      setError(
        err.response?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-vh-100 d-flex
      align-items-center justify-content-center
      bg-light'
    >
      <div className='card border-0 shadow-sm'
        style={{ width: '100%', maxWidth: 500 }}
      >
        <div className='card-body p-4 p-md-5'>

          {/* Back */}
          <div className='mb-4'>
            <Link
              to='/'
              className='text-muted
                text-decoration-none'
              style={{ fontSize: 14 }}
            >
              ← Back to dashboard
            </Link>
          </div>

          {/* Header */}
          <div className='mb-4'>
            <h4 className='fw-semibold mb-1'>
              Create Account
            </h4>
            <p className='text-muted mb-0'
              style={{ fontSize: 14 }}
            >
              Register to receive disaster
              alerts in your area!
            </p>
          </div>

          {/* Error Alert */}
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

          {/* Success Alert */}
          {success && (
            <div className='alert alert-success
              d-flex align-items-center
              gap-2 py-2'
            >
              <span>✅</span>
              <span style={{ fontSize: 14 }}>
                {success}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className='d-flex flex-column gap-3'>

              {/* First + Last Name */}
              <div className='row g-3'>
                <div className='col-md-6'>
                  <label className='form-label
                    fw-medium'
                  >
                    First Name
                    <span className='text-danger'>
                      *
                    </span>
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
                  <label className='form-label
                    fw-medium'
                  >
                    Last Name
                    <span className='text-danger'>
                      *
                    </span>
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
              </div>

              {/* Sex + Birthday */}
              <div className='row g-3'>
                <div className='col-md-6'>
                  <label className='form-label
                    fw-medium'
                  >
                    Sex
                    <span className='text-danger'>
                      *
                    </span>
                  </label>
                  <select
                    name='sex'
                    className='form-select'
                    value={formData.sex}
                    onChange={handleChange}
                    required
                  >
                    <option value=''>
                      Select sex
                    </option>
                    <option value='male'>
                      Male
                    </option>
                    <option value='female'>
                      Female
                    </option>
                  </select>
                </div>
                <div className='col-md-6'>
                  <label className='form-label
                    fw-medium'
                  >
                    Birthday
                    <span className='text-danger'>
                      *
                    </span>
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
              </div>

              {/* Phone */}
              <div>
                <label className='form-label
                  fw-medium'
                >
                  Phone Number
                  <span className='text-danger'>
                    *
                  </span>
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

              {/* Email */}
              <div>
                <label className='form-label
                  fw-medium'
                >
                  Email
                  <span className='text-danger'>
                    *
                  </span>
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

              {/* Password */}
              <div>
                <label className='form-label
                  fw-medium'
                >
                  Password
                  <span className='text-danger'>
                    *
                  </span>
                </label>
                <div className='input-group'>
                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
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
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {/* Barangay */}
              <div>
                <label className='form-label
                  fw-medium'
                >
                  Barangay
                  <span className='text-danger'>
                    *
                  </span>
                </label>
                <input
                  type='text'
                  name='barangay'
                  className='form-control'
                  placeholder='e.g. Mambaling'
                  value={formData.barangay}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Municipality + Province */}
              <div className='row g-3'>
                <div className='col-md-6'>
                  <label className='form-label
                    fw-medium'
                  >
                    Municipality / City
                    <span className='text-danger'>
                      *
                    </span>
                  </label>
                  <input
                    type='text'
                    name='municipality'
                    className='form-control'
                    placeholder='e.g. Cebu City'
                    value={formData.municipality}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='col-md-6'>
                  <label className='form-label
                    fw-medium'
                  >
                    Province
                    <span className='text-danger'>
                      *
                    </span>
                  </label>
                  <input
                    type='text'
                    name='province'
                    className='form-control'
                    placeholder='e.g. Cebu'
                    value={formData.province}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Subscribe to alerts */}
              <div className='form-check'>
                <input
                  type='checkbox'
                  className='form-check-input'
                  id='subscribe'
                  checked={formData.is_subscribed}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      is_subscribed: e.target.checked
                    }))
                  }
                />
                <label
                  className='form-check-label
                    text-muted'
                  htmlFor='subscribe'
                  style={{ fontSize: 14 }}
                >
                  Subscribe to receive{" "}
                  <span className='text-dark
                    fw-medium'
                  >
                    SMS and Email alerts
                  </span>{" "}
                  for disasters in my area
                </label>
              </div>

              {/* Terms */}
              <div className='form-check'>
                <input
                  type='checkbox'
                  className='form-check-input'
                  id='terms'
                  checked={isChecked}
                  onChange={(e) =>
                    setIsChecked(e.target.checked)
                  }
                  required
                />
                <label
                  className='form-check-label
                    text-muted'
                  htmlFor='terms'
                  style={{ fontSize: 14 }}
                >
                  By creating an account you agree
                  to the{" "}
                  <span className='text-dark
                    fw-medium'
                  >
                    Terms and Conditions
                  </span>{" "}
                  and{" "}
                  <span className='text-dark
                    fw-medium'
                  >
                    Privacy Policy
                  </span>
                </label>
              </div>

              {/* Button */}
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
                      Creating Account...
                    </>
                  : 'Create Account 🛡️'
                }
              </button>

            </div>
          </form>

          {/* Sign In Link */}
          <div className='mt-4 text-center'>
            <p className='text-muted mb-0'
              style={{ fontSize: 14 }}
            >
              Already have an account?{" "}
              <Link
                to='/signin'
                className='text-danger
                  text-decoration-none fw-medium'
              >
                Sign In
              </Link>
            </p>
          </div>

        </div>
        {registeredUser && (
        <QrCode user={registeredUser} />
      )}
      </div>
    </div>
  );
}

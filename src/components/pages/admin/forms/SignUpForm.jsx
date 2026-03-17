import { useState, useEffect } from "react";
import { Link } from "react-router";
import { postRequest, getRequest } from "../../../../API/API";

export default function RegisterForm() {

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [centers, setCenter] = useState([])

  const [checkRole, setCheckRole] = useState(false)
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: '',
    assignedCenter: ''

  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c] = await Promise.all([
          getRequest('api/evacuations'),
        ]);
        setCenter(c);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);
  
const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: value
  }));

  if (name === 'role') {
    setCheckRole(value === 'barangay_official');
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

   

    try {
      setLoading(true);
      const response = await postRequest(
        'auth/admin-reg',
        formData
      )

      if (response.success) {
        setSuccess(
          'Account created successfully! You can now sign in.'
        );
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          role: '', 
          assignedCenter: ''
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
    <div className='container-fluid'
    >
      <div className=''>
        <div className=''>

         

          {/* Header */}
          <div className='mb-4'>
            <h4 className='fw-semibold mb-1'>
              Create Account
            </h4>
           
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


                {/* Role selection */}
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="drrmo">DRRMO</option>
                    <option value="dswd">DSWD</option>
                    <option value="barangay_official">Barangay Official</option>
                    <option value="super_admin">Super Admin</option>

                  </select>

                  {/* Conditionally show assigned center if role is barangay_official */}
                  {checkRole && (
                    
                    <select
                      name="assignedCenter"
                      className="form-select mt-2"
                      value={formData.assignedCenter || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Assign Center</option>
                      {centers.map((element, i)=>(
                      <option value={element.id} key={i}>{element.id} {element.name}</option>
                      ))}
                    </select>
                  )}
                    
                  
                  

                    
                 


              {/* Button */}
              <button
                type='submit'
                className='btn btn-success w-100'
                disabled={loading}
              >
                {loading
                  ? <>
                      <span className='spinner-border
                        spinner-border-sm me-2'
                      />
                      Creating Account...
                    </>
                  : 'Create Account'
                }
              </button>

            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

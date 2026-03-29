import React, { useState } from 'react'
import { postRequest } from '../../../../API/API'

function Hotline() {

  const [formData, setFormData] = useState({
    name: '',
    type: 'lgu',
    phone_number: '',
    alternative_number: '',
    city: '',
    province: '',
    address: '',
    is_active: 1
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await postRequest(
        'auth/hotline-reg',
        formData
      )

      if (response.success) {
        alert('Hotline saved successfully!')
        handleReset()
      }
    } catch (error) {
      alert('Failed to save hotline.')
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      type: 'lgu',
      phone_number: '',
      alternative_number: '',
      city: '',
      province: '',
      address: '',
      is_active: 1
    })
  }

  return (
    <div className='admin-form-page'>
      <div className='admin-form-shell'>

      {/* Header */}
      <div className='admin-form-header'>
        <div>
        <div className='admin-form-kicker'>Emergency Contacts</div>
        <h4 className='admin-form-title'>
          Emergency Hotline
        </h4>
        <p className='admin-form-subtitle'>
          Register emergency contact information
        </p>
        </div>
      </div>

      <div className='card border-0 shadow-sm'>
        <div className='card-body p-4'>
          <form onSubmit={handleSubmit}>

            {/* BASIC INFO */}
            <div className='admin-form-section'>Hotline Information</div>

            <div className='row g-3'>

              <div className='col-md-6'>
                <label className='form-label fw-semibold'>
                  Name
                </label>
                <input
                  type='text'
                  name='name'
                  className='form-control'
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-semibold'>
                  Type
                </label>
                <select
                  name='type'
                  className='form-select'
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value='lgu'>LGU</option>
                  <option value='police'>Police</option>
                  <option value='fire'>Fire</option>
                  <option value='medical'>Medical</option>
                  <option value='rescue'>Rescue</option>
                  <option value='coast_guard'>Coast Guard</option>
                  <option value='red_cross'>Red Cross</option>
                  <option value='ndrrmc'>NDRRMC</option>
                </select>
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-semibold'>
                  Phone Number
                </label>
                <input
                  type='text'
                  name='phone_number'
                  className='form-control'
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-6'>
                <label className='form-label fw-semibold'>
                  Alternative Number
                </label>
                <input
                  type='text'
                  name='alternative_number'
                  className='form-control'
                  value={formData.alternative_number}
                  onChange={handleChange}
                />
              </div>

            </div>

            <hr className='my-4' />

            {/* LOCATION */}
            <div className='admin-form-section'>Location Details</div>

            <div className='row g-3'>

              <div className='col-md-4'>
                <label className='form-label fw-semibold'>
                  City / Municipality
                </label>
                <input
                  type='text'
                  name='city'
                  className='form-control'
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-4'>
                <label className='form-label fw-semibold'>
                  Province
                </label>
                <input
                  type='text'
                  name='province'
                  className='form-control'
                  value={formData.province}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='col-md-4'>
                <label className='form-label fw-semibold'>
                  Status
                </label>
                <select
                  name='is_active'
                  className='form-select'
                  value={formData.is_active}
                  onChange={handleChange}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div className='col-12'>
                <label className='form-label fw-semibold'>
                  Address
                </label>
                <input
                  type='text'
                  name='address'
                  className='form-control'
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <hr className='my-4' />

            {/* ACTIONS */}
            <div className='d-flex justify-content-end gap-2'>
              <button
                type='button'
                className='btn btn-outline-secondary px-4'
                onClick={handleReset}
              >
                Reset
              </button>

              <button
                type='submit'
                className='btn btn-primary px-4'
              >
                Save Hotline
              </button>
            </div>

          </form>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Hotline

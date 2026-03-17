import React, { useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

import { postRequest } from '../../../../API/API'

// Import Geosearch
import { GeoSearchControl, 
         OpenStreetMapProvider } 
from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'

import markerIcon2x from
  'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from
  'leaflet/dist/images/marker-icon.png'
import markerShadow from
  'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Search Control Component
const SearchControl = ({ onLocationSelect }) => {
  const map = useMap()

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        countrycodes: 'ph',
        addressdetails: 1,
      }
    })

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      searchLabel: 
        'Search street, city, building...',
      keepResult: true,
    })

    map.addControl(searchControl)

    // When user selects a search result
    map.on('geosearch/showlocation', (result) => {
      const { x, y, label } = result.location
      // x = longitude, y = latitude
      onLocationSelect(y, x)
    })

    return () => {
      map.removeControl(searchControl)
    }
  }, [map])

  return null
}

// Click handler component
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    }
  })
  return null
}

function Hazard() {

  const [formData, setFormData] = useState({
    address: '',
    barangay: '',
    municipality: '',
    province: '',
    latitude: '',
    longitude: '',
    disaster_type: '',
    level: ''
  })

  const [markerPosition, setMarkerPosition] =
    useState(null)
  const [loadingAddress, setLoadingAddress] =
    useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Reverse Geocoding
  const getAddressFromCoords = async (lat, lng) => {
    try {
      setLoadingAddress(true)

      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            lat,
            lon: lng,
            format: 'json',
            addressdetails: 1
          },
          headers: {
            'Accept-Language': 'en'
          }
        }
      )

      const addr = response.data.address
      const displayName = response.data.display_name

      setFormData(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        address: displayName
          ? displayName
              .split(',')
              .slice(0, 3)
              .join(',')
              .trim()
          : '',
        barangay:
          addr.suburb ||
          addr.village ||
          addr.neighbourhood ||
          addr.hamlet ||
          '',
        municipality:
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.county ||
          '',
        province:
          addr.province ||
          addr.state ||
          addr.region ||
          '',
      }))

    } catch (error) {
      console.error('Geocoding error:', error)
      alert('Could not get address. Please fill manually.')
    } finally {
      setLoadingAddress(false)
    }
  }

  const handleLocationSelect = async (lat, lng) => {
    setMarkerPosition([lat, lng])
    await getAddressFromCoords(lat, lng)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form Data:', formData)
    try{
     const response = await postRequest('auth/hazard-reg',formData)

     if (response.success) {
      alert('Evacuation center saved!')
      handleReset()
    }

    }catch (error) {
    alert('Failed to save. Try again.')
  }
    
  }

  const handleReset = () => {
    setFormData({
      name: '',
      address: '',
      barangay: '',
      municipality: '',
      province: '',
      latitude: '',
      longitude: '',
      capacity: '',
      disaster_type: ''
    })
    setMarkerPosition(null)
  }

  return (
    <div className='container-fluid py-4'>

      {/* Header */}
      <div className='d-flex align-items-center
        gap-2 mb-4'
      >
        <div>
          <h4 className='mb-0 fw-bold'>
            Hazard Area
          </h4>
          <small className='text-muted'>
            Add the prone area
          </small>
        </div>
      </div>

      <div className='card border-0 shadow-sm'>
        <div className='card-body p-4'>
          <form onSubmit={handleSubmit}>
            {/* Map */}
            <div className='mb-4'>
              <h6 className='fw-bold text-danger mb-1'>
                Pick Location on Map
              </h6>
              <small className='text-muted d-block mb-3'>
                Search a location OR
                Click anywhere on the map
                to auto fill address details
              </small>

              {/* Loading */}
              {loadingAddress && (
                <div className='alert alert-info
                  d-flex align-items-center
                  gap-2 py-2 mb-3'
                >
                  <div className='spinner-border
                    spinner-border-sm'
                  />
                  <span style={{ fontSize: 13 }}>
                    Getting address details...
                  </span>
                </div>
              )}

              {/* Success */}
              {markerPosition && !loadingAddress && (
                <div className='alert alert-success
                  d-flex align-items-center
                  gap-2 py-2 mb-3'
                >
                  <span style={{ fontSize: 13 }}>
                    Location selected!
                    Lat: <b>{formData.latitude}</b> |
                    Lng: <b>{formData.longitude}</b>
                  </span>
                </div>
              )}

              {/* Map */}
              <div
                className='rounded-3 overflow-hidden border mb-3'
                style={{ height: 400 }}
              >
                <MapContainer
                  center={[10.3157, 123.8854]}
                  zoom={13}
                  style={{
                    height: '100%',
                    width: '100%'
                  }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap'
                  />

                  {/* Search Bar */}
                  <SearchControl
                    onLocationSelect={
                      handleLocationSelect
                    }
                  />

                  {/* Click to pick */}
                  <LocationPicker
                    onLocationSelect={
                      handleLocationSelect
                    }
                  />

                  {/* Marker */}
                  {markerPosition && (
                    <Marker position={markerPosition}>
                      <Popup>
                        <b>Selected Location</b>
                        <br />
                        <small>
                          {formData.address ||
                            'Loading...'}
                        </small>
                      </Popup>
                    </Marker>
                  )}

                </MapContainer>
              </div>

              {/* Auto filled fields */}
              <div className='row g-3'>

                <div className='col-md-6'>
                  <label className='form-label fw-semibold'>
                    Latitude
                    <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='number'
                    name='latitude'
                    className='form-control'
                    placeholder='Auto filled'
                    value={formData.latitude}
                    onChange={handleChange}
                    step='any'
                    required
                  />
                </div>

                <div className='col-md-6'>
                  <label className='form-label fw-semibold'>
                    Longitude
                    <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='number'
                    name='longitude'
                    className='form-control'
                    placeholder='Auto filled'
                    value={formData.longitude}
                    onChange={handleChange}
                    step='any'
                    required
                  />
                </div>

                <div className='col-12'>
                  <label className='form-label fw-semibold'>
                    Address
                    <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='text'
                    name='address'
                    className='form-control'
                    placeholder='Auto filled'
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className='col-md-4'>
                  <label className='form-label fw-semibold'>
                    Barangay
                    <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='text'
                    name='barangay'
                    className='form-control'
                    placeholder='Auto filled'
                    value={formData.barangay}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className='col-md-4'>
                  <label className='form-label fw-semibold'>
                    Municipality
                    <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='text'
                    name='municipality'
                    className='form-control'
                    placeholder='Auto filled'
                    value={formData.municipality}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className='col-md-4'>
                  <label className='form-label fw-semibold'>
                    Province
                    <span className='text-danger'>*</span>
                  </label>
                  <input
                    type='text'
                    name='province'
                    className='form-control'
                    placeholder='Auto filled'
                    value={formData.province}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>
            </div>

            <hr className='my-3' />

            {/* Capacity & Status */}
            <div className='mb-4'>
              <h6 className='fw-bold text-danger mb-3'>
                Disaster Level & Type
              </h6>
              <div className='row g-3'>

                <div className='col-md-4'>
                  <label className='form-label fw-semibold'>
                    Level
                    <span className='text-danger'>*</span>
                  </label>
                  <select
                    name='level'
                    className='form-select'
                    value={formData.level}
                    onChange={handleChange}
                    required
                  >
                    <option value='low'>
                      Low
                    </option>
                    <option value='moderate'>
                      Moderate
                    </option>
                    <option value='high'>
                      High
                    </option>
                    <option value='very_high'>
                      Very High
                    </option>
                  </select>
                </div>

                <div className='col-md-4'>
                  <label className='form-label fw-semibold'>
                    Disaster Type
                  </label>
                  <select
                    name='disaster_type'
                    className='form-select'
                    value={formData.disaster_type}
                    onChange={handleChange}
                  >
                    <option value=''>
                      All Disasters
                    </option>
                    <option value='typhoon'>
                      Typhoon
                    </option>
                    <option value='earthquake'>
                      Earthquake
                    </option>
                    <option value='tsunami'>
                      Tsunami
                    </option>
                    <option value='fire'>
                      Fire
                    </option>
                    <option value='flood'>
                      Flood
                    </option>
                  </select>
                </div>

              </div>
            </div>

            <hr className='my-3' />

            {/* Buttons */}
            <div className='d-flex gap-2
              justify-content-end'
            >
              <button
                type='button'
                className='btn btn-light px-4'
                onClick={handleReset}
              >
                Reset
              </button>
              <button
                type='submit'
                className='btn btn-success px-4'
                disabled={loadingAddress}
              >
                Save Center
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  )
}

export default Hazard

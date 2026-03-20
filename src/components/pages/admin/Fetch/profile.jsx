// src/pages/admin/Fetch/profile.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { getRequest, putRequest } from '../../../../API/API'

import { QRCodeSVG } from 'qrcode.react'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evacuee, setEvacuee] = useState(null)
  const [loading, setLoading] = useState(true)

 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getRequest(
          `api/profile/${id}`
        )
        if (response.success) {
          setEvacuee(response.evacuee)
          console.log(response.evacuee);
          
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  
const serveNeed = async (needId, type) => {
  try {

    const response = await putRequest(
      `update/serve/${needId}`
    )

    if (response.success) {

      // update UI instantly without reload
      setEvacuee(prev => ({
        ...prev,
        needs: {
          ...prev.needs,
          [type]: prev.needs[type].map(n =>
            n.id === needId
              ? { ...n, served: true }
              : n
          )
        }
      }))

    }

  } catch (error) {
    console.log(error)
  }
}

  if (loading) {
    return (
      <div className='d-flex
        justify-content-center
        align-items-center'
        style={{ minHeight: 400 }}
      >
        <div className='spinner-border
          text-danger'
        />
      </div>
    )
  }

  if (!evacuee) {
    return (
      <div className='p-4 text-center'>
        <p className='text-muted'>
          Evacuee not found!
        </p>
      </div>
    )
  }

  // Calculate age
  const age = evacuee.birthday
    ? Math.floor(
        (new Date() - new Date(evacuee.birthday))
        / (365.25 * 24 * 60 * 60 * 1000)
      )
    : 'N/A'

  // Capacity percentage
  const pct = Math.round(
    (evacuee.center?.current_occupancy /
      evacuee.center?.capacity) * 100
  )

  return (
    <div className='p-4'>

      <div className='row g-3'>

        {/* ── Left Column ── */}
        <div className='col-md-4'>

          {/* Profile Card */}
          <div className='card border-0
            shadow-sm mb-3'
          >
            <div className='card-body p-4
              text-center'
            >
              {/* Avatar */}
              <div
                className='rounded-circle
                  bg-danger bg-opacity-10
                  d-flex align-items-center
                  justify-content-center
                  mx-auto mb-3'
                style={{
                  width: 80, height: 80,
                  fontSize: '2rem'
                }}
              >
                {evacuee.sex === 'male'
                  ? '👨' : '👩'}
              </div>

              <h5 className='fw-bold mb-1'>
                {evacuee.firstName}{' '}
                {evacuee.lastName}
              </h5>

              <p className='text-muted mb-2'
                style={{ fontSize: 13 }}
              >
                {evacuee.barangay},{' '}
                {evacuee.city}
              </p>

              <span className={`badge ${
                evacuee.checkin?.checkout_at
                  ? 'bg-secondary'
                  : 'bg-success'
              }`}>
                {evacuee.checkin?.checkout_at
                  ? 'Checked Out'
                  : 'Currently Inside'
                }
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className='card border-0
            shadow-sm mb-3'
          >
            <div className='card-body p-4
              text-center'
            >
              <h6 className='fw-bold mb-3'>
                🔲 QR Code
              </h6>
              <div className='d-inline-block
                p-3 border rounded bg-white'
              >
                {/* QR Code component */}
                <div style={{
                  width: 150, height: 150,
                  background: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#6c757d'
                }}>
                  <QRCodeSVG 
                    value={id}
                    size={150}
                    level='H'
                    />
                </div>
              </div>
              <div className='mt-2'
                style={{ fontSize: 12,
                  color: '#6c757d' }}
              >
                ID: #{evacuee.id}
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column ── */}
        <div className='col-md-8'>

          {/* Personal Info */}
          <div className='card border-0
            shadow-sm mb-3'
          >
            <div className='card-body p-4'>
              <h6 className='fw-bold mb-3
                border-bottom pb-2'
              >
                👤 Personal Information
              </h6>

              <div className='row g-3'>
                <div className='col-6'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Full Name
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {evacuee.firstName}{' '}
                    {evacuee.lastName}
                  </div>
                </div>

                <div className='col-6'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Age / Sex
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {age} yrs / {evacuee.sex}
                  </div>
                </div>

                <div className='col-6'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Phone
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {evacuee.phone || 'N/A'}
                  </div>
                </div>

                <div className='col-6'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Email
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {evacuee.email || 'N/A'}
                  </div>
                </div>

                <div className='col-12'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Address
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {evacuee.barangay},{' '}
                    {evacuee.city},{' '}
                    {evacuee.province}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in Info */}
          <div className='card border-0
            shadow-sm mb-3'
          >
            <div className='card-body p-4'>
              <h6 className='fw-bold mb-3
                border-bottom pb-2'
              >
                🏠 Check-in Information
              </h6>

              <div className='row g-3'>
                <div className='col-12'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Evacuation Center
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {evacuee?.name || 'N/A'}
                  </div>

                  {/* Capacity Bar */}
                  {evacuee.center && (
                    <div className='mt-1'>
                      <div className='progress'
                        style={{ height: 6 }}
                      >
                        <div
                          className={`progress-bar ${
                            pct >= 90
                              ? 'bg-danger'
                              : pct >= 70
                              ? 'bg-warning'
                              : 'bg-success'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className='text-muted mt-1'
                        style={{ fontSize: 11 }}
                      >
                        {evacuee.center.current_occupancy}/
                        {evacuee.center.capacity} capacity
                      </div>
                    </div>
                  )}
                </div>

                <div className='col-6'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Check-in Time
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {evacuee.checkin_at
                      ? new Date(
                          evacuee.checkin_at
                        ).toLocaleString()
                      : 'N/A'
                    }
                  </div>
                </div>

                <div className='col-6'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Number of People
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {evacuee.checkin
                      ?.number_of_people || 1} persons
                  </div>
                </div>

                <div className='col-6'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Checked in by
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {evacuee?.adminFN + ' ' +  evacuee?.adminLN || 'N/A'}
                  </div>
                </div>

                <div className='col-6'>
                  <div className='text-muted'
                    style={{ fontSize: 12 }}
                  >
                    Check-out Time
                  </div>
                  <div className='fw-medium'
                    style={{ fontSize: 14 }}
                  >
                    {evacuee.checkin?.checkout_at
                      ? new Date(
                          evacuee.checkin.checkout_at
                        ).toLocaleString()
                      : '—'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical & Food Needs */}
          <div className='card border-0
            shadow-sm mb-3'
          >
            <div className='card-body p-4'>
              <h6 className='fw-bold mb-3
                border-bottom pb-2'
              >
                🆘 Medical &amp; Food Needs
              </h6>

              <div className='row g-3'>

                {/* Allergies */}
                <div className='col-md-4'>
                  <div className='text-muted mb-2'
                    style={{ fontSize: 12 }}
                  >
                    🤧 Allergies
                  </div>
                  {evacuee.needs?.allergies?.length > 0
                    ? evacuee.needs.allergies.map(
                        (a, i) => (
                          <span
                            key={i}
                            className='badge
                              bg-danger
                              bg-opacity-10
                              text-danger me-1 mb-1'
                          >
                            {a.name}
                          </span>
                        )
                      )
                    : <span className='text-muted'
                        style={{ fontSize: 13 }}
                      >
                        None
                      </span>
                  }
                </div>

                {/* Medicines */}
                <div className='col-md-4'>
  <div
    className='text-muted mb-2'
    style={{ fontSize: 12 }}
  >
    💊 Medicines
  </div>

  {evacuee?.needs?.medicines?.length > 0
    ? evacuee.needs.medicines.map((m, i) => (
        <div
          key={i}
          className='d-flex align-items-center gap-2 mb-1'
        >

          <span
            className='badge bg-primary bg-opacity-10 text-primary'
          >
            {m.name}
          </span>

          <span
            style={{ fontSize: 11 }}
            className='text-muted'
          >
            x{m.quantity}
          </span>

          {m.served ? (
            <span className='badge bg-success'>
              Served
            </span>
          ) : (
            <button
              className='btn btn-sm btn-outline-success'
              onClick={() =>
                serveNeed(m.id, "medicines")
              }
            >
              Serve
            </button>
          )}

        </div>
      ))
    : (
      <span
        className='text-muted'
        style={{ fontSize: 13 }}
      >
        None
      </span>
    )
  }
</div>

                {/* Special Foods */}
                <div className='col-md-4'>
                  <div className='text-muted mb-2'
                    style={{ fontSize: 12 }}
                  >
                    🍽️ Special Foods
                  </div>
                  {evacuee.needs?.special_foods?.length > 0
                    ? evacuee.needs.special_foods.map(
                        (f, i) => (
                          <div key={i}
                            className='d-flex
                              align-items-center
                              gap-1 mb-1'
                          >
                            <span
                              className='badge
                                bg-success
                                bg-opacity-10
                                text-success'
                            >
                              {f.name}
                            </span>
                            <span
                              style={{ fontSize: 11 }}
                              className='text-muted'
                            >
                              x{f.quantity}
                            </span>

                                {f.served ? (
                                <span className='badge bg-success'>
                                Served
                                </span>
                            ) : (
                                <button
                                className='btn btn-sm btn-outline-success'
                                onClick={() =>
                                    serveNeed(f.id, "special_foods")
                                }
                                >
                                Serve
                                </button>
                            )}
                          </div>
                        )
                      )
                    : <span className='text-muted'
                        style={{ fontSize: 13 }}
                      >
                        None
                      </span>
                  }
                </div>

              </div>
            </div>
          </div>

          {/* Checkout Button */}
          {!evacuee.checkin?.checkout_at && (
            <button
              className='btn btn-danger w-100'
              onClick={() => {
                // handleCheckout()
              }}
            >
              🚪 Check Out Evacuee
            </button>
          )}

        </div>
      </div>
    </div>
  )
}
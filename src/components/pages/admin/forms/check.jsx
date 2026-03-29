import React, { useState } from 'react'
import CheckIn from '../forms/checkIn'
import QrCheckIn from '../forms/qrCheckIn'

function Check() {
  const [isScan, setScan] = useState(true)

  return (
    <div>
      <div className='px-4 pt-4 pb-0'>
        <div className='admin-form-toggle'>
          <button
            type='button'
            className={isScan ? 'active' : ''}
            onClick={() => setScan(true)}
          >
            Registered
          </button>
          <button
            type='button'
            className={!isScan ? 'active' : ''}
            onClick={() => setScan(false)}
          >
            Not Registered
          </button>
        </div>
      </div>

      {isScan ? <QrCheckIn /> : <CheckIn />}
    </div>
  )
}

export default Check

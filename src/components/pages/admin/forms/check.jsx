import React, { useState } from 'react'

import CheckIn from '../forms/checkIn'
import QrCheckIn from '../forms/qrCheckIn'

function Check() {
  const [isScan, setScan] = useState(true)

  const toggleMode = () => {
    setScan(!isScan)
  }

  return (
    <div className="container mt-3">

      <button
        className="btn btn-primary mb-3"
        onClick={toggleMode}
      >
        {isScan ? "Switch to Manual Check-In" : "Switch to QR Scan"}
      </button>

      {isScan ? <QrCheckIn /> : <CheckIn />}

    </div>
  )
}

export default Check
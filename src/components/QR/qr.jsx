import { QRCodeSVG } from 'qrcode.react'

export default function QrCode({ user }) {

  const qrData = JSON.stringify({
    userId: user.id,
    name: `${user.firstname} ${user.lastname}`,
    barangay: user.barangay,
    municipality: user.municipality
  })

  return (
    <div className='text-center p-4
      border-top'
    >
      <h5 className='fw-bold mb-2'>
        Your QR Code 🎉
      </h5>
      <p className='text-muted mb-3'
        style={{ fontSize: 13 }}
      >
        Show this to barangay staff
        for evacuation check-in
      </p>

      <div className='d-inline-block p-3
        border rounded-3 bg-white shadow-sm'
      >
        <QRCodeSVG
          value={qrData}
          size={200}
          level='H'
        />
      </div>

      <div className='mt-3'>
        <p className='fw-semibold mb-0'>
          {user.firstname} {user.lastname}
        </p>
        <p className='text-muted mb-0'
          style={{ fontSize: 13 }}
        >
          {user.barangay}, {user.municipality}
        </p>
      </div>

      {/* Download button */}
      <button
        className='btn btn-outline-danger
          btn-sm mt-3'
        onClick={() => {
          const svg = document.querySelector(
            'svg'
          )
          const svgData = new XMLSerializer()
            .serializeToString(svg)
          const blob = new Blob(
            [svgData],
            { type: 'image/svg+xml' }
          )
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'my-qr-code.svg'
          a.click()
        }}
      >
        Download QR Code
      </button>
    </div>
  )
}
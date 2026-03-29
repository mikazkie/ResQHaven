import { QRCodeSVG } from 'qrcode.react'

export default function QrCode({ user }) {
  const qrData = JSON.stringify({
    userId: user.id,
    name: `${user.firstname} ${user.lastname}`,
    barangay: user.barangay,
    municipality: user.municipality
  })

  const downloadQrCode = () => {
    const svg = document.querySelector('.user-qr-card svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'resqhaven-qr-code.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='user-qr-card text-center'>
      <div className='d-inline-block p-3 border rounded-4 bg-white shadow-sm'>
        <QRCodeSVG
          value={qrData}
          size={220}
          level='H'
        />
      </div>

      <div className='mt-4'>
        <p className='fw-semibold mb-1'>
          {user.firstname} {user.lastname}
        </p>
        <p className='text-muted mb-0' style={{ fontSize: 13 }}>
          {[user.barangay, user.municipality].filter(Boolean).join(', ')}
        </p>
      </div>

      <button
        className='btn btn-outline-secondary mt-4'
        onClick={downloadQrCode}
      >
        Download QR Code
      </button>
    </div>
  )
}

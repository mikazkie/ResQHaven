import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner({ onScan }) {
  const scannerRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')

  const startScanner = async () => {
    try {
      setError('')

      // ✅ Prevent duplicate instances
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
        } catch (e) {
          // ignore if already stopped
        }
        scannerRef.current = null
      }

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // ✅ Check if still running before stopping
          try {
            if (
              scannerRef.current &&
              scannerRef.current.isScanning
            ) {
              await scannerRef.current.stop()
            }
          } catch (e) {
            // ignore stop error
          }

          setScanning(false)
          scannerRef.current = null

          // ✅ Parse QR data
          try {
            const parsed = JSON.parse(decodedText)
            onScan(parsed)
          } catch (e) {
            // if not JSON pass as string
            onScan(decodedText)
          }
        },
        (err) => {
          // scanning in progress — ignore
        }
      )
      setScanning(true)

    } catch (err) {
      console.log('Scanner error:', err)
      setError('Camera not available!')
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    try {
      if (
        scannerRef.current &&
        scannerRef.current.isScanning
      ) {
        await scannerRef.current.stop()
      }
    } catch (e) {
      // ignore
    }
    setScanning(false)
    scannerRef.current = null
  }

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        scannerRef.current &&
        scannerRef.current.isScanning
      ) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div>
      {/* Scanner Box */}
      <div
        id='qr-reader'
        style={{ width: '100%' }}
      />

      {error && (
        <div className='alert alert-danger
          mt-2 py-2'
          style={{ fontSize: 13 }}
        >
          ❌ {error}
        </div>
      )}

      {!scanning ? (
        <button
          className='btn btn-danger w-100 mt-3'
          onClick={startScanner}
        >
          📷 Start Scanner
        </button>
      ) : (
        <button
          className='btn btn-secondary w-100 mt-3'
          onClick={stopScanner}
        >
          ⏹ Stop Scanner
        </button>
      )}
    </div>
  )
}

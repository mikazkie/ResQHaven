import React from 'react'

export default function ConfirmModal({
  show,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  loading = false
}) {
  if (!show) return null

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'rgba(0,0,0,0.4)',
        zIndex: 1050
      }}
    >
      <div
        className="bg-white rounded-4 shadow p-4"
        style={{ width: 350 }}
      >
        <h6 className="fw-semibold mb-2">{title}</h6>

        <p className="text-muted small mb-4">
          {message}
        </p>

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-sm btn-light"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className="btn btn-sm btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? <span className="spinner-border spinner-border-sm"></span>
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({
  children,
  roles // ✅ accepts array of roles!
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className='d-flex
        justify-content-center
        align-items-center vh-100'
      >
        <div className='spinner-border
          text-danger' />
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  // ✅ Check if user role is allowed
  if (roles && !roles.includes(user.role)) {
    return <Navigate to='/unauthorized' replace />
  }

  return children
}
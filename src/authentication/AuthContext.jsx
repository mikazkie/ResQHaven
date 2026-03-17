// src/context/AuthContext.jsx
import { createContext, useContext,
  useState, useEffect } from 'react'
import { getRequest } from '../API/API'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getRequest('api/me')
        
        if (response.success) {
          setUser(response.user)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => 
  useContext(AuthContext)
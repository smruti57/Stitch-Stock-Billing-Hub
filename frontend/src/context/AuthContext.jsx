import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, register as apiRegister, getProfile } from '../api/authApi'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('stitch_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('stitch_token'))
  const [loading, setLoading] = useState(true)

  // Hydrate user from API on mount if token exists
  useEffect(() => {
    const hydrateUser = async () => {
      if (token) {
        try {
          const profile = await getProfile()
          setUser(profile)
          localStorage.setItem('stitch_user', JSON.stringify(profile))
        } catch {
          // Token invalid or expired — clear state
          setUser(null)
          setToken(null)
          localStorage.removeItem('stitch_token')
          localStorage.removeItem('stitch_user')
        }
      }
      setLoading(false)
    }
    hydrateUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    const { token: newToken, user: newUser } = data
    localStorage.setItem('stitch_token', newToken)
    localStorage.setItem('stitch_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await apiRegister(name, email, password)
    const { token: newToken, user: newUser } = data
    localStorage.setItem('stitch_token', newToken)
    localStorage.setItem('stitch_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore server errors on logout
    } finally {
      localStorage.removeItem('stitch_token')
      localStorage.removeItem('stitch_user')
      setToken(null)
      setUser(null)
    }
  }, [])

  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext

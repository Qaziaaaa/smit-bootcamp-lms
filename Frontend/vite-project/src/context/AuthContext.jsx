import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { DEMO_KEY, TOKEN_KEY, USER_KEY } from '../constants'
import { getMe, login as loginRequest, logout as logoutRequest } from '../services/authService'

const AuthContext = createContext(null)

export { AuthContext }

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => readStoredUser())
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    if (!token) return

    if (localStorage.getItem(DEMO_KEY) === '1') {
      setLoading(false)
      return
    }

    let cancelled = false

    getMe()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await loginRequest({ email, password })
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  const loginAsDemo = useCallback((role) => {
    const demoUser = {
      id: `demo-${role}`,
      name: role === 'admin' ? 'Admin' : 'Student',
      email: role === 'admin' ? 'admin@lms.com' : 'student@lms.com',
      role,
    }
    localStorage.setItem(TOKEN_KEY, 'demo-token')
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser))
    localStorage.setItem(DEMO_KEY, '1')
    setToken('demo-token')
    setUser(demoUser)
    return demoUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // token is discarded client-side regardless
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(DEMO_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      login,
      loginAsDemo,
      logout,
    }),
    [user, token, loading, login, loginAsDemo, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

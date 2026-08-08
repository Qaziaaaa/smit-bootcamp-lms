import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { DEMO_KEY, TOKEN_KEY, USER_KEY } from '../constants'
import { getMe, login as loginRequest, logout as logoutRequest } from '../services/authService'

const AuthContext = createContext(null)

export { AuthContext }

function readStoredUser() {
  const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
  try {
    return JSON.parse(raw) || null
  } catch {
    return null
  }
}

// Demo logins are preview-only: they live in sessionStorage so a fresh visit
// always starts at the login screen. Real logins persist in localStorage.
function initToken() {
  // migrate: drop any legacy demo session previously persisted in localStorage,
  // including a leftover demo-token even if its demo flag was lost
  const localToken = localStorage.getItem(TOKEN_KEY)
  if (localStorage.getItem(DEMO_KEY) === '1' || localToken === 'demo-token') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(DEMO_KEY)
  }
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(initToken)
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(() => Boolean(token))

  useEffect(() => {
    if (!token) return

    if (sessionStorage.getItem(DEMO_KEY) === '1') {
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
          sessionStorage.removeItem(TOKEN_KEY)
          sessionStorage.removeItem(USER_KEY)
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
    sessionStorage.setItem(TOKEN_KEY, 'demo-token')
    sessionStorage.setItem(USER_KEY, JSON.stringify(demoUser))
    sessionStorage.setItem(DEMO_KEY, '1')
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(DEMO_KEY)
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
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(DEMO_KEY)
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

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { TOKEN_KEY, USER_KEY } from '../constants'
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

function initToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(initToken)
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(() => Boolean(token))

  useEffect(() => {
    if (!token) return

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

  const login = useCallback(async (email, password, role) => {
    const { token: newToken, user: newUser } = await loginRequest({ email, password, role })
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // token is discarded client-side regardless
    }
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
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
      logout,
    }),
    [user, token, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

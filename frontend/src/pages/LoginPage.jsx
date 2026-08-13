import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Exact SMIT color palette from source
const NAVY    = 'hsl(218, 53%, 36%)'   // --clr-navy
const NAVY_DARK = 'hsl(221, 83%, 24%)' // --clr-blue-darker  (button hover)
const BLUE_TEXT = 'hsl(221, 83%, 33%)' // --clr-blue-dark    (helper text)

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [activeTab,   setActiveTab]   = useState(0)   // 0=Student 1=Admin
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError,   setFormError]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  function goHome(user) {
    navigate(user.role === 'admin' ? '/dashboard' : '/student/dashboard', { replace: true })
  }

  function switchTab(idx) {
    setActiveTab(idx)
    setEmail('')
    setPassword('')
    setFieldErrors({})
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Please enter a valid email.'
    if (!password) errs.password = 'Password is required.'
    setFieldErrors(errs)
    setFormError('')
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const user = await login(email.trim(), password, isStudent ? 'student' : 'admin')
      goHome(user)
    } catch (err) {
      const status = err.response?.status
      setFormError(status === 401 ? 'Invalid email or password.' : err.response?.data?.message || 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isStudent = activeTab === 0

  /* ─── shared input style ──────────────────────────────────── */
  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    fontSize: '0.9rem',
    fontFamily: 'Poppins, sans-serif',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    outline: 'none',
    background: '#fff',
    color: '#1a202c',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* ── SMIT Logo ─────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src="/logo.png"
            alt="SMIT – Saylani Mass IT Training"
            style={{ width: '130px', height: 'auto', display: 'inline-block' }}
          />
          <p style={{
            margin: '6px 0 0',
            fontWeight: 600,
            fontSize: '1rem',
            color: NAVY,
            fontFamily: 'Poppins, sans-serif',
          }}>
            Student Portal
          </p>
        </div>

        {/* ── Tab switcher ──────────────────────────────────── */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '10px',
          gap: '2px',
        }}>
          {['Login as Student', 'Login as Admin'].map((label, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => switchTab(idx)}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.85rem',
                fontWeight: activeTab === idx ? 600 : 400,
                color: activeTab === idx ? NAVY : '#94a3b8',
                background: activeTab === idx ? '#ffffff' : 'transparent',
                boxShadow: activeTab === idx ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Login Card ────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px 22px 24px',
        }}>
          {/* Card header */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Login</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: BLUE_TEXT, lineHeight: 1.5 }}>
              {isStudent
                ? 'Kindly provide the email and password used during SMIT course registration.'
                : 'Enter your admin credentials to access the management dashboard.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}
              >
                Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={isStudent ? 'student@smit.edu.pk' : 'admin@lms.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: fieldErrors.email ? '#ef4444' : '#e2e8f0',
                }}
                onFocus={e => { e.target.style.borderColor = NAVY }}
                onBlur={e => { e.target.style.borderColor = fieldErrors.email ? '#ef4444' : '#e2e8f0' }}
              />
              {fieldErrors.email && (
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}
              >
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: '40px',
                    borderColor: fieldErrors.password ? '#ef4444' : '#e2e8f0',
                  }}
                  onFocus={e => { e.target.style.borderColor = NAVY }}
                  onBlur={e => { e.target.style.borderColor = fieldErrors.password ? '#ef4444' : '#e2e8f0' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? (
                    /* Eye-off SVG */
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    /* Eye SVG */
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{fieldErrors.password}</p>
              )}
            </div>

            {/* Error alert */}
            {formError && (
              <div style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '0.83rem',
              }}>
                {formError}
              </div>
            )}

            {/* LOGIN button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '11px',
                marginTop: '4px',
                background: submitting ? '#94a3b8' : NAVY,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!submitting) e.target.style.background = NAVY_DARK }}
              onMouseLeave={e => { if (!submitting) e.target.style.background = NAVY }}
            >
              {submitting ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>
        </div>

        {/* ── Switch role link ──────────────────────────────── */}
        <button
          type="button"
          onClick={() => switchTab(isStudent ? 1 : 0)}
          style={{
            display: 'block',
            width: '100%',
            marginTop: '10px',
            padding: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.88rem',
            fontWeight: 500,
            color: NAVY,
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = NAVY
            e.currentTarget.style.textDecoration = 'underline'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e2e8f0'
            e.currentTarget.style.textDecoration = 'none'
          }}
        >
          {isStudent ? 'Login as Admin' : 'Login as Student'}
        </button>

      </div>
    </div>
  )
}

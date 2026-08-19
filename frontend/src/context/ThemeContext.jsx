// Theme context — manages dark/light mode toggle.
// Stores preference in localStorage, applies 'dark' class to <html> for Tailwind.
// Falls back to system preference on first visit.
import { useCallback, useEffect, useState } from 'react'
import { ThemeContext } from './theme-context'

const STORAGE_KEY = 'lms-theme'

export function ThemeProvider({ children }) {
  // Initialize from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Apply theme class to <html> element and persist to localStorage
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

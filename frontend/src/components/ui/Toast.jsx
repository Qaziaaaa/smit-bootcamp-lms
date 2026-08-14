import { Toaster } from 'react-hot-toast'
import { useTheme } from '../../context/useTheme'

export const ToastProvider = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: isDark ? '#2a2a2a' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#111827',
          border: `1px solid ${isDark ? '#3a3a3a' : '#e5e7eb'}`,
          borderRadius: '10px',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: isDark ? '#2a2a2a' : '#ffffff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: isDark ? '#2a2a2a' : '#ffffff' } },
      }}
    />
  )
}

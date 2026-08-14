import toast from 'react-hot-toast'

export function toastInfo(message) {
  const isDark = document.documentElement.classList.contains('dark')
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: isDark ? '#2a2a2a' : '#eff6ff',
      color: isDark ? '#93c5fd' : '#1e40af',
      border: `1px solid ${isDark ? '#1e3a5f' : '#bfdbfe'}`,
      borderRadius: '10px',
    },
    position: 'top-right',
    duration: 3000,
  })
}

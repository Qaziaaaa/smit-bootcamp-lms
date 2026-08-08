import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    background: { default: '#f8fafb', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    divider: '#e2e8f0',
    error: { main: '#dc2626' },
    success: { main: '#16a34a' },
    warning: { main: '#b45309' },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', Roboto, -apple-system, sans-serif",
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 8 },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
})

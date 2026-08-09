import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2D69EB', contrastText: '#ffffff' },
    background: { default: '#F8FAFA', paper: '#ffffff' },
    text: { primary: '#0A0A0A', secondary: '#828283' },
    divider: '#E2E8F0',
    error: { main: '#DC2626' },
    success: { main: '#22C55E' },
    warning: { main: '#D97706' },
    info: { main: '#0277BD' },
  },
  typography: {
    fontFamily: "'Poppins', 'Segoe UI', Roboto, -apple-system, sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          minHeight: 36,
          '&:hover': { backgroundColor: '#0E3B9A' },
        },
        outlined: {
          borderColor: '#E2E8F0',
          color: '#0A0A0A',
          '&:hover': { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
        },
        containedPrimary: {
          '&:hover': { backgroundColor: '#0E3B9A' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: '#E2E8F0' },
            '&.Mui-focused fieldset': { borderColor: '#2D69EB', borderWidth: 2 },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
        },
        outlined: {
          borderColor: '#E2E8F0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 9999 },
      },
    },
  },
})

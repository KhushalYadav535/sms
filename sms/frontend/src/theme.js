import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      light: '#6573c3',
      dark: '#2c387e',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f50057',
      light: '#f73378',
      dark: '#ab003c',
      contrastText: '#fff',
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#555555',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ffa000',
    },
    success: {
      main: '#388e3c',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02857em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 8px rgba(63,81,181,0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(63,81,181,0.4)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(63,81,181,0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: '#3f51b5',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: '#f0f2f5',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '6px 12px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(63, 81, 181, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(63, 81, 181, 0.25)',
            },
          },
        },
      },
    },
  },
});

export default theme;

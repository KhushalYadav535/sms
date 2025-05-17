import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1A237E', // Deep indigo
      light: '#534BAE',
      dark: '#000051',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D81B60', // Deep pink
      light: '#FF5C8D',
      dark: '#A00037',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FF', // Light blue-gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A237E',
      secondary: '#546E7A',
    },
    success: {
      main: '#00BFA5', // Teal
      light: '#5DF2D6',
      dark: '#008E76',
    },
    warning: {
      main: '#FFB300', // Amber
      light: '#FFE54C',
      dark: '#C68400',
    },
    error: {
      main: '#D50000', // Red
      light: '#FF5131',
      dark: '#9B0000',
    },
    info: {
      main: '#2962FF', // Blue
      light: '#768FFF',
      dark: '#0039CB',
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(8px)',
          backgroundColor: alpha('#FFFFFF', 0.9),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
          backgroundColor: alpha('#FFFFFF', 0.9),
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: alpha('#F8F9FF', 0.8),
          color: '#1A237E',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&.MuiChip-filled': {
            backgroundColor: alpha('#1A237E', 0.08),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha('#F8F9FF', 0.5),
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: alpha('#1A237E', 0.04),
            transform: 'translateX(4px)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: alpha('#1A237E', 0.04),
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 48,
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: alpha('#1A237E', 0.08),
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: alpha('#1A237E', 0.04),
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0,0,0,0.05)',
    '0 4px 12px rgba(0,0,0,0.05)',
    '0 6px 16px rgba(0,0,0,0.05)',
    '0 8px 20px rgba(0,0,0,0.05)',
    '0 10px 24px rgba(0,0,0,0.05)',
    '0 12px 28px rgba(0,0,0,0.05)',
    '0 14px 32px rgba(0,0,0,0.05)',
    '0 16px 36px rgba(0,0,0,0.05)',
    '0 18px 40px rgba(0,0,0,0.05)',
    '0 20px 44px rgba(0,0,0,0.05)',
    '0 22px 48px rgba(0,0,0,0.05)',
    '0 24px 52px rgba(0,0,0,0.05)',
    '0 26px 56px rgba(0,0,0,0.05)',
    '0 28px 60px rgba(0,0,0,0.05)',
    '0 30px 64px rgba(0,0,0,0.05)',
    '0 32px 68px rgba(0,0,0,0.05)',
    '0 34px 72px rgba(0,0,0,0.05)',
    '0 36px 76px rgba(0,0,0,0.05)',
    '0 38px 80px rgba(0,0,0,0.05)',
    '0 40px 84px rgba(0,0,0,0.05)',
    '0 42px 88px rgba(0,0,0,0.05)',
    '0 44px 92px rgba(0,0,0,0.05)',
    '0 46px 96px rgba(0,0,0,0.05)',
    '0 48px 100px rgba(0,0,0,0.05)',
  ],
});

export default theme; 
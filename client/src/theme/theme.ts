import { createTheme, type ThemeOptions } from '@mui/material/styles';

const sharedTypography: ThemeOptions['typography'] = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
};

const sharedComponents: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 600,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1B4332',
      light: '#2D6A4F',
      dark: '#081C15',
    },
    secondary: {
      main: '#40916C',
    },
    background: {
      default: '#F4F7F5',
      paper: '#FFFFFF',
    },
  },
  typography: sharedTypography,
  components: sharedComponents,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#52B788',
      light: '#74C69D',
      dark: '#2D6A4F',
    },
    secondary: {
      main: '#95D5B2',
    },
    background: {
      default: '#0B1410',
      paper: '#15201A',
    },
  },
  typography: sharedTypography,
  components: sharedComponents,
});

export type ThemeMode = 'light' | 'dark';

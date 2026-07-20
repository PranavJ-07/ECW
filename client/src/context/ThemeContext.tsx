import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { darkTheme, lightTheme, type ThemeMode } from '@/theme/theme';

const THEME_MODE_KEY = 'ethicraft_theme_mode';

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_MODE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    localStorage.setItem(THEME_MODE_KEY, nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const theme = mode === 'light' ? lightTheme : darkTheme;

  const value = useMemo(
    () => ({ mode, toggleMode, setMode }),
    [mode, toggleMode, setMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }

  return context;
}

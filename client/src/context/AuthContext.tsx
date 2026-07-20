import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getCurrentUserRequest, loginRequest } from '@/api/auth.api';
import { setUnauthorizedHandler } from '@/api/axios';
import type {
  CollegeSummary,
  CurrentUserPayload,
  LoginCredentials,
  PublicUser,
} from '@/types/auth.types';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/utils/storage';

interface AuthContextValue {
  user: PublicUser | null;
  college: CollegeSummary | null;
  permissions: string[];
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySessionPayload(
  payload: CurrentUserPayload,
  setters: {
    setUser: (user: PublicUser) => void;
    setCollege: (college: CollegeSummary) => void;
    setPermissions: (permissions: string[]) => void;
  },
): void {
  setters.setUser(payload.user);
  setters.setCollege(payload.college);
  setters.setPermissions(payload.permissions);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [college, setCollege] = useState<CollegeSummary | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setCollege(null);
    setPermissions([]);
  }, []);

  const refreshUser = useCallback(async () => {
    const payload = await getCurrentUserRequest();
    applySessionPayload(payload, { setUser, setCollege, setPermissions });
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const session = await loginRequest(credentials);
      setAccessToken(session.accessToken);
      await refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth(): Promise<void> {
      const token = getAccessToken();

      if (!token) {
        if (!cancelled) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        await refreshUser();
      } catch {
        clearSession();
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [clearSession, refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      college,
      permissions,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      logout,
      refreshUser,
    }),
    [user, college, permissions, isInitializing, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

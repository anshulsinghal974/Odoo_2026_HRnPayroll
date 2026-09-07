// AuthContext — stores JWT token + decoded AuthUser in memory.
// Token is persisted in localStorage; session rehydrated via GET /api/auth/me on mount.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthUser, UserRole, LoginCredentials } from '../../types';
import { loginWithBackend, fetchCurrentUser } from '../../api/auth';

// ─── Context Shape ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user:            AuthUser | null;
  token:           string | null;
  role:            UserRole | null;
  isLoading:       boolean;
  login:           (credentials: LoginCredentials) => Promise<void>;
  logout:          () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'pp360_token';

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount — rehydrate session from stored token via /api/auth/me
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    // Token exists — verify it with the backend and get full user profile
    setToken(stored);
    fetchCurrentUser()
      .then((profile) => setUser(profile))
      .catch(() => {
        // Token expired or invalid — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { token: newToken, user: newUser } = await loginWithBackend(credentials);
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    role:            user?.role ?? null,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

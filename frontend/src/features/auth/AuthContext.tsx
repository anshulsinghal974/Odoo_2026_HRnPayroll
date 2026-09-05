// AuthContext — stores JWT token + decoded AuthUser in memory.
// Token is also persisted to localStorage for page refreshes.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthUser, UserRole, LoginCredentials } from '../../types';
import { mockLogin, decodeMockToken } from '../../api/auth';

// ─── Context Shape ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  /** The decoded user object, or null if not logged in */
  user: AuthUser | null;
  /** Raw JWT string, or null if not logged in */
  token: string | null;
  /** Current role, or null */
  role: UserRole | null;
  /** True while login or token hydration is in progress */
  isLoading: boolean;
  /** Login with email + password. Throws on invalid credentials. */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Clears token + user from memory and localStorage */
  logout: () => void;
  /** True if there is a valid authenticated session */
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'pp360_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // starts true to hydrate on mount

  // On mount: restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const decoded = decodeMockToken(stored);
      if (decoded) {
        setToken(stored);
        setUser(decoded);
      } else {
        // Token corrupt or expired — clear it
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { token: newToken, user: newUser } = await mockLogin(credentials);
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
    role: user?.role ?? null,
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
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

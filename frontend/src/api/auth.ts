// Auth API — calls real backend at /api/auth/login
// Falls back to mock users when backend is unavailable (offline dev / no DB).

import type { LoginCredentials, AuthUser, UserRole } from '../types';
import { apiClient } from './client';

// ── Role mapping — Prisma enum → frontend display string ──────────────────────
const ROLE_MAP: Record<string, UserRole> = {
  ADMIN:                'Admin',
  HR_MANAGER:           'HR Manager',
  HR_PAYROLL_MANAGER:   'HR Payroll Manager',
  HR_PAYROLL_USER:      'HR Payroll User',
  EMPLOYEE:             'Employee',
  // pass-through if backend already sends display strings
  Admin:                'Admin',
  'HR Manager':         'HR Manager',
  'HR Payroll Manager': 'HR Payroll Manager',
  'HR Payroll User':    'HR Payroll User',
  Employee:             'Employee',
};

// ── Mock users — used when backend is offline ──────────────────────────────────
const MOCK_USERS: Array<{ email: string; password: string } & AuthUser> = [
  { id: 'usr-001', email: 'admin@peoplepay360.com',       password: 'admin123', name: 'Alex Admin',   role: 'Admin',              employeeId: 'EMP-001' },
  { id: 'usr-002', email: 'hrmanager@peoplepay360.com',   password: 'hr123',    name: 'Helen HR',     role: 'HR Manager',         employeeId: 'EMP-002' },
  { id: 'usr-003', email: 'payroll@peoplepay360.com',     password: 'pay123',   name: 'Paul Payroll', role: 'HR Payroll Manager',  employeeId: 'EMP-003' },
  { id: 'usr-004', email: 'payrolluser@peoplepay360.com', password: 'pay123',   name: 'Uma Payroll',  role: 'HR Payroll User',     employeeId: 'EMP-004' },
  { id: 'usr-005', email: 'employee@peoplepay360.com',    password: 'emp123',   name: 'Eve Employee', role: 'Employee',            employeeId: 'EMP-005' },
];

// ── Lightweight mock token builder ─────────────────────────────────────────────
function b64url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildMockToken(user: AuthUser): string {
  const now = Math.floor(Date.now() / 1000);
  return [
    b64url({ alg: 'HS256', typ: 'JWT' }),
    b64url({ sub: user.id, email: user.email, name: user.name, role: user.role, employeeId: user.employeeId, iat: now, exp: now + 8 * 3600 }),
    b64url({ mock: true }),
  ].join('.');
}

function decodeMockTokenPayload(token: string): AuthUser | null {
  try {
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const p   = JSON.parse(atob(raw));
    if (!p.sub || !p.role) return null;
    return { id: p.sub, email: p.email, name: p.name, role: p.role as UserRole, employeeId: p.employeeId };
  } catch {
    return null;
  }
}

// ── Backend response shape ─────────────────────────────────────────────────────
interface BackendLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    employeeId: string | null;
    employee?: { firstName: string; lastName: string } | null;
  };
}

function mapBackendUser(user: BackendLoginResponse['user']): AuthUser {
  const name = user.employee
    ? `${user.employee.firstName} ${user.employee.lastName}`.trim()
    : user.email.split('@')[0];
  return {
    id:         user.id,
    email:      user.email,
    name,
    role:       ROLE_MAP[user.role] ?? (user.role as UserRole),
    employeeId: user.employeeId ?? undefined,
  };
}

// ── Main login function ────────────────────────────────────────────────────────
/**
 * Try real backend first. If backend is down or DB unavailable,
 * fall back to mock credentials so the UI is always usable.
 */
export async function loginWithBackend(
  credentials: LoginCredentials
): Promise<{ token: string; user: AuthUser }> {
  try {
    const res = await apiClient.post<BackendLoginResponse>('/auth/login', credentials);
    return {
      token: res.data.token,
      user:  mapBackendUser(res.data.user),
    };
  } catch (err: any) {
    // Only fall back to mock if backend is unreachable (network error)
    // If backend responds with 401 (wrong password), surface that error.
    const status = err?.response?.status;
    if (status === 401 || status === 400) {
      throw new Error(err.response?.data?.error ?? 'Invalid email or password.');
    }

    // Backend down / DB not connected — use mock
    console.warn('Backend unavailable — using mock login');
    await new Promise(r => setTimeout(r, 400));

    const match = MOCK_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    if (!match) throw new Error('Invalid email or password.');

    const { password: _pw, ...user } = match;
    return { token: buildMockToken(user), user };
  }
}

// ── Session rehydration ────────────────────────────────────────────────────────
/**
 * GET /api/auth/me — verify stored token with backend.
 * Falls back to decoding a mock token if backend is down.
 */
export async function fetchCurrentUser(): Promise<AuthUser> {
  try {
    const res = await apiClient.get<BackendLoginResponse['user']>('/auth/me');
    return mapBackendUser(res.data);
  } catch (err: any) {
    const status = err?.response?.status;
    // 401 means token is invalid/expired — don't fall back, let AuthContext clear it
    if (status === 401) throw err;

    // Backend down — try to decode mock token from localStorage
    const stored = localStorage.getItem('pp360_token');
    if (stored) {
      const decoded = decodeMockTokenPayload(stored);
      if (decoded) return decoded;
    }
    throw err;
  }
}

// ── Legacy named exports (used by AuthContext) ─────────────────────────────────
export const mockLogin       = loginWithBackend;
export const decodeMockToken = decodeMockTokenPayload;

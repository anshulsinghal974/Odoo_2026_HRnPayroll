// Mock login API — simulates real backend during development.
// When BE-04 (auth endpoints) land, swap these for real apiClient calls.

import type { LoginCredentials, AuthUser, UserRole } from '../types';

// Simulate different roles for demo / development
const MOCK_USERS: Array<{ email: string; password: string } & AuthUser> = [
  {
    id: 'usr-001',
    email: 'admin@peoplepay360.com',
    password: 'admin123',
    name: 'Alex Admin',
    role: 'Admin',
    employeeId: 'EMP-001',
  },
  {
    id: 'usr-002',
    email: 'hrmanager@peoplepay360.com',
    password: 'hr123',
    name: 'Helen HR',
    role: 'HR Manager',
    employeeId: 'EMP-002',
  },
  {
    id: 'usr-003',
    email: 'payroll@peoplepay360.com',
    password: 'pay123',
    name: 'Paul Payroll',
    role: 'HR Payroll Manager',
    employeeId: 'EMP-003',
  },
  {
    id: 'usr-004',
    email: 'payrolluser@peoplepay360.com',
    password: 'pay123',
    name: 'Uma Payroll',
    role: 'HR Payroll User',
    employeeId: 'EMP-004',
  },
  {
    id: 'usr-005',
    email: 'employee@peoplepay360.com',
    password: 'emp123',
    name: 'Eve Employee',
    role: 'Employee',
    employeeId: 'EMP-005',
  },
];

// Lightweight base64url encoder (browser-safe, no external dep needed for mock)
function b64url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Build a fake JWT-like token string. NOT cryptographically signed. */
function buildMockToken(user: AuthUser): string {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    employeeId: user.employeeId,
    iat: now,
    exp: now + 8 * 60 * 60, // 8 hours
  });
  const signature = b64url({ mock: true });
  return `${header}.${payload}.${signature}`;
}

/** Decode the payload section of our mock token */
export function decodeMockToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const raw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(raw));
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role as UserRole,
      employeeId: decoded.employeeId,
    };
  } catch {
    return null;
  }
}

/** Simulates a login API call with 400ms network delay. */
export async function mockLogin(
  credentials: LoginCredentials
): Promise<{ token: string; user: AuthUser }> {
  await new Promise((res) => setTimeout(res, 400)); // Simulated latency

  const match = MOCK_USERS.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );

  if (!match) {
    throw new Error('Invalid email or password. Please try again.');
  }

  const { password: _pw, ...user } = match;
  const token = buildMockToken(user);
  return { token, user };
}

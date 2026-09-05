import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../../db/prisma';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: Role;
  employeeId?: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: Role;
    employeeId: string | null;
  };
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const SALT_ROUNDS = 12;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '24h';
}

// ──────────────────────────────────────────────
// Service functions
// ──────────────────────────────────────────────

/**
 * Register a new user.
 * - Validates no duplicate email
 * - Hashes password with bcrypt (12 rounds)
 * - Creates User record
 * - Returns user object (no password hash)
 */
export async function register(input: RegisterInput) {
  const { email, password, role, employeeId } = input;

  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('A user with this email already exists');
    (error as any).statusCode = 409;
    throw error;
  }

  // If employeeId is provided, verify the employee exists
  if (employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      const error = new Error('Employee not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Check if another user is already linked to this employee
    const linkedUser = await prisma.user.findUnique({ where: { employeeId } });
    if (linkedUser) {
      const error = new Error('This employee is already linked to a user account');
      (error as any).statusCode = 409;
      throw error;
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      employeeId: employeeId || null,
    },
    select: {
      id: true,
      email: true,
      role: true,
      employeeId: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Authenticate a user with email + password.
 * - Verifies credentials
 * - Issues JWT with role claim
 * - Returns { token, user }
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    (error as any).statusCode = 401;
    throw error;
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid email or password');
    (error as any).statusCode = 401;
    throw error;
  }

  // Issue JWT
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn() as any,
  } as jwt.SignOptions);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    },
  };
}

/**
 * Get user profile by ID.
 * Includes linked employee data if available.
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      employeeId: true,
      createdAt: true,
      updatedAt: true,
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          jobPosition: true,
          status: true,
          profileImage: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error('User not found');
    (error as any).statusCode = 404;
    throw error;
  }

  return user;
}

import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

// ──────────────────────────────────────────────
// Validation helpers (no extra library needed)
// ──────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = Object.values(Role);
const MIN_PASSWORD_LENGTH = 8;

interface ValidationError {
  field: string;
  message: string;
}

function sendValidationError(res: Response, errors: ValidationError[]): void {
  res.status(400).json({
    error: 'Validation failed',
    details: errors,
  });
}

/**
 * Validate POST /auth/register body.
 * Required: email, password, role
 * Optional: employeeId
 */
export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const errors: ValidationError[] = [];
  const { email, password, role } = req.body;

  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    });
  }

  if (!role || typeof role !== 'string') {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!VALID_ROLES.includes(role as Role)) {
    errors.push({
      field: 'role',
      message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
    });
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
}

/**
 * Validate POST /auth/login body.
 * Required: email, password
 */
export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const errors: ValidationError[] = [];
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
}

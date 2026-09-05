import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: Role;
}

/**
 * Extended Express Request with authenticated user data.
 * Use this type in any route handler that sits behind the JWT middleware.
 */
export interface AuthRequest extends Request {
  user: JwtUserPayload;
}

// ──────────────────────────────────────────────
// JWT Authentication Middleware
// ──────────────────────────────────────────────

/**
 * Verifies the JWT from the Authorization header.
 * Attaches decoded payload { userId, email, role } to req.user.
 *
 * Usage: router.get('/protected', authenticate, handler)
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required. Provide a Bearer token in the Authorization header.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token is missing' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtUserPayload;

    // Attach user payload to the request
    (req as AuthRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token has expired' });
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
}

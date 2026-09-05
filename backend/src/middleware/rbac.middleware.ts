import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from './jwt.middleware';

// ──────────────────────────────────────────────
// Role-Based Access Control Middleware
// ──────────────────────────────────────────────

/**
 * Higher-order middleware factory that restricts access to specified roles.
 * Must be used AFTER the `authenticate` middleware in the chain.
 *
 * Usage:
 *   router.delete('/employees/:id', authenticate, requireRoles('ADMIN', 'HR_MANAGER'), handler)
 *
 * @param allowedRoles — one or more Role values that are permitted
 * @returns Express middleware that checks req.user.role
 */
export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    // Safety check: authenticate middleware should have run first
    if (!authReq.user) {
      res.status(401).json({
        error: 'Authentication required. The JWT middleware must run before RBAC checks.',
      });
      return;
    }

    const userRole = authReq.user.role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole}.`,
      });
      return;
    }

    next();
  };
}

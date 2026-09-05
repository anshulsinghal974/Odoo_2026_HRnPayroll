import { Request, Response } from 'express';
import * as authService from './auth.service';
import { AuthRequest } from '../../middleware/jwt.middleware';

/**
 * POST /api/auth/register
 * Public — creates a new user account.
 */
export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, role, employeeId } = req.body;

    const user = await authService.register({ email, password, role, employeeId });

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message || 'Registration failed',
    });
  }
}

/**
 * POST /api/auth/login
 * Public — authenticates user, returns JWT.
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message || 'Login failed',
    });
  }
}

/**
 * GET /api/auth/me
 * Protected — returns current user's profile.
 */
export async function meHandler(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;

    const profile = await authService.getProfile(userId);

    res.status(200).json(profile);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to fetch profile',
    });
  }
}

import { Router } from 'express';
import { registerHandler, loginHandler, meHandler } from './auth.controller';
import { validateRegister, validateLogin } from './auth.validation';
import { authenticate } from '../../middleware/jwt.middleware';

const router = Router();

// Public routes
router.post('/register', validateRegister, registerHandler);
router.post('/login', validateLogin, loginHandler);

// Protected routes
router.get('/me', authenticate, meHandler);

export default router;

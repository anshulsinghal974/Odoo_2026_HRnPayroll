import { Router } from 'express';
import { authenticate } from '../../middleware/jwt.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import {
  listHandler,
  getByIdHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} from './employee.controller';

const router = Router();

// All employee routes require authentication
router.use(authenticate);

// List & Get — any authenticated user can read
router.get('/', listHandler);
router.get('/:id', getByIdHandler);

// Create, Update, Delete — HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN
router.post(
  '/',
  requireRoles('HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'),
  createHandler
);
router.put(
  '/:id',
  requireRoles('HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'),
  updateHandler
);
router.delete(
  '/:id',
  requireRoles('ADMIN', 'HR_MANAGER'),
  deleteHandler
);

export default router;

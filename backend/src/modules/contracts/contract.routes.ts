import { Router } from 'express';
import { authenticate } from '../../middleware/jwt.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import {
  listHandler,
  getByIdHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} from './contract.controller';

const router = Router();

// All contract routes require authentication
router.use(authenticate);

// List & Get — any authenticated user can read
router.get('/', listHandler);
router.get('/:id', getByIdHandler);

// Create, Update — HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN
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

// Delete — only ADMIN and HR_MANAGER (and service enforces DRAFT-only)
router.delete(
  '/:id',
  requireRoles('ADMIN', 'HR_MANAGER'),
  deleteHandler
);

export default router;

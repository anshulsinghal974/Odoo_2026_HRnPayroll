import { Router } from 'express';
import { authenticate } from '../../middleware/jwt.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import {
  listHandler,
  getByIdHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} from './schedule.controller';

const router = Router();

router.use(authenticate);

// Read open to all authenticated users
router.get('/', listHandler);
router.get('/:id', getByIdHandler);

// Write restricted to HR managers & admins
router.post(
  '/',
  requireRoles('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'ADMIN'),
  createHandler
);
router.put(
  '/:id',
  requireRoles('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'ADMIN'),
  updateHandler
);
router.delete(
  '/:id',
  requireRoles('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'ADMIN'),
  deleteHandler
);

export default router;

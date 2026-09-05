import { Router } from 'express';
import { authenticate } from '../../middleware/jwt.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { Role } from '@prisma/client';
import {
  listHandler,
  getByIdHandler,
  createHandler,
  checkOutHandler,
  deleteHandler,
  correctionHandler,
} from './attendance.controller';

const router = Router();

// All attendance routes require valid JWT authentication
router.use(authenticate);

// List & view
router.get('/', listHandler);
router.get('/:id', getByIdHandler);

// Create (check-in) & Check-out
router.post('/', createHandler);
router.post('/:id/checkout', checkOutHandler);

// Manual Correction with Audit Trail (HR Managers, Payroll Managers/Users, Admins)
router.put('/:id', requireRoles(Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN), correctionHandler);
router.post('/:id/correct', requireRoles(Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN), correctionHandler);

// Delete (HR Manager & Admin only)
router.delete('/:id', requireRoles(Role.HR_MANAGER, Role.ADMIN), deleteHandler);

export default router;

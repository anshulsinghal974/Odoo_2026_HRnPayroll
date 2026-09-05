import { Router } from 'express';
import { authenticate } from '../../middleware/jwt.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { Role } from '@prisma/client';
import {
  eligibleEmployeesHandler,
  createPayrunHandler,
  listPayrunsHandler,
  getPayrunByIdHandler,
  computePayrunHandler,
  getPayslipByIdHandler,
  getPayrunWarningsHandler,
  validatePayrunHandler,
  markPayrunPaidHandler,
} from './payrun.controller';

const router = Router();

// All payrun & payslip routes require authentication
router.use(authenticate);

// ──────────────────────────────────────────────
// PAYRUN WIZARD & MANAGEMENT
// ──────────────────────────────────────────────

// Wizard Step 1: Discover eligible employees
router.post(
  '/payruns/eligible-employees',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  eligibleEmployeesHandler
);

// Wizard Step 2: Create payrun with chosen employees
router.post(
  '/payruns/create',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  createPayrunHandler
);

router.post(
  '/payruns',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  createPayrunHandler
);

// List & view
router.get(
  '/payruns',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  listPayrunsHandler
);

router.get(
  '/payruns/:id',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  getPayrunByIdHandler
);

// Compute Payrun (Draft -> Computed)
router.post(
  '/payruns/:id/compute',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  computePayrunHandler
);

// Get Payroll Warnings & Readiness Score
router.get(
  '/payruns/:id/warnings',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  getPayrunWarningsHandler
);

// Validate Payrun (Computed -> Validated)
router.post(
  '/payruns/:id/validate',
  requireRoles(Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  validatePayrunHandler
);

// Mark Payrun Paid (Validated -> Paid)
router.post(
  '/payruns/:id/mark-paid',
  requireRoles(Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  markPayrunPaidHandler
);

// ──────────────────────────────────────────────
// PAYSLIP DETAILS
// ──────────────────────────────────────────────

// View payslip (Employees can view own; HR Payroll & Admin can view any)
router.get(
  '/payslips/:id',
  getPayslipByIdHandler
);

export default router;

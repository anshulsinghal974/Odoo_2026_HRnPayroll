import { Router } from 'express';
import { authenticate } from '../../middleware/jwt.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { Role } from '@prisma/client';
import {
  listStructuresHandler,
  getStructureByIdHandler,
  createStructureHandler,
  updateStructureHandler,
  deleteStructureHandler,
  listRulesHandler,
  getRuleByIdHandler,
  createRuleHandler,
  updateRuleHandler,
  deleteRuleHandler,
} from './salary.controller';

const router = Router();

// All salary structure and rule routes require authentication
router.use(authenticate);

// ──────────────────────────────────────────────
// SALARY STRUCTURE ROUTES
// ──────────────────────────────────────────────

router.get(
  '/salary-structures',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  listStructuresHandler
);

router.get(
  '/salary-structures/:id',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  getStructureByIdHandler
);

router.post(
  '/salary-structures',
  requireRoles(Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  createStructureHandler
);

router.put(
  '/salary-structures/:id',
  requireRoles(Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  updateStructureHandler
);

router.delete(
  '/salary-structures/:id',
  requireRoles(Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  deleteStructureHandler
);

// ──────────────────────────────────────────────
// SALARY RULE ROUTES
// ──────────────────────────────────────────────

router.get(
  '/salary-rules',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  listRulesHandler
);

router.get(
  '/salary-rules/:id',
  requireRoles(Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  getRuleByIdHandler
);

router.post(
  '/salary-rules',
  requireRoles(Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  createRuleHandler
);

router.put(
  '/salary-rules/:id',
  requireRoles(Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  updateRuleHandler
);

router.delete(
  '/salary-rules/:id',
  requireRoles(Role.HR_PAYROLL_MANAGER, Role.ADMIN),
  deleteRuleHandler
);

export default router;

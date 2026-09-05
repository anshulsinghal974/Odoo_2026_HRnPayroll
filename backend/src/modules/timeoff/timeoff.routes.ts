import { Router } from 'express';
import { authenticate } from '../../middleware/jwt.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import * as c from './timeoff.controller';

const router = Router();
router.use(authenticate);

// ──────────────────────────────────────────────
// TIME OFF TYPES
// ──────────────────────────────────────────────
router.get('/time-off-types', c.listTypesHandler);
router.post('/time-off-types', requireRoles('HR_MANAGER', 'ADMIN'), c.createTypeHandler);
router.put('/time-off-types/:id', requireRoles('HR_MANAGER', 'ADMIN'), c.updateTypeHandler);
router.delete('/time-off-types/:id', requireRoles('HR_MANAGER', 'ADMIN'), c.deleteTypeHandler);

// ──────────────────────────────────────────────
// ALLOCATIONS
// ──────────────────────────────────────────────
router.get('/allocations', c.listAllocationsHandler);
router.get('/allocations/:id', c.getAllocationHandler);
router.post('/allocations', requireRoles('HR_MANAGER', 'ADMIN'), c.createAllocationHandler);
router.post('/allocations/:id/approve', requireRoles('HR_MANAGER', 'ADMIN'), c.approveAllocationHandler);
router.post('/allocations/:id/refuse', requireRoles('HR_MANAGER', 'ADMIN'), c.refuseAllocationHandler);

// ──────────────────────────────────────────────
// LEAVE REQUESTS
// ──────────────────────────────────────────────
router.get('/leave-requests', c.listLeaveRequestsHandler);
router.get('/leave-requests/:id', c.getLeaveRequestHandler);
// Employees can create their own leave requests (handled by the service mapping employeeId)
router.post('/leave-requests', c.createLeaveRequestHandler);
// Approvals restricted to managers
router.post('/leave-requests/:id/approve', requireRoles('HR_MANAGER', 'ADMIN'), c.approveLeaveRequestHandler);
router.post('/leave-requests/:id/refuse', requireRoles('HR_MANAGER', 'ADMIN'), c.refuseLeaveRequestHandler);

export default router;

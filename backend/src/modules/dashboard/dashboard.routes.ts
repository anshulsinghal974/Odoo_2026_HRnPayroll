import { Router } from 'express';
import { authenticate } from '../../middleware/jwt.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { Role } from '@prisma/client';
import {
  kpisHandler,
  salaryByDeptHandler,
  monthlyTrendHandler,
  attendanceOverviewHandler,
  alertsHandler,
} from './dashboard.controller';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Any authenticated HR / manager / admin role can view the dashboard
const DASHBOARD_ROLES = [
  Role.HR_MANAGER,
  Role.HR_PAYROLL_USER,
  Role.HR_PAYROLL_MANAGER,
  Role.ADMIN,
];

/**
 * GET /dashboard/kpis
 * Headline KPI cards — totalNetSalary, payslipsGenerated,
 * averageSalary, approvedTimeOff, attendanceHealthPercent.
 * Optional query: periodStart, periodEnd, department
 */
router.get('/dashboard/kpis', requireRoles(...DASHBOARD_ROLES), kpisHandler);

/**
 * GET /dashboard/salary-by-department
 * Bar-chart data: [{ department, totalCost }] sorted desc.
 * Optional query: periodStart, periodEnd
 */
router.get(
  '/dashboard/salary-by-department',
  requireRoles(...DASHBOARD_ROLES),
  salaryByDeptHandler
);

/**
 * GET /dashboard/monthly-trend
 * Line-chart data: last N months of net salary.
 * Optional query: months (1–24, default 6)
 */
router.get(
  '/dashboard/monthly-trend',
  requireRoles(...DASHBOARD_ROLES),
  monthlyTrendHandler
);

/**
 * GET /dashboard/attendance-overview
 * Attendance health card: present/absent/partial counts + % health.
 * Optional query: periodStart, periodEnd, department
 */
router.get(
  '/dashboard/attendance-overview',
  requireRoles(...DASHBOARD_ROLES),
  attendanceOverviewHandler
);

/**
 * GET /dashboard/alerts
 * Active system-level alerts (missing contracts, stale payruns, etc.)
 */
router.get('/dashboard/alerts', requireRoles(...DASHBOARD_ROLES), alertsHandler);

export default router;

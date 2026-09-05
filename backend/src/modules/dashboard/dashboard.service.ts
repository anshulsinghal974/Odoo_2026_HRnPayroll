import { prisma } from '../../db/prisma';
import { PayslipStatus, AttendanceStatus, LeaveStatus } from '@prisma/client';

// ──────────────────────────────────────────────
// TYPES (matching OpenAPI contract shapes)
// ──────────────────────────────────────────────

export interface DashboardKPIs {
  totalNetSalary: number;
  payslipsGenerated: number;
  averageSalary: number;
  approvedTimeOff: number;
  attendanceHealthPercent: number;
}

export interface SalaryCostByDept {
  department: string;
  totalCost: number;
}

export interface MonthlyTrendPoint {
  month: string; // e.g. "2026-03"
  totalNet: number;
}

export interface AttendanceOverview {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  partialCount: number;
  healthPercent: number;
}

export interface DashboardAlert {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  relatedId?: string;
}

// ──────────────────────────────────────────────
// KPI TOTALS
// ──────────────────────────────────────────────

/**
 * Returns headline KPI cards.
 * Scope is optionally bounded by periodStart / periodEnd / department.
 */
export async function getDashboardKPIs(
  periodStart?: Date,
  periodEnd?: Date,
  department?: string
): Promise<DashboardKPIs> {
  // 1. Payslip-level financials (VALIDATED + PAID only)
  const payslipWhere: Record<string, any> = {
    status: { in: [PayslipStatus.VALIDATED, PayslipStatus.PAID] },
  };

  if (periodStart || periodEnd) {
    payslipWhere.payrun = {
      ...(periodStart && { periodStart: { gte: periodStart } }),
      ...(periodEnd && { periodEnd: { lte: periodEnd } }),
    };
  }

  if (department) {
    payslipWhere.employee = { department };
  }

  const payslips = await prisma.payslip.findMany({
    where: payslipWhere,
    select: { netAmount: true },
  });

  const totalNetSalary = payslips.reduce(
    (sum, p) => sum + Number(p.netAmount),
    0
  );
  const payslipsGenerated = payslips.length;
  const averageSalary =
    payslipsGenerated > 0 ? totalNetSalary / payslipsGenerated : 0;

  // 2. Approved time-off count
  const leaveWhere: Record<string, any> = { status: LeaveStatus.APPROVED };
  if (periodStart || periodEnd) {
    leaveWhere.startDate = {};
    if (periodStart) leaveWhere.startDate.gte = periodStart;
    if (periodEnd) leaveWhere.startDate.lte = periodEnd;
  }
  if (department) {
    leaveWhere.employee = { department };
  }

  const approvedTimeOff = await prisma.leaveRequest.count({
    where: leaveWhere,
  });

  // 3. Attendance health
  const attWhere: Record<string, any> = {};
  if (periodStart || periodEnd) {
    attWhere.checkIn = {};
    if (periodStart) attWhere.checkIn.gte = periodStart;
    if (periodEnd) attWhere.checkIn.lte = periodEnd;
  }
  if (department) {
    attWhere.employee = { department };
  }

  const [total, presentCount] = await Promise.all([
    prisma.attendance.count({ where: attWhere }),
    prisma.attendance.count({
      where: { ...attWhere, status: AttendanceStatus.PRESENT },
    }),
  ]);

  const attendanceHealthPercent =
    total > 0 ? Math.round((presentCount / total) * 100 * 10) / 10 : 0;

  return {
    totalNetSalary: Math.round(totalNetSalary * 100) / 100,
    payslipsGenerated,
    averageSalary: Math.round(averageSalary * 100) / 100,
    approvedTimeOff,
    attendanceHealthPercent,
  };
}

// ──────────────────────────────────────────────
// SALARY BY DEPARTMENT
// ──────────────────────────────────────────────

/**
 * Aggregates validated/paid net payslip amounts by employee.department.
 * Returns array sorted by totalCost desc — ready for a bar chart.
 */
export async function getSalaryByDepartment(
  periodStart?: Date,
  periodEnd?: Date
): Promise<SalaryCostByDept[]> {
  const payrunWhere: Record<string, any> = {
    status: { in: ['VALIDATED', 'PAID'] },
  };
  if (periodStart) payrunWhere.periodStart = { gte: periodStart };
  if (periodEnd) payrunWhere.periodEnd = { lte: periodEnd };

  const payslips = await prisma.payslip.findMany({
    where: {
      status: { in: [PayslipStatus.VALIDATED, PayslipStatus.PAID] },
      payrun: payrunWhere,
    },
    select: {
      netAmount: true,
      employee: { select: { department: true } },
    },
  });

  const map = new Map<string, number>();

  for (const ps of payslips) {
    const dept = ps.employee?.department ?? 'Unassigned';
    map.set(dept, (map.get(dept) ?? 0) + Number(ps.netAmount));
  }

  return Array.from(map.entries())
    .map(([department, totalCost]) => ({
      department,
      totalCost: Math.round(totalCost * 100) / 100,
    }))
    .sort((a, b) => b.totalCost - a.totalCost);
}

// ──────────────────────────────────────────────
// MONTHLY TREND
// ──────────────────────────────────────────────

/**
 * Returns month-by-month net salary totals for the last N months.
 * Fills zero for months with no paid payrun.
 */
export async function getMonthlyTrend(
  months: number = 6
): Promise<MonthlyTrendPoint[]> {
  const now = new Date();
  const results: MonthlyTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const payslips = await prisma.payslip.findMany({
      where: {
        status: { in: [PayslipStatus.VALIDATED, PayslipStatus.PAID] },
        payrun: {
          status: { in: ['VALIDATED', 'PAID'] },
          periodStart: { gte: start },
          periodEnd: { lte: end },
        },
      },
      select: { netAmount: true },
    });

    const totalNet = payslips.reduce(
      (sum, p) => sum + Number(p.netAmount),
      0
    );

    results.push({
      month: label,
      totalNet: Math.round(totalNet * 100) / 100,
    });
  }

  return results;
}

// ──────────────────────────────────────────────
// ATTENDANCE OVERVIEW
// ──────────────────────────────────────────────

export async function getAttendanceOverview(
  periodStart?: Date,
  periodEnd?: Date,
  department?: string
): Promise<AttendanceOverview> {
  const where: Record<string, any> = {};

  if (periodStart || periodEnd) {
    where.checkIn = {};
    if (periodStart) where.checkIn.gte = periodStart;
    if (periodEnd) where.checkIn.lte = periodEnd;
  }

  if (department) {
    where.employee = { department };
  }

  const [totalRecords, presentCount, absentCount, partialCount] =
    await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.count({
        where: { ...where, status: AttendanceStatus.PRESENT },
      }),
      prisma.attendance.count({
        where: { ...where, status: AttendanceStatus.ABSENT },
      }),
      prisma.attendance.count({
        where: { ...where, status: AttendanceStatus.PARTIAL },
      }),
    ]);

  const healthPercent =
    totalRecords > 0
      ? Math.round((presentCount / totalRecords) * 100 * 10) / 10
      : 0;

  return { totalRecords, presentCount, absentCount, partialCount, healthPercent };
}

// ──────────────────────────────────────────────
// ALERTS
// ──────────────────────────────────────────────

/**
 * Surface active system-level alerts surfaced on the dashboard.
 * Checks:
 *  - Employees with no active contract
 *  - Payruns stuck in DRAFT for > 7 days
 *  - Employees missing bank details
 *  - Expiring contracts in the next 30 days
 */
export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  const alerts: DashboardAlert[] = [];
  const now = new Date();

  // 1. Active employees with no active contract
  const noContractEmployees = await prisma.employee.findMany({
    where: {
      status: 'ACTIVE',
      contracts: {
        none: { status: 'ACTIVE' },
      },
    },
    select: { id: true, firstName: true, lastName: true },
    take: 10,
  });

  for (const emp of noContractEmployees) {
    alerts.push({
      type: 'NO_ACTIVE_CONTRACT',
      severity: 'HIGH',
      message: `${emp.firstName} ${emp.lastName} has no active contract`,
      relatedId: emp.id,
    });
  }

  // 2. Payruns in DRAFT for > 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const staleDraftPayruns = await prisma.payrun.findMany({
    where: {
      status: 'DRAFT',
      createdAt: { lt: sevenDaysAgo },
    },
    select: { id: true, name: true },
    take: 5,
  });

  for (const pr of staleDraftPayruns) {
    alerts.push({
      type: 'STALE_DRAFT_PAYRUN',
      severity: 'MEDIUM',
      message: `Payrun "${pr.name}" has been in DRAFT for more than 7 days`,
      relatedId: pr.id,
    });
  }

  // 3. Active employees with missing bank details
  const noBankDetails = await prisma.employee.count({
    where: {
      status: 'ACTIVE',
      OR: [
        { bankAccount: null },
        { bankAccount: '' },
        { bankIFSC: null },
        { bankIFSC: '' },
      ],
    },
  });

  if (noBankDetails > 0) {
    alerts.push({
      type: 'MISSING_BANK_DETAILS',
      severity: 'MEDIUM',
      message: `${noBankDetails} active employee(s) are missing bank details — payslips cannot be marked paid`,
    });
  }

  // 4. Contracts expiring within 30 days
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringContracts = await prisma.contract.findMany({
    where: {
      status: 'ACTIVE',
      endDate: {
        gte: now,
        lte: thirtyDaysOut,
      },
    },
    select: { id: true, employee: { select: { firstName: true, lastName: true } }, endDate: true },
    take: 10,
  });

  for (const c of expiringContracts) {
    const days = Math.ceil(
      ((c.endDate as Date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    alerts.push({
      type: 'EXPIRING_CONTRACT',
      severity: days <= 7 ? 'HIGH' : 'LOW',
      message: `Contract for ${c.employee.firstName} ${c.employee.lastName} expires in ${days} day(s)`,
      relatedId: c.id,
    });
  }

  return alerts;
}

import { Request, Response, NextFunction } from 'express';
import {
  getDashboardKPIs,
  getSalaryByDepartment,
  getMonthlyTrend,
  getAttendanceOverview,
  getDashboardAlerts,
} from './dashboard.service';

// ── helpers ──────────────────────────────────

function parseDate(raw: unknown): Date | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d;
}

function parseDept(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
}

// ──────────────────────────────────────────────
// GET /dashboard/kpis
// ──────────────────────────────────────────────

export async function kpisHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const periodStart = parseDate(req.query.periodStart);
    const periodEnd = parseDate(req.query.periodEnd);
    const department = parseDept(req.query.department);

    const data = await getDashboardKPIs(periodStart, periodEnd, department);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────
// GET /dashboard/salary-by-department
// ──────────────────────────────────────────────

export async function salaryByDeptHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const periodStart = parseDate(req.query.periodStart);
    const periodEnd = parseDate(req.query.periodEnd);

    const data = await getSalaryByDepartment(periodStart, periodEnd);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────
// GET /dashboard/monthly-trend
// ──────────────────────────────────────────────

export async function monthlyTrendHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const months =
      req.query.months && !isNaN(Number(req.query.months))
        ? Math.min(Math.max(Number(req.query.months), 1), 24)
        : 6;

    const data = await getMonthlyTrend(months);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────
// GET /dashboard/attendance-overview
// ──────────────────────────────────────────────

export async function attendanceOverviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const periodStart = parseDate(req.query.periodStart);
    const periodEnd = parseDate(req.query.periodEnd);
    const department = parseDept(req.query.department);

    const data = await getAttendanceOverview(periodStart, periodEnd, department);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────
// GET /dashboard/alerts
// ──────────────────────────────────────────────

export async function alertsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getDashboardAlerts();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

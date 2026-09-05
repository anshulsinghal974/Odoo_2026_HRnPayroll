import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/jwt.middleware';
import * as attendanceService from './attendance.service';
import { AttendanceStatus, Role } from '@prisma/client';
import { prisma } from '../../db/prisma';

// Helper to resolve linked employee ID for the authenticated user
async function getEmployeeIdForUser(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { employeeId: true },
  });
  return user?.employeeId || null;
}

/**
 * GET /api/attendances
 * List attendance records (paginated, filterable)
 */
export async function listHandler(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    let employeeId = req.query.employeeId as string | undefined;

    // If caller is an EMPLOYEE, enforce viewing only their own records
    if (authReq.user && authReq.user.role === Role.EMPLOYEE) {
      const selfEmployeeId = await getEmployeeIdForUser(authReq.user.userId);
      if (!selfEmployeeId) {
        res.status(403).json({ error: 'No employee record linked to this user account' });
        return;
      }
      employeeId = selfEmployeeId;
    }

    const query: attendanceService.ListAttendanceQuery = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      employeeId,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      status: req.query.status as AttendanceStatus | undefined,
    };

    const result = await attendanceService.listAttendances(query);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to list attendance records' });
  }
}

/**
 * GET /api/attendances/:id
 * Get attendance details by ID
 */
export async function getByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;
    const record = await attendanceService.getAttendanceById(id);

    // If caller is EMPLOYEE, ensure they own this record
    if (authReq.user && authReq.user.role === Role.EMPLOYEE) {
      const selfEmployeeId = await getEmployeeIdForUser(authReq.user.userId);
      if (record.employeeId !== selfEmployeeId) {
        res.status(403).json({ error: 'Forbidden: You can only view your own attendance' });
        return;
      }
    }

    res.status(200).json(record);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to get attendance record' });
  }
}

/**
 * POST /api/attendances
 * Create attendance (Check-in or record creation)
 */
export async function createHandler(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    let employeeId = req.body.employeeId;

    // If EMPLOYEE role, automatically attach their linked employeeId or verify ownership
    if (authReq.user && authReq.user.role === Role.EMPLOYEE) {
      const selfEmployeeId = await getEmployeeIdForUser(authReq.user.userId);
      if (!selfEmployeeId) {
        res.status(403).json({ error: 'No employee record linked to this user account' });
        return;
      }
      if (employeeId && employeeId !== selfEmployeeId) {
        res.status(403).json({ error: 'Forbidden: You cannot record attendance for other employees' });
        return;
      }
      employeeId = selfEmployeeId;
    }

    if (!employeeId) {
      res.status(400).json({ error: 'employeeId is required' });
      return;
    }

    const checkIn = req.body.checkIn || new Date();

    const record = await attendanceService.createAttendance({
      employeeId,
      checkIn,
      checkOut: req.body.checkOut,
      status: req.body.status,
    });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create attendance record' });
  }
}

/**
 * POST /api/attendances/:id/checkout
 * Check-out active attendance
 */
export async function checkOutHandler(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;

    // Check ownership if EMPLOYEE
    if (authReq.user && authReq.user.role === Role.EMPLOYEE) {
      const existing = await attendanceService.getAttendanceById(id);
      const selfEmployeeId = await getEmployeeIdForUser(authReq.user.userId);
      if (existing.employeeId !== selfEmployeeId) {
        res.status(403).json({ error: 'Forbidden: You can only check out your own attendance' });
        return;
      }
    }

    const updated = await attendanceService.checkOutAttendance(id, req.body?.checkOut);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to check out attendance' });
  }
}

/**
 * DELETE /api/attendances/:id
 * Delete an attendance record
 */
export async function deleteHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await attendanceService.deleteAttendance(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to delete attendance record' });
  }
}

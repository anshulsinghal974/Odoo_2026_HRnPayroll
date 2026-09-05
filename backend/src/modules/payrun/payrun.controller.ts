import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/jwt.middleware';
import * as payrunService from './payrun.service';
import { PayrunStatus, Role } from '@prisma/client';

/**
 * POST /api/payruns/eligible-employees
 * Wizard Step 1: Validate scope and retrieve eligible employees for structure + period
 */
export async function eligibleEmployeesHandler(req: Request, res: Response): Promise<void> {
  try {
    const { structureId, periodStart, periodEnd } = req.body;

    if (!structureId || !periodStart || !periodEnd) {
      res.status(400).json({ error: 'structureId, periodStart, and periodEnd are required' });
      return;
    }

    const result = await payrunService.getEligibleEmployeesForPayrun({
      structureId,
      periodStart,
      periodEnd,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to get eligible employees' });
  }
}

/**
 * POST /api/payruns/create (and POST /api/payruns)
 * Wizard Step 2: Create payrun and draft payslips with selected employees
 */
export async function createPayrunHandler(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const { name, structureId, periodStart, periodEnd, employeeIds, notes } = req.body;

    if (!name || !structureId || !periodStart || !periodEnd || !employeeIds) {
      res.status(400).json({
        error: 'name, structureId, periodStart, periodEnd, and employeeIds are required',
      });
      return;
    }

    const payrun = await payrunService.createPayrunWithEmployees(
      {
        name,
        structureId,
        periodStart,
        periodEnd,
        employeeIds,
        notes,
      },
      authReq.user?.userId
    );

    res.status(201).json(payrun);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create payrun' });
  }
}

/**
 * GET /api/payruns
 * List all payruns (paginated, filterable by status)
 */
export async function listPayrunsHandler(req: Request, res: Response): Promise<void> {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const status = req.query.status as PayrunStatus | undefined;

    const result = await payrunService.listPayruns({ page, limit, status });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to list payruns' });
  }
}

/**
 * GET /api/payruns/:id
 * Get payrun details with structure and payslips
 */
export async function getPayrunByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const payrun = await payrunService.getPayrunById(id);
    res.status(200).json(payrun);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to get payrun' });
  }
}

/**
 * POST /api/payruns/:id/compute
 * Compute all payslips in the payrun (DRAFT -> COMPUTED)
 */
export async function computePayrunHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const updated = await payrunService.computePayrun(id);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to compute payrun' });
  }
}

/**
 * GET /api/payslips/:id
 * Get single payslip by ID with calculation lines
 */
export async function getPayslipByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;
    const payslip = await payrunService.getPayslipById(id);

    // If EMPLOYEE role, allow viewing only their own payslip
    if (authReq.user && authReq.user.role === Role.EMPLOYEE) {
      const { prisma } = await import('../../db/prisma');
      const user = await prisma.user.findUnique({
        where: { id: authReq.user.userId },
        select: { employeeId: true },
      });
      if (payslip.employeeId !== user?.employeeId) {
        res.status(403).json({ error: 'Forbidden: You can only view your own payslips' });
        return;
      }
    }

    res.status(200).json(payslip);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to get payslip' });
  }
}

/**
 * GET /api/payruns/:id/warnings
 * Get payroll readiness score and warnings report
 */
export async function getPayrunWarningsHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const warnings = await payrunService.getPayrunWarnings(id);
    res.status(200).json(warnings);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to get payrun warnings' });
  }
}

/**
 * POST /api/payruns/:id/validate
 * Validate payrun (COMPUTED -> VALIDATED, runs warnings check first)
 */
export async function validatePayrunHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const validated = await payrunService.validatePayrun(id);
    res.status(200).json(validated);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to validate payrun',
      readinessScore: error.readinessScore,
      warnings: error.warnings,
    });
  }
}

/**
 * POST /api/payruns/:id/mark-paid
 * Mark payrun as paid (VALIDATED -> PAID, immutable after)
 */
export async function markPayrunPaidHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const paid = await payrunService.markPayrunPaid(id);
    res.status(200).json(paid);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to mark payrun as paid' });
  }
}

/**
 * GET /api/payslips/:id/pdf
 * Download rendered payslip as a PDF
 */
export async function downloadPayslipPdfHandler(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = req.params.id as string;

    // Check ownership if EMPLOYEE
    if (authReq.user && authReq.user.role === Role.EMPLOYEE) {
      const { prisma } = await import('../../db/prisma');
      const user = await prisma.user.findUnique({
        where: { id: authReq.user.userId },
        select: { employeeId: true },
      });
      const payslip = await prisma.payslip.findUnique({
        where: { id },
        select: { employeeId: true },
      });
      if (!payslip || payslip.employeeId !== user?.employeeId) {
        res.status(403).json({ error: 'Forbidden: You can only download your own payslip' });
        return;
      }
    }

    const { generatePayslipPdf } = await import('../../services/pdf.service');
    const pdfBuffer = await generatePayslipPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="payslip-${id}.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to generate payslip PDF' });
  }
}

/**
 * POST /api/payruns/:id/send OR POST /api/payruns/:id/send-payslips
 * Bulk email payslips to all employees for a validated/paid payrun
 */
export async function sendBulkPayslipsHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { sendBulkPayslipsForPayrun } = await import('../../services/email.service');
    const report = await sendBulkPayslipsForPayrun(id);
    res.status(200).json(report);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to send bulk payslips' });
  }
}

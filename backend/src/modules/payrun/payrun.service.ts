import { prisma } from '../../db/prisma';
import { PayrunStatus, PayslipStatus, Prisma, RuleCategory } from '@prisma/client';
import { resolveContractForPeriod } from '../contracts/contract.service';
import { computeSalaryFromRules, SalaryRuleExecutable } from '../payroll/salary-engine';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface Step1ValidateScopeInput {
  structureId: string;
  periodStart: string | Date;
  periodEnd: string | Date;
}

export interface Step2CreatePayrunInput {
  name: string;
  structureId: string;
  periodStart: string | Date;
  periodEnd: string | Date;
  employeeIds: string[];
  notes?: string;
}

export interface ListPayrunsQuery {
  page?: number;
  limit?: number;
  status?: PayrunStatus;
}

// ──────────────────────────────────────────────
// Step 1: Eligible Employees Discovery
// ──────────────────────────────────────────────

/**
 * Wizard Step 1: Validates scope and returns eligible employees
 * who have an active contract matching the salary structure and covering the period.
 * No database records are created in this step.
 */
export async function getEligibleEmployeesForPayrun(input: Step1ValidateScopeInput) {
  const { structureId } = input;
  const periodStart = new Date(input.periodStart);
  const periodEnd = new Date(input.periodEnd);

  if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
    throw { statusCode: 400, message: 'Invalid periodStart or periodEnd date format' };
  }

  if (periodEnd < periodStart) {
    throw { statusCode: 400, message: 'periodEnd cannot be before periodStart' };
  }

  const structure = await prisma.salaryStructure.findUnique({
    where: { id: structureId },
    include: {
      rules: { orderBy: { sequence: 'asc' } },
    },
  });

  if (!structure) {
    throw { statusCode: 404, message: 'Salary structure not found' };
  }

  if (!structure.isActive) {
    throw { statusCode: 400, message: `Salary structure "${structure.name}" is inactive` };
  }

  if (structure.rules.length === 0) {
    throw { statusCode: 400, message: `Salary structure "${structure.name}" has no rules configured` };
  }

  // Find all ACTIVE contracts covering this period and mapped to this salary structure
  const activeContracts = await prisma.contract.findMany({
    where: {
      salaryStructureId: structureId,
      status: 'ACTIVE',
      startDate: { lte: periodEnd },
      OR: [
        { endDate: null },
        { endDate: { gte: periodStart } },
      ],
    },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          jobPosition: true,
          status: true,
          bankAccount: true,
        },
      },
    },
  });

  const employees = activeContracts.map((c) => ({
    id: c.employee.id,
    firstName: c.employee.firstName,
    lastName: c.employee.lastName,
    email: c.employee.email,
    department: c.employee.department,
    jobPosition: c.employee.jobPosition,
    contractId: c.id,
    contractName: c.name,
    wage: Number(c.wage),
    hasBankDetails: Boolean(c.employee.bankAccount),
    employeeStatus: c.employee.status,
  }));

  return {
    structure: {
      id: structure.id,
      name: structure.name,
      ruleCount: structure.rules.length,
    },
    periodStart,
    periodEnd,
    totalEligible: employees.length,
    employees,
  };
}

// ──────────────────────────────────────────────
// Step 2: Create Payrun with Selected Employees
// ──────────────────────────────────────────────

/**
 * Wizard Step 2: Creates the Payrun and its Draft Payslips for all selected employees.
 */
export async function createPayrunWithEmployees(
  input: Step2CreatePayrunInput,
  userId?: string
) {
  if (!input.name || input.name.trim() === '') {
    throw { statusCode: 400, message: 'Payrun name is required' };
  }

  if (!input.employeeIds || !Array.isArray(input.employeeIds) || input.employeeIds.length === 0) {
    throw { statusCode: 400, message: 'At least one employee must be selected to create a payrun' };
  }

  const periodStart = new Date(input.periodStart);
  const periodEnd = new Date(input.periodEnd);

  if (periodEnd < periodStart) {
    throw { statusCode: 400, message: 'periodEnd cannot be before periodStart' };
  }

  // Verify structure
  const structure = await prisma.salaryStructure.findUnique({
    where: { id: input.structureId },
  });
  if (!structure) {
    throw { statusCode: 404, message: 'Salary structure not found' };
  }

  // Resolve contract for each employee and ensure valid coverage
  const employeeContracts: { employeeId: string; contractId: string }[] = [];

  for (const empId of input.employeeIds) {
    const contract = await resolveContractForPeriod(empId, periodStart);
    if (!contract) {
      const emp = await prisma.employee.findUnique({ where: { id: empId } });
      throw {
        statusCode: 400,
        message: `Employee ${emp ? `${emp.firstName} ${emp.lastName}` : empId} does not have an active contract covering the payrun period`,
      };
    }
    employeeContracts.push({ employeeId: empId, contractId: contract.id });
  }

  // Create Payrun and Draft Payslips in transaction
  const payrun = await prisma.$transaction(async (tx) => {
    const created = await tx.payrun.create({
      data: {
        name: input.name.trim(),
        structureId: input.structureId,
        periodStart,
        periodEnd,
        status: PayrunStatus.DRAFT,
        createdBy: userId || null,
        notes: input.notes || null,
        payslips: {
          create: employeeContracts.map((ec) => ({
            employeeId: ec.employeeId,
            contractId: ec.contractId,
            status: PayslipStatus.DRAFT,
          })),
        },
      },
      include: {
        structure: { select: { id: true, name: true } },
        payslips: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true,
              },
            },
            contract: { select: { id: true, name: true, wage: true } },
          },
        },
      },
    });

    return created;
  });

  return payrun;
}

// ──────────────────────────────────────────────
// Payrun Details & Listing
// ──────────────────────────────────────────────

export async function listPayruns(query: ListPayrunsQuery) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 20;
  const skip = (page - 1) * limit;

  const where: Prisma.PayrunWhereInput = {};
  if (query.status) {
    where.status = query.status;
  }

  const [records, total] = await Promise.all([
    prisma.payrun.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        structure: { select: { id: true, name: true } },
        _count: { select: { payslips: true } },
        payslips: {
          select: { netAmount: true, status: true },
        },
      },
    }),
    prisma.payrun.count({ where }),
  ]);

  const data = records.map((p) => {
    const totalNetSalary = p.payslips.reduce((sum, ps) => sum + (ps.netAmount ? Number(ps.netAmount) : 0), 0);
    return {
      id: p.id,
      name: p.name,
      structureId: p.structureId,
      structureName: p.structure.name,
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
      status: p.status,
      createdBy: p.createdBy,
      payslipCount: p._count.payslips,
      totalNetSalary: Number(totalNetSalary.toFixed(2)),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPayrunById(id: string) {
  const payrun = await prisma.payrun.findUnique({
    where: { id },
    include: {
      structure: {
        include: {
          rules: { orderBy: { sequence: 'asc' } },
        },
      },
      payslips: {
        orderBy: { employee: { firstName: 'asc' } },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              jobPosition: true,
              bankAccount: true,
              bankName: true,
            },
          },
          contract: {
            select: { id: true, name: true, wage: true, startDate: true, endDate: true },
          },
          lines: {
            orderBy: { sequence: 'asc' },
          },
        },
      },
    },
  });

  if (!payrun) {
    throw { statusCode: 404, message: 'Payrun not found' };
  }

  const totalNet = payrun.payslips.reduce((sum, ps) => sum + (ps.netAmount ? Number(ps.netAmount) : 0), 0);

  return {
    ...payrun,
    totalNetSalary: Number(totalNet.toFixed(2)),
  };
}

// ──────────────────────────────────────────────
// Compute Payrun
// ──────────────────────────────────────────────

/**
 * Executes computation engine for all payslips in a payrun:
 * - Runs rules in sequence
 * - Calculates worked days
 * - Generates PayslipLines and updates net amounts
 * - Transitions Payrun to COMPUTED
 */
export async function computePayrun(id: string) {
  const payrun = await prisma.payrun.findUnique({
    where: { id },
    include: {
      structure: {
        include: {
          rules: { orderBy: { sequence: 'asc' } },
        },
      },
      payslips: {
        include: {
          contract: true,
        },
      },
    },
  });

  if (!payrun) {
    throw { statusCode: 404, message: 'Payrun not found' };
  }

  if (payrun.status === PayrunStatus.VALIDATED || payrun.status === PayrunStatus.PAID) {
    throw {
      statusCode: 400,
      message: `Cannot re-compute a payrun with status "${payrun.status}". Finalized payruns are immutable.`,
    };
  }

  if (!payrun.structure.rules || payrun.structure.rules.length === 0) {
    throw {
      statusCode: 400,
      message: `Salary structure "${payrun.structure.name}" has no rules configured`,
    };
  }

  const executableRules: SalaryRuleExecutable[] = payrun.structure.rules.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    category: r.category,
    sequence: r.sequence,
    computation: r.computation,
    amount: r.amount ? Number(r.amount) : null,
    percentage: r.percentage ? Number(r.percentage) : null,
    percentageBaseCode: r.percentageBaseCode,
    formula: r.formula,
  }));

  // Process all payslips in a transaction
  await prisma.$transaction(async (tx) => {
    for (const payslip of payrun.payslips) {
      const wage = payslip.contract?.wage ? Number(payslip.contract.wage) : 0;

      // 1. Calculate worked days from attendance records in this period
      const attendances = await tx.attendance.findMany({
        where: {
          employeeId: payslip.employeeId,
          checkIn: {
            gte: payrun.periodStart,
            lte: payrun.periodEnd,
          },
        },
      });

      const presentDays = attendances.filter((a) => a.status !== 'ABSENT').length;
      // Default to standard 22 days if no attendances are tracked yet, else actual attended days
      const workedDays = presentDays > 0 ? presentDays : 22;

      // 2. Compute salary lines
      const { lines, totals } = computeSalaryFromRules(executableRules, wage, {
        WORKED_DAYS: workedDays,
      });

      // 3. Clear any existing lines (for idempotent re-computes)
      await tx.payslipLine.deleteMany({
        where: { payslipId: payslip.id },
      });

      // 4. Persist computed PayslipLines
      await tx.payslipLine.createMany({
        data: lines.map((l) => ({
          payslipId: payslip.id,
          ruleId: l.ruleId || executableRules.find((r) => r.code === l.ruleCode)?.id || '',
          ruleName: l.ruleName,
          category: l.category,
          sequence: l.sequence,
          amount: new Prisma.Decimal(l.amount),
        })),
      });

      // 5. Update Payslip status and netAmount
      await tx.payslip.update({
        where: { id: payslip.id },
        data: {
          workedDays: new Prisma.Decimal(workedDays),
          netAmount: new Prisma.Decimal(totals.net),
          status: PayslipStatus.COMPUTED,
        },
      });
    }

    // 6. Update Payrun status to COMPUTED
    await tx.payrun.update({
      where: { id },
      data: {
        status: PayrunStatus.COMPUTED,
      },
    });
  });

  // Return fresh computed payrun
  return getPayrunById(id);
}

// ──────────────────────────────────────────────
// Payslip Details
// ──────────────────────────────────────────────

export async function getPayslipById(id: string) {
  const payslip = await prisma.payslip.findUnique({
    where: { id },
    include: {
      payrun: {
        include: {
          structure: { select: { id: true, name: true } },
        },
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          jobPosition: true,
          bankAccount: true,
          bankName: true,
          bankIFSC: true,
        },
      },
      contract: {
        select: {
          id: true,
          name: true,
          wage: true,
          startDate: true,
          endDate: true,
        },
      },
      lines: {
        orderBy: { sequence: 'asc' },
      },
    },
  });

  if (!payslip) {
    throw { statusCode: 404, message: 'Payslip not found' };
  }

  return payslip;
}

// ──────────────────────────────────────────────
// Warning Detection & Readiness Scoring
// ──────────────────────────────────────────────

export interface PayrollWarning {
  type: 'DUPLICATE_PAYSLIP' | 'MISSING_BANK_DETAILS' | 'EXPIRED_CONTRACT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  employeeId?: string;
  employeeName?: string;
}

export interface PayrunWarningsResult {
  payrunId: string;
  payrunName: string;
  readinessScore: number;
  hasBlockingErrors: boolean;
  warnings: PayrollWarning[];
}

/**
 * Detects payroll anomalies before validation:
 * - Duplicate payslips across overlapping payrun periods
 * - Missing bank account details
 * - Expired or invalid contracts
 * Computes a 0-100 readiness score.
 */
export async function getPayrunWarnings(payrunId: string): Promise<PayrunWarningsResult> {
  const payrun = await prisma.payrun.findUnique({
    where: { id: payrunId },
    include: {
      payslips: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bankAccount: true,
              status: true,
            },
          },
          contract: {
            select: {
              id: true,
              name: true,
              status: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
    },
  });

  if (!payrun) {
    throw { statusCode: 404, message: 'Payrun not found' };
  }

  const warnings: PayrollWarning[] = [];

  for (const payslip of payrun.payslips) {
    const empName = `${payslip.employee.firstName} ${payslip.employee.lastName}`;

    // 1. Check for duplicate payslips in overlapping payruns
    const overlapping = await prisma.payslip.findFirst({
      where: {
        employeeId: payslip.employeeId,
        payrunId: { not: payrun.id },
        payrun: {
          status: { in: [PayrunStatus.COMPUTED, PayrunStatus.VALIDATED, PayrunStatus.PAID] },
          periodStart: { lte: payrun.periodEnd },
          periodEnd: { gte: payrun.periodStart },
        },
      },
      include: {
        payrun: { select: { name: true } },
      },
    });

    if (overlapping) {
      warnings.push({
        type: 'DUPLICATE_PAYSLIP',
        severity: 'CRITICAL',
        message: `Duplicate payslip: ${empName} already has a payslip in active payrun "${overlapping.payrun.name}" for an overlapping period`,
        employeeId: payslip.employeeId,
        employeeName: empName,
      });
    }

    // 2. Check for missing bank details
    if (!payslip.employee.bankAccount || payslip.employee.bankAccount.trim() === '') {
      warnings.push({
        type: 'MISSING_BANK_DETAILS',
        severity: 'HIGH',
        message: `Missing bank details: ${empName} has no bank account number on file`,
        employeeId: payslip.employeeId,
        employeeName: empName,
      });
    }

    // 3. Check for expired or inactive contracts
    if (!payslip.contract) {
      warnings.push({
        type: 'EXPIRED_CONTRACT',
        severity: 'CRITICAL',
        message: `No contract: ${empName} is missing an associated contract`,
        employeeId: payslip.employeeId,
        employeeName: empName,
      });
    } else if (payslip.contract.status !== 'ACTIVE') {
      warnings.push({
        type: 'EXPIRED_CONTRACT',
        severity: 'CRITICAL',
        message: `Invalid contract: Contract for ${empName} has status "${payslip.contract.status}"`,
        employeeId: payslip.employeeId,
        employeeName: empName,
      });
    } else if (payslip.contract.endDate && payslip.contract.endDate < payrun.periodEnd) {
      warnings.push({
        type: 'EXPIRED_CONTRACT',
        severity: 'CRITICAL',
        message: `Expired contract: Contract for ${empName} expired on ${payslip.contract.endDate.toISOString().split('T')[0]} before payrun period ended`,
        employeeId: payslip.employeeId,
        employeeName: empName,
      });
    }
  }

  // Calculate Readiness Score (0 - 100)
  let scoreDeduction = 0;
  for (const w of warnings) {
    if (w.severity === 'CRITICAL') scoreDeduction += 25;
    else if (w.severity === 'HIGH') scoreDeduction += 15;
    else if (w.severity === 'MEDIUM') scoreDeduction += 10;
    else if (w.severity === 'LOW') scoreDeduction += 5;
  }

  const readinessScore = Math.max(0, 100 - scoreDeduction);
  const hasBlockingErrors = warnings.some((w) => w.severity === 'CRITICAL');

  return {
    payrunId: payrun.id,
    payrunName: payrun.name,
    readinessScore,
    hasBlockingErrors,
    warnings,
  };
}

// ──────────────────────────────────────────────
// Validate Payrun
// ──────────────────────────────────────────────

/**
 * Validates a payrun (Computed → Validated).
 * Runs warning detection logic; blocks validation if critical anomalies exist.
 */
export async function validatePayrun(id: string) {
  const payrun = await prisma.payrun.findUnique({
    where: { id },
    include: {
      payslips: { select: { id: true, status: true } },
    },
  });

  if (!payrun) {
    throw { statusCode: 404, message: 'Payrun not found' };
  }

  if (payrun.status !== PayrunStatus.COMPUTED) {
    throw {
      statusCode: 400,
      message: `Cannot validate payrun with status "${payrun.status}". Payrun must be in COMPUTED status first.`,
    };
  }

  // Run warning detection
  const warningReport = await getPayrunWarnings(id);

  if (warningReport.hasBlockingErrors) {
    const criticalMessages = warningReport.warnings
      .filter((w) => w.severity === 'CRITICAL')
      .map((w) => w.message);

    throw {
      statusCode: 400,
      message: `Payrun validation blocked due to ${criticalMessages.length} critical warning(s).`,
      readinessScore: warningReport.readinessScore,
      warnings: warningReport.warnings,
    };
  }

  // Transition payrun and all payslips to VALIDATED
  await prisma.$transaction(async (tx) => {
    await tx.payrun.update({
      where: { id },
      data: { status: PayrunStatus.VALIDATED },
    });

    await tx.payslip.updateMany({
      where: { payrunId: id },
      data: { status: PayslipStatus.VALIDATED },
    });
  });

  return getPayrunById(id);
}

// ──────────────────────────────────────────────
// Mark-Paid Payrun
// ──────────────────────────────────────────────

/**
 * Marks a payrun as paid (Validated → Paid).
 * Once marked Paid, payrun is locked and immutable.
 */
export async function markPayrunPaid(id: string) {
  const payrun = await prisma.payrun.findUnique({
    where: { id },
  });

  if (!payrun) {
    throw { statusCode: 404, message: 'Payrun not found' };
  }

  if (payrun.status === PayrunStatus.PAID) {
    throw { statusCode: 400, message: 'Payrun is already marked as PAID' };
  }

  if (payrun.status !== PayrunStatus.VALIDATED) {
    throw {
      statusCode: 400,
      message: `Cannot mark payrun as paid. Payrun must be in VALIDATED status (currently "${payrun.status}").`,
    };
  }

  // Transition payrun and payslips to PAID
  await prisma.$transaction(async (tx) => {
    await tx.payrun.update({
      where: { id },
      data: { status: PayrunStatus.PAID },
    });

    await tx.payslip.updateMany({
      where: { payrunId: id },
      data: { status: PayslipStatus.PAID },
    });
  });

  return getPayrunById(id);
}

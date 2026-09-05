import { prisma } from '../../db/prisma';
import { ContractStatus, Prisma } from '@prisma/client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ListContractsQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  status?: string;
}

export interface CreateContractInput {
  employeeId: string;
  name: string;
  startDate: string;
  endDate?: string;
  wage: number;
  department?: string;
  jobPosition?: string;
  salaryStructureId?: string;
  scheduleId?: string;
  notes?: string;
}

export interface UpdateContractInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  wage?: number;
  department?: string;
  jobPosition?: string;
  status?: ContractStatus;
  salaryStructureId?: string | null;
  scheduleId?: string | null;
  notes?: string;
}

// ──────────────────────────────────────────────
// NO-CONCURRENT-ACTIVE-CONTRACT RULE
// ──────────────────────────────────────────────
// Before setting a contract to ACTIVE, we verify that
// no other contract for the same employee is already ACTIVE.
// This is the core business rule from the PRD §A2.

async function enforceNoActiveContractConflict(
  employeeId: string,
  excludeContractId?: string
): Promise<void> {
  const where: Prisma.ContractWhereInput = {
    employeeId,
    status: 'ACTIVE',
  };

  if (excludeContractId) {
    where.id = { not: excludeContractId };
  }

  const existing = await prisma.contract.findFirst({ where });

  if (existing) {
    const error = new Error(
      `Employee already has an active contract (${existing.name}, ID: ${existing.id}). ` +
      'Only one ACTIVE contract is allowed per employee at any time.'
    );
    (error as any).statusCode = 409;
    throw error;
  }
}

// ──────────────────────────────────────────────
// List contracts (paginated, filterable)
// ──────────────────────────────────────────────

export async function listContracts(query: ListContractsQuery) {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.ContractWhereInput = {};

  if (query.employeeId) {
    where.employeeId = query.employeeId;
  }

  if (query.status && Object.values(ContractStatus).includes(query.status as ContractStatus)) {
    where.status = query.status as ContractStatus;
  }

  const [data, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        salaryStructure: { select: { id: true, name: true } },
        schedule: { select: { id: true, name: true } },
      },
    }),
    prisma.contract.count({ where }),
  ]);

  return { data, total, page, limit };
}

// ──────────────────────────────────────────────
// Get contract by ID
// ──────────────────────────────────────────────

export async function getContractById(id: string) {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      salaryStructure: { select: { id: true, name: true } },
      schedule: { select: { id: true, name: true } },
    },
  });

  if (!contract) {
    const error = new Error('Contract not found');
    (error as any).statusCode = 404;
    throw error;
  }

  return contract;
}

// ──────────────────────────────────────────────
// Create contract
// ──────────────────────────────────────────────

export async function createContract(input: CreateContractInput) {
  // Validate employee exists
  const employee = await prisma.employee.findUnique({
    where: { id: input.employeeId },
  });
  if (!employee) {
    const error = new Error('Employee not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Validate salary structure if provided
  if (input.salaryStructureId) {
    const structure = await prisma.salaryStructure.findUnique({
      where: { id: input.salaryStructureId },
    });
    if (!structure) {
      const error = new Error('Salary structure not found');
      (error as any).statusCode = 404;
      throw error;
    }
  }

  // Validate schedule if provided
  if (input.scheduleId) {
    const schedule = await prisma.workingSchedule.findUnique({
      where: { id: input.scheduleId },
    });
    if (!schedule) {
      const error = new Error('Working schedule not found');
      (error as any).statusCode = 404;
      throw error;
    }
  }

  // New contracts are created as DRAFT by default (schema default),
  // so no active-contract conflict check needed at creation time.

  const contract = await prisma.contract.create({
    data: {
      employeeId: input.employeeId,
      name: input.name,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      wage: input.wage,
      department: input.department,
      jobPosition: input.jobPosition,
      salaryStructureId: input.salaryStructureId,
      scheduleId: input.scheduleId,
      notes: input.notes,
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      salaryStructure: { select: { id: true, name: true } },
      schedule: { select: { id: true, name: true } },
    },
  });

  return contract;
}

// ──────────────────────────────────────────────
// Update contract
// ──────────────────────────────────────────────

export async function updateContract(id: string, input: UpdateContractInput) {
  const existing = await prisma.contract.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Contract not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // If status is being set to ACTIVE, enforce no-concurrent rule
  if (input.status === 'ACTIVE' && existing.status !== 'ACTIVE') {
    await enforceNoActiveContractConflict(existing.employeeId, id);
  }

  // Build update data
  const data: Prisma.ContractUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
  if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;
  if (input.wage !== undefined) data.wage = input.wage;
  if (input.department !== undefined) data.department = input.department;
  if (input.jobPosition !== undefined) data.jobPosition = input.jobPosition;
  if (input.status !== undefined) data.status = input.status;
  if (input.notes !== undefined) data.notes = input.notes;

  // Handle nullable relations
  if (input.salaryStructureId !== undefined) {
    data.salaryStructure = input.salaryStructureId
      ? { connect: { id: input.salaryStructureId } }
      : { disconnect: true };
  }
  if (input.scheduleId !== undefined) {
    data.schedule = input.scheduleId
      ? { connect: { id: input.scheduleId } }
      : { disconnect: true };
  }

  const contract = await prisma.contract.update({
    where: { id },
    data,
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      salaryStructure: { select: { id: true, name: true } },
      schedule: { select: { id: true, name: true } },
    },
  });

  return contract;
}

// ──────────────────────────────────────────────
// Delete contract (only DRAFT contracts)
// ──────────────────────────────────────────────

export async function deleteContract(id: string) {
  const existing = await prisma.contract.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Contract not found');
    (error as any).statusCode = 404;
    throw error;
  }

  if (existing.status !== 'DRAFT') {
    const error = new Error(
      `Only DRAFT contracts can be deleted. This contract is ${existing.status}. ` +
      'Use status update to CANCELLED or EXPIRED instead.'
    );
    (error as any).statusCode = 409;
    throw error;
  }

  await prisma.contract.delete({ where: { id } });
}

// ──────────────────────────────────────────────
// PERIOD RESOLUTION HELPER
// ──────────────────────────────────────────────
// Used by the payroll computation engine to find the
// correct contract for an employee on a given date.
// Logic:
//   1. Find ACTIVE contract whose startDate <= date
//      AND (endDate is null OR endDate >= date)
//   2. If none found, return null (employee has no
//      valid contract for this period)

/**
 * Resolves the valid contract for an employee at a specific date.
 * Returns null if no contract covers the given date.
 *
 * @param employeeId - The employee to look up
 * @param date - The reference date (typically period start or end)
 */
export async function resolveContractForPeriod(
  employeeId: string,
  date: Date
) {
  const contract = await prisma.contract.findFirst({
    where: {
      employeeId,
      status: 'ACTIVE',
      startDate: { lte: date },
      OR: [
        { endDate: null },
        { endDate: { gte: date } },
      ],
    },
    include: {
      salaryStructure: {
        include: {
          rules: { orderBy: { sequence: 'asc' } },
        },
      },
      schedule: {
        include: { lines: true },
      },
    },
    orderBy: { startDate: 'desc' }, // most recent first if multiple somehow
  });

  return contract;
}

import { prisma } from '../../db/prisma';
import { EmployeeStatus, Prisma } from '@prisma/client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ListEmployeesQuery {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  jobPosition?: string;
  managerId?: string;
  scheduleId?: string;
  bankName?: string;
  bankAccount?: string;
  bankIFSC?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  jobPosition?: string;
  status?: EmployeeStatus;
  managerId?: string | null;
  scheduleId?: string | null;
  bankName?: string;
  bankAccount?: string;
  bankIFSC?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
}

// ──────────────────────────────────────────────
// List employees (paginated, filterable, searchable)
// ──────────────────────────────────────────────

export async function listEmployees(query: ListEmployeesQuery) {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.EmployeeWhereInput = {};

  if (query.search) {
    const search = query.search;
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (query.department) {
    where.department = query.department;
  }

  if (query.status && Object.values(EmployeeStatus).includes(query.status as EmployeeStatus)) {
    where.status = query.status as EmployeeStatus;
  }

  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        schedule: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.employee.count({ where }),
  ]);

  return { data, total, page, limit };
}

// ──────────────────────────────────────────────
// Get employee by ID (with smart-button counts)
// ──────────────────────────────────────────────

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      schedule: { select: { id: true, name: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
      _count: {
        select: {
          contracts: true,
          attendances: true,
          leaveRequests: true,
          payslips: true,
        },
      },
    },
  });

  if (!employee) {
    const error = new Error('Employee not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Reshape _count to _counts for API contract
  const { _count, ...rest } = employee;
  return {
    ...rest,
    _counts: _count,
  };
}

// ──────────────────────────────────────────────
// Create employee
// ──────────────────────────────────────────────

export async function createEmployee(input: CreateEmployeeInput) {
  // Check for duplicate email
  const existing = await prisma.employee.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    const error = new Error('An employee with this email already exists');
    (error as any).statusCode = 409;
    throw error;
  }

  // Validate manager exists if provided
  if (input.managerId) {
    const manager = await prisma.employee.findUnique({
      where: { id: input.managerId },
    });
    if (!manager) {
      const error = new Error('Manager not found');
      (error as any).statusCode = 404;
      throw error;
    }
  }

  // Validate schedule exists if provided
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

  const employee = await prisma.employee.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      department: input.department,
      jobPosition: input.jobPosition,
      managerId: input.managerId,
      scheduleId: input.scheduleId,
      bankName: input.bankName,
      bankAccount: input.bankAccount,
      bankIFSC: input.bankIFSC,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      gender: input.gender,
      address: input.address,
      emergencyContact: input.emergencyContact,
    },
    include: {
      schedule: { select: { id: true, name: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return employee;
}

// ──────────────────────────────────────────────
// Update employee
// ──────────────────────────────────────────────

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  // Check employee exists
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Employee not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // If email is being changed, check for duplicates
  if (input.email && input.email !== existing.email) {
    const duplicate = await prisma.employee.findUnique({
      where: { email: input.email },
    });
    if (duplicate) {
      const error = new Error('An employee with this email already exists');
      (error as any).statusCode = 409;
      throw error;
    }
  }

  // Validate manager if being changed
  if (input.managerId) {
    if (input.managerId === id) {
      const error = new Error('An employee cannot be their own manager');
      (error as any).statusCode = 400;
      throw error;
    }
    const manager = await prisma.employee.findUnique({
      where: { id: input.managerId },
    });
    if (!manager) {
      const error = new Error('Manager not found');
      (error as any).statusCode = 404;
      throw error;
    }
  }

  // Build update data
  const data: Prisma.EmployeeUpdateInput = {};
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.email !== undefined) data.email = input.email;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.department !== undefined) data.department = input.department;
  if (input.jobPosition !== undefined) data.jobPosition = input.jobPosition;
  if (input.status !== undefined) data.status = input.status;
  if (input.gender !== undefined) data.gender = input.gender;
  if (input.address !== undefined) data.address = input.address;
  if (input.emergencyContact !== undefined) data.emergencyContact = input.emergencyContact;
  if (input.bankName !== undefined) data.bankName = input.bankName;
  if (input.bankAccount !== undefined) data.bankAccount = input.bankAccount;
  if (input.bankIFSC !== undefined) data.bankIFSC = input.bankIFSC;
  if (input.dateOfBirth !== undefined) data.dateOfBirth = new Date(input.dateOfBirth);

  // Handle nullable relations
  if (input.managerId !== undefined) {
    data.manager = input.managerId
      ? { connect: { id: input.managerId } }
      : { disconnect: true };
  }
  if (input.scheduleId !== undefined) {
    data.schedule = input.scheduleId
      ? { connect: { id: input.scheduleId } }
      : { disconnect: true };
  }

  const employee = await prisma.employee.update({
    where: { id },
    data,
    include: {
      schedule: { select: { id: true, name: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return employee;
}

// ──────────────────────────────────────────────
// Delete employee
// ──────────────────────────────────────────────

export async function deleteEmployee(id: string) {
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Employee not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Check for dependent records that would prevent deletion
  const dependents = await prisma.employee.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          contracts: true,
          payslips: true,
        },
      },
    },
  });

  if (dependents && (dependents._count.contracts > 0 || dependents._count.payslips > 0)) {
    const error = new Error(
      'Cannot delete employee with existing contracts or payslips. Consider setting status to TERMINATED instead.'
    );
    (error as any).statusCode = 409;
    throw error;
  }

  await prisma.employee.delete({ where: { id } });
}

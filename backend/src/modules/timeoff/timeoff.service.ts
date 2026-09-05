import { prisma } from '../../db/prisma';
import { Prisma, TimeOffUnit, ApprovalMode, AllocationStatus, LeaveStatus } from '@prisma/client';

// ──────────────────────────────────────────────
// TIME OFF TYPES
// ──────────────────────────────────────────────

export async function listTimeOffTypes() {
  return prisma.timeOffType.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createTimeOffType(input: any) {
  return prisma.timeOffType.create({
    data: {
      name: input.name,
      unit: input.unit || 'DAYS',
      requiresAllocation: input.requiresAllocation ?? true,
      approvalMode: input.approvalMode || 'HR_APPROVAL',
      carryOver: input.carryOver || false,
      color: input.color,
    },
  });
}

export async function updateTimeOffType(id: string, input: any) {
  return prisma.timeOffType.update({
    where: { id },
    data: {
      name: input.name,
      unit: input.unit,
      requiresAllocation: input.requiresAllocation,
      approvalMode: input.approvalMode,
      carryOver: input.carryOver,
      color: input.color,
    },
  });
}

export async function deleteTimeOffType(id: string) {
  // Check dependencies
  const type = await prisma.timeOffType.findUnique({
    where: { id },
    include: {
      _count: {
        select: { allocations: true, leaveRequests: true },
      },
    },
  });
  if (type && (type._count.allocations > 0 || type._count.leaveRequests > 0)) {
    throw { statusCode: 409, message: 'Cannot delete time off type with existing allocations or requests' };
  }
  return prisma.timeOffType.delete({ where: { id } });
}

// ──────────────────────────────────────────────
// ALLOCATIONS
// ──────────────────────────────────────────────

export async function listAllocations(query: any) {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.AllocationWhereInput = {};
  if (query.employeeId) where.employeeId = query.employeeId;
  if (query.typeId) where.typeId = query.typeId;
  if (query.status) where.status = query.status as AllocationStatus;

  const [data, total] = await Promise.all([
    prisma.allocation.findMany({
      where,
      skip,
      take: limit,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        type: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.allocation.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getAllocationById(id: string) {
  const allocation = await prisma.allocation.findUnique({
    where: { id },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true } },
      type: true,
    },
  });
  if (!allocation) throw { statusCode: 404, message: 'Allocation not found' };
  return allocation;
}

export async function createAllocation(input: any) {
  const numberOfDays = Number(input.numberOfDays);
  return prisma.allocation.create({
    data: {
      employeeId: input.employeeId,
      typeId: input.typeId,
      numberOfDays,
      remaining: numberOfDays,
      taken: 0,
      dateFrom: new Date(input.dateFrom),
      dateTo: new Date(input.dateTo),
      notes: input.notes,
      status: 'DRAFT',
    },
    include: { type: true },
  });
}

export async function approveAllocation(id: string) {
  return prisma.allocation.update({
    where: { id },
    data: { status: 'APPROVED' },
    include: { type: true },
  });
}

export async function refuseAllocation(id: string) {
  return prisma.allocation.update({
    where: { id },
    data: { status: 'REFUSED' },
    include: { type: true },
  });
}

// ──────────────────────────────────────────────
// LEAVE REQUESTS
// ──────────────────────────────────────────────

export async function listLeaveRequests(query: any) {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.LeaveRequestWhereInput = {};
  if (query.employeeId) where.employeeId = query.employeeId;
  if (query.status) where.status = query.status as LeaveStatus;

  const [data, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      skip,
      take: limit,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        type: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.leaveRequest.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getLeaveRequestById(id: string) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true } },
      type: true,
      allocation: true,
    },
  });
  if (!request) throw { statusCode: 404, message: 'Leave request not found' };
  return request;
}

export async function createLeaveRequest(input: any) {
  const type = await prisma.timeOffType.findUnique({ where: { id: input.typeId } });
  if (!type) throw { statusCode: 404, message: 'Time off type not found' };

  let allocationId = input.allocationId;

  if (type.requiresAllocation && !allocationId) {
    // Auto-detect a valid allocation if not provided
    const validAllocations = await prisma.allocation.findMany({
      where: {
        employeeId: input.employeeId,
        typeId: input.typeId,
        status: 'APPROVED',
        remaining: { gte: input.duration },
        dateFrom: { lte: new Date(input.dateFrom) },
        dateTo: { gte: new Date(input.dateTo) },
      },
      orderBy: { dateTo: 'asc' }, // use the one expiring soonest
    });

    if (validAllocations.length === 0) {
      throw { statusCode: 400, message: 'No valid allocation with sufficient balance found for this period' };
    }
    allocationId = validAllocations[0].id;
  }

  return prisma.leaveRequest.create({
    data: {
      employeeId: input.employeeId,
      typeId: input.typeId,
      allocationId: allocationId || null,
      dateFrom: new Date(input.dateFrom),
      dateTo: new Date(input.dateTo),
      duration: input.duration,
      reason: input.reason,
      status: 'SUBMITTED',
    },
    include: { type: true },
  });
}

// Auto-balance-deduction logic on approval
export async function approveLeaveRequest(id: string, approverUserId: string) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { type: true, allocation: true },
  });
  if (!request) throw { statusCode: 404, message: 'Leave request not found' };
  
  if (request.status === 'APPROVED') {
    throw { statusCode: 400, message: 'Leave request is already approved' };
  }

  // Deduct balance from allocation if required
  if (request.type.requiresAllocation && request.allocationId) {
    const allocation = await prisma.allocation.findUnique({ where: { id: request.allocationId } });
    if (!allocation) throw { statusCode: 404, message: 'Allocation not found' };

    const newTaken = Number(allocation.taken) + Number(request.duration);
    const newRemaining = Number(allocation.numberOfDays) - newTaken;

    if (newRemaining < 0) {
      throw { statusCode: 400, message: 'Insufficient allocation balance to approve this leave' };
    }

    await prisma.allocation.update({
      where: { id: allocation.id },
      data: {
        taken: newTaken,
        remaining: newRemaining,
      },
    });
  }

  // We need to resolve the approverUserId to an employeeId if approver is an employee
  const approverUser = await prisma.user.findUnique({ where: { id: approverUserId } });

  return prisma.leaveRequest.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approverId: approverUser?.employeeId || null,
    },
    include: { type: true, allocation: true },
  });
}

export async function refuseLeaveRequest(id: string) {
  const request = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!request) throw { statusCode: 404, message: 'Leave request not found' };

  // If we are refusing an already approved request, we need to refund the allocation
  if (request.status === 'APPROVED' && request.allocationId) {
    const allocation = await prisma.allocation.findUnique({ where: { id: request.allocationId } });
    if (allocation) {
      const newTaken = Number(allocation.taken) - Number(request.duration);
      const newRemaining = Number(allocation.numberOfDays) - newTaken;
      await prisma.allocation.update({
        where: { id: allocation.id },
        data: { taken: newTaken, remaining: newRemaining },
      });
    }
  }

  return prisma.leaveRequest.update({
    where: { id },
    data: { status: 'REFUSED' },
    include: { type: true },
  });
}

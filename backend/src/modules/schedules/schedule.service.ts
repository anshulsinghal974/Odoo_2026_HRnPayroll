import { prisma } from '../../db/prisma';
import { DayOfWeek, Prisma } from '@prisma/client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ScheduleLineInput {
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  breakMins?: number;
}

export interface CreateScheduleInput {
  name: string;
  type?: string;
  lines: ScheduleLineInput[];
}

export interface UpdateScheduleInput {
  name?: string;
  type?: string;
  isActive?: boolean;
  lines?: ScheduleLineInput[];
}

// ──────────────────────────────────────────────
// Helper: Calculate total hours
// ──────────────────────────────────────────────

function calculateTotalHours(lines: ScheduleLineInput[]): number {
  let totalMinutes = 0;

  for (const line of lines) {
    const [startHour, startMin] = line.startTime.split(':').map(Number);
    const [endHour, endMin] = line.endTime.split(':').map(Number);

    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    let diff = endTotal - startTotal;
    if (diff < 0) {
      // Handle cross-midnight shift (e.g., 22:00 to 06:00)
      diff += 24 * 60;
    }

    const breakMins = line.breakMins || 0;
    const netMins = Math.max(0, diff - breakMins);
    
    totalMinutes += netMins;
  }

  return Number((totalMinutes / 60).toFixed(2));
}

// ──────────────────────────────────────────────
// List Schedules
// ──────────────────────────────────────────────

export async function listSchedules(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.workingSchedule.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        lines: true,
      },
    }),
    prisma.workingSchedule.count(),
  ]);

  return { data, total, page, limit };
}

// ──────────────────────────────────────────────
// Get Schedule by ID
// ──────────────────────────────────────────────

export async function getScheduleById(id: string) {
  const schedule = await prisma.workingSchedule.findUnique({
    where: { id },
    include: {
      lines: true,
    },
  });

  if (!schedule) {
    const error = new Error('Working schedule not found');
    (error as any).statusCode = 404;
    throw error;
  }

  return schedule;
}

// ──────────────────────────────────────────────
// Create Schedule
// ──────────────────────────────────────────────

export async function createSchedule(input: CreateScheduleInput) {
  const totalHours = calculateTotalHours(input.lines);

  const schedule = await prisma.workingSchedule.create({
    data: {
      name: input.name,
      type: input.type || 'standard',
      totalHours,
      lines: {
        create: input.lines.map(line => ({
          day: line.day,
          startTime: line.startTime,
          endTime: line.endTime,
          breakMins: line.breakMins || 0,
        })),
      },
    },
    include: {
      lines: true,
    },
  });

  return schedule;
}

// ──────────────────────────────────────────────
// Update Schedule
// ──────────────────────────────────────────────

export async function updateSchedule(id: string, input: UpdateScheduleInput) {
  const existing = await prisma.workingSchedule.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Working schedule not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Build update data
  const data: Prisma.WorkingScheduleUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.type !== undefined) data.type = input.type;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  // If lines are provided, we delete the old ones and create new ones
  if (input.lines) {
    data.totalHours = calculateTotalHours(input.lines);
    data.lines = {
      deleteMany: {}, // Delete existing lines
      create: input.lines.map(line => ({
        day: line.day,
        startTime: line.startTime,
        endTime: line.endTime,
        breakMins: line.breakMins || 0,
      })),
    };
  }

  const schedule = await prisma.workingSchedule.update({
    where: { id },
    data,
    include: {
      lines: true,
    },
  });

  return schedule;
}

// ──────────────────────────────────────────────
// Delete Schedule
// ──────────────────────────────────────────────

export async function deleteSchedule(id: string) {
  const existing = await prisma.workingSchedule.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Working schedule not found');
    (error as any).statusCode = 404;
    throw error;
  }

  // Check dependencies
  const dependents = await prisma.workingSchedule.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          employees: true,
          contracts: true,
        },
      },
    },
  });

  if (dependents && (dependents._count.employees > 0 || dependents._count.contracts > 0)) {
    const error = new Error('Cannot delete a schedule that is assigned to employees or contracts.');
    (error as any).statusCode = 409;
    throw error;
  }

  await prisma.workingSchedule.delete({ where: { id } });
}

import { prisma } from '../../db/prisma';
import { AttendanceStatus, DayOfWeek, Prisma, Attendance } from '@prisma/client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type DerivedAttendanceStatus =
  | 'On Time'
  | 'Late'
  | 'Absent'
  | 'Overtime'
  | 'Missing Check-out';

export interface AttendanceWithDerivedStatus extends Attendance {
  derivedStatus: DerivedAttendanceStatus;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string | null;
    jobPosition: string | null;
  };
}

export interface ListAttendanceQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: AttendanceStatus;
}

export interface CreateAttendanceInput {
  employeeId: string;
  checkIn: string | Date;
  checkOut?: string | Date | null;
  status?: AttendanceStatus;
}

export interface ScheduleLineDetails {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  breakMins: number;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

/**
 * Resolves the relevant ScheduleLine for an employee on a given date.
 */
export async function resolveScheduleLineForEmployee(
  employeeId: string,
  date: Date
): Promise<ScheduleLineDetails | null> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      scheduleId: true,
      schedule: {
        include: { lines: true },
      },
      contracts: {
        where: { status: 'ACTIVE' },
        take: 1,
        include: {
          schedule: {
            include: { lines: true },
          },
        },
      },
    },
  });

  if (!employee) return null;

  // Prefer contract-level schedule, fallback to employee-level schedule
  const activeContract = employee.contracts[0];
  const schedule = activeContract?.schedule || employee.schedule;

  if (!schedule || !schedule.lines || schedule.lines.length === 0) {
    return null;
  }

  const dayOfWeek = DAY_OF_WEEK_MAP[date.getDay()];
  const line = schedule.lines.find((l) => l.day === dayOfWeek);

  if (!line) return null;

  return {
    day: line.day,
    startTime: line.startTime,
    endTime: line.endTime,
    breakMins: line.breakMins,
  };
}

/**
 * Computes net worked hours from checkIn, checkOut, and schedule break time.
 */
export function computeWorkedHours(
  checkIn: Date,
  checkOut: Date,
  breakMins: number = 0
): number {
  const rawMinutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
  if (rawMinutes <= 0) return 0;

  // Apply break deduction only if the shift duration exceeds the break time
  const effectiveBreak = rawMinutes > breakMins ? breakMins : 0;
  const netMinutes = Math.max(0, rawMinutes - effectiveBreak);

  return Number((netMinutes / 60).toFixed(2));
}

/**
 * Derives human-friendly status: On Time / Late / Absent / Overtime / Missing Check-out
 */
export function deriveAttendanceStatus(
  checkIn: Date,
  checkOut: Date | null,
  workedHours: number | null,
  status: AttendanceStatus,
  scheduleLine?: ScheduleLineDetails | null
): DerivedAttendanceStatus {
  // 1. Check if marked Absent
  if (status === AttendanceStatus.ABSENT || (checkOut && workedHours === 0)) {
    return 'Absent';
  }

  // 2. Check if Missing Check-out
  if (!checkOut) {
    return 'Missing Check-out';
  }

  // 3. With ScheduleLine: evaluate check-in punctuality and worked hours vs schedule
  if (scheduleLine) {
    const [startHour, startMin] = scheduleLine.startTime.split(':').map(Number);
    const [endHour, endMin] = scheduleLine.endTime.split(':').map(Number);

    const scheduledStartMins = startHour * 60 + startMin;
    let scheduledEndMins = endHour * 60 + endMin;
    if (scheduledEndMins < scheduledStartMins) {
      scheduledEndMins += 24 * 60; // Overnight shift
    }

    const scheduledNetShiftHours = Number(
      (Math.max(0, scheduledEndMins - scheduledStartMins - (scheduleLine.breakMins || 0)) / 60).toFixed(2)
    );

    // Overtime: worked hours exceed scheduled shift by more than 0.1 hours (6 mins)
    if (workedHours !== null && workedHours > scheduledNetShiftHours + 0.1) {
      return 'Overtime';
    }

    // Late: checked in after scheduled start time (using local hours/minutes)
    const checkInMins = checkIn.getHours() * 60 + checkIn.getMinutes();
    if (checkInMins > scheduledStartMins) {
      return 'Late';
    }

    return 'On Time';
  }

  // 4. Default fallback when no schedule exists: standard 8h day, 09:00 start
  if (workedHours !== null && workedHours > 8.0) {
    return 'Overtime';
  }

  const checkInMins = checkIn.getHours() * 60 + checkIn.getMinutes();
  if (checkInMins > 9 * 60) {
    return 'Late';
  }

  return 'On Time';
}

/**
 * Determines DB AttendanceStatus enum based on worked hours vs scheduled hours
 */
function derivePrismaStatus(
  workedHours: number | null,
  scheduleLine?: ScheduleLineDetails | null
): AttendanceStatus {
  if (workedHours === null) {
    return AttendanceStatus.PRESENT;
  }
  if (workedHours === 0) {
    return AttendanceStatus.ABSENT;
  }

  const expectedHours = scheduleLine ? 6.0 : 4.0;
  if (workedHours < expectedHours) {
    return AttendanceStatus.PARTIAL;
  }

  return AttendanceStatus.PRESENT;
}

// ──────────────────────────────────────────────
// Service Functions
// ──────────────────────────────────────────────

/**
 * List attendances with pagination, filtering, and derivedStatus enrichment.
 */
export async function listAttendances(query: ListAttendanceQuery) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 20;
  const skip = (page - 1) * limit;

  const where: Prisma.AttendanceWhereInput = {};

  if (query.employeeId) {
    where.employeeId = query.employeeId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.dateFrom || query.dateTo) {
    where.checkIn = {};
    if (query.dateFrom) {
      where.checkIn.gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      // Set end of day for dateTo
      const toDate = new Date(query.dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.checkIn.lte = toDate;
    }
  }

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { checkIn: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            jobPosition: true,
          },
        },
      },
    }),
    prisma.attendance.count({ where }),
  ]);

  // Enrich records with derived status
  const enrichedData: AttendanceWithDerivedStatus[] = await Promise.all(
    records.map(async (rec) => {
      const scheduleLine = await resolveScheduleLineForEmployee(rec.employeeId, rec.checkIn);
      const workedHours = rec.workedHours ? Number(rec.workedHours) : null;
      const derived = deriveAttendanceStatus(
        rec.checkIn,
        rec.checkOut,
        workedHours,
        rec.status,
        scheduleLine
      );
      return {
        ...rec,
        derivedStatus: derived,
      };
    })
  );

  return {
    data: enrichedData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single attendance by ID with derivedStatus enrichment.
 */
export async function getAttendanceById(id: string): Promise<AttendanceWithDerivedStatus> {
  const record = await prisma.attendance.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          jobPosition: true,
        },
      },
    },
  });

  if (!record) {
    throw { statusCode: 404, message: 'Attendance record not found' };
  }

  const scheduleLine = await resolveScheduleLineForEmployee(record.employeeId, record.checkIn);
  const workedHours = record.workedHours ? Number(record.workedHours) : null;
  const derivedStatus = deriveAttendanceStatus(
    record.checkIn,
    record.checkOut,
    workedHours,
    record.status,
    scheduleLine
  );

  return {
    ...record,
    derivedStatus,
  };
}

/**
 * Create an attendance record (Check-in or manual entry).
 */
export async function createAttendance(input: CreateAttendanceInput): Promise<AttendanceWithDerivedStatus> {
  // Validate employee
  const employee = await prisma.employee.findUnique({
    where: { id: input.employeeId },
  });
  if (!employee) {
    throw { statusCode: 404, message: 'Employee not found' };
  }

  const checkInDate = new Date(input.checkIn);
  const checkOutDate = input.checkOut ? new Date(input.checkOut) : null;

  if (checkOutDate && checkOutDate < checkInDate) {
    throw { statusCode: 400, message: 'Check-out time cannot be before check-in time' };
  }

  // Check for duplicate open check-in
  if (!checkOutDate) {
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: input.employeeId,
        checkOut: null,
      },
    });
    if (activeAttendance) {
      throw {
        statusCode: 409,
        message: 'Employee already has an active check-in without check-out',
      };
    }
  }

  // Resolve schedule for worked-hours and status derivation
  const scheduleLine = await resolveScheduleLineForEmployee(input.employeeId, checkInDate);

  let workedHours: number | null = null;
  let status: AttendanceStatus = input.status || AttendanceStatus.PRESENT;

  if (checkOutDate) {
    workedHours = computeWorkedHours(checkInDate, checkOutDate, scheduleLine?.breakMins || 0);
    if (!input.status) {
      status = derivePrismaStatus(workedHours, scheduleLine);
    }
  }

  const created = await prisma.attendance.create({
    data: {
      employeeId: input.employeeId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      workedHours: workedHours !== null ? new Prisma.Decimal(workedHours) : null,
      status,
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
        },
      },
    },
  });

  const derivedStatus = deriveAttendanceStatus(
    created.checkIn,
    created.checkOut,
    workedHours,
    created.status,
    scheduleLine
  );

  return {
    ...created,
    derivedStatus,
  };
}

/**
 * Check-out an active attendance record.
 */
export async function checkOutAttendance(
  id: string,
  checkOutTime?: string | Date
): Promise<AttendanceWithDerivedStatus> {
  const existing = await prisma.attendance.findUnique({
    where: { id },
  });

  if (!existing) {
    throw { statusCode: 404, message: 'Attendance record not found' };
  }

  const checkOutDate = checkOutTime ? new Date(checkOutTime) : new Date();

  if (checkOutDate < existing.checkIn) {
    throw { statusCode: 400, message: 'Check-out time cannot be before check-in time' };
  }

  const scheduleLine = await resolveScheduleLineForEmployee(existing.employeeId, existing.checkIn);
  const workedHours = computeWorkedHours(existing.checkIn, checkOutDate, scheduleLine?.breakMins || 0);
  const status = derivePrismaStatus(workedHours, scheduleLine);

  const updated = await prisma.attendance.update({
    where: { id },
    data: {
      checkOut: checkOutDate,
      workedHours: new Prisma.Decimal(workedHours),
      status,
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
        },
      },
    },
  });

  const derivedStatus = deriveAttendanceStatus(
    updated.checkIn,
    updated.checkOut,
    workedHours,
    updated.status,
    scheduleLine
  );

  return {
    ...updated,
    derivedStatus,
  };
}

/**
 * Delete an attendance record.
 */
export async function deleteAttendance(id: string): Promise<void> {
  const existing = await prisma.attendance.findUnique({
    where: { id },
  });

  if (!existing) {
    throw { statusCode: 404, message: 'Attendance record not found' };
  }

  await prisma.attendance.delete({
    where: { id },
  });
}

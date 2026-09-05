/**
 * db/seed.ts — Full demo data seeding
 *
 * Creates:
 *  - 5 system users (one per role) — unchanged from original seed
 *  - 3 departments: Engineering, Sales, Operations
 *  - 1 working schedule (Mon–Fri, 9–18)
 *  - 1 salary structure (Basic → HRA → Gross → PF → Net)
 *  - 24 employees (8 per department) with bank details
 *  - 24 active contracts (1 per employee, linked to salary structure)
 *  - 6 months of attendance records (workdays only, with realistic variation)
 *  - 1 leave type + allocations + approved leave requests
 *  - 3 completed PAID payruns (last 3 months), each with computed payslips
 *
 * Run: npx ts-node -e "require('./src/db/seed.ts')"
 * Or: npx prisma db seed   (if configured in package.json)
 *
 * IDEMPOTENT: uses upsert where possible; for non-upsertable records checks
 * existence first. Re-running will not create duplicates.
 */

import bcrypt from 'bcrypt';
import {
  PrismaClient,
  Role,
  EmployeeStatus,
  ContractStatus,
  AttendanceStatus,
  RuleCategory,
  ComputationType,
  PayrunStatus,
  PayslipStatus,
  LeaveStatus,
  AllocationStatus,
  ApprovalMode,
  TimeOffUnit,
} from '@prisma/client';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Password123!';

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

/** Returns every workday (Mon–Fri) between two dates inclusive */
function workdays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/** Build a check-in time for a workday with slight variation */
function checkInTime(day: Date, variant: number): Date {
  // 8:45 – 9:30 range
  const minuteOffset = [0, 15, -5, 20, -10, 30, 10, -3][variant % 8];
  const d = new Date(day);
  d.setHours(9, minuteOffset < 0 ? 60 + minuteOffset : minuteOffset, 0, 0);
  return d;
}

/** Build a check-out time — 8.5–9.5 hours after check-in */
function checkOutTime(checkIn: Date, variant: number): Date {
  const hours = 8 + (variant % 3);
  const mins = [0, 30, 45][variant % 3];
  const d = new Date(checkIn);
  d.setHours(d.getHours() + hours, mins, 0, 0);
  return d;
}

function monthStart(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

function monthEnd(year: number, month: number): Date {
  return new Date(year, month, 0, 23, 59, 59, 999);
}

function payrunName(year: number, month: number): string {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${names[month - 1]} ${year} Payrun`;
}

// ──────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  console.log('\n🌱 PeoplePay360 — Full Demo Seed\n');

  // ── 1. SYSTEM USERS ──────────────────────────

  console.log('👤 Seeding system users...');
  const systemUsers = [
    { email: 'admin@peoplepay360.com', role: Role.ADMIN },
    { email: 'hr.manager@peoplepay360.com', role: Role.HR_MANAGER },
    { email: 'hr.payroll.user@peoplepay360.com', role: Role.HR_PAYROLL_USER },
    { email: 'hr.payroll.manager@peoplepay360.com', role: Role.HR_PAYROLL_MANAGER },
    { email: 'employee@peoplepay360.com', role: Role.EMPLOYEE },
  ];

  for (const u of systemUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role },
      create: { email: u.email, passwordHash, role: u.role },
    });
  }
  console.log(`  ✅ ${systemUsers.length} system users`);

  // ── 2. WORKING SCHEDULE ──────────────────────

  console.log('🗓️  Seeding working schedule...');
  let schedule = await prisma.workingSchedule.findFirst({
    where: { name: 'Standard 5×8' },
  });

  if (!schedule) {
    schedule = await prisma.workingSchedule.create({
      data: {
        name: 'Standard 5×8',
        weeklyHours: 40,
        lines: {
          create: [
            { dayOfWeek: 'MONDAY',    hourFrom: 9, hourTo: 18 },
            { dayOfWeek: 'TUESDAY',   hourFrom: 9, hourTo: 18 },
            { dayOfWeek: 'WEDNESDAY', hourFrom: 9, hourTo: 18 },
            { dayOfWeek: 'THURSDAY',  hourFrom: 9, hourTo: 18 },
            { dayOfWeek: 'FRIDAY',    hourFrom: 9, hourTo: 18 },
          ],
        },
      },
    });
  }
  console.log(`  ✅ Schedule: ${schedule.name} (${schedule.weeklyHours}h/week)`);

  // ── 3. SALARY STRUCTURE ──────────────────────

  console.log('💰 Seeding salary structure...');
  let structure = await prisma.salaryStructure.findFirst({
    where: { name: 'Standard India CTC' },
  });

  if (!structure) {
    structure = await prisma.salaryStructure.create({
      data: {
        name: 'Standard India CTC',
        isActive: true,
        rules: {
          create: [
            {
              name: 'Basic Salary',
              code: 'BASIC',
              category: RuleCategory.BASIC,
              sequence: 10,
              computation: ComputationType.FIXED,
              amount: 0, // overridden by contract wage
            },
            {
              name: 'HRA (40% of Basic)',
              code: 'HRA',
              category: RuleCategory.ALLOWANCE,
              sequence: 20,
              computation: ComputationType.PERCENTAGE,
              percentage: 40,
              percentageBaseCode: 'BASIC',
            },
            {
              name: 'Gross Salary',
              code: 'GROSS',
              category: RuleCategory.GROSS,
              sequence: 30,
              computation: ComputationType.FORMULA,
              formula: 'BASIC + HRA',
            },
            {
              name: 'Provident Fund (12% of Basic)',
              code: 'PF',
              category: RuleCategory.DEDUCTION,
              sequence: 40,
              computation: ComputationType.PERCENTAGE,
              percentage: 12,
              percentageBaseCode: 'BASIC',
            },
            {
              name: 'Professional Tax',
              code: 'PT',
              category: RuleCategory.DEDUCTION,
              sequence: 50,
              computation: ComputationType.FIXED,
              amount: 200,
            },
            {
              name: 'Net Salary',
              code: 'NET',
              category: RuleCategory.NET,
              sequence: 60,
              computation: ComputationType.FORMULA,
              formula: 'GROSS - PF - PT',
            },
          ],
        },
      },
    });
  }
  console.log(`  ✅ Structure: ${structure.name}`);

  // ── 4. EMPLOYEES ──────────────────────────────

  console.log('👥 Seeding employees...');

  const depts = [
    { name: 'Engineering', positions: ['Senior Engineer', 'Junior Engineer', 'Tech Lead', 'DevOps Engineer'] },
    { name: 'Sales', positions: ['Sales Executive', 'Account Manager', 'Sales Lead', 'Business Dev Manager'] },
    { name: 'Operations', positions: ['Operations Analyst', 'Process Manager', 'Team Lead', 'Support Specialist'] },
  ];

  const firstNames = [
    'Priya', 'Rahul', 'Sneha', 'Amit', 'Kavya', 'Rohan', 'Ananya', 'Vikram',
    'Deepika', 'Sanjay', 'Nisha', 'Arjun', 'Meera', 'Karthik', 'Pooja', 'Varun',
    'Riya', 'Aditya', 'Shweta', 'Nikhil', 'Tanvi', 'Mohit', 'Ishaan', 'Divya',
  ];

  const lastNames = [
    'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Mehta', 'Joshi', 'Verma',
    'Reddy', 'Nair', 'Iyer', 'Bose', 'Kapoor', 'Malhotra', 'Chopra', 'Shah',
    'Rao', 'Mishra', 'Agarwal', 'Tiwari', 'Pandey', 'Saxena', 'Trivedi', 'Das',
  ];

  const wages = [
    55000, 42000, 78000, 48000, 65000, 52000, 45000, 88000,   // Engineering
    48000, 55000, 62000, 72000, 44000, 58000, 50000, 67000,   // Sales
    40000, 46000, 53000, 61000, 43000, 57000, 49000, 75000,   // Operations
  ];

  const banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank'];
  const ifscPrefixes = ['HDFC0001', 'ICIC0002', 'SBIN0003', 'UTIB0004', 'KKBK0005'];

  const employees: Array<{ id: string; idx: number }> = [];

  for (let i = 0; i < 24; i++) {
    const deptIdx = Math.floor(i / 8);
    const dept = depts[deptIdx];
    const posIdx = i % 4;
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@peoplepay360.com`;
    const bankIdx = i % 5;

    const emp = await prisma.employee.upsert({
      where: { email },
      update: {},
      create: {
        firstName,
        lastName,
        email,
        phone: `98${String(10000000 + i * 1234567).slice(0, 8)}`,
        department: dept.name,
        jobPosition: dept.positions[posIdx],
        status: EmployeeStatus.ACTIVE,
        scheduleId: schedule.id,
        bankName: banks[bankIdx],
        bankAccount: `${100000000 + i * 111111}`,
        bankIFSC: `${ifscPrefixes[bankIdx]}${String(i + 1).padStart(3, '0')}`,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        dateOfBirth: new Date(1985 + (i % 15), i % 12, (i % 28) + 1),
      },
    });

    employees.push({ id: emp.id, idx: i });
  }
  console.log(`  ✅ ${employees.length} employees across ${depts.length} departments`);

  // ── 5. CONTRACTS ──────────────────────────────

  console.log('📋 Seeding contracts...');
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  for (const { id: employeeId, idx } of employees) {
    const existing = await prisma.contract.findFirst({
      where: { employeeId, status: ContractStatus.ACTIVE },
    });
    if (existing) continue;

    await prisma.contract.create({
      data: {
        employeeId,
        name: `Employment Contract ${firstNames[idx]} ${lastNames[idx]}`,
        startDate: sixMonthsAgo,
        endDate: new Date(now.getFullYear() + 1, now.getMonth(), 0), // 1yr+ from now
        wage: wages[idx],
        department: depts[Math.floor(idx / 8)].name,
        jobPosition: depts[Math.floor(idx / 8)].positions[idx % 4],
        status: ContractStatus.ACTIVE,
        salaryStructureId: structure.id,
      },
    });
  }
  console.log(`  ✅ ${employees.length} active contracts`);

  // ── 6. TIME-OFF TYPE + ALLOCATIONS ───────────

  console.log('🏖️  Seeding time-off types and allocations...');
  let leaveType = await prisma.timeOffType.findFirst({ where: { name: 'Annual Leave' } });
  if (!leaveType) {
    leaveType = await prisma.timeOffType.create({
      data: {
        name: 'Annual Leave',
        unit: TimeOffUnit.DAYS,
        approvalMode: ApprovalMode.HR_APPROVAL,
        allowNegative: false,
      },
    });
  }

  for (const { id: employeeId } of employees) {
    const existing = await prisma.allocation.findFirst({
      where: { employeeId, typeId: leaveType.id, status: AllocationStatus.APPROVED },
    });
    if (existing) continue;

    await prisma.allocation.create({
      data: {
        employeeId,
        typeId: leaveType.id,
        numberOfDays: 21,
        remaining: 19,
        status: AllocationStatus.APPROVED,
        notes: 'Annual leave allocation — demo seed',
      },
    });
  }
  console.log(`  ✅ Annual leave allocations for all employees`);

  // ── 7. LEAVE REQUESTS ────────────────────────

  console.log('📅 Seeding leave requests...');
  // Give roughly every 3rd employee 2 days of approved leave across the period
  let leaveCount = 0;
  for (let i = 0; i < employees.length; i += 3) {
    const { id: employeeId } = employees[i];
    const leaveMonth = new Date(now.getFullYear(), now.getMonth() - 2, 10);
    const existing = await prisma.leaveRequest.findFirst({ where: { employeeId } });
    if (existing) continue;

    await prisma.leaveRequest.create({
      data: {
        employeeId,
        typeId: leaveType.id,
        dateFrom: leaveMonth,
        dateTo: new Date(leaveMonth.getFullYear(), leaveMonth.getMonth(), leaveMonth.getDate() + 1),
        duration: 2,
        status: LeaveStatus.APPROVED,
        reason: 'Personal work — demo seed',
        approvedAt: new Date(leaveMonth.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    });
    leaveCount++;
  }
  console.log(`  ✅ ${leaveCount} approved leave requests`);

  // ── 8. ATTENDANCE RECORDS ────────────────────

  console.log('⏱️  Seeding 6 months of attendance (this takes a moment)...');
  const attendanceStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const attendanceEnd = new Date(now.getFullYear(), now.getMonth() - 1, 28); // stop before current month
  const days = workdays(attendanceStart, attendanceEnd);

  let attCount = 0;
  for (const { id: employeeId, idx } of employees) {
    for (let di = 0; di < days.length; di++) {
      const day = days[di];

      // Check if already seeded
      const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
      const existing = await prisma.attendance.findFirst({
        where: { employeeId, checkIn: { gte: dayStart, lte: dayEnd } },
      });
      if (existing) continue;

      // ~5% absent days, ~5% partial (missing checkout)
      const roll = (idx + di) % 20;
      if (roll === 0) {
        // ABSENT — record with just a status marker (no check-in/out)
        const ci = checkInTime(day, idx + di);
        await prisma.attendance.create({
          data: {
            employeeId,
            checkIn: ci,
            status: AttendanceStatus.ABSENT,
          },
        });
      } else if (roll === 1) {
        // PARTIAL — checked in but no checkout
        const ci = checkInTime(day, idx + di);
        await prisma.attendance.create({
          data: {
            employeeId,
            checkIn: ci,
            workedHours: null,
            status: AttendanceStatus.PARTIAL,
          },
        });
      } else {
        // PRESENT — full check-in/checkout
        const ci = checkInTime(day, idx + di);
        const co = checkOutTime(ci, idx + di);
        const wh = (co.getTime() - ci.getTime()) / 3_600_000;
        await prisma.attendance.create({
          data: {
            employeeId,
            checkIn: ci,
            checkOut: co,
            workedHours: Math.round(wh * 100) / 100,
            status: AttendanceStatus.PRESENT,
          },
        });
      }
      attCount++;
    }
  }
  console.log(`  ✅ ${attCount} attendance records`);

  // ── 9. PAYRUNS + PAYSLIPS (3 completed) ──────

  console.log('🧾 Seeding 3 completed PAID payruns...');

  // Fetch ordered salary rules for computation
  const rules = await prisma.salaryRule.findMany({
    where: { structureId: structure.id },
    orderBy: { sequence: 'asc' },
  });

  // Fetch all employee contracts for the period
  const contracts = await prisma.contract.findMany({
    where: {
      status: ContractStatus.ACTIVE,
      salaryStructureId: structure.id,
    },
    include: { employee: true },
  });

  for (let monthOffset = 3; monthOffset >= 1; monthOffset--) {
    const year = now.getMonth() + 1 - monthOffset < 1
      ? now.getFullYear() - 1
      : now.getFullYear();
    const month = ((now.getMonth() + 1 - monthOffset + 12) % 12) || 12;

    const pStart = monthStart(year, month);
    const pEnd = monthEnd(year, month);
    const pName = payrunName(year, month);

    // Skip if already seeded
    const existingPayrun = await prisma.payrun.findFirst({ where: { name: pName } });
    if (existingPayrun) {
      console.log(`  ⏭️  ${pName} already exists, skipping`);
      continue;
    }

    // Create payrun
    const payrun = await prisma.payrun.create({
      data: {
        name: pName,
        structureId: structure.id,
        periodStart: pStart,
        periodEnd: pEnd,
        status: PayrunStatus.PAID,
        notes: 'Demo seed payrun',
      },
    });

    let payslipCount = 0;

    for (const contract of contracts) {
      const wage = Number(contract.wage);

      // Compute salary lines
      const computed: Record<string, number> = {};
      const lineData: Array<{
        ruleId: string;
        ruleName: string;
        category: RuleCategory;
        sequence: number;
        amount: number;
      }> = [];

      for (const rule of rules) {
        let amount = 0;

        if (rule.computation === ComputationType.FIXED) {
          // BASIC rule uses contract wage; others use their fixed amount
          amount = rule.code === 'BASIC' ? wage : Number(rule.amount ?? 0);
        } else if (rule.computation === ComputationType.PERCENTAGE) {
          const base = computed[rule.percentageBaseCode ?? ''] ?? 0;
          amount = (base * Number(rule.percentage ?? 0)) / 100;
        } else if (rule.computation === ComputationType.FORMULA) {
          // Simple arithmetic evaluation using prior computed codes as vars
          try {
            const safeVars = Object.entries(computed)
              .map(([k, v]) => `const ${k} = ${v};`)
              .join(' ');
            // eslint-disable-next-line no-new-func
            amount = new Function(`${safeVars} return (${rule.formula});`)() as number;
          } catch {
            amount = 0;
          }
        }

        amount = Math.round(amount * 100) / 100;
        computed[rule.code] = amount;

        lineData.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          sequence: rule.sequence,
          amount,
        });
      }

      const netAmount = computed['NET'] ?? computed['GROSS'] ?? wage;

      // Check no duplicate payslip
      const existingSlip = await prisma.payslip.findFirst({
        where: { payrunId: payrun.id, employeeId: contract.employeeId },
      });
      if (existingSlip) continue;

      await prisma.payslip.create({
        data: {
          payrunId: payrun.id,
          employeeId: contract.employeeId,
          contractId: contract.id,
          status: PayslipStatus.PAID,
          workedDays: 22,
          netAmount,
          lines: {
            create: lineData,
          },
        },
      });
      payslipCount++;
    }

    console.log(`  ✅ Payrun "${pName}" — ${payslipCount} payslips (PAID)`);
  }

  // ── SUMMARY ──────────────────────────────────

  const [empCount, contractCount, attCountFinal, payrunCount, payslipCount] =
    await Promise.all([
      prisma.employee.count(),
      prisma.contract.count({ where: { status: ContractStatus.ACTIVE } }),
      prisma.attendance.count(),
      prisma.payrun.count({ where: { status: PayrunStatus.PAID } }),
      prisma.payslip.count({ where: { status: PayslipStatus.PAID } }),
    ]);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Seed complete!
    Employees       : ${empCount}
    Active contracts: ${contractCount}
    Attendance rows : ${attCountFinal}
    Completed payruns: ${payrunCount}
    Paid payslips   : ${payslipCount}
    
🔑  All accounts share password: ${DEFAULT_PASSWORD}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

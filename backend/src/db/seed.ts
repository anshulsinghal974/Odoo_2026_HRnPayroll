import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────
// Seed data: one test user per role
// ──────────────────────────────────────────────

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Password123!';

interface SeedUser {
  email: string;
  role: Role;
}

const seedUsers: SeedUser[] = [
  { email: 'admin@peoplepay360.com', role: 'ADMIN' },
  { email: 'hr.manager@peoplepay360.com', role: 'HR_MANAGER' },
  { email: 'hr.payroll.user@peoplepay360.com', role: 'HR_PAYROLL_USER' },
  { email: 'hr.payroll.manager@peoplepay360.com', role: 'HR_PAYROLL_MANAGER' },
  { email: 'employee@peoplepay360.com', role: 'EMPLOYEE' },
];

async function main() {
  console.log('🌱 Seeding test users...\n');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const { email, role } of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role,
      },
      create: {
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log(`  ✅ ${user.role.padEnd(20)} → ${user.email} (${user.id})`);
  }

  console.log(`\n🔑 All users share password: ${DEFAULT_PASSWORD}`);
  console.log('🌱 Seed complete!\n');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

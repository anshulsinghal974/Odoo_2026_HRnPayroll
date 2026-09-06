import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db/prisma';
import authRoutes from './modules/auth/auth.routes';
import employeeRoutes from './modules/employees/employee.routes';
import contractRoutes from './modules/contracts/contract.routes';
import scheduleRoutes from './modules/schedules/schedule.routes';
import timeoffRoutes from './modules/timeoff/timeoff.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import salaryRoutes from './modules/payroll/salary.routes';
import payrunRoutes from './modules/payrun/payrun.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import mlRoutes from './modules/ml/ml.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ──────────────────────────────────────────────
// Global middleware
// ──────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

// Health check (public)
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Basic health check including DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Module routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api', timeoffRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api', salaryRoutes);
app.use('/api', payrunRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', mlRoutes);

// ──────────────────────────────────────────────
// Global error handler
// ──────────────────────────────────────────────

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

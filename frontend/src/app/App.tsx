// App Router — PeoplePay360
// All authenticated routes are wrapped by ProtectedRoute + AppLayout.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from './AppLayout';
import { LoginPage } from '../features/auth';
import { EmployeeList } from '../features/employees';
import { ContractsPage } from '../features/contracts';
import {
  AttendancePlaceholder,
  TimeOffPlaceholder,
  PayrollPlaceholder,
  ReportsPlaceholder,
} from '../features/placeholders/Placeholders';
import { PlaygroundPage } from '../features/playground/PlaygroundPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ─────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />

        {/* ── Authenticated + Layout-wrapped Routes ─────────────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/attendance" element={<AttendancePlaceholder />} />
          <Route path="/time-off" element={<TimeOffPlaceholder />} />
          <Route path="/payroll" element={<PayrollPlaceholder />} />
          <Route path="/reports" element={<ReportsPlaceholder />} />
        </Route>

        {/* ── Catch-all ─────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

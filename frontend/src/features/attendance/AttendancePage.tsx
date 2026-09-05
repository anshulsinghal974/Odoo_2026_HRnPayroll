// Attendance feature — Page wrapper
// Renders the heading + AttendanceList with optional employee filtering via URL params.

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AttendanceList } from './AttendanceList';

export const AttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId') || undefined;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Attendance</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {employeeId
            ? 'Viewing attendance for a specific employee'
            : 'Global attendance records · Check-in / Check-out tracking'}
        </p>
      </div>

      <AttendanceList employeeId={employeeId} />
    </div>
  );
};

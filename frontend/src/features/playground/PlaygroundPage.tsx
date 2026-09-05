import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Table,
  type Column,
  Modal,
  Spinner,
  EmptyState,
} from '../../components';

interface EmployeeSample {
  id: string;
  name: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  wage: number;
}

const sampleEmployees: EmployeeSample[] = [
  {
    id: 'EMP-001',
    name: 'Sarah Jenkins',
    department: 'Engineering',
    role: 'Lead Architect',
    status: 'Active',
    wage: 9500,
  },
  {
    id: 'EMP-002',
    name: 'Marcus Chen',
    department: 'Payroll Operations',
    role: 'Payroll Manager',
    status: 'Active',
    wage: 8200,
  },
  {
    id: 'EMP-003',
    name: 'Elena Rostova',
    department: 'Human Resources',
    role: 'HR Business Partner',
    status: 'On Leave',
    wage: 7100,
  },
  {
    id: 'EMP-004',
    name: 'Devon Vance',
    department: 'Product',
    role: 'Senior Product Manager',
    status: 'Active',
    wage: 8800,
  },
  {
    id: 'EMP-005',
    name: 'Aisha Patel',
    department: 'Engineering',
    role: 'Frontend Engineer',
    status: 'Terminated',
    wage: 6800,
  },
];

export const PlaygroundPage: React.FC = () => {
  // Interactive States
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSample | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [showEmptyTable, setShowEmptyTable] = useState(false);

  // Status to badge variant mapper
  const getStatusBadge = (status: EmployeeSample['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success" dot>{status}</Badge>;
      case 'On Leave':
        return <Badge variant="warning" dot>{status}</Badge>;
      case 'Terminated':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Table Columns Definition
  const columns: Column<EmployeeSample>[] = [
    {
      key: 'name',
      header: 'Employee Name',
      sortable: true,
      accessor: (row) => (
        <div>
          <span className="font-semibold text-neutral-900">{row.name}</span>
          <span className="block text-xs text-neutral-400">{row.id}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      accessor: 'department',
    },
    {
      key: 'role',
      header: 'Position',
      accessor: 'role',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      key: 'wage',
      header: 'Monthly Wage',
      sortable: true,
      align: 'right',
      accessor: (row) => (
        <span className="font-mono font-medium text-neutral-900">
          ${row.wage.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-neutral-900 text-lg tracking-tight">PeoplePay360</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                Design System v1.0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="neutral">FE-01 · Design System</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBtnLoading(!isBtnLoading)}
            >
              Toggle Loading: {isBtnLoading ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Component Primitives Playground
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Handcrafted with Tailwind CSS tokens. Zero external component libraries.
          </p>
        </div>

        {/* 1. BUTTONS */}
        <Card>
          <CardHeader bordered>
            <div>
              <CardTitle>1. Button Primitive</CardTitle>
              <CardDescription>
                Supports variants (primary, secondary, danger, outline, ghost), sizes (sm, md, lg), and loading states.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsBtnLoading(!isBtnLoading)}
            >
              Toggle Loading
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold uppercase text-neutral-400 mb-3 tracking-wider">
                Variants (Default Size: md)
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" isLoading={isBtnLoading}>
                  Primary Action
                </Button>
                <Button variant="secondary" isLoading={isBtnLoading}>
                  Secondary Action
                </Button>
                <Button variant="danger" isLoading={isBtnLoading}>
                  Danger Action
                </Button>
                <Button variant="outline" isLoading={isBtnLoading}>
                  Outline Action
                </Button>
                <Button variant="ghost" isLoading={isBtnLoading}>
                  Ghost Action
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-semibold uppercase text-neutral-400 mb-3 tracking-wider">
                Sizes &amp; Icons
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  leftIcon={
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Small with Icon
                </Button>
                <Button
                  size="md"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  }
                >
                  Medium Export
                </Button>
                <Button
                  size="lg"
                  rightIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  }
                >
                  Large Run Payrun
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. BADGES */}
        <Card>
          <CardHeader bordered>
            <div>
              <CardTitle>2. Badge Primitive</CardTitle>
              <CardDescription>
                Categorical status indicators with subtle borders, dot indicators, and sizing.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-neutral-400 mb-3 tracking-wider">
                Status Variants with Pulse Dot
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="primary" dot>Primary / Processing</Badge>
                <Badge variant="success" dot>Success / Active</Badge>
                <Badge variant="warning" dot>Warning / Review Required</Badge>
                <Badge variant="danger" dot>Danger / Terminated</Badge>
                <Badge variant="neutral" dot>Neutral / Draft</Badge>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-semibold uppercase text-neutral-400 mb-3 tracking-wider">
                Sizes &amp; Tags
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <Badge size="sm" variant="success">sm pill</Badge>
                <Badge size="md" variant="success">md pill</Badge>
                <Badge size="sm" variant="warning" pill={false}>sm tag</Badge>
                <Badge size="md" variant="danger" pill={false}>md tag</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. SPINNERS */}
        <Card>
          <CardHeader bordered>
            <div>
              <CardTitle>3. Spinner Primitive</CardTitle>
              <CardDescription>
                Smooth CSS-animated SVG spinners across standard token sizes and theme colors.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="xs" color="primary" />
                <span className="text-xs text-neutral-400">xs (14px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="sm" color="neutral" />
                <span className="text-xs text-neutral-400">sm (16px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="md" color="success" />
                <span className="text-xs text-neutral-400">md (24px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" color="warning" />
                <span className="text-xs text-neutral-400">lg (32px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="xl" color="danger" />
                <span className="text-xs text-neutral-400">xl (40px)</span>
              </div>
              <div className="flex items-center gap-2 pl-4 border-l border-neutral-200">
                <Spinner size="sm" color="primary" label="Synchronizing attendance..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. CARDS */}
        <div>
          <h2 className="text-lg font-bold text-neutral-900 mb-3 tracking-tight">
            4. Card Primitive &amp; Layout Variations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card hoverable>
              <CardHeader>
                <div>
                  <CardTitle>Active Contracts</CardTitle>
                  <CardDescription>Period 2026-Q1</CardDescription>
                </div>
                <Badge variant="success" dot>Live</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                  142
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  +12 added this month across 4 departments
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-neutral-500">Auto-resolved</span>
                <Button size="sm" variant="ghost">View Details &rarr;</Button>
              </CardFooter>
            </Card>

            <Card hoverable>
              <CardHeader>
                <div>
                  <CardTitle>Net Salary Volume</CardTitle>
                  <CardDescription>Payrun #PR-2026-03</CardDescription>
                </div>
                <Badge variant="primary">Validated</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-primary-600 tracking-tight">
                  $482,950
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Average: $3,401 per employee
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-neutral-500">Ready to execute</span>
                <Button size="sm" variant="ghost">Print PDF &rarr;</Button>
              </CardFooter>
            </Card>

            <Card hoverable>
              <CardHeader>
                <div>
                  <CardTitle>Attendance Health</CardTitle>
                  <CardDescription>Calculated readiness</CardDescription>
                </div>
                <Badge variant="warning" dot>Audit Alert</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-warning-600 tracking-tight">
                  94.2%
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  3 missing checkouts require manual correction
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-neutral-500">Audit trail enabled</span>
                <Button size="sm" variant="ghost">Resolve &rarr;</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* 5. MODAL */}
        <Card>
          <CardHeader bordered>
            <div>
              <CardTitle>5. Modal Primitive</CardTitle>
              <CardDescription>
                Accessible, animated backdrop blur overlay with keyboard Esc &amp; outside click closing.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setModalSize('sm');
                  setIsModalOpen(true);
                }}
              >
                Open Small
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setModalSize('md');
                  setIsModalOpen(true);
                }}
              >
                Open Modal (md)
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setModalSize('lg');
                  setIsModalOpen(true);
                }}
              >
                Open Large
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              Click any of the buttons above to trigger the modal dialog in different sizes with interactive forms and action buttons.
            </p>
          </CardContent>
        </Card>

        {/* 6. GENERIC TABLE */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                6. Generic Typed Table Primitive (`Table&lt;T&gt;`)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Sortable column headers, custom cells, loading state toggle, and empty state fallback.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setTableLoading(!tableLoading)}
              >
                Toggle Loading: {tableLoading ? 'ON' : 'OFF'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEmptyTable(!showEmptyTable)}
              >
                Toggle Empty State: {showEmptyTable ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>

          <Table<EmployeeSample>
            data={showEmptyTable ? [] : sampleEmployees}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={tableLoading}
            emptyTitle="No Employees Available"
            emptyDescription="There are no active employee records matching your current filter criteria."
            emptyAction={
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowEmptyTable(false)}
              >
                Reset Filter
              </Button>
            }
            onRowClick={(emp) => setSelectedEmployee(emp)}
          />

          {selectedEmployee && (
            <div className="p-4 rounded-xl bg-primary-50/70 border border-primary-200/80 flex items-center justify-between text-xs text-primary-900">
              <div>
                <span className="font-semibold">Selected Row:</span> {selectedEmployee.name} ({selectedEmployee.role} — {selectedEmployee.department})
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-primary-700 hover:bg-primary-100"
                onClick={() => setSelectedEmployee(null)}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>

        {/* 7. EMPTY STATE PREVIEW */}
        <div>
          <h2 className="text-lg font-bold text-neutral-900 mb-3 tracking-tight">
            7. EmptyState Standalone Primitive
          </h2>
          <EmptyState
            title="No Payruns Scheduled"
            description="Create your first payrun to compute salary structures, calculate deduction rules, and validate payslips."
            action={
              <Button
                variant="primary"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Start Payrun Wizard
              </Button>
            }
          />
        </div>
      </main>

      {/* Interactive Modal Instance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size={modalSize}
        title="Confirm Payroll Finalization"
        description="Payrun #PR-2026-03 · March 2026 Cycle"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('Payrun validated successfully in playground demo!');
                setIsModalOpen(false);
              }}
            >
              Validate &amp; Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-warning-50 border border-warning-200/80 text-warning-800 text-xs flex items-start gap-2.5">
            <svg className="w-4 h-4 shrink-0 text-warning-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-semibold">Warning Engine Alert:</span> 1 employee has a missing bank IBAN number. Validating this payrun will flag payslip distribution for manual review.
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700">
              Payrun Notes (Optional)
            </label>
            <textarea
              rows={3}
              className="w-full text-xs rounded-xl border border-neutral-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Add audit notes for payroll manager review..."
              defaultValue="Standard monthly cycle. Overtime hours reconciled."
            />
          </div>

          <div className="text-xs text-neutral-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700 font-mono">Esc</kbd> or click outside to dismiss.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlaygroundPage;

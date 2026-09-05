import type { Employee, EmployeeStatus } from '../../types';
import { Badge, Card, CardContent } from '../../components';
import { Mail, Phone, Building2 } from 'lucide-react';

interface EmployeeKanbanProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
  onStatusChange?: (empId: string, newStatus: EmployeeStatus) => void;
}

const COLUMNS: { status: EmployeeStatus; title: string; badgeVariant: 'success' | 'warning' | 'danger' }[] = [
  { status: 'Active', title: 'Active Employees', badgeVariant: 'success' },
  { status: 'On Leave', title: 'On Leave', badgeVariant: 'warning' },
  { status: 'Terminated', title: 'Terminated', badgeVariant: 'danger' },
];

export const EmployeeKanban: React.FC<EmployeeKanbanProps> = ({
  employees,
  onSelectEmployee,
  onStatusChange,
}) => {
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: EmployeeStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && onStatusChange) {
      onStatusChange(id, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map((col) => {
        const columnEmployees = employees.filter((emp) => emp.status === col.status);

        return (
          <div
            key={col.status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.status)}
            className="bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/60 min-h-[450px] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-800 text-sm">{col.title}</h3>
                <Badge variant={col.badgeVariant}>{columnEmployees.length}</Badge>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnEmployees.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center text-xs text-neutral-400">
                  Drop items here
                </div>
              ) : (
                columnEmployees.map((emp) => (
                  <Card
                    key={emp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, emp.id)}
                    onClick={() => onSelectEmployee(emp)}
                    className="cursor-pointer hover:shadow-md transition-shadow border border-neutral-200 bg-white"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                            {emp.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-900 text-sm leading-tight hover:text-primary-600">
                              {emp.name}
                            </h4>
                            <p className="text-xs text-neutral-500 font-medium">{emp.jobPosition}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{emp.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="truncate">{emp.workEmail}</span>
                        </div>
                        {emp.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Move controls for accessibility/keyboard/mobile */}
                      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Drag to move status</span>
                        <select
                          value={emp.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (onStatusChange) {
                              onStatusChange(emp.id, e.target.value as EmployeeStatus);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-neutral-100 border border-neutral-200 rounded px-1.5 py-0.5 text-xs text-neutral-700 font-medium focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

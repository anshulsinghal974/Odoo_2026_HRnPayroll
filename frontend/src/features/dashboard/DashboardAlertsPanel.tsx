import React from 'react';
import { Card, Badge } from '../../components';
import type { DashboardAlert } from '../../types';

interface DashboardAlertsPanelProps {
  alerts?: DashboardAlert[];
}

export const DashboardAlertsPanel: React.FC<DashboardAlertsPanelProps> = ({ alerts = [] }) => {
  return (
    <Card className="p-6 bg-white shadow-sm border border-neutral-200 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Payroll System Alerts & Raw Warnings</h3>
            <p className="text-xs text-neutral-500">Live operational alerts, validation flags, and compliance review items</p>
          </div>
        </div>
        <Badge variant="warning" size="sm">
          {alerts.length} Warnings Flagged
        </Badge>
      </div>

      {alerts.length === 0 ? (
        <div className="py-6 text-center text-xs text-neutral-500">
          ✨ No active payroll warnings or compliance alerts detected.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isDanger = alert.type === 'danger';
            const isWarning = alert.type === 'warning';
            const bgClasses = isDanger
              ? 'bg-rose-50/60 border-rose-200 text-rose-900'
              : isWarning
              ? 'bg-amber-50/60 border-amber-200 text-amber-900'
              : 'bg-blue-50/60 border-blue-200 text-blue-900';

            const badgeVariant = isDanger ? 'danger' : isWarning ? 'warning' : 'primary';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${bgClasses} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">
                    {isDanger ? '🚨' : isWarning ? '⚠️' : 'ℹ️'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">{alert.title}</h4>
                      {alert.department && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-neutral-200 text-neutral-700">
                          {alert.department}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] text-neutral-500 font-medium">{alert.timestamp}</span>
                  <Badge variant={badgeVariant} size="sm">
                    {alert.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

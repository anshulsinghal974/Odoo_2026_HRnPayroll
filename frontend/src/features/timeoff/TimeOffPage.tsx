import React, { useState } from 'react';
import { RequestList } from './RequestList';
import { AllocationList } from './AllocationList';
import { TimeOffTypeConfig } from './TimeOffTypeConfig';
import { Clock, Award, Settings } from 'lucide-react';

export const TimeOffPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'allocations' | 'config'>('requests');

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Time Off Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage leave balances, request approvals, employee quota allocations, and leave rules
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'requests'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-primary-600" />
            <span>Time Off Requests</span>
          </button>

          <button
            onClick={() => setActiveTab('allocations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'allocations'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Allocations</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'config'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-neutral-600" />
            <span>Leave Types</span>
          </button>
        </div>
      </div>

      {activeTab === 'requests' && <RequestList />}
      {activeTab === 'allocations' && <AllocationList />}
      {activeTab === 'config' && <TimeOffTypeConfig />}
    </div>
  );
};

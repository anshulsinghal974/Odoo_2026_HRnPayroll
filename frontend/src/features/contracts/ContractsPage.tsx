import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContractList } from './ContractList';
import { ScheduleForm } from '../schedules/ScheduleForm';
import { getSchedules, createSchedule } from '../../api/schedules';
import type { CreateScheduleInput, WorkingSchedule } from '../../types';
import { Button, Card, Spinner, Badge } from '../../components';
import { Clock, Plus, Calendar, FileText } from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'contracts' | 'schedules'>('contracts');
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkingSchedule | null>(null);

  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['schedules'],
    queryFn: getSchedules,
  });

  const createScheduleMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setIsCreatingSchedule(false);
      setSelectedSchedule(null);
    },
  });

  const handleScheduleSubmit = (data: CreateScheduleInput) => {
    createScheduleMutation.mutate(data);
  };

  if (isCreatingSchedule) {
    return (
      <ScheduleForm
        initialValues={selectedSchedule || undefined}
        onSubmit={handleScheduleSubmit}
        isLoading={createScheduleMutation.isPending}
        onCancel={() => {
          setIsCreatingSchedule(false);
          setSelectedSchedule(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Contracts & Working Schedules</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage active contracts, wage rates, and employee weekly working schedule templates
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'contracts'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-4 h-4 text-primary-600" />
            <span>Contracts</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'schedules'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Working Schedules</span>
          </button>
        </div>
      </div>

      {activeTab === 'contracts' ? (
        <ContractList />
      ) : (
        /* Working Schedules Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Schedule Templates</h2>
              <p className="text-xs text-neutral-500">
                Weekly shift grids used to calculate payroll context and attendance thresholds
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedSchedule(null);
                setIsCreatingSchedule(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Schedule Template
            </Button>
          </div>

          {isLoadingSchedules ? (
            <div className="p-8 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schedules.map((sch) => (
                <Card key={sch.id} hoverable className="border border-neutral-200">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary-600" /> {sch.name}
                        </h3>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">ID: {sch.id}</p>
                      </div>
                      <Badge variant="success" size="md">
                        {sch.totalWeeklyHours} hrs/week
                      </Badge>
                    </div>

                    {/* Summary list of working days */}
                    <div className="grid grid-cols-7 gap-1 pt-2 border-t border-neutral-100 text-center">
                      {sch.days.map((d) => (
                        <div
                          key={d.day}
                          className={`p-1.5 rounded text-[10px] font-semibold ${
                            d.isWorkDay
                              ? 'bg-primary-50 text-primary-700 border border-primary-200/60'
                              : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          <span className="block uppercase text-[9px] font-bold">
                            {d.day.substring(0, 3)}
                          </span>
                          <span className="font-mono mt-0.5 block">
                            {d.isWorkDay ? `${d.dailyHours}h` : 'Off'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSchedule(sch);
                          setIsCreatingSchedule(true);
                        }}
                      >
                        Edit Grid Pattern
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

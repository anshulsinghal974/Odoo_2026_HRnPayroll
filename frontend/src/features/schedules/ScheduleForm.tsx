import React, { useState, useMemo } from 'react';
import type { ScheduleDay, WorkingSchedule, CreateScheduleInput } from '../../types';
import { DEFAULT_WEEKLY_DAYS } from '../../api/schedules';
import { Button, Card, CardContent, CardHeader, Badge } from '../../components';
import { Clock, Calendar, Save, ArrowLeft } from 'lucide-react';

interface ScheduleFormProps {
  initialValues?: WorkingSchedule;
  onSubmit: (data: CreateScheduleInput) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

function calculateDailyHours(start: string, end: string, breakHours: number, isWorkDay: boolean): number {
  if (!isWorkDay || !start || !end) return 0;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  if (isNaN(startH) || isNaN(endH)) return 0;

  const startTotalMinutes = startH * 60 + (startM || 0);
  const endTotalMinutes = endH * 60 + (endM || 0);
  const diffMinutes = endTotalMinutes - startTotalMinutes;

  if (diffMinutes <= 0) return 0;
  const grossHours = diffMinutes / 60;
  const netHours = Math.max(0, grossHours - breakHours);
  return Number(netHours.toFixed(2));
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const [name, setName] = useState(initialValues?.name || 'Standard 40h/week');
  const [days, setDays] = useState<ScheduleDay[]>(
    initialValues?.days || DEFAULT_WEEKLY_DAYS
  );

  // Recalculate total weekly hours whenever any day parameter changes
  const totalWeeklyHours = useMemo(() => {
    return days.reduce((sum, day) => {
      const daily = calculateDailyHours(day.startTime, day.endTime, day.breakHours, day.isWorkDay);
      return sum + daily;
    }, 0);
  }, [days]);

  const handleDayChange = (
    index: number,
    field: keyof ScheduleDay,
    value: string | number | boolean
  ) => {
    setDays((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };
      target.dailyHours = calculateDailyHours(
        target.startTime,
        target.endTime,
        target.breakHours,
        target.isWorkDay
      );
      updated[index] = target;
      return updated;
    });
  };

  const handleQuickPreset = (preset: '40h' | '35h' | 'partTime') => {
    if (preset === '40h') {
      setName('Standard 40h/week (8h x 5 days)');
      setDays(
        DEFAULT_WEEKLY_DAYS.map((d) =>
          d.isWorkDay
            ? { ...d, startTime: '08:00', endTime: '17:00', breakHours: 1, dailyHours: 8 }
            : d
        )
      );
    } else if (preset === '35h') {
      setName('Standard 35h/week (7h x 5 days)');
      setDays(
        DEFAULT_WEEKLY_DAYS.map((d) =>
          d.isWorkDay
            ? { ...d, startTime: '09:00', endTime: '17:00', breakHours: 1, dailyHours: 7 }
            : d
        )
      );
    } else if (preset === 'partTime') {
      setName('Part-Time 20h/week (4h x 5 days)');
      setDays(
        DEFAULT_WEEKLY_DAYS.map((d) =>
          d.isWorkDay
            ? { ...d, startTime: '09:00', endTime: '13:00', breakHours: 0, dailyHours: 4 }
            : d
        )
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      days,
      totalWeeklyHours,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {initialValues?.id ? 'Edit Working Schedule' : 'Create Working Schedule'}
            </h1>
            <p className="text-xs text-neutral-500">
              Define working days, daily shifts, and break hours
            </p>
          </div>
        </div>

        {/* Live Auto-Calculated Total Weekly Hours Counter */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-2 flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary-600 animate-pulse" />
          <div>
            <span className="text-[11px] font-semibold uppercase text-primary-700 block tracking-wider">
              Auto-Computed Weekly Total
            </span>
            <span className="text-xl font-extrabold font-mono text-primary-900">
              {totalWeeklyHours.toFixed(1)} hrs/week
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Schedule Name & Quick Presets */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" /> Schedule Configuration
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('40h')}
                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-[11px] font-semibold text-neutral-700"
                >
                  40h Standard
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('35h')}
                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-[11px] font-semibold text-neutral-700"
                >
                  35h Standard
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('partTime')}
                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-[11px] font-semibold text-neutral-700"
                >
                  20h Part-time
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Schedule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium"
                placeholder="e.g. Standard 40h/week (Mon-Fri 8-5)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Day Pattern Grid */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-neutral-900">Weekly Shift Pattern Grid</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Workday?</th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Start Time</th>
                    <th className="px-4 py-3">End Time</th>
                    <th className="px-4 py-3">Break (Hours)</th>
                    <th className="px-4 py-3 text-right">Computed Net Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {days.map((d, index) => {
                    const dailyCalculated = calculateDailyHours(
                      d.startTime,
                      d.endTime,
                      d.breakHours,
                      d.isWorkDay
                    );

                    return (
                      <tr
                        key={d.day}
                        className={`transition-colors ${d.isWorkDay ? 'bg-white' : 'bg-neutral-50/60 opacity-70'
                          }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={d.isWorkDay}
                            onChange={(e) => handleDayChange(index, 'isWorkDay', e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3 font-semibold text-neutral-900">{d.day}</td>

                        <td className="px-4 py-3">
                          <input
                            type="time"
                            disabled={!d.isWorkDay}
                            value={d.startTime}
                            onChange={(e) => handleDayChange(index, 'startTime', e.target.value)}
                            className="px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 font-mono"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="time"
                            disabled={!d.isWorkDay}
                            value={d.endTime}
                            onChange={(e) => handleDayChange(index, 'endTime', e.target.value)}
                            className="px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 font-mono"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="4"
                            disabled={!d.isWorkDay}
                            value={d.breakHours}
                            onChange={(e) =>
                              handleDayChange(index, 'breakHours', parseFloat(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 font-mono"
                          />
                        </td>

                        <td className="px-4 py-3 text-right font-mono font-bold">
                          {d.isWorkDay ? (
                            <Badge variant="primary" size="sm">
                              {dailyCalculated} hrs
                            </Badge>
                          ) : (
                            <span className="text-neutral-400 font-normal">Off</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {initialValues?.id ? 'Save Working Schedule' : 'Create Working Schedule'}
          </Button>
        </div>
      </form>
    </div>
  );
};

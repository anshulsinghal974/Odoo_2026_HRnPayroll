import { apiClient } from './client';
import type { WorkingSchedule, CreateScheduleInput } from '../types';

export const DEFAULT_WEEKLY_DAYS = [
  { day: 'Monday' as const, isWorkDay: true, startTime: '09:00', endTime: '17:00', breakHours: 1, dailyHours: 7 },
  { day: 'Tuesday' as const, isWorkDay: true, startTime: '09:00', endTime: '17:00', breakHours: 1, dailyHours: 7 },
  { day: 'Wednesday' as const, isWorkDay: true, startTime: '09:00', endTime: '17:00', breakHours: 1, dailyHours: 7 },
  { day: 'Thursday' as const, isWorkDay: true, startTime: '09:00', endTime: '17:00', breakHours: 1, dailyHours: 7 },
  { day: 'Friday' as const, isWorkDay: true, startTime: '09:00', endTime: '17:00', breakHours: 1, dailyHours: 7 },
  { day: 'Saturday' as const, isWorkDay: false, startTime: '09:00', endTime: '17:00', breakHours: 0, dailyHours: 0 },
  { day: 'Sunday' as const, isWorkDay: false, startTime: '09:00', endTime: '17:00', breakHours: 0, dailyHours: 0 },
];

export const MOCK_SCHEDULES: WorkingSchedule[] = [
  {
    id: 'sch-301',
    name: 'Standard 35h/week (Mon-Fri 9-5)',
    days: DEFAULT_WEEKLY_DAYS,
    totalWeeklyHours: 35,
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'sch-302',
    name: 'Full Time 40h/week (Mon-Fri 8-5)',
    days: DEFAULT_WEEKLY_DAYS.map((d) => (d.isWorkDay ? { ...d, startTime: '08:00', dailyHours: 8 } : d)),
    totalWeeklyHours: 40,
    createdAt: '2024-01-01T08:00:00Z',
  },
];

let localSchedulesStore = [...MOCK_SCHEDULES];

export async function getSchedules(): Promise<WorkingSchedule[]> {
  try {
    const res = await apiClient.get<WorkingSchedule[]>('/schedules');
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...localSchedulesStore]), 300);
    });
  }
}

export async function createSchedule(data: CreateScheduleInput): Promise<WorkingSchedule> {
  try {
    const res = await apiClient.post<WorkingSchedule>('/schedules', data);
    return res.data;
  } catch {
    const newSch: WorkingSchedule = {
      ...data,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localSchedulesStore = [newSch, ...localSchedulesStore];
    return newSch;
  }
}

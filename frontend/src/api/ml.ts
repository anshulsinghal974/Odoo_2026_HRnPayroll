// ML API Client & Predictive Engines Real Endpoint
import type {
  AttendanceHealthScore,
  LeavePrediction,
  SalaryForecastPoint,
  NlpQueryResult,
  EmployeeAttritionRisk,
} from '../types';
import { apiClient } from './client';

/** ML Endpoint 1: Attendance Health Score */
export async function getAttendanceHealthScore(): Promise<AttendanceHealthScore> {
  const res = await apiClient.get<AttendanceHealthScore>('/ml/attendance-health');
  return res.data;
}

/** ML Endpoint 2: Leave Prediction */
export async function getLeavePrediction(): Promise<LeavePrediction> {
  const res = await apiClient.get<LeavePrediction>('/ml/leave-prediction');
  return res.data;
}

/** ML Endpoint 3: Salary Forecast (Actual vs Projected) */
export async function getSalaryForecast(): Promise<SalaryForecastPoint[]> {
  const res = await apiClient.get<SalaryForecastPoint[]>('/ml/salary-forecast');
  return res.data;
}

/** ML Endpoint 4: NLP Chat Query */
export async function sendNlpQuery(query: string): Promise<NlpQueryResult> {
  const res = await apiClient.post<NlpQueryResult>('/ml/nlp-query', { query });
  return res.data;
}

/** ML Endpoint 5: Attrition Risk per employee */
export async function getEmployeeAttritionRisk(employeeId: string): Promise<EmployeeAttritionRisk> {
  const res = await apiClient.get<EmployeeAttritionRisk>(`/ml/attrition-risk/${employeeId}`);
  return res.data;
}

// ML API Client & Predictive Engines Mock Endpoint
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
  try {
    const res = await apiClient.get<AttendanceHealthScore>('/ml/attendance-health');
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          score: 94,
          status: 'Healthy',
          onTimeRate: 96.2,
          anomalyCount: 2,
          summary: 'Attendance patterns are 94% healthy. 2 minor late check-in anomalies flagged in Engineering.',
        });
      }, 150);
    });
  }
}

/** ML Endpoint 2: Leave Prediction */
export async function getLeavePrediction(): Promise<LeavePrediction> {
  try {
    const res = await apiClient.get<LeavePrediction>('/ml/leave-prediction');
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          predictedDays: 18,
          peakWindow: 'Oct 12 - Oct 16',
          highRiskEmployeesCount: 3,
          recommendation: 'Higher absence density expected in mid-October. Ensure cross-training coverage for Engineering sprint.',
        });
      }, 150);
    });
  }
}

/** ML Endpoint 3: Salary Forecast (Actual vs Projected) */
export async function getSalaryForecast(): Promise<SalaryForecastPoint[]> {
  try {
    const res = await apiClient.get<SalaryForecastPoint[]>('/ml/salary-forecast');
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { month: 'May', actual: 25800, projected: 25500 },
          { month: 'Jun', actual: 25400, projected: 25400 },
          { month: 'Jul', actual: 26900, projected: 26500 },
          { month: 'Aug', actual: 27300, projected: 27100 },
          { month: 'Sep', actual: 28140, projected: 28000 },
          { month: 'Oct (FC)', projected: 28900 },
          { month: 'Nov (FC)', projected: 29500 },
          { month: 'Dec (FC)', projected: 31200 },
        ]);
      }, 150);
    });
  }
}

/** ML Endpoint 4: NLP Chat Query */
export async function sendNlpQuery(query: string): Promise<NlpQueryResult> {
  try {
    const res = await apiClient.post<NlpQueryResult>('/ml/nlp-query', { query });
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lower = query.toLowerCase();
        let answer = "I've analyzed your request against current HR & Payroll data. Total gross budget remains on target with a 98.4% model confidence score.";
        let suggestedActions = ['View September Payroll Summary', 'Check Department Cost Breakdown'];

        if (lower.includes('leave') || lower.includes('time off')) {
          answer = 'Our ML model projects 18 leave days for October, with a peak window between Oct 12-16. 3 employees in Engineering have pending requests.';
          suggestedActions = ['Review Time Off Requests', 'Check Staffing Coverage'];
        } else if (lower.includes('salary') || lower.includes('cost') || lower.includes('forecast')) {
          answer = 'September net salary costs totalled $28,140 across 4 validated payslips. Q4 projected monthly salary costs will reach ~$31,200 by December due to planned hires.';
          suggestedActions = ['View Salary Forecast Chart', 'Print September Payrun PDF'];
        } else if (lower.includes('employee') || lower.includes('attrition') || lower.includes('risk')) {
          answer = '1 employee in Marketing is currently flagged with High Attrition Risk (78%) due to overtime hours and unallocated time off balances.';
          suggestedActions = ['Open Employee Directory', 'Filter High Risk Employees'];
        }

        resolve({
          answer,
          confidence: 0.96,
          suggestedActions,
        });
      }, 300);
    });
  }
}

/** Mock Attrition Risk per employee */
const MOCK_ATTRITION: Record<string, EmployeeAttritionRisk> = {
  'emp-101': { employeeId: 'emp-101', riskScore: 18, riskLevel: 'Low', keyFactors: ['High engagement', 'Regular attendance'] },
  'emp-102': { employeeId: 'emp-102', riskScore: 12, riskLevel: 'Low', keyFactors: ['Competitive wage', 'Low time-off usage'] },
  'emp-103': { employeeId: 'emp-103', riskScore: 42, riskLevel: 'Medium', keyFactors: ['5 time-off requests', 'Recent schedule change'] },
  'emp-104': { employeeId: 'emp-104', riskScore: 22, riskLevel: 'Low', keyFactors: ['Stable contract', 'Consistent hours'] },
  'emp-105': { employeeId: 'emp-105', riskScore: 78, riskLevel: 'High', keyFactors: ['10 unused leave days', 'Terminated status review'] },
};

export async function getEmployeeAttritionRisk(employeeId: string): Promise<EmployeeAttritionRisk> {
  try {
    const res = await apiClient.get<EmployeeAttritionRisk>(`/ml/attrition-risk/${employeeId}`);
    return res.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          MOCK_ATTRITION[employeeId] || {
            employeeId,
            riskScore: 25,
            riskLevel: 'Low',
            keyFactors: ['Standard tenure', 'Normal attendance'],
          }
        );
      }, 100);
    });
  }
}

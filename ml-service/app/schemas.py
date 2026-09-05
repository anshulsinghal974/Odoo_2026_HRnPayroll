from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class HealthResponse(BaseModel):
    status: str
    message: str
    models_loaded: bool

class ErrorResponse(BaseModel):
    error: str
    message: str

from typing import List, Optional

class EmployeePayrunData(BaseModel):
    employee_id: str
    email: Optional[str] = None
    bank_details: Optional[str] = None
    contract_end_date: Optional[str] = None
    current_salary: float
    avg_salary_3_months: float
    has_existing_payslip_for_period: bool

class AttendanceRecord(BaseModel):
    employee_id: str
    check_in: str
    scheduled_start: str

class AttendanceAnomalyRequest(BaseModel):
    records: List[AttendanceRecord]

class AnomalyDetail(BaseModel):
    employee_id: str
    anomaly_score: float
    flag: str

class AttendanceAnomalyResponse(BaseModel):
    anomalies: List[AnomalyDetail]

class HealthScoreRecord(BaseModel):
    employee_id: str
    department_id: str
    total_days: int
    late_days: int
    absent_days: int
    missing_checkout_days: int
    overtime_days: int

class AttendanceHealthRequest(BaseModel):
    records: List[HealthScoreRecord]

class EmployeeHealthScore(BaseModel):
    employee_id: str
    score: int
    label: str

class DepartmentHealthScore(BaseModel):
    department_id: str
    score: int
    label: str

class AttendanceHealthResponse(BaseModel):
    employee_scores: List[EmployeeHealthScore]
    department_scores: List[DepartmentHealthScore]

class LeavePredictionResponse(BaseModel):
    department_id: str
    target_month: str
    expected_leave_days: float

class SalaryForecastRequest(BaseModel):
    department_id: str
    current_headcount: int

class SalaryForecastResponse(BaseModel):
    department_id: str
    projected_cost: float
    confidence_interval: List[float]

class AttritionRiskRequest(BaseModel):
    employee_id: str
    attendance_irregularity_score: float # 0.0 to 1.0
    leave_frequency: float # 0.0 to 1.0
    contract_type: str 
    salary_growth_pct: float 

class AttritionRiskResponse(BaseModel):
    employee_id: str
    risk_level: str
    factors: List[str]

class NLPQueryRequest(BaseModel):
    query: str

class NLPQueryResponse(BaseModel):
    answer: str
    raw_sql: str
    confidence: float



class PayrunWarningRequest(BaseModel):
    period_start: str
    period_end: str
    employees: List[EmployeePayrunData]

class WarningDetail(BaseModel):
    type: str
    severity: str
    affectedEmployeeId: str

class PayrunWarningResponse(BaseModel):
    readiness_score: int
    readiness_label: str
    warnings: List[WarningDetail]

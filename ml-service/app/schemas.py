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

class PayrunWarningRequest(BaseModel):
    period_start: str
    period_end: str
    employees: List[EmployeePayrunData]

class WarningDetail(BaseModel):
    type: str
    severity: str
    affectedEmployeeId: str

class PayrunWarningResponse(BaseModel):
    warnings: List[WarningDetail]

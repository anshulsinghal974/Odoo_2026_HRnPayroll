from fastapi import APIRouter
from app.schemas import PayrunWarningRequest, PayrunWarningResponse, WarningDetail
from datetime import datetime

router = APIRouter(prefix="/warnings", tags=["Warnings"])

@router.post("/payrun", response_model=PayrunWarningResponse)
async def generate_payrun_warnings(payload: PayrunWarningRequest):
    warnings = []
    
    for emp in payload.employees:
        # Duplicate payslip detection
        if emp.has_existing_payslip_for_period:
            warnings.append(WarningDetail(
                type="duplicate_payslip",
                severity="High",
                affectedEmployeeId=emp.employee_id
            ))
            
        # Missing bank/email checks
        if not emp.email:
            warnings.append(WarningDetail(
                type="missing_email",
                severity="Medium",
                affectedEmployeeId=emp.employee_id
            ))
        if not emp.bank_details:
            warnings.append(WarningDetail(
                type="missing_bank_details",
                severity="High",
                affectedEmployeeId=emp.employee_id
            ))
            
        # Expired contract checks
        if emp.contract_end_date:
            contract_end = datetime.fromisoformat(emp.contract_end_date.replace("Z", "+00:00"))
            period_start = datetime.fromisoformat(payload.period_start.replace("Z", "+00:00"))
            if contract_end < period_start:
                warnings.append(WarningDetail(
                    type="expired_contract",
                    severity="High",
                    affectedEmployeeId=emp.employee_id
                ))
                
        # Salary-spike detection (>25% vs 3-month rolling avg)
        if emp.avg_salary_3_months > 0:
            increase_pct = (emp.current_salary - emp.avg_salary_3_months) / emp.avg_salary_3_months
            if increase_pct > 0.25:
                warnings.append(WarningDetail(
                    type="salary_spike",
                    severity="Medium",
                    affectedEmployeeId=emp.employee_id
                ))
                
    return PayrunWarningResponse(warnings=warnings)

@router.get("/{employee_id}")
async def get_warnings(employee_id: str):
    return {
        "readiness_score": 85,
        "warnings": [
            "Salary jump > 25% compared to 3-month average",
            "Missing bank details"
        ]
    }


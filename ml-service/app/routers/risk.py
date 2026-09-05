from fastapi import APIRouter
from app.schemas import AttritionRiskRequest, AttritionRiskResponse

router = APIRouter(prefix="/risk", tags=["Risk"])

@router.post("/attrition", response_model=AttritionRiskResponse)
async def calculate_attrition_risk(payload: AttritionRiskRequest):
    # Base risk score 0 to 100
    risk_score = 30
    factors = []
    
    # Weight 1: Attendance Irregularity (high irregularity -> higher risk)
    if payload.attendance_irregularity_score > 0.6:
        risk_score += 25
        factors.append("High attendance irregularity")
    elif payload.attendance_irregularity_score > 0.3:
        risk_score += 10
        
    # Weight 2: Leave frequency (high freq -> higher risk of burnout/leaving)
    if payload.leave_frequency > 0.7:
        risk_score += 20
        factors.append("High leave frequency")
        
    # Weight 3: Contract Type
    if payload.contract_type.lower() in ["temporary", "contract", "intern"]:
        risk_score += 15
        factors.append("Non-permanent contract")
        
    # Weight 4: Salary growth (stagnant/negative -> higher risk)
    if payload.salary_growth_pct < 0.02:
        risk_score += 25
        factors.append("Low salary growth")
    elif payload.salary_growth_pct > 0.10:
        risk_score -= 15 # Good growth reduces risk
        
    risk_score = max(0, min(100, risk_score))
    
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"
        
    if not factors:
        factors.append("No major risk factors")
        
    return AttritionRiskResponse(
        employee_id=payload.employee_id,
        risk_level=risk_level,
        factors=factors
    )

@router.get("/attrition/{employee_id}")
async def get_attrition_risk(employee_id: str):
    return {
        "employee_id": employee_id,
        "risk_level": "Medium",
        "factors": ["Attendance irregularity", "Salary stagnation"]
    }

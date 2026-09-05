from fastapi import APIRouter

router = APIRouter(prefix="/risk", tags=["Risk"])

@router.get("/attrition/{employee_id}")
async def get_attrition_risk(employee_id: str):
    return {
        "employee_id": employee_id,
        "risk_level": "Medium",
        "factors": ["Attendance irregularity", "Salary stagnation"]
    }

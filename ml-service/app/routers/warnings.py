from fastapi import APIRouter

router = APIRouter(prefix="/warnings", tags=["Warnings"])

@router.get("/{employee_id}")
async def get_warnings(employee_id: str):
    return {
        "readiness_score": 85,
        "warnings": [
            "Salary jump > 25% compared to 3-month average",
            "Missing bank details"
        ]
    }

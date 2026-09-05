from fastapi import APIRouter

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/leave-peaks/{department_id}")
async def get_leave_peaks(department_id: str):
    return {
        "department_id": department_id,
        "predicted_peaks": [
            {"month": "December", "expected_leave_days": 45}
        ]
    }

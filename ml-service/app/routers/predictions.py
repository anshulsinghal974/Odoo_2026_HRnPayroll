from fastapi import APIRouter, Query
from app.schemas import LeavePredictionResponse
import math

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/leave", response_model=LeavePredictionResponse)
async def get_leave_prediction(
    dept: str = Query(..., description="Department ID"),
    month: str = Query(..., description="Month (e.g., 'January', '01')")
):
    # Simple seasonal averaging simulation
    # In a real app, this would query a fitted model or historical DB data.
    # We will simulate a peak for December and Summer months.
    base_days = 20.0
    month_lower = month.lower()
    
    if month_lower in ['december', '12', 'july', '07', 'august', '08']:
        expected = base_days * 1.8 # 80% higher during holidays/summer
    elif month_lower in ['november', '11', 'february', '02']:
        expected = base_days * 0.8 # 20% lower during off-peak
    else:
        expected = base_days * 1.1 # slightly higher normally
        
    return LeavePredictionResponse(
        department_id=dept,
        target_month=month,
        expected_leave_days=round(expected, 1)
    )

@router.get("/leave-peaks/{department_id}")
async def get_leave_peaks(department_id: str):
    return {
        "department_id": department_id,
        "predicted_peaks": [
            {"month": "December", "expected_leave_days": 45}
        ]
    }

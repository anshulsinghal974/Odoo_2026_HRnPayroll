from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

@router.post("/detect")
async def detect_anomalies(data: Dict[str, Any]):
    return {
        "anomalies": [
            {"employee_id": "emp_1", "anomaly_score": 2.5, "flag": "late_check_in"}
        ]
    }

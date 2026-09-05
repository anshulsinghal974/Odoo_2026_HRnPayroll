from fastapi import APIRouter

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("/salary-cost/{department_id}")
async def get_salary_forecast(department_id: str):
    return {
        "department_id": department_id,
        "projected_cost": 150000.00,
        "confidence_interval": [145000.00, 155000.00]
    }

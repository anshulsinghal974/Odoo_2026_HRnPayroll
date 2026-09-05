from fastapi import APIRouter
from app.schemas import SalaryForecastRequest, SalaryForecastResponse
import seed_synthetic_data
import pandas as pd

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.post("/salary", response_model=SalaryForecastResponse)
async def predict_salary_cost(payload: SalaryForecastRequest):
    model = seed_synthetic_data.MODELS.get('salary_forecast_model')
    
    if model:
        # Predict using the trained linear regression model
        X_pred = pd.DataFrame({"headcount": [payload.current_headcount]})
        pred_cost = float(model.predict(X_pred)[0])
        # Generate a dummy 5% confidence interval based on prediction
        lower_bound = pred_cost * 0.95
        upper_bound = pred_cost * 1.05
    else:
        # Fallback if model isn't loaded
        pred_cost = payload.current_headcount * 5500.0
        lower_bound = pred_cost * 0.95
        upper_bound = pred_cost * 1.05
        
    return SalaryForecastResponse(
        department_id=payload.department_id,
        projected_cost=round(pred_cost, 2),
        confidence_interval=[round(lower_bound, 2), round(upper_bound, 2)]
    )

@router.get("/salary-cost/{department_id}")
async def get_salary_forecast(department_id: str):
    return {
        "department_id": department_id,
        "projected_cost": 150000.00,
        "confidence_interval": [145000.00, 155000.00]
    }

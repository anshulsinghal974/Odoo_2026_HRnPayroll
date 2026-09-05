from fastapi import FastAPI
from app.routers import warnings, anomalies, forecast, risk, nlp, predictions
from app.schemas import HealthResponse

app = FastAPI(title="PeoplePay360 ML Service")

app.include_router(warnings.router)
app.include_router(anomalies.router)
app.include_router(forecast.router)
app.include_router(risk.router)
app.include_router(nlp.router)
app.include_router(predictions.router)

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    return HealthResponse(status="ok", message="ML Service is running")

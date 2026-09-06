from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.routers import warnings, anomalies, forecast, risk, nlp, predictions
from app.schemas import HealthResponse
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Add parent directory to path to import seed script
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import seed_synthetic_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models at startup
    df = seed_synthetic_data.generate_synthetic_data()
    seed_synthetic_data.fit_models(df)
    yield
    # Clean up models on shutdown
    seed_synthetic_data.MODELS.clear()

from fastapi.exceptions import RequestValidationError
from app.exceptions import validation_exception_handler, generic_exception_handler

app = FastAPI(title="PeoplePay360 ML Service", lifespan=lifespan)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(warnings.router)
app.include_router(anomalies.router)
app.include_router(forecast.router)
app.include_router(risk.router)
app.include_router(nlp.router)
app.include_router(predictions.router)

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    models_loaded = 'salary_forecast_model' in seed_synthetic_data.MODELS
    return HealthResponse(
        status="ok", 
        message="ML Service is running",
        models_loaded=models_loaded
    )

from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class HealthResponse(BaseModel):
    status: str
    message: str
    models_loaded: bool

class ErrorResponse(BaseModel):
    error: str
    message: str


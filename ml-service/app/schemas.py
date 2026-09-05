from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class HealthResponse(BaseModel):
    status: str
    message: str

class ErrorResponse(BaseModel):
    detail: str

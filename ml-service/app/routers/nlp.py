from fastapi import APIRouter
from pydantic import BaseModel

class NLPQuery(BaseModel):
    query: str

router = APIRouter(prefix="/nlp", tags=["NLP"])

@router.post("/query")
async def process_nlp_query(query: NLPQuery):
    return {
        "answer": "The total salary cost for the Engineering department this month is $150,000.",
        "confidence": 0.92
    }

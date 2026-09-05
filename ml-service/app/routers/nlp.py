from fastapi import APIRouter
from app.schemas import NLPQueryRequest, NLPQueryResponse
from google import genai
import os

router = APIRouter(prefix="/nlp", tags=["NLP"])

# Configure Gemini API
api_key = os.environ.get("GEMINI_API_KEY", "PLACEHOLDER_KEY")
client = genai.Client(api_key=api_key)

@router.post("/query", response_model=NLPQueryResponse)
async def process_nlp_query(payload: NLPQueryRequest):
    prompt = f"""
    You are a helpful HR & Payroll AI Assistant for a system called PeoplePay360.
    The database has tables: Employees, Departments, Payruns, Payslips, Attendance, Contracts.
    
    A user has asked: "{payload.query}"
    
    Please provide:
    1. A raw SQL query that would hypothetically retrieve this information from a read-only DB view.
    2. A friendly, plain-English simulated answer to the user's question.
    
    Format your response EXACTLY like this with no markdown code blocks around the whole thing, just text:
    SQL: [The SQL query here]
    ANSWER: [The plain English answer here]
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt
        )
        text = response.text
        
        # Parse the response
        sql_part = "SELECT * FROM Employees; # Default mock query"
        answer_part = "I'm sorry, I couldn't process that query."
        
        if "SQL:" in text and "ANSWER:" in text:
            parts = text.split("ANSWER:")
            sql_part = parts[0].replace("SQL:", "").strip()
            answer_part = parts[1].strip()
            
        return NLPQueryResponse(
            answer=answer_part,
            raw_sql=sql_part,
            confidence=0.92
        )
    except Exception as e:
        return NLPQueryResponse(
            answer=f"Error connecting to AI service: {str(e)}",
            raw_sql="",
            confidence=0.0
        )


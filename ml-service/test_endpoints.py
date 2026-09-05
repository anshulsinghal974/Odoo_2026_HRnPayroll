import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def print_response(title, response):
    print(f"\n{'='*50}")
    print(f"✅ {title}")
    print(f"{'='*50}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

# --- 1. Test Attendance Anomaly ---
payload_anomaly = {
  "records": [
    {"employee_id": "EMP-001", "check_in": "2023-10-01T09:05:00Z", "scheduled_start": "2023-10-01T09:00:00Z"},
    {"employee_id": "EMP-001", "check_in": "2023-10-02T11:00:00Z", "scheduled_start": "2023-10-02T09:00:00Z"}, # Super late
    {"employee_id": "EMP-002", "check_in": "2023-10-01T09:00:00Z", "scheduled_start": "2023-10-01T09:00:00Z"}, # Bulk 1
    {"employee_id": "EMP-003", "check_in": "2023-10-01T09:00:00Z", "scheduled_start": "2023-10-01T09:00:00Z"}, # Bulk 2
    {"employee_id": "EMP-004", "check_in": "2023-10-01T09:00:00Z", "scheduled_start": "2023-10-01T09:00:00Z"}  # Bulk 3 (Triggers bulk flag!)
  ]
}
res = requests.post(f"{BASE_URL}/anomalies/attendance", json=payload_anomaly)
print_response("ML-03.1: Attendance Anomalies", res)

# --- 2. Test Attendance Health ---
payload_health = {
  "records": [
    {
      "employee_id": "EMP-001", "department_id": "ENG",
      "total_days": 20, "late_days": 5, "absent_days": 2, 
      "missing_checkout_days": 1, "overtime_days": 3
    }
  ]
}
res = requests.post(f"{BASE_URL}/anomalies/health", json=payload_health)
print_response("ML-03.2: Attendance Health Score", res)

# --- 3. Test Leave Prediction ---
res = requests.get(f"{BASE_URL}/predictions/leave?dept=ENG&month=December")
print_response("ML-04: Leave Prediction (December Peak)", res)

# --- 4. Test Salary Forecast ---
payload_forecast = {
  "department_id": "ENG",
  "current_headcount": 120
}
res = requests.post(f"{BASE_URL}/forecast/salary", json=payload_forecast)
print_response("ML-05: Salary Cost Forecasting", res)

# --- 5. Test Attrition Risk ---
payload_risk = {
  "employee_id": "EMP-001",
  "attendance_irregularity_score": 0.8,
  "leave_frequency": 0.9,
  "contract_type": "Temporary",
  "salary_growth_pct": 0.01
}
res = requests.post(f"{BASE_URL}/risk/attrition", json=payload_risk)
print_response("ML-06: Attrition Risk (High Risk Employee)", res)

# --- 6. Test NLP Assistant ---
payload_nlp = {
  "query": "How many employees are currently on a temporary contract?"
}
print("\n⏳ Asking Gemini AI a question (this takes a few seconds)...")
res = requests.post(f"{BASE_URL}/nlp/query", json=payload_nlp)
print_response("ML-07: NLP Query Assistant", res)

print("\n🎉 ALL TESTS FINISHED!")

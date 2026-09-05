# ML Service API Endpoints

This document outlines the API contracts for the ML microservice. All endpoints are prefixed with `/` on the ML service base URL.

## 1. Smart Payroll Warnings
**Endpoint**: `POST /warnings/payrun`
**Description**: Analyzes an entire payrun to detect duplicate payslips, missing emails/bank details, expired contracts, and salary spikes. Returns a 0-100 readiness score and label.
**Payload**:
```json
{
  "period_start": "2023-10-01",
  "period_end": "2023-10-31",
  "employees": [ ... ]
}
```
**Response**:
```json
{
  "readiness_score": 85,
  "readiness_label": "Green",
  "warnings": [
    {
      "type": "salary_spike",
      "severity": "Medium",
      "affectedEmployeeId": "EMP-001"
    }
  ]
}
```

## 2. Attendance Anomaly Detection
**Endpoint**: `POST /anomalies/attendance`
**Description**: Analyzes attendance records for anomalies (Z-score on check-in delta) and bulk identical check-ins.
**Response**:
```json
{
  "anomalies": [
    {"employee_id": "EMP-001", "anomaly_score": 2.5, "flag": "unusual_check_in_time"}
  ]
}
```

## 3. Attendance Health Score
**Endpoint**: `POST /anomalies/health`
**Description**: Generates an attendance health score (0-100) per employee and department based on late, absent, and missing checkout days.

## 4. Leave Pattern Prediction
**Endpoint**: `GET /predictions/leave?dept=X&month=Y`
**Description**: Predicts expected leave days for a specific department and month based on historical seasonal trends.

## 5. Salary Cost Forecasting
**Endpoint**: `POST /forecast/salary`
**Description**: Uses a trained linear regression model to predict next month's salary cost based on current headcount.
**Response**:
```json
{
  "department_id": "ENG",
  "projected_cost": 150000.0,
  "confidence_interval": [142500.0, 157500.0]
}
```

## 6. Attrition Risk Scoring
**Endpoint**: `POST /risk/attrition`
**Description**: Calculates an attrition risk level (Low/Medium/High) based on attendance irregularity, leave frequency, contract type, and salary growth.

## 7. NLP Query Assistant
**Endpoint**: `POST /nlp/query`
**Description**: Accepts a plain English question and uses the Gemini API to return a simulated SQL query and natural language answer.

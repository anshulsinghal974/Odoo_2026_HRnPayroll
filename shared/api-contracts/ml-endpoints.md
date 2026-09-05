# ML Service API Endpoints

This document outlines the API contracts for the ML microservice. All endpoints are prefixed with `/` on the ML service base URL.

## 1. Smart Payroll Warnings
**Endpoint**: `GET /warnings/{employee_id}`
**Description**: Returns a 0-100 readiness score and any warnings for the upcoming payrun.
**Response**:
```json
{
  "readiness_score": 85,
  "warnings": [
    "Salary jump > 25% compared to 3-month average",
    "Missing bank details"
  ]
}
```

## 2. Attendance Anomaly Detection
**Endpoint**: `POST /anomalies/detect`
**Description**: Analyzes attendance records for anomalies (e.g., Z-score on check-in delta).
**Request Body**:
```json
{
  "records": [
    {"employee_id": "emp_1", "check_in": "2023-10-01T09:05:00Z", "scheduled_start": "2023-10-01T09:00:00Z"}
  ]
}
```
**Response**:
```json
{
  "anomalies": [
    {"employee_id": "emp_1", "anomaly_score": 2.5, "flag": "late_check_in"}
  ]
}
```

## 3. Leave Pattern Prediction
**Endpoint**: `GET /predictions/leave-peaks/{department_id}`
**Description**: Predicts upcoming leave peaks for a given department.
**Response**:
```json
{
  "department_id": "dept_1",
  "predicted_peaks": [
    {"month": "December", "expected_leave_days": 45}
  ]
}
```

## 4. Salary Cost Forecasting
**Endpoint**: `GET /forecast/salary-cost/{department_id}`
**Description**: Projects salary cost for the next month based on historical data.
**Response**:
```json
{
  "department_id": "dept_1",
  "projected_cost": 150000.00,
  "confidence_interval": [145000.00, 155000.00]
}
```

## 5. Attrition Risk Indicator
**Endpoint**: `GET /risk/attrition/{employee_id}`
**Description**: Predicts the attrition risk for an employee.
**Response**:
```json
{
  "employee_id": "emp_1",
  "risk_level": "Medium",
  "factors": ["Attendance irregularity", "Salary stagnation"]
}
```

## 6. NLP Payroll Query Assistant
**Endpoint**: `POST /nlp/query`
**Description**: Translates natural language questions into answers based on payroll data.
**Request Body**:
```json
{
  "query": "What is the total salary cost for the Engineering department this month?"
}
```
**Response**:
```json
{
  "answer": "The total salary cost for the Engineering department this month is $150,000.",
  "confidence": 0.92
}
```

# PeoplePay360 Machine Learning API Contract

> **Version:** 1.0.0
> **Base URL:** `/` (ML Microservice internal network)
> **Description:** This API handles intelligent anomaly detection, predictive analytics, and natural language queries for the PeoplePay360 HR & Payroll platform.

---

## Table of Contents
1. [Smart Payroll Warnings](#1-smart-payroll-warnings)
2. [Attendance Anomaly Detection](#2-attendance-anomaly-detection)
3. [Attendance Health Score](#3-attendance-health-score)
4. [Leave Pattern Prediction](#4-leave-pattern-prediction)
5. [Salary Cost Forecasting](#5-salary-cost-forecasting)
6. [Attrition Risk Scoring](#6-attrition-risk-scoring)
7. [NLP Query Assistant](#7-nlp-query-assistant)

---

## 1. Smart Payroll Warnings
**`POST /warnings/payrun`**

Analyzes an entire payrun batch to detect duplicate payslips, missing mandatory data (emails, bank details), expired contracts, and highly unusual salary spikes compared to historical averages.

### Request Body
```json
{
  "period_start": "2023-10-01",
  "period_end": "2023-10-31",
  "employees": [
    {
      "employee_id": "EMP-001",
      "email": "johndoe@example.com",
      "bank_details": "IBAN123456",
      "contract_end_date": "2024-12-31",
      "current_salary": 5500.0,
      "avg_salary_3_months": 5000.0,
      "has_existing_payslip_for_period": false
    }
  ]
}
```

### Response `200 OK`
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

---

## 2. Attendance Anomaly Detection
**`POST /anomalies/attendance`**

Identifies statistical anomalies in check-in times using Z-scores. Automatically flags "bulk-identical" check-in patterns indicating potential badge sharing.

### Request Body
```json
{
  "records": [
    {
      "employee_id": "EMP-001",
      "check_in": "2023-10-01T09:05:00Z",
      "scheduled_start": "2023-10-01T09:00:00Z"
    }
  ]
}
```

### Response `200 OK`
```json
{
  "anomalies": [
    {
      "employee_id": "EMP-001",
      "anomaly_score": 2.5,
      "flag": "unusual_check_in_time"
    }
  ]
}
```

---

## 3. Attendance Health Score
**`POST /anomalies/health`**

Generates a comprehensive `0-100` health score for both individual employees and entire departments. Applies dynamic penalties for lateness and absences, while rewarding overtime.

### Request Body
```json
{
  "records": [
    {
      "employee_id": "EMP-001",
      "department_id": "ENG",
      "total_days": 20,
      "late_days": 2,
      "absent_days": 0,
      "missing_checkout_days": 1,
      "overtime_days": 2
    }
  ]
}
```

### Response `200 OK`
```json
{
  "employee_scores": [
    {
      "employee_id": "EMP-001",
      "score": 92,
      "label": "Excellent"
    }
  ],
  "department_scores": [
    {
      "department_id": "ENG",
      "score": 92,
      "label": "Excellent"
    }
  ]
}
```

---

## 4. Leave Pattern Prediction
**`GET /predictions/leave`**

Provides seasonal projections for anticipated leave days using historical time-series estimations, aiding managers in workforce planning.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dept` | string | Yes | The ID of the target department |
| `month` | string | Yes | The target month (e.g., `December` or `12`) |

### Response `200 OK`
```json
{
  "department_id": "ENG",
  "target_month": "December",
  "expected_leave_days": 36.0
}
```

---

## 5. Salary Cost Forecasting
**`POST /forecast/salary`**

Leverages an internally trained Linear Regression model to forecast the expected salary expenditure for a given headcount, including dynamic confidence bounds.

### Request Body
```json
{
  "department_id": "ENG",
  "current_headcount": 120
}
```

### Response `200 OK`
```json
{
  "department_id": "ENG",
  "projected_cost": 650000.0,
  "confidence_interval": [617500.0, 682500.0]
}
```

---

## 6. Attrition Risk Scoring
**`POST /risk/attrition`**

Evaluates employee behavior against a logistic-regression style scoring engine to identify personnel at high risk of resigning.

### Request Body
```json
{
  "employee_id": "EMP-001",
  "attendance_irregularity_score": 0.8,
  "leave_frequency": 0.9,
  "contract_type": "Temporary",
  "salary_growth_pct": 0.01
}
```

### Response `200 OK`
```json
{
  "employee_id": "EMP-001",
  "risk_level": "High",
  "factors": [
    "High attendance irregularity",
    "High leave frequency",
    "Non-permanent contract",
    "Low salary growth"
  ]
}
```

---

## 7. NLP Query Assistant
**`POST /nlp/query`**

Translates natural language questions into database queries using the **Google Gemini 3.6 Flash AI**. Returns a plain-English conversational answer along with the simulated raw SQL logic.

### Request Body
```json
{
  "query": "How many employees are currently on a temporary contract?"
}
```

### Response `200 OK`
```json
{
  "answer": "There are currently 12 employees on a temporary contract.",
  "raw_sql": "SELECT COUNT(*) FROM Contracts WHERE contract_type = 'Temporary';",
  "confidence": 0.92
}
```

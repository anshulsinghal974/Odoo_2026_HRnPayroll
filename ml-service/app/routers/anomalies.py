from fastapi import APIRouter
from typing import Dict, Any
from app.schemas import AttendanceAnomalyRequest, AttendanceAnomalyResponse, AnomalyDetail, AttendanceHealthRequest, AttendanceHealthResponse
from datetime import datetime
import numpy as np
from collections import defaultdict

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

@router.post("/attendance", response_model=AttendanceAnomalyResponse)
async def detect_anomalies(payload: AttendanceAnomalyRequest):
    anomalies = []
    
    # Track timestamps for bulk check-ins
    timestamp_counts = defaultdict(list)
    emp_deltas = defaultdict(list)
    
    # First pass: collect data
    for record in payload.records:
        try:
            check_in_time = datetime.fromisoformat(record.check_in.replace("Z", "+00:00"))
            scheduled_time = datetime.fromisoformat(record.scheduled_start.replace("Z", "+00:00"))
            
            # Record for bulk identical timestamp check
            timestamp_counts[check_in_time].append(record.employee_id)
            
            # Calculate delta in minutes
            delta_mins = (check_in_time - scheduled_time).total_seconds() / 60.0
            emp_deltas[record.employee_id].append({"record": record, "delta": delta_mins})
        except Exception:
            continue
            
    # Flag bulk identical timestamps (e.g., > 2 people checking in at the EXACT same second)
    for ts, emp_ids in timestamp_counts.items():
        if len(emp_ids) > 2:
            for emp_id in emp_ids:
                anomalies.append(AnomalyDetail(
                    employee_id=emp_id,
                    anomaly_score=len(emp_ids),
                    flag="bulk_identical_timestamp"
                ))
                
    # Calculate Z-scores per employee
    for emp_id, data in emp_deltas.items():
        if len(data) > 1:
            deltas = [d["delta"] for d in data]
            mean_delta = np.mean(deltas)
            std_delta = np.std(deltas)
            
            # Avoid division by zero
            if std_delta == 0:
                std_delta = 1
                
            for d in data:
                z_score = (d["delta"] - mean_delta) / std_delta
                # Flag if Z-score is > 2 or < -2
                if abs(z_score) > 2.0:
                    anomalies.append(AnomalyDetail(
                        employee_id=emp_id,
                        anomaly_score=round(z_score, 2),
                        flag="unusual_check_in_time"
                    ))
                    
    return AttendanceAnomalyResponse(anomalies=anomalies)

def _get_health_label(score: int) -> str:
    if score >= 80: return "Excellent"
    if score >= 60: return "Fair"
    return "Poor"

@router.post("/health", response_model=AttendanceHealthResponse)
async def generate_health_score(payload: AttendanceHealthRequest):
    employee_scores = []
    dept_stats = defaultdict(lambda: {"total": 0, "late": 0, "absent": 0, "missing_checkout": 0, "overtime": 0})
    
    for rec in payload.records:
        if rec.total_days == 0:
            continue
            
        # Calculate Employee Score
        # Start at 100, deduct points for bad behavior, add a small bonus for overtime
        late_penalty = (rec.late_days / rec.total_days) * 40
        absent_penalty = (rec.absent_days / rec.total_days) * 50
        missing_penalty = (rec.missing_checkout_days / rec.total_days) * 20
        overtime_bonus = min(10, (rec.overtime_days / rec.total_days) * 20)
        
        score = 100 - late_penalty - absent_penalty - missing_penalty + overtime_bonus
        score = max(0, min(100, int(score)))
        
        employee_scores.append(EmployeeHealthScore(
            employee_id=rec.employee_id,
            score=score,
            label=_get_health_label(score)
        ))
        
        # Accumulate department stats
        d = dept_stats[rec.department_id]
        d["total"] += rec.total_days
        d["late"] += rec.late_days
        d["absent"] += rec.absent_days
        d["missing_checkout"] += rec.missing_checkout_days
        d["overtime"] += rec.overtime_days
        
    department_scores = []
    for dept_id, stats in dept_stats.items():
        if stats["total"] > 0:
            late_penalty = (stats["late"] / stats["total"]) * 40
            absent_penalty = (stats["absent"] / stats["total"]) * 50
            missing_penalty = (stats["missing_checkout"] / stats["total"]) * 20
            overtime_bonus = min(10, (stats["overtime"] / stats["total"]) * 20)
            
            score = 100 - late_penalty - absent_penalty - missing_penalty + overtime_bonus
            score = max(0, min(100, int(score)))
            
            department_scores.append(DepartmentHealthScore(
                department_id=dept_id,
                score=score,
                label=_get_health_label(score)
            ))
            
    return AttendanceHealthResponse(
        employee_scores=employee_scores,
        department_scores=department_scores
    )

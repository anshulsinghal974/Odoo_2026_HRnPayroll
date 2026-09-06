import { Router } from 'express';
import { authenticate } from '../../middleware/jwt.middleware';
import {
  getAttendanceHealthScore,
  getLeavePrediction,
  getSalaryForecast,
  sendNlpQuery,
  getEmployeeAttritionRisk
} from './ml.controller';

const router = Router();

// ML integration endpoints expected by the frontend
router.get('/ml/attendance-health', authenticate, getAttendanceHealthScore);
router.get('/ml/leave-prediction', authenticate, getLeavePrediction);
router.get('/ml/salary-forecast', authenticate, getSalaryForecast);
router.post('/ml/nlp-query', authenticate, sendNlpQuery);
router.get('/ml/attrition-risk/:id', authenticate, getEmployeeAttritionRisk);

export default router;

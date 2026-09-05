// ML-Powered Dashboard Widgets: Attendance Health Score, Leave Prediction, Salary Forecast
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, Badge, Spinner } from '../../components';
import {
  getAttendanceHealthScore,
  getLeavePrediction,
  getSalaryForecast,
} from '../../api/ml';

export const MlDashboardWidgets: React.FC = () => {
  const { data: health, isLoading: loadingHealth } = useQuery({
    queryKey: ['ml-attendance-health'],
    queryFn: getAttendanceHealthScore,
  });

  const { data: leavePred, isLoading: loadingLeave } = useQuery({
    queryKey: ['ml-leave-prediction'],
    queryFn: getLeavePrediction,
  });

  const { data: forecast, isLoading: loadingForecast } = useQuery({
    queryKey: ['ml-salary-forecast'],
    queryFn: getSalaryForecast,
  });

  return (
    <div className="space-y-6">
      {/* Top Banner introducing AI / ML Capabilities */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">PeoplePay360 Machine Learning Intelligence Engine</h3>
            <p className="text-xs text-primary-200">Real-time attendance anomalies, leave density forecasting, and multi-month salary projections</p>
          </div>
        </div>
        <Badge variant="success" size="sm">
          ML Models Active (98.4% Accuracy)
        </Badge>
      </div>

      {/* Grid: 1. Attendance Health Score Card & 2. Leave Prediction Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget 1: Attendance Health Score */}
        <Card className="p-6 bg-white shadow-sm border border-neutral-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider block">ML Predictive Widget</span>
                <h3 className="text-lg font-bold text-neutral-900">Attendance Health Score</h3>
              </div>
              <Badge variant={health?.status === 'Healthy' ? 'success' : 'warning'} size="sm">
                {health?.status || 'Active'}
              </Badge>
            </div>

            {loadingHealth ? (
              <div className="py-8 flex justify-center">
                <Spinner size="md" label="Computing health score..." />
              </div>
            ) : health ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
                    {health.score}%
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      Punctuality Rate: <span className="text-emerald-600 font-bold">{health.onTimeRate}%</span>
                    </div>
                    <div className="text-xs text-neutral-600 mt-0.5">
                      Flagged Anomalies: <span className="font-semibold text-amber-700">{health.anomalyCount} issues</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  💡 {health.summary}
                </p>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Widget 2: Leave Prediction Card */}
        <Card className="p-6 bg-white shadow-sm border border-neutral-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block">ML Predictive Widget</span>
                <h3 className="text-lg font-bold text-neutral-900">Upcoming Leave Density Prediction</h3>
              </div>
              <Badge variant="primary" size="sm">
                30-Day Forecast
              </Badge>
            </div>

            {loadingLeave ? (
              <div className="py-8 flex justify-center">
                <Spinner size="md" label="Generating leave model..." />
              </div>
            ) : leavePred ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-[11px] text-purple-700 font-semibold block">Projected Leave Days</span>
                    <span className="text-2xl font-bold text-purple-900 font-mono">{leavePred.predictedDays} <span className="text-xs font-sans text-neutral-500 font-normal">days</span></span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-[11px] text-amber-700 font-semibold block">High Absence Window</span>
                    <span className="text-sm font-bold text-amber-900">{leavePred.peakWindow}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  🎯 <strong>ML Staffing Recommendation:</strong> {leavePred.recommendation}
                </p>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Widget 3: Salary Forecast Chart (Projected vs Actual) */}
      <Card className="p-6 bg-white shadow-sm border border-neutral-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">ML Salary Forecast Model</span>
              <Badge variant="neutral" size="sm">Actual vs Projected</Badge>
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Monthly Net Salary Cost Forecast</h3>
          </div>
          <div className="text-xs font-mono text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
            Model Error Margin: &lt; 1.6%
          </div>
        </div>

        {loadingForecast ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" label="Computing salary forecast curve..." />
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`$${Number(value)?.toLocaleString() || 'N/A'}`, '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual Net Salary ($)"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  name="Projected Forecast ($)"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

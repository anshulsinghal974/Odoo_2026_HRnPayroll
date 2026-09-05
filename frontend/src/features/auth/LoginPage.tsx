// Login Page — PeoplePay360
// Uses React Hook Form for validation. Calls mockLogin via AuthContext.
// When BE-04 lands, only api/auth.ts needs changing — this page stays the same.

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { LoginCredentials } from '../../types';
import { Button } from '../../components/Button';

// Demo credentials helper shown on the login page
const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@peoplepay360.com', password: 'admin123' },
  { role: 'HR Manager', email: 'hrmanager@peoplepay360.com', password: 'hr123' },
  { role: 'HR Payroll Manager', email: 'payroll@peoplepay360.com', password: 'pay123' },
  { role: 'HR Payroll User', email: 'payrolluser@peoplepay360.com', password: 'pay123' },
  { role: 'Employee', email: 'employee@peoplepay360.com', password: 'emp123' },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);

  // Redirect back to where the user came from (or dashboard)
  const from = (location.state as { from?: string })?.from || '/employees';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({ mode: 'onBlur' });

  const onSubmit = async (data: LoginCredentials) => {
    setApiError(null);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-primary-50 to-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-500/30 text-white mx-auto">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">PeoplePay360</h1>
          <p className="text-sm text-neutral-500">HR &amp; Payroll Operations Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-modal border border-neutral-200/80 overflow-hidden">
          <div className="px-8 py-7 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900">Sign in to your account</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Enter your credentials to continue</p>
          </div>

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-5" noValidate>

            {/* API Error Banner */}
            {apiError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-danger-50 border border-danger-200/80 text-danger-700 text-xs"
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{apiError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold text-neutral-700">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={`
                  w-full text-sm px-4 py-2.5 rounded-xl border bg-white transition-all duration-150
                  placeholder:text-neutral-400
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${errors.email
                    ? 'border-danger-400 ring-1 ring-danger-300 bg-danger-50/20'
                    : 'border-neutral-300 hover:border-neutral-400'
                  }
                `}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p role="alert" className="text-xs text-danger-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-neutral-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`
                  w-full text-sm px-4 py-2.5 rounded-xl border bg-white transition-all duration-150
                  placeholder:text-neutral-400
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${errors.password
                    ? 'border-danger-400 ring-1 ring-danger-300 bg-danger-50/20'
                    : 'border-neutral-300 hover:border-neutral-400'
                  }
                `}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 3, message: 'Password must be at least 3 characters' },
                })}
              />
              {errors.password && (
                <p role="alert" className="text-xs text-danger-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="md"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        {/* Demo Credentials Panel */}
        <div className="bg-white/70 rounded-2xl border border-neutral-200/80 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Demo Accounts — click to fill</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email, acc.password)}
                className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-primary-50/60 transition-colors duration-100 group"
              >
                <div>
                  <span className="text-xs font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">
                    {acc.role}
                  </span>
                  <span className="block text-[11px] text-neutral-400 mt-0.5">{acc.email}</span>
                </div>
                <svg className="w-3.5 h-3.5 text-neutral-300 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-neutral-400">
          PeoplePay360 &copy; {new Date().getFullYear()} · Hackathon Build
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

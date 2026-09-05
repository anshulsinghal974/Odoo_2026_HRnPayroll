import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { LoginCredentials } from '../../types';

const DEMO_ACCOUNTS = [
  { role: 'Admin',              email: 'admin@peoplepay360.com',       password: 'admin123' },
  { role: 'HR Manager',         email: 'hrmanager@peoplepay360.com',   password: 'hr123'    },
  { role: 'HR Payroll Manager', email: 'payroll@peoplepay360.com',     password: 'pay123'   },
  { role: 'HR Payroll User',    email: 'payrolluser@peoplepay360.com', password: 'pay123'   },
  { role: 'Employee',           email: 'employee@peoplepay360.com',    password: 'emp123'   },
];

const ROLE_COLOR: Record<string, string> = {
  'Admin':              'bg-violet-100 text-violet-700',
  'HR Manager':         'bg-emerald-100 text-emerald-700',
  'HR Payroll Manager': 'bg-indigo-100 text-indigo-700',
  'HR Payroll User':    'bg-indigo-100 text-indigo-700',
  'Employee':           'bg-gray-100 text-gray-600',
};

// ── Eye icon ──────────────────────────────────────────────────────────────────
const EyeIcon: React.FC<{ open: boolean }> = ({ open }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
           -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7
           a9.958 9.958 0 012.223-3.592M6.53 6.53A9.956 9.956 0 0112 5
           c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.072 5.468
           M3 3l18 18" />
    </svg>
  );

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: string })?.from ?? '/employees';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({ mode: 'onBlur' });

  const emailVal = watch('email');

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
    <div className="min-h-screen flex bg-white">

      {/* ── Left panel — brand / illustration ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative flex-col bg-gray-900 overflow-hidden">
        {/* Gradient mesh */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full bg-indigo-600/25 blur-[120px]" />
          <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] rounded-full bg-violet-600/20 blur-[100px]" />
          <div className="absolute -bottom-20 left-1/3 w-[320px] h-[320px] rounded-full bg-indigo-500/15 blur-[80px]" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2
                     m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1
                     m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              PeoplePay<span className="text-indigo-400">360</span>
            </span>
          </div>

          {/* Centre headline */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              HR &amp; Payroll Platform
            </p>
            <h2 className="text-4xl font-extrabold text-white leading-[1.18] text-balance">
              Manage your workforce with confidence
            </h2>
            <p className="mt-5 text-base text-gray-400 leading-relaxed">
              Contracts, attendance, time-off, salary rules, and AI-powered insights — all in one place.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              {['Smart Payroll', 'Leave Management', 'Attendance Tracking', 'Role-based Access', 'ML Insights'].map(f => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.07]
                             border border-white/[0.10] text-xs font-medium text-gray-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer quote */}
          <p className="text-xs text-gray-600 pb-2">
            &copy; {new Date().getFullYear()} PeoplePay360 · Built for modern HR teams
          </p>
        </div>
      </div>

      {/* ── Right panel — login form ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-[400px] animate-slide-up">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow shadow-indigo-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2
                     m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1
                     m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">
              PeoplePay<span className="text-indigo-600">360</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your workspace</p>

          {/* Error banner */}
          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200
                         text-red-700 text-sm mb-6 animate-fade-in"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3
                     L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="field-label">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={`field-input pl-10 ${errors.email ? 'field-input-error' : ''}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="field-label">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`field-input pl-10 pr-10 ${errors.password ? 'field-input-error' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 3, message: 'At least 3 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 h-11 px-5 rounded-lg
                         bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                         text-white text-sm font-semibold
                         shadow-sm hover:shadow-glow-sm
                         transition-all duration-150
                         disabled:opacity-60 disabled:cursor-not-allowed
                         focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="relative flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Demo accounts
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100 shadow-xs">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = emailVal === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc.email, acc.password)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left
                                transition-colors duration-100 group
                                ${isSelected
                                  ? 'bg-indigo-50'
                                  : 'hover:bg-gray-50'
                                }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_COLOR[acc.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {acc.role}
                      </span>
                      <span className="text-xs text-gray-500">{acc.email}</span>
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? 'text-indigo-500' : 'text-gray-300 group-hover:text-gray-500'}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;

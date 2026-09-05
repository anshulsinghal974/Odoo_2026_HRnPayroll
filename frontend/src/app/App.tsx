import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-card border border-neutral-200/80 p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/30">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            PeoplePay360
          </h1>
          <p className="text-sm font-medium text-primary-600 mt-1 uppercase tracking-wider">
            HR &amp; Payroll Operations Platform
          </p>
          <p className="text-neutral-500 mt-3 text-sm leading-relaxed">
            Frontend scaffold initialized with custom Tailwind theme, modular architecture, and design tokens.
          </p>
        </div>

        {/* Palette validation preview */}
        <div className="grid grid-cols-5 gap-2 pt-4 border-t border-neutral-100">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-primary-600 shadow-sm"></div>
            <span className="text-xs font-semibold text-neutral-700">Primary</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-neutral-600 shadow-sm"></div>
            <span className="text-xs font-semibold text-neutral-700">Neutral</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-success-600 shadow-sm"></div>
            <span className="text-xs font-semibold text-neutral-700">Success</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-warning-500 shadow-sm"></div>
            <span className="text-xs font-semibold text-neutral-700">Warning</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-danger-600 shadow-sm"></div>
            <span className="text-xs font-semibold text-neutral-700">Danger</span>
          </div>
        </div>

        <div className="text-xs text-neutral-400">
          Module FE-01 · Scaffold &amp; Design System Active
        </div>
      </div>
    </div>
  );
};

export default App;

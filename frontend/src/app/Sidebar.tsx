// Sidebar — primary navigation for all authenticated pages.
// Collapsible: expanded (220 px) ↔ collapsed (64 px).
// Persists collapse state in localStorage.

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { useRBAC } from '../hooks/useRBAC';
import { Badge } from '../components';

// ── Types ────────────────────────────────────────────────────────────────────
type AccessModule = 'employees' | 'contracts' | 'attendance' | 'time-off' | 'payroll' | 'dashboard' | 'reports';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  module: AccessModule;
}

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon: React.FC<{ d: string | string[]; className?: string }> = ({ d, className = 'w-[18px] h-[18px]' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    {(Array.isArray(d) ? d : [d]).map((path, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={path} />
    ))}
  </svg>
);

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard', label: 'Dashboard', module: 'dashboard',
    icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    to: '/employees', label: 'Employees', module: 'employees',
    icon: <Icon d={[
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    ]} />,
  },
  {
    to: '/contracts', label: 'Contracts', module: 'contracts',
    icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  },
  {
    to: '/attendance', label: 'Attendance', module: 'attendance',
    icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    to: '/time-off', label: 'Time Off', module: 'time-off',
    icon: <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  },
  {
    to: '/payroll', label: 'Payroll', module: 'payroll',
    icon: <Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    to: '/reports', label: 'Reports', module: 'dashboard',
    icon: <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  },
];

const ROLE_BADGE: Record<string, 'primary' | 'success' | 'warning' | 'neutral' | 'danger'> = {
  'Admin':              'danger' as never,
  'HR Manager':         'success',
  'HR Payroll Manager': 'primary',
  'HR Payroll User':    'primary',
  'Employee':           'neutral',
};

// ── Collapse toggle button ────────────────────────────────────────────────────
const CollapseIcon: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

// ── Sidebar ───────────────────────────────────────────────────────────────────
export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { canAccessModule } = useRBAC();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try { localStorage.setItem('sidebar-collapsed', String(collapsed)); } catch { /* noop */ }
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const visibleNav = NAV_ITEMS.filter(item => canAccessModule(item.module));

  const initials = user
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <aside
      className={`
        sidebar transition-[width] duration-300 ease-in-out
        ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}
      `}
      aria-label="Primary navigation"
    >
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div
        className={`
          flex items-center h-[60px] shrink-0 px-4
          border-b border-white/[0.06]
          ${collapsed ? 'justify-center' : 'gap-3'}
        `}
      >
        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2
                 m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1
                 m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        {!collapsed && (
          <span className="font-bold text-[15px] text-white tracking-tight leading-none">
            PeoplePay<span className="text-indigo-400">360</span>
          </span>
        )}
      </div>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-0.5 scrollbar-none">
        {visibleNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => `
              nav-item group
              ${isActive ? 'nav-item-active' : 'nav-item-default'}
              ${collapsed ? 'justify-center px-0 w-full' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-full" />
                )}
                <span className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="truncate text-[13.5px]">{item.label}</span>
                )}
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="tooltip top-1/2 -translate-y-1/2">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom — user + collapse ───────────────────────────────── */}
      <div className="shrink-0 border-t border-white/[0.06] px-2.5 py-3 space-y-1">

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`
            nav-item nav-item-default w-full
            ${collapsed ? 'justify-center px-0' : ''}
          `}
        >
          <span className="shrink-0">
            <CollapseIcon collapsed={collapsed} />
          </span>
          {!collapsed && <span className="text-[13px]">Collapse</span>}
        </button>

        {/* User row */}
        {user && (
          <div
            className={`
              flex items-center rounded-lg px-2 py-2 gap-2.5 group
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-[11px] font-bold shrink-0">
              {initials}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate leading-tight">{user.name}</p>
                <Badge
                  variant={(ROLE_BADGE[user.role] as 'primary' | 'success' | 'warning' | 'neutral') ?? 'neutral'}
                  size="sm"
                  className="mt-0.5"
                >
                  {user.role}
                </Badge>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 shrink-0"
              aria-label="Sign out"
            >
              <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

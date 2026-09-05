// TopNav — primary navigation bar for all authenticated pages.
// Shows the brand logo + 6 module links + user info + logout.
// Per-role link hiding comes in FE-10 (RBAC UI enforcement).

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { Badge } from '../components';

const NAV_LINKS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    to: '/employees',
    label: 'Employees',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/contracts',
    label: 'Contracts',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    to: '/attendance',
    label: 'Attendance',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/time-off',
    label: 'Time Off',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/payroll',
    label: 'Payroll',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
] as const;

// Map role to a badge variant
const ROLE_BADGE: Record<string, 'primary' | 'success' | 'warning' | 'neutral'> = {
  Admin: 'danger' as never,
  'HR Manager': 'success',
  'HR Payroll Manager': 'primary',
  'HR Payroll User': 'primary',
  Employee: 'neutral',
};

import { useRBAC } from '../hooks/useRBAC';

export function TopNav() {
  const { user, logout } = useAuth();
  const { canAccessModule } = useRBAC();
  const navigate = useNavigate();

  const visibleNavLinks = NAV_LINKS.filter((link) => {
    if (link.to === '/dashboard' || link.to === '/reports') return canAccessModule('dashboard');
    if (link.to === '/employees') return canAccessModule('employees');
    if (link.to === '/contracts') return canAccessModule('contracts');
    if (link.to === '/attendance') return canAccessModule('attendance');
    if (link.to === '/time-off') return canAccessModule('time-off');
    if (link.to === '/payroll') return canAccessModule('payroll');
    return true;
  });


  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">

          {/* Brand */}
          <NavLink
            to="/employees"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm shadow-primary-500/30 group-hover:bg-primary-700 transition-colors">
              <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-neutral-900 text-[15px] tracking-tight hidden sm:block">
              PeoplePay<span className="text-primary-600">360</span>
            </span>
          </NavLink>

          {/* Nav Links */}
          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
            {visibleNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150 whitespace-nowrap group
                  ${isActive
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`transition-colors ${isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary-600" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Info + Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {user && (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-semibold text-neutral-800 leading-none">{user.name}</span>
                  <Badge
                    variant={(ROLE_BADGE[user.role] as 'primary' | 'success' | 'warning' | 'neutral') || 'neutral'}
                    size="sm"
                    className="mt-1"
                  >
                    {user.role}
                  </Badge>
                </div>

                {/* Avatar Circle */}
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors duration-150"
                >
                  <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

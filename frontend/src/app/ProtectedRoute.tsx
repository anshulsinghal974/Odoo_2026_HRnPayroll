// ProtectedRoute — redirects unauthenticated users to /login.
// Passes the attempted URL so the login page can redirect back after login.
// Per-role access control (RBAC hiding) is implemented in FE-10.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { Spinner } from '../components';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While token hydration from localStorage is in progress, show a full-page loader
  // to avoid flashing the login page to an already authenticated user.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="primary" />
          <span className="text-xs font-medium text-neutral-500">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the current URL so login can redirect back
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

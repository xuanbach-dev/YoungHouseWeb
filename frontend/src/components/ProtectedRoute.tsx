import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ADMIN_FLAG_KEY = 'yh_admin_auth';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthed = typeof window !== 'undefined' && localStorage.getItem(ADMIN_FLAG_KEY) === 'true';

  if (!isAuthed) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;


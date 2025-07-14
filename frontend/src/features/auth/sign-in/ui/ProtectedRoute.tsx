import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../../../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  console.log('[ProtectedRoute] render', { pathname: location.pathname, user, loading, children });

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
} 

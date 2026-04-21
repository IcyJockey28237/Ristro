import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute - Wraps pages that require authentication.
 * @param {string} role - Optional. If set, only users with this role can access.
 * @param {React.ReactNode} children - The page component to render.
 */
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ristro-bg flex items-center justify-center">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  // Not logged in → redirect to auth
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Wrong role → redirect to their correct dashboard
  if (role && user.role !== role) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/menu" replace />;
  }

  return children;
}

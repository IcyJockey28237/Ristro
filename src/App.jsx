import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./components/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function AuthRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ristro-bg flex items-center justify-center">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  // If already logged in, redirect to appropriate dashboard
  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/menu"} replace />;
  }

  return <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth page — redirects if already logged in */}
          <Route path="/" element={<AuthRedirect />} />

          {/* Customer routes */}
          <Route
            path="/menu"
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  const location = useLocation();

  // ✅ Wait until auth state is fully loaded
  if (loading) return null;

  // ✅ Allow public routes
  if (location.pathname === "/login" || location.pathname === "/register") {
    return children;
  }

  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

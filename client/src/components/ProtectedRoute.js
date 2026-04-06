import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, user }) => {
  const token = localStorage.getItem("token");

  // ✅ allow if either user OR token exists
  if (!user && !token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;


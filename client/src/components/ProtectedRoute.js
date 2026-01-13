import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  // ⏳ wait until token is resolved
  if (token === undefined) {
    return <p>Loading...</p>;
  }

  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;


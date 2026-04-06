import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";

function App() {
  // ✅ MUST be inside component
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Auth */}
        <Route
          path="/login"
          element={<AuthPage setUser={setUser} />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
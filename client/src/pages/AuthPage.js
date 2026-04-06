import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      /* ================= FORGOT PASSWORD ================= */
      if (isForgot) {
        await api.post("/api/auth/forgot-password", { email });
        toast.success("Reset link sent to email");
        return;
      }

      /* ================= LOGIN ================= */
      if (isLogin) {
        const res = await api.post("/api/auth/login", {
          email,
          password
        });

        // ✅ store token
        localStorage.setItem("token", res.data.token);

        // ✅ set user
        setUser(res.data.user);

        toast.success("Login successful");

        // 🔥 FIX: delay navigation slightly (ensures state update)
        setTimeout(() => {
          navigate("/dashboard");
        }, 100);
      }

      /* ================= REGISTER ================= */
      else {
        await api.post("/api/auth/register", {
          email,
          password
        });

        toast.success("Account created! Please login.");
        setIsLogin(true);
      }

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>
          {isForgot
            ? "Forgot Password"
            : isLogin
            ? "Login"
            : "Create Account"}
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        {!isForgot && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {/* BUTTON */}
        <button onClick={handleSubmit}>
          {isForgot
            ? "Send Reset Link"
            : isLogin
            ? "Login"
            : "Register"}
        </button>

        {/* SWITCH LOGIN / REGISTER */}
        {!isForgot && (
          <p className="auth-switch">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>
        )}

        {/* FORGOT PASSWORD */}
        {isLogin && !isForgot && (
          <p
            className="auth-forgot"
            onClick={() => setIsForgot(true)}
          >
            Forgot Password?
          </p>
        )}

        {/* BACK */}
        {isForgot && (
          <p
            className="auth-back"
            onClick={() => setIsForgot(false)}
          >
            Back to Login
          </p>
        )}

      </div>
    </div>
  );
};

export default AuthPage;
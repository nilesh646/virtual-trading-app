import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "../auth.css";

const AuthPage = ({ setUser }) => {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: "", color: "" },
      { label: "Weak", color: "#f87171" },
      { label: "Fair", color: "#fb923c" },
      { label: "Good", color: "#facc15" },
      { label: "Strong", color: "#4ade80" },
    ];
    return { score, ...levels[score] };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
      if (strength.score < 2) { setError("Please use a stronger password."); return; }
    }

    setLoading(true);
    try {
      if (mode === "forgot") {
        await api.post("/api/auth/forgot-password", { email });
        toast.success("Reset link sent to your email");
        setMode("login");
        return;
      }

      if (mode === "login") {
        const res = await api.post("/api/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        toast.success("Welcome back!");
        setTimeout(() => navigate("/dashboard"), 100);
      } else {
        await api.post("/api/auth/register", { name, email, password });
        toast.success("Account created! Please sign in.");
        setMode("login");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const EyeOpen = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.3 8C2.8 5 5.3 3 8 3s5.2 2 6.7 5c-1.5 3-4 5-6.7 5S2.8 11 1.3 8z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );

  const EyeOff = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M4.3 4.4C3.1 5.2 2.1 6.4 1.3 8c1.5 3 4 5 6.7 5 1.2 0 2.3-.4 3.3-1M7 3.1C7.2 3 7.6 3 8 3c2.7 0 5.2 2 6.7 5-.4.9-1 1.7-1.6 2.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const titles = { login: "Welcome back", register: "Create account", forgot: "Reset password" };
  const subtitles = { login: "Sign in to continue to your account", register: "Join us today — it's free to get started", forgot: "We'll send a reset link to your email" };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-lines" />
      </div>

      <div className={`auth-card ${mode === "register" ? "auth-card--wide" : ""}`}>
        <div className="auth-card-inner">

          {/* Header */}
          <div className="auth-header">
            <div className="brand-mark">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="url(#brandGrad)"/>
                <path d="M10 18L16 24L26 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1"/>
                    <stop offset="1" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="auth-title">{titles[mode]}</h1>
            <p className="auth-subtitle">{subtitles[mode]}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5"/>
                <path d="M8 5v3M8 11h.01" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">

            {/* Name — register only */}
            {mode === "register" && (
              <div className="field-group">
                <label className="field-label" htmlFor="ap-name">Full name</label>
                <div className="field-wrapper">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input id="ap-name" type="text" className="field-input" placeholder="John Doe"
                    value={name} onChange={e => setName(e.target.value)} required autoComplete="name"/>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="field-group">
              <label className="field-label" htmlFor="ap-email">Email address</label>
              <div className="field-wrapper">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </span>
                <input id="ap-email" type="email" className="field-input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
              </div>
            </div>

            {/* Password */}
            {mode !== "forgot" && (
              <div className="field-group">
                <div className="field-label-row">
                  <label className="field-label" htmlFor="ap-password">Password</label>
                  {mode === "login" && (
                    <span className="field-link" style={{cursor:"pointer"}} onClick={() => { setMode("forgot"); setError(""); }}>
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="field-wrapper">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input id="ap-password" type={showPassword ? "text" : "password"} className="field-input"
                    placeholder={mode === "register" ? "Min. 8 characters" : "••••••••"}
                    value={password} onChange={e => setPassword(e.target.value)} required
                    autoComplete={mode === "register" ? "new-password" : "current-password"}/>
                  <button type="button" className="field-toggle" onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff/> : <EyeOpen/>}
                  </button>
                </div>
                {mode === "register" && password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="strength-bar"
                          style={{background: i <= strength.score ? strength.color : "var(--border)"}}/>
                      ))}
                    </div>
                    <span className="strength-label" style={{color: strength.color}}>{strength.label}</span>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password — register only */}
            {mode === "register" && (
              <div className="field-group">
                <label className="field-label" htmlFor="ap-confirm">Confirm password</label>
                <div className="field-wrapper">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input id="ap-confirm" type={showPassword ? "text" : "password"}
                    className={`field-input ${confirmPassword && confirmPassword !== password ? "field-input--error" : ""}`}
                    placeholder="Re-enter password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password"/>
                  {confirmPassword && confirmPassword === password && (
                    <span className="field-success">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7l3 3 5-6" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            )}

            <button type="submit" className={`auth-btn${loading ? " loading" : ""}`} disabled={loading}>
              {loading ? (
                <><span className="spinner"/> {mode === "login" ? "Signing in..." : mode === "register" ? "Creating account..." : "Sending..."}</>
              ) : (
                mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"
              )}
            </button>
          </form>

          {/* Footer links */}
          <p className="auth-footer">
            {mode === "login" && <>Don't have an account? <span className="auth-link" style={{cursor:"pointer"}} onClick={() => { setMode("register"); setError(""); }}>Create one</span></>}
            {mode === "register" && <>Already have an account? <span className="auth-link" style={{cursor:"pointer"}} onClick={() => { setMode("login"); setError(""); }}>Sign in</span></>}
            {mode === "forgot" && <>Remembered it? <span className="auth-link" style={{cursor:"pointer"}} onClick={() => { setMode("login"); setError(""); }}>Back to sign in</span></>}
          </p>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;

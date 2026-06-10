import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "../auth.css";

const AuthPage = ({ setUser }) => {
  const [mode, setMode] = useState("login"); // login | register | forgot | otp | reset
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP + reset
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  const navigate = useNavigate();

  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Weak", color: "#f87171" },
      { score: 2, label: "Fair", color: "#fb923c" },
      { score: 3, label: "Good", color: "#facc15" },
      { score: 4, label: "Strong", color: "#4ade80" },
    ][s];
  };
  const strength = getStrength(mode === "reset" ? newPassword : password);

  const startCooldown = () => {
    setOtpCooldown(60);
    const t = setInterval(() => setOtpCooldown(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };
  const handleOtpKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
  };
  const handleOtpPaste = (e) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { setOtp(p.split("")); document.getElementById("otp-5")?.focus(); }
    e.preventDefault();
  };

  const resendOtp = async () => {
    if (otpCooldown > 0) return;
    try {
      await api.post("/api/auth/forgot-password", { email });
      toast.success("New OTP sent!"); setOtp(["","","","","",""]); startCooldown();
    } catch { setError("Failed to resend OTP."); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode === "register") {
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }
        if (strength.score < 2) { setError("Please use a stronger password."); return; }
        await api.post("/api/auth/register", { name, email, password });
        toast.success("Account created! Please sign in."); setMode("login"); return;
      }
      if (mode === "login") {
        const res = await api.post("/api/auth/login", { email, password });
        localStorage.setItem("token", res.data.token); setUser(res.data.user);
        toast.success("Welcome back!"); setTimeout(() => navigate("/dashboard"), 100); return;
      }
      if (mode === "forgot") {
        await api.post("/api/auth/forgot-password", { email });
        toast.success("OTP sent! Check your inbox."); setOtp(["","","","","",""]); startCooldown(); setMode("otp"); return;
      }
      if (mode === "otp") {
        const otpStr = otp.join("");
        if (otpStr.length < 6) { setError("Enter all 6 digits."); return; }
        const res = await api.post("/api/auth/verify-otp", { email, otp: otpStr });
        setResetToken(res.data.resetToken); toast.success("OTP verified!"); setMode("reset"); return;
      }
      if (mode === "reset") {
        if (newPassword !== confirmNew) { setError("Passwords do not match."); return; }
        if (strength.score < 2) { setError("Please use a stronger password."); return; }
        await api.post("/api/auth/reset-password", { resetToken, newPassword });
        toast.success("Password reset! Please sign in."); setMode("login"); setNewPassword(""); setConfirmNew(""); return;
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally { setLoading(false); }
  };

  const EyeOpen = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.3 8C2.8 5 5.3 3 8 3s5.2 2 6.7 5c-1.5 3-4 5-6.7 5S2.8 11 1.3 8z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>;
  const EyeOff = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M4.3 4.4C3.1 5.2 2.1 6.4 1.3 8c1.5 3 4 5 6.7 5 1.2 0 2.3-.4 3.3-1M7 3.1C7.2 3 7.6 3 8 3c2.7 0 5.2 2 6.7 5-.4.9-1 1.7-1.6 2.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;

  const titles = { login: "Welcome back", register: "Create account", forgot: "Forgot password", otp: "Enter OTP", reset: "Set new password" };
  const subs = { login: "Sign in to continue to your account", register: "Join us today — it's free", forgot: "We'll send a 6-digit OTP to your email", otp: `OTP sent to ${email} · expires in 10 min`, reset: "Choose a strong new password" };
  const btnLabels = { login: "Sign in", register: "Create account", forgot: "Send OTP", otp: "Verify OTP", reset: "Reset password" };
  const loadingLabels = { login: "Signing in...", register: "Creating account...", forgot: "Sending OTP...", otp: "Verifying...", reset: "Resetting..." };


  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
        <div className="grid-lines"/>
      </div>

      <div className={`auth-card ${mode === "register" ? "auth-card--wide" : ""}`}>
        <div className="auth-card-inner">
          <div className="auth-header">
            <div className="brand-mark">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="url(#bg)"/>
                <path d="M10 18L16 24L26 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs><linearGradient id="bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
              </svg>
            </div>
            <h1 className="auth-title">{titles[mode]}</h1>
            <p className="auth-subtitle">{subs[mode]}</p>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5"/><path d="M8 5v3M8 11h.01" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name */}
            {mode === "register" && (
              <div className="field-group">
                <label className="field-label" htmlFor="ap-name">Full name</label>
                <div className="field-wrapper">
                  <span className="field-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                  <input id="ap-name" type="text" className="field-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required autoComplete="name"/>
                </div>
              </div>
            )}

            {/* Email */}
            {["login","register","forgot"].includes(mode) && (
              <div className="field-group">
                <label className="field-label" htmlFor="ap-email">Email address</label>
                <div className="field-wrapper">
                  <span className="field-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg></span>
                  <input id="ap-email" type="email" className="field-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
                </div>
              </div>
            )}

            {/* OTP boxes */}
            {mode === "otp" && (
              <div className="field-group">
                <label className="field-label">6-digit OTP</label>
                <div className="otp-boxes" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                      className={`otp-box ${digit ? "otp-box--filled" : ""}`}
                      value={digit} onChange={e => handleOtpChange(e.target.value, i)}
                      onKeyDown={e => handleOtpKey(e, i)} autoFocus={i === 0}/>
                  ))}
                </div>
                <div className="otp-resend">
                  {otpCooldown > 0
                    ? <span className="otp-resend-timer">Resend in {otpCooldown}s</span>
                    : <span className="otp-resend-link" onClick={resendOtp}>Resend OTP</span>}
                </div>
              </div>
            )}

            {/* Password (login/register) */}
            {["login","register"].includes(mode) && (
              <div className="field-group">
                <div className="field-label-row">
                  <label className="field-label" htmlFor="ap-pwd">Password</label>
                  {mode === "login" && <span className="field-link" style={{cursor:"pointer"}} onClick={() => { setMode("forgot"); setError(""); }}>Forgot password?</span>}
                </div>
                <div className="field-wrapper">
                  <span className="field-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                  <input id="ap-pwd" type={showPassword ? "text" : "password"} className="field-input"
                    placeholder={mode === "register" ? "Min. 8 characters" : "••••••••"}
                    value={password} onChange={e => setPassword(e.target.value)} required
                    autoComplete={mode === "register" ? "new-password" : "current-password"}/>
                  <button type="button" className="field-toggle" onClick={() => setShowPassword(p => !p)}>{showPassword ? <EyeOff/> : <EyeOpen/>}</button>
                </div>
                {mode === "register" && password && (
                  <div className="password-strength">
                    <div className="strength-bars">{[1,2,3,4].map(i => <div key={i} className="strength-bar" style={{background: i <= strength.score ? strength.color : "var(--border)"}}/>)}</div>
                    <span className="strength-label" style={{color: strength.color}}>{strength.label}</span>
                  </div>
                )}
              </div>
            )}

            {/* Confirm password (register) */}
            {mode === "register" && (
              <div className="field-group">
                <label className="field-label" htmlFor="ap-confirm">Confirm password</label>
                <div className="field-wrapper">
                  <span className="field-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                  <input id="ap-confirm" type={showPassword ? "text" : "password"}
                    className={`field-input ${confirmPassword && confirmPassword !== password ? "field-input--error" : ""}`}
                    placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password"/>
                  {confirmPassword && confirmPassword === password && <span className="field-success"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
                </div>
              </div>
            )}

            {/* New password (reset) */}
            {mode === "reset" && (
              <>
                <div className="field-group">
                  <label className="field-label" htmlFor="ap-newpwd">New password</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                    <input id="ap-newpwd" type={showPassword ? "text" : "password"} className="field-input" placeholder="Min. 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password"/>
                    <button type="button" className="field-toggle" onClick={() => setShowPassword(p => !p)}>{showPassword ? <EyeOff/> : <EyeOpen/>}</button>
                  </div>
                  {newPassword && (
                    <div className="password-strength">
                      <div className="strength-bars">{[1,2,3,4].map(i => <div key={i} className="strength-bar" style={{background: i <= strength.score ? strength.color : "var(--border)"}}/>)}</div>
                      <span className="strength-label" style={{color: strength.color}}>{strength.label}</span>
                    </div>
                  )}
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="ap-confirmnew">Confirm new password</label>
                  <div className="field-wrapper">
                    <span className="field-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                    <input id="ap-confirmnew" type={showPassword ? "text" : "password"}
                      className={`field-input ${confirmNew && confirmNew !== newPassword ? "field-input--error" : ""}`}
                      placeholder="Re-enter new password" value={confirmNew} onChange={e => setConfirmNew(e.target.value)} required autoComplete="new-password"/>
                    {confirmNew && confirmNew === newPassword && <span className="field-success"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>}
                  </div>
                </div>
              </>
            )}

            <button type="submit" className={`auth-btn${loading ? " loading" : ""}`} disabled={loading}>
              {loading ? <><span className="spinner"/>{loadingLabels[mode]}</> : btnLabels[mode]}
            </button>
          </form>

          <p className="auth-footer">
            {mode === "login" && <>Don't have an account? <span className="auth-link" style={{cursor:"pointer"}} onClick={() => { setMode("register"); setError(""); }}>Create one</span></>}
            {mode === "register" && <>Already have an account? <span className="auth-link" style={{cursor:"pointer"}} onClick={() => { setMode("login"); setError(""); }}>Sign in</span></>}
            {["forgot","otp","reset"].includes(mode) && <span className="auth-link" style={{cursor:"pointer"}} onClick={() => { setMode("login"); setError(""); setOtp(["","","","","",""]); }}>← Back to sign in</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
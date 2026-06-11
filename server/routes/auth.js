const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const User = require("../models/User");

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory OTP store
const otpStore = new Map();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ error: "All fields required" });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= FORGOT PASSWORD — send OTP ================= */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If that email exists, an OTP was sent." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min
    otpStore.set(email, { otp, expiresAt });

    console.log(`📧 Sending OTP ${otp} to ${email}`);

    const { error } = await resend.emails.send({
      from: "TraderPro <onboarding@resend.dev>", // use this until you verify your domain
      to: email,
      subject: "Your TraderPro Password Reset OTP",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#0f0f1a;color:#e8e8f0;border-radius:12px;padding:32px;">
          <h2 style="color:#6366f1;margin:0 0 8px">TraderPro</h2>
          <p style="color:#9090b0;margin:0 0 24px;font-size:14px">Password Reset Request</p>
          <p style="margin:0 0 16px">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#1a1a28;border:1px solid #2f2f50;border-radius:10px;padding:24px;text-align:center;margin:0 0 24px">
            <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#ffffff;font-family:monospace">${otp}</span>
          </div>
          <p style="color:#55557a;font-size:13px;margin:0">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send OTP. Try again." });
    }

    console.log(`✅ OTP sent successfully to ${email}`);
    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("OTP send error:", err);
    res.status(500).json({ error: "Failed to send OTP. Try again." });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = otpStore.get(email);
    if (!record)
      return res.status(400).json({ error: "No OTP found. Request a new one." });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP expired. Request a new one." });
    }
    if (record.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP. Please try again." });

    const resetToken = jwt.sign(
      { email, purpose: "reset" },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "15m" }
    );
    otpStore.delete(email);
    res.json({ resetToken });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password", async (req, res) => {
  const { resetToken, newPassword } = req.body;
  try {
    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET || "secret123");
    } catch {
      return res.status(400).json({ error: "Reset token expired or invalid." });
    }
    if (payload.purpose !== "reset")
      return res.status(400).json({ error: "Invalid token." });
    const user = await User.findOne({ email: payload.email });
    if (!user) return res.status(400).json({ error: "User not found." });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
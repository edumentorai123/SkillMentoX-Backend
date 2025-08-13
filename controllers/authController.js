import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../utils/sendMail.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../validation/authValidation.js";
import User from "../models/user.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, provider: user.provider },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};


export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { firstName, lastName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      provider: "email",
      isVerified: false,
      otpCode: crypto.createHash("sha256").update(otp).digest("hex"),
      otpExpires: Date.now() + 10 * 60 * 1000
    });
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - OTP",
      html: `<p>Your OTP code is: <b>${otp}</b>. It expires in 10 minutes.</p>`
    });

    res.status(201).json({
      message: "OTP sent to your email. Please verify.",
      userId: user._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      _id: userId,
      otpCode: hashedOtp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




export const setRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["mentor", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email first" });

    user.role = role;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Welcome to Your App 🎉",
      html: `<p>Hi ${user.firstName},</p>
             <p>Welcome! You are now registered as a <b>${role}</b>.</p>`
    });

    res.json({ message: "Role set and welcome email sent", user: { id: user._id, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      message: "Logged in",
      token,
      user: { id: user._id, email: user.email, firstName: user.firstName, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing id token" });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const firstName = payload.given_name || payload.name?.split(" ")[0] || "";
    const lastName = payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "";

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
        provider: "google"
      });
      await user.save();

      await sendEmail({
        to: user.email,
        subject: "Welcome to Your App",
        html: `<p>Welcome ${user.firstName}! Please select your role in the app.</p>`
      });

      const token = generateToken(user);
      return res.status(201).json({
        message: "User created via Google - select role",
        user: { id: user._id, email: user.email, firstName: user.firstName },
        token
      });
    }

    const token = generateToken(user);
    res.json({
      message: "Google login success",
      token,
      user: { id: user._id, email: user.email, firstName: user.firstName, role: user.role }
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google auth failed" });
  }
};



export const forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "If that email exists, a reset link was sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const html = `
      <p>You requested a password reset</p>
      <p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `;

    try {
      await sendEmail({ to: user.email, subject: "Password Reset", html });
      res.json({ message: "Reset link sent to email" });
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      console.error("Email send error:", emailErr);
      res.status(500).json({ message: "Could not send email" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      html: `<p>Your password has been updated.</p>`
    });

    const tokenJwt = generateToken(user);
    res.json({ message: "Password updated", token: tokenJwt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../utils/sendMail.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validation/authValidation.js";
import User from "../models/User.js";
import TempUser from "../models/tempUser.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      provider: user.provider,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { firstName, lastName, email, password, role } = req.body;

    if (!["mentor", "student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    console.log(`Registration attempt for email: ${email}`);
    // Clean up expired temp users before checking for existing users
    await TempUser.deleteMany({
      otpExpires: { $lt: Date.now() - 24 * 60 * 60 * 1000 },
    });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // If a temp user exists with the same email, delete it to allow re-registration (sends a new OTP)
    await TempUser.deleteOne({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create temporary user
    const tempUser = new TempUser({
      firstName,
      lastName,
      email,
      password,
      role,
      provider: "email",
      otpCode: crypto.createHash("sha256").update(otp).digest("hex"),
      otpExpires: Date.now() + 10 * 60 * 1000,
    });
    console.log(`Creating TempUser for: ${email}`);
    await tempUser.save();

    console.log(`Sending OTP email to: ${email}`);
    try {
      await sendEmail({
        to: email,
        subject: "Verify Your Email - OTP",
        html: `<p>Your OTP code is: <b>${otp}</b>. It expires in 10 minutes.</p>
                <p>You are registering as a <b>${role}</b>.</p>`,
      });
      console.log(`OTP email sent to: ${email}`);
    } catch (emailError) {
      console.error(`Failed to send email to ${email}:`, emailError);
      // Even if email fails, we should still return an error so the UI stops "Sending..."
      return res.status(500).json({ message: "Verification email could not be sent. Please check your email address or try again later." });
    }

    res.status(201).json({
      message: "OTP sent to your email. Please verify.",
      userId: tempUser._id,
      role,
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

    // Find temporary user
    const tempUser = await TempUser.findOne({
      _id: userId,
      otpCode: hashedOtp,
      otpExpires: { $gt: Date.now() },
    });

    if (!tempUser) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Create permanent user in User collection
    const user = new User({
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      email: tempUser.email,
      password: tempUser.password,
      role: tempUser.role,
      provider: tempUser.provider,
      isVerified: true,
    });
    await user.save();

    // Delete temporary user
    await TempUser.deleteOne({ _id: userId });

    // Clean up expired temp users (older than 24 hours)
    await TempUser.deleteMany({
      otpExpires: { $lt: Date.now() - 24 * 60 * 60 * 1000 },
    });

    await sendEmail({
      to: user.email,
      subject: "Welcome to SkillMentroX 🎉",
      html: `<p>Hi ${user.firstName},</p>
              <p>Welcome to SkillMentroX! You are now registered as a <b>${user.role}</b>.</p>
              <p>Get started by logging in and exploring our platform.</p>`,
    });

    const token = generateToken(user);

    // Set HTTP-only cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.cookie("role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res
        .status(400)
        .json({ message: "User ID and email are required" });
    }

    const tempUser = await TempUser.findOne({ _id: userId, email });
    if (!tempUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already registered and verified" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempUser.otpCode = crypto.createHash("sha256").update(otp).digest("hex");
    tempUser.otpExpires = Date.now() + 10 * 60 * 1000;
    await tempUser.save();

    // Send OTP email
    await sendEmail({
      to: tempUser.email,
      subject: "Verify Your Email - OTP",
      html: `<p>Your new OTP code is: <b>${otp}</b>. It expires in 10 minutes.</p>
             <p>You are registering as a <b>${tempUser.role}</b>.</p>`,
    });

    res.json({
      message: "New OTP sent to your email",
      userId: tempUser._id,
      role: tempUser.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    // Set HTTP-only cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.cookie("role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Logged in",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isPremium: user.isPremium || false,
        avatar: user.avatar || "",
      },
      isPremium: user.isPremium || false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link was sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 1000 * 60 * 60;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
    const resetUrl = `${frontendUrl}/resetPassword/${resetToken}`;
    
    const htmlContent = `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password for your SkillMentorX account. No changes have been made yet.</p>
      <div class="highlight-box">
        <h3>Reset your password</h3>
        <p>Click the button below to choose a new password. This link is valid for 60 minutes.</p>
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <div class="code-block">${resetUrl}</div>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: htmlContent,
      });
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
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      html: `<p>Your password has been updated.</p>`,
    });

    const tokenJwt = generateToken(user);
    res.json({ message: "Password updated", token: tokenJwt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      "firstName lastName email role"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const testEmailTransport = async (req, res) => {
  try {
    const user = process.env.EMAIL_USER?.replace(/^["']|["']$/g, "");
    const pass = process.env.EMAIL_PASS?.replace(/^["']|["']$/g, "");
    
    console.log(`Diagnostic: Testing email for user: ${user}`);
    
    const info = await sendEmail({
      to: user,
      subject: "Diagnostic - SkillMentoX-Backend",
      html: `<h2>Diagnostic Test</h2><p>This is a test email from SkillMentoX.</p><p>Environment User: <b>${user}</b></p>`
    });
    
    res.status(200).json({ 
      message: "Test email sent succesfully! Please check your inbox (edumentorai123@gmail.com).",
      info: info
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
    res.status(500).json({ 
      message: "Test email failed! Here is the error info:",
      error: error.message,
      code: error.code,
      response: error.response,
      command: error.command
    });
  }
};

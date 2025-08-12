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
    { id: User._id, email: user.email, role: user.role, provider: user.provider },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// REGISTER (email/password)
export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { firstName, lastName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      provider: "email"
    });
    await user.save();

    // Send welcome email (role missing atm)
    await sendEmail({
      to: user.email,
      subject: "Welcome to Your App",
      html:` <p> Welcome ${user.firstName}! Please select your role in the app.</p>`
    });

    // Return minimal info; frontend should open role selection modal
    res.status(201).json({
      message: "User created, please select role",
      user: { id: user._id, email: user.email, firstName: user.firstName },
      token: generateToken(user)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN (email/password)
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

// GOOGLE LOGIN
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
        // no password
      });
      await user.save();

      // send welcome email
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

    // existing user -> login
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

// SET ROLE endpoint
export const setRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!["mentor", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ message: "Role set", user: { id: user._id, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "If that email exists, a reset link was sent." });

    // create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const resetUrl = $`{process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const html = `
      <p>You requested a password reset</p>
      <p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `;

    try {
      await sendEmail({ to: user.email, subject: "Password Reset", html });
      res.json({ message: "Reset link sent to email" });
    } catch (emailErr) {
      // Clean up token if email fails
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

// RESET PASSWORD
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

    // Optionally notify success via email
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


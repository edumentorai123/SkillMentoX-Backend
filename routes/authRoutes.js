import express from "express";
import {
  register,
  login,
  googleLogin,
  setRole,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";

const router = express.Router();

// Register & Login
router.post("/register", register);
router.post("/login", login);

// Google
router.post("/google", googleLogin);

// Role (frontend should call this after showing role modal to user)
router.put("/set-role/:userId", setRole);

// Forgot / Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
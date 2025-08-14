import express from "express";
import {
  register,
  login,
  googleLogin,
  setRole,
  forgotPassword,
  resetPassword,
  verifyOtp
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.put("/set-role/:userId", setRole);
router.post("/login", login);
router.post("/google", googleLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
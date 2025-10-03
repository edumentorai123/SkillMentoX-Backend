import express from "express";
import {
    createCheckoutSession,
    stripeWebhook,
    verifySession,
} from "../controllers/subscriptionController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

    router.post("/create-checkout-session", protect, createCheckoutSession);
    router.post("/webhook",express.raw({ type: "application/json" }),stripeWebhook);
    router.post("/verify-session", protect, verifySession);

export default router;

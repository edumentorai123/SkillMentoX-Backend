// backend/routes/mentorRoutes.js
import express from "express";
import {
  createMentorRequest,
  createOrUpdateMentorProfile,
  deleteMentorDocument,
  getMentorProfile,
  getMentorRequests,
  approveMentorRequest,
  rejectMentorRequest,
} from "../controllers/mentorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { courseCategories } from "../data/courseCategories.js";

const router = express.Router();

// Course categories
router.get("/courseCategories", (req, res) => {
  res.json({ success: true, data: courseCategories });
});

// Mentor profile routes
router.post(
  "/updateProfile",
  protect,
  authorize("mentor"),
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "qualificationProof", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  createOrUpdateMentorProfile
);
router.get("/profile", protect, getMentorProfile);
router.delete("/document", protect, authorize("mentor"), deleteMentorDocument);


router.post("/mentor-request", protect, createMentorRequest);
router.get("/mentor-requests", protect, getMentorRequests);
router.patch("/mentor-requests/:id/approve", protect, authorize("admin"), approveMentorRequest);
router.patch("/mentor-requests/:id/reject", protect, authorize("admin"), rejectMentorRequest);

export default router;
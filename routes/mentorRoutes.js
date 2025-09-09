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
    { name: "profilePicture", maxCount: 1 },
    { name: "idProof", maxCount: 10 },
    { name: "qualificationProof", maxCount: 10 },
    { name: "cv", maxCount: 10 },
  ]),
  createOrUpdateMentorProfile
);

router.get("/profile", protect, authorize("mentor"), getMentorProfile);

router.delete("/document", protect, authorize("mentor") , deleteMentorDocument);


router.post("/mentor-request", protect, createMentorRequest);
router.get("/mentor-requests", protect, getMentorRequests);
router.patch("/mentor-requests/:id/approve", protect, authorize("admin"), approveMentorRequest);
router.patch("/mentor-requests/:id/reject", protect, authorize("admin"), rejectMentorRequest);

export default router;
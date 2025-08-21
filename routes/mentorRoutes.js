
import express from "express";
import { createOrUpdateMentorProfile, getMentorProfile } from "../controllers/mentorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { courseCategories } from "../data/courseCategories.js";

const router = express.Router();

// New endpoint to fetch course categories
router.get("/courseCategories", (req, res) => {
  res.json({ success: true, data: courseCategories });
});

router.post(
  "/updateProfile",
  protect,
  authorize("mentor"),
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "qualificationProof", maxCount: 1 },
  ]),
  createOrUpdateMentorProfile
);

router.get("/profile", protect, getMentorProfile);

export default router;

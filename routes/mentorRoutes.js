import express from "express";
import {
  createOrUpdateMentorProfile,
  deleteMentorDocument,
  getMentorProfile,
  getMentorStudents,
} from "../controllers/mentorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { courseCategories } from "../data/courseCategories.js";

const router = express.Router();

router.get("/courseCategories", (req, res) => {
  res.json({ success: true, data: courseCategories });
});

router.delete("/document", protect, authorize("mentor"), deleteMentorDocument);
router.get("/getMentorstudents", protect, getMentorStudents);
router.get("/profile", protect, getMentorProfile);
router.put(
  "/updateMentorProfile",
  protect,
  authorize("mentor"),
  createOrUpdateMentorProfile
);

export default router;

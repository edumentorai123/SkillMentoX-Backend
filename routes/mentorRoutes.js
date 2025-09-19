import express from "express";
import {
  createOrUpdateMentorProfile,
  deleteMentorDocument,

  getMentorRequests,
  approveMentorRequest,
  rejectMentorRequest,
  getMentorProfiles,
  createMentorRequest,
  getMentorDetails,

} from "../controllers/mentorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { courseCategories } from "../data/courseCategories.js";
import Mentor from "../models/mentor.js";

const router = express.Router();

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
    { name: "cv", maxCount: 1 },
  ]),
  createOrUpdateMentorProfile
);

router.get("/profile", protect, getMentorProfiles);
router.delete("/document", protect, authorize("mentor"), deleteMentorDocument);


router.get(
  "/admin/mentor-requests",
  protect,
  authorize("admin"),
  getMentorRequests
);



router.get("/getMentorDetails/:id", protect, authorize("admin"), getMentorDetails);


router.delete("/document", protect, authorize("mentor"), deleteMentorDocument);
router.post("/mentor-request", protect, createMentorRequest);
router.get("/mentor-requests", protect, getMentorRequests);
router.patch("/mentor-requests/:id/approve",
  protect,
  authorize("admin"),
  approveMentorRequest
);
router.patch(
  "/mentor-requests/:id/reject",
  protect,
  authorize("admin"),
  rejectMentorRequest
);

export default router;

// import express from "express";
// import { createOrUpdateMentorProfile, getMentorProfile } from "../controllers/mentorController.js";
// import { protect, authorize } from "../middleware/authMiddleware.js";
// import upload from "../middleware/upload.js";
// import { courseCategories } from "../data/courseCategories.js";

// const router = express.Router();

// // New endpoint to fetch course categories
// router.get("/courseCategories", (req, res) => {
//   res.json({ success: true, data: courseCategories });
// });

// router.post(
//   "/updateProfile",
//   protect,
//   authorize("mentor"),
//   upload.fields([
//     { name: "profilePicture", maxCount: 1 },
//     { name: "idProof", maxCount: 1 },
//     { name: "qualificationProof", maxCount: 1 },
//     { name: "cv", maxCount: 1 }, // Added CV upload field
//   ]),
//   createOrUpdateMentorProfile
// );

// router.get("/profile", protect, getMentorProfile);

// export default router;


import express from "express";
import {
  createOrUpdateMentorProfile,
  getMentorProfile,
} from "../controllers/mentorController.js";
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
    { name: "profilePicture", maxCount: 1 }, // single
    { name: "idProof", maxCount: 10 }, // multiple
    { name: "qualificationProof", maxCount: 10 }, // multiple
    { name: "cv", maxCount: 10 }, // multiple
  ]),
  createOrUpdateMentorProfile
);

router.get("/profile", protect, getMentorProfile);

export default router;

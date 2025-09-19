import express from "express";
import { courseCategories } from "../data/courseCategories.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getAllMentors, getAllStudents, getAllUsers } from "../controllers/AdminController.js";

const router = express.Router();



router.get("/getAllmentors", getAllMentors)
router.get("/getAllusers",getAllUsers)
router.get("/getAllStudents",getAllStudents)
 



export default router;

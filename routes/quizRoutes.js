import express from "express";
import { getQuizzes, seedQuizzes, completeQuiz } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/", protect, getQuizzes);
router.post("/seed", seedQuizzes);
router.post("/complete", protect, completeQuiz);

export default router;
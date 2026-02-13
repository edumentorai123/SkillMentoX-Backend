import express from 'express';
import { getCourseById, getCourses } from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCourses);
router.get('/:id', protect, getCourseById);

export default router;

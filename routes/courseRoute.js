import express from 'express';
import { getCourseById, getCourses } from '../controllers/courseController.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);

export default router;

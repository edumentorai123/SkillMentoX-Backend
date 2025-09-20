import CourseModel from '../models/course.js';
import StudentProfile from '../models/StudentProfile.js';

export const getCourses = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Student profile not found" });
        }

        const allCourses = CourseModel.getAllCourses();

        const filteredCourses = allCourses.filter(course =>
            course.stack.toLowerCase().includes(profile.selectedStack.toLowerCase())
        );

        res.status(200).json({ success: true, data: filteredCourses });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching courses",
            error: error.message
        });
    }
};

export const getCourseById = (req, res) => {
    try {
        const course = CourseModel.getCourseById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching course",
            error: error.message
        });
    }
};

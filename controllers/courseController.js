import CourseModel from '../models/course.js';
import StudentProfile from '../models/StudentProfile.js';

export const getCourses = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Student profile not found" });
        }

        // Fetch all courses using standard Mongoose method
        const allCourses = await CourseModel.find({});
        
        // Filter courses where the user's selected stack includes the course's stack tag
        const filteredCourses = allCourses.filter(course => 
            course.stack && profile.selectedStack.toLowerCase().includes(course.stack.toLowerCase())
        );

        res.status(200).json({ success: true, data: filteredCourses });
    } catch (error) {
        console.error("Error fetching courses process:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching courses",
            error: error.message
        });
    }
};

export const getCourseById = async (req, res) => {
    try {
        // Use findById for single document retrieval
        const course = await CourseModel.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching course",
            error: error.message
        });
    }
};

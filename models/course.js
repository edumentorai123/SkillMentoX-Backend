import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    tags: [String],
    stack: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const CourseModel = mongoose.model("Course", courseSchema);

export default CourseModel;

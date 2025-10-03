import mongoose from "mongoose";

const userQuizProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model("UserQuizProgress", userQuizProgressSchema);
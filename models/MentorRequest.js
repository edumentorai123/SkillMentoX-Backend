import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const mentorRequestSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: String,
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    type: {
      type: String,
      enum: [
        "Mentor Application",
        "Account Recovery",
        "Content Report",
        "Session Request",
        "Course Addition",
        "Technical Issue",
        "Refund Request",
        "Feature Request",
      ],
      default: "Mentor Application",
    },
    reviewedBy: { type: Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },
  { timestamps: true }
);

const MentorRequest = mongoose.model("MentorRequest", mentorRequestSchema);
export default MentorRequest;
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  courseName: { type: String, required: true, trim: true },
});

const mentorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to "User" model
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: "" },
    headline: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    currentRole: { type: String, trim: true },
    company: { type: String, trim: true },
    yearsOfExperience: { type: Number, min: 0 },
    education: [
      {
        degree: { type: String, trim: true },
        institution: { type: String, trim: true },
        year: { type: String, trim: true },
      },
    ],
    certifications: [{ type: String, trim: true }],
    courses: [courseSchema], // mentor can select multiple category+course pairs
    email: { type: String, required: true, lowercase: true, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    socialLinks: [{ type: String, trim: true }],
    documents: {
      idProof: [{ type: String, trim: true }],
      qualificationProof: [{ type: String, trim: true }],
    },

    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Mentor = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);

export default Mentor;

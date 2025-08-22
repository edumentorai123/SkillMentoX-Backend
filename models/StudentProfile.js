import mongoose from "mongoose";

const StudentProfile = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, "Please enter a valid phone number"],
    },
    avatar: {
      type: String,
      default: "",
    },

    educationLevel: {
      type: String,
      required: true,
      enum: [
        "High School",
        "Bachelor's Degree",
        "Master's Degree",
        "PhD",
        "Professional Certificate",
        "Self-Taught",
      ],
    },
    selectedCourse: {
      type: String,
      required: true,
      enum: [
        "Web Development",
        "Data Science",
        "Mobile App Development",
        "UI/UX Design",
        "Digital Marketing",
        "Machine Learning",
        "Cybersecurity",
        "Cloud Computing",
        "DevOps",
        "Blockchain Development",
      ],
    },
    selectedStack: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

export default mongoose.model("students", StudentProfile);

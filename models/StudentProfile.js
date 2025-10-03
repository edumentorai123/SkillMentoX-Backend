import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
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
    selectedCategory: {
      type: String,
      required: true,
      trim: true,
    },
    selectedStack: {
      type: String,
      required: true,
      trim: true,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionType: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
      default: null,
    },
    subscriptionStart: {
      type: Date,
      default: null,
    },
    subscriptionEnd: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    subscriptionId: {
      type: String,
      default: null,
    },

    // ===== Request Fields =====
    category: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "resolved"],
      default: "pending",
    },
    stack: {
      type: String,
      trim: true,
    },
    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    replies: [
      {
        mentor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Mentor",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    requestedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Update updatedAt before save
studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
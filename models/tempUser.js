// models/tempUser.js
import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["mentor", "student"], required: true },
  provider: { type: String, default: "email" },
  otpCode: { type: String, required: true },
  otpExpires: { type: Date, required: true },
});

export default mongoose.model("TempUser", tempUserSchema);
import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingProfile = await StudentProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = new StudentProfile({
      userId,
      ...req.body,
    });

    await profile.save();
    res.status(201).json({ data: profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);

    const profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json({ data: profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(req.params.id) },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ data: profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getStudentStacks = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.json({ success: true, data: [profile.selectedStack] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};





// Create request (Student side)
export const createRequest = async (req, res) => {
  try {
      const { category, stack } = req.body;
      const studentId = req.user.id;

      const student = await User.findById(studentId);
      if (!student) {
          return res.status(404).json({ message: "Student not found" });
      }

      const request = await StudentProfile.findOneAndUpdate(
          { userId: studentId },
          { category, stack, status: "pending" },
          { new: true, runValidators: true }
      );

      if (!request) {
          return res.status(404).json({ message: "Profile not found. Please create profile first." });
      }

      res.status(201).json({ message: "Request created", request });
  } catch (err) {
      console.error("Error creating request:", err);
      res.status(500).json({
          message: "Internal server error",
          error: err.message,
      });
  }
};

// Get requests (Admin side)
export const getAllRequests = async (req, res) => {
  try {
      const requests = await StudentProfile.find()
          .populate("student", "name email")
          .populate("assignedMentor", "name expertise");

      res.json({ requests });
  } catch (err) {
      console.error("Error fetching requests:", err);
      res.status(500).json({
          message: "Internal server error",
          error: err.message,
      });
  }
};

// Get my requests (Student side)
export const getMyRequests = async (req, res) => {
  try {
      const studentId = req.user.id;

      const requests = await StudentProfile.find({ student: studentId })
          .populate("assignedMentor", "name expertise");

      res.json({ requests });
  } catch (err) {
      console.error("Error fetching student requests:", err);
      res.status(500).json({
          message: "Internal server error",
          error: err.message,
      });
  }
};

// Update request (Admin accepts + assigns mentor)
export const updateRequestStatus = async (req, res) => {
  try {
      const { id } = req.params;
      const { status, mentorId, notes } = req.body;

      const request = await StudentProfile.findById(id);
      if (!request) {
          return res.status(404).json({ message: "Request not found" });
      }

      request.status = status || request.status;
      if (mentorId) request.assignedMentor = mentorId;
      if (notes) request.notes = notes;

      await request.save();

      res.json({ message: "Request updated", request });
  } catch (err) {
      console.error("Error updating request:", err);
      res.status(500).json({
          message: "Internal server error",
          error: err.message,
      });
  }
};

// Get assigned requests (Mentor side)
export const getAssignedRequests = async (req, res) => {
  try {
      const mentorId = req.user.id;

      const requests = await StudentProfile.find({ assignedMentor: mentorId })
          .populate("student", "name email")
          .populate("assignedMentor", "fullName")
          .populate("replies.mentor", "fullName");

      res.json({ requests });
  } catch (err) {
      console.error("Error fetching assigned requests:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};

// Reply to request (Mentor side)
export const replyToRequest = async (req, res) => {
  try {
      const { id } = req.params;
      const { text } = req.body;
      const mentorId = req.user.id;

      const request = await StudentProfile.findById(id);
      if (!request) return res.status(404).json({ message: "Request not found" });

      if (request.assignedMentor.toString() !== mentorId) {
          return res.status(403).json({ message: "Not authorized to reply to this request" });
      }

      request.replies.push({
          mentor: mentorId,
          text,
          time: new Date(),
      });

      await request.save();

      res.json({ message: "Reply added", request });
  } catch (err) {
      console.error("Error replying to request:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};

// Mark request as resolved (Mentor side)
export const markRequestResolved = async (req, res) => {
  try {
      const { id } = req.params;
      const mentorId = req.user.id;

      const request = await StudentProfile.findById(id);
      if (!request) return res.status(404).json({ message: "Request not found" });

      if (request.assignedMentor.toString() !== mentorId) {
          return res.status(403).json({ message: "Not authorized to update this request" });
      }

      request.status = "resolved";
      await request.save();

      res.json({ message: "Request marked as resolved", request });
  } catch (err) {
      console.error("Error marking request resolved:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};
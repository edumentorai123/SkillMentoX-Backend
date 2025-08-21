import StudentProfile from "../models/StudentProfile.js";


export const createProfile = async (req, res) => {
  try {
    const profile = new StudentProfile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getProfileById = async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, 
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

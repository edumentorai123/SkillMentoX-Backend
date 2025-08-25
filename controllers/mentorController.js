
// import Mentor from "../models/mentor.js";
// import { courseCategories } from "../data/courseCategories.js";
// import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
// import { mentorProfileSchema } from "../validation/mentorValidation.js";

// // Updated isValidCourse
// const isValidCourse = (category, courseName) => {
//   if (!courseCategories[category]) return false;
//   const availableCourses = courseCategories[category].Stacks || courseCategories[category].Languages || [];
//   return availableCourses.includes(courseName);
// };

// const parseJSON = (value, fallback) => {
//   if (!value) return fallback;
//   try {
//     return JSON.parse(value);
//   } catch {
//     return fallback;
//   }
// };


// export const createOrUpdateMentorProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const {
//       fullName,
//       headline,
//       bio,
//       currentRole,
//       company,
//       yearsOfExperience,
//       email,
//       phoneNumber,
//       gender,
//       linkedin,
//       github,
//       portfolio,
//     } = req.body;

//     const education = parseJSON(req.body.education, []);
//     const certifications = parseJSON(req.body.certifications, []);
//     const courses = parseJSON(req.body.courses, []);

//     // Joi validation
//     const { error } = mentorProfileSchema.validate(
//       {
//         fullName,
//         headline,
//         bio,
//         currentRole,
//         company,
//         yearsOfExperience:
//           yearsOfExperience !== undefined
//             ? Number(yearsOfExperience)
//             : undefined,
//         email,
//         phoneNumber,
//         gender,
//         linkedin,
//         github,
//         portfolio,
//         education,
//         certifications,
//         courses,
//       },
//       { abortEarly: false }
//     );

//     if (error) {
//       return res.status(400).json({
//         success: false,
//         message: error.details.map((d) => d.message).join(", "),
//       });
//     }

//     // validate courses manually also
//     if (Array.isArray(courses) && courses.length) {
//       for (const c of courses) {
//         if (!c?.category || !c?.courseName) {
//           return res.status(400).json({
//             success: false,
//             message: "Invalid course payload format. Must have category + courseName",
//           });
//         }
//         if (!isValidCourse(c.category, c.courseName)) {
//           return res.status(400).json({
//             success: false,
//             message: `Invalid course: ${c.category} > ${c.courseName}`,
//           });
//         }
//       }
//     }

//     let profilePictureUrl = "";
//     let idProofUrl = "";
//     let qualificationProofUrl = "";
//     let cvUrl = "";

//     if (req.files?.profilePicture?.[0]) {
//       const up = await uploadBufferToCloudinary(
//         req.files.profilePicture[0],
//         "mentors/profile"
//       );
//       profilePictureUrl = up.secure_url;
//     }
//     if (req.files?.idProof?.[0]) {
//       const up = await uploadBufferToCloudinary(
//         req.files.idProof[0],
//         "mentors/documents"
//       );
//       idProofUrl = up.secure_url;
//     }
//     if (req.files?.qualificationProof?.[0]) {
//       const up = await uploadBufferToCloudinary(
//         req.files.qualificationProof[0],
//         "mentors/documents"
//       );
//       qualificationProofUrl = up.secure_url;
//     }
//     if (req.files?.cv?.[0]) {
//       const up = await uploadBufferToCloudinary(
//         req.files.cv[0],
//         "mentors/documents"
//       );
//       cvUrl = up.secure_url;
//     }

//     const data = {
//       fullName,
//       headline,
//       bio,
//       currentRole,
//       company,
//       email,
//       phoneNumber,
//       gender,
//       linkedin,
//       github,
//       portfolio,
//       education,
//       certifications,
//       courses,
//     };

//     if (yearsOfExperience !== undefined)
//       data.yearsOfExperience = Number(yearsOfExperience) || 0;
//     if (profilePictureUrl) data.profilePicture = profilePictureUrl;

//     data.documents = {};
//     if (idProofUrl) data.documents.idProof = idProofUrl;
//     if (qualificationProofUrl)
//       data.documents.qualificationProof = qualificationProofUrl;
//     if (cvUrl) data.documents.cv = cvUrl;

//     let mentor = await Mentor.findOne({ userId });
//     if (mentor) {
//       mentor = await Mentor.findOneAndUpdate(
//         { userId },
//         { $set: data },
//         { new: true }
//       );
//       return res
//         .status(200)
//         .json({ success: true, message: "Profile updated", data: mentor });
//     } else {
//       const newMentor = await Mentor.create({ userId, ...data });
//       return res
//         .status(201)
//         .json({ success: true, message: "Profile created", data: newMentor });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getMentorProfile = async (req, res) => {
//   try {
//     const mentor = await Mentor.findOne({ userId: req.user.id });
//     if (!mentor)
//       return res
//         .status(404)
//         .json({ success: false, message: "Profile not found" });
//     res.json({ success: true, data: mentor });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// controllers/mentorController.js

import Mentor from "../models/mentor.js";
import { courseCategories } from "../data/courseCategories.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { mentorProfileSchema } from "../validation/mentorValidation.js";

/**
 * NOTE (important for multiple uploads):
 * - Make sure your Mentor schema uses arrays for all document fields you want multiple of:
 *   documents: {
 *     idProof: [String],
 *     qualificationProof: [String],
 *     cv: [String],
 *   }
 * - Keep profilePicture as a single string field at the root (not in documents).
 * - In your route, configure multer with upload.fields and suitable maxCount values.
 */

// helper: validate course
const isValidCourse = (category, courseName) => {
  if (!courseCategories[category]) return false;
  const availableCourses =
    courseCategories[category].Stacks ||
    courseCategories[category].Languages ||
    [];
  return availableCourses.includes(courseName);
};

const parseJSON = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// helper: upload one multer file buffer to cloudinary folder, return secure_url
const uploadOne = async (file, folder) => {
  const up = await uploadBufferToCloudinary(file, folder);
  return up.secure_url;
};

// helper: upload many files in a field (if present), return array of secure_url
const uploadMany = async (filesArray, folder) => {
  if (!filesArray || !Array.isArray(filesArray) || filesArray.length === 0) return [];
  const urls = await Promise.all(filesArray.map((f) => uploadOne(f, folder)));
  return urls;
};

export const createOrUpdateMentorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fullName,
      headline,
      bio,
      currentRole,
      company,
      yearsOfExperience,
      email,
      phoneNumber,
      gender,
      linkedin,
      github,
      portfolio,
    } = req.body;

    const education = parseJSON(req.body.education, []);
    const certifications = parseJSON(req.body.certifications, []);
    const courses = parseJSON(req.body.courses, []);

    // Joi validation (form fields only; documents are handled separately)
    const { error } = mentorProfileSchema.validate(
      {
        fullName,
        headline,
        bio,
        currentRole,
        company,
        yearsOfExperience:
          yearsOfExperience !== undefined ? Number(yearsOfExperience) : undefined,
        email,
        phoneNumber,
        gender,
        linkedin,
        github,
        portfolio,
        education,
        certifications,
        courses,
      },
      { abortEarly: false }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message).join(", "),
      });
    }

    // manual validation for courses as well
    if (Array.isArray(courses) && courses.length) {
      for (const c of courses) {
        if (!c?.category || !c?.courseName) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid course payload format. Must have category + courseName",
          });
        }
        if (!isValidCourse(c.category, c.courseName)) {
          return res.status(400).json({
            success: false,
            message: `Invalid course: ${c.category} > ${c.courseName}`,
          });
        }
      }
    }

    // Fetch existing mentor (needed to merge/append docs)
    const existing = await Mentor.findOne({ userId });

    // --- Uploads ---
    // profilePicture is SINGLE (overwrite if provided)
    const newProfileUrl = req.files?.profilePicture?.[0]
      ? await uploadOne(req.files.profilePicture[0], "mentors/profile")
      : "";

    // These are MULTIPLE: append all new uploads to arrays
    const newIdProofUrls = await uploadMany(
      req.files?.idProof,
      "mentors/documents"
    );
    const newQualificationUrls = await uploadMany(
      req.files?.qualificationProof,
      "mentors/documents"
    );
    const newCvUrls = await uploadMany(req.files?.cv, "mentors/documents");

    // --- Build update document ---
    const setObj = {
      fullName,
      headline,
      bio,
      currentRole,
      company,
      email,
      phoneNumber,
      gender,
      linkedin,
      github,
      portfolio,
      education,
      certifications,
      courses,
    };

    if (yearsOfExperience !== undefined) {
      setObj.yearsOfExperience = Number(yearsOfExperience) || 0;
    }
    if (newProfileUrl) {
      setObj.profilePicture = newProfileUrl; // overwrite
    }

    // If mentor exists -> use $push for arrays so we append; else create with arrays set initially
    let updated;

    if (existing) {
      const updateOps = { $set: setObj };

      // Prepare $push with $each only for fields that have new files
      const pushOps = {};
      if (newIdProofUrls.length) {
        pushOps["documents.idProof"] = { $each: newIdProofUrls };
      }
      if (newQualificationUrls.length) {
        pushOps["documents.qualificationProof"] = { $each: newQualificationUrls };
      }
      if (newCvUrls.length) {
        pushOps["documents.cv"] = { $each: newCvUrls };
      }

      if (Object.keys(pushOps).length) {
        updateOps.$push = pushOps;
      }

      // Ensure documents object exists if missing
      if (!existing.documents) {
        updateOps.$set["documents"] = {
          idProof: existing.documents?.idProof || [],
          qualificationProof: existing.documents?.qualificationProof || [],
          cv: existing.documents?.cv || [],
        };
      }

      updated = await Mentor.findOneAndUpdate({ userId }, updateOps, {
        new: true,
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated",
        data: updated,
      });
    } else {
      // New mentor: create with documents arrays initialized
      const toCreate = {
        userId,
        ...setObj,
        documents: {
          idProof: newIdProofUrls,
          qualificationProof: newQualificationUrls,
          cv: newCvUrls,
        },
      };

      updated = await Mentor.create(toCreate);

      return res.status(201).json({
        success: true,
        message: "Profile created",
        data: updated,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user.id });
    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    res.json({ success: true, data: mentor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

import express from "express";
import { createProfile, createRequest, getAllRequests, getMyRequests, getProfileById, getStudentStacks, updateProfile, updateRequestStatus } from "../controllers/StudentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";



const StudentRoutes = express.Router()

    .post("/createprofile",protect,createProfile)
    .get("/getprofile/:id",protect,getProfileById )
    .put("/updateprofile/:id",protect, updateProfile)
    .get("/mystacks", protect, getStudentStacks)
    .post("/", protect, authorize("student"), createRequest)
    .get("/my", protect, authorize("student"), getMyRequests)
    .get("/", protect, authorize("admin"), getAllRequests)
    .put("/:id", protect, authorize("admin"), updateRequestStatus)


export default StudentRoutes;
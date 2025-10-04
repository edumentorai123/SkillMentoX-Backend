import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import StudentRoutes from "./routes/StudentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { initSocket } from "./socket.js";
import adminRouter from "./routes/adminRoute.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import badgeRoutes from "./routes/badgeRoutes.js"
import progressRoutes from "./routes/progressRoutes.js"
import streakRoutes from "./routes/streakRoutes.js"
import doubtsRoutes from "./routes/doubtsRoutes.js"
import courseRoutes from "./routes/courseRoute.js"


dotenv.config();
const app = express();

connectDB().catch((error) => {
  console.error("Failed to connect to MongoDB, continuing without DB:", error);
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/students", StudentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/achievements", badgeRoutes);
app.use("/api/students/progress", progressRoutes);
app.use("/api/streaks", streakRoutes);
app.use("/api/doubts", doubtsRoutes);
app.use('/api/courses', courseRoutes);




const server = createServer(app);
initSocket(server);
app.use("/api/admin",adminRouter)


const PORT = process.env.PORT || 9999;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
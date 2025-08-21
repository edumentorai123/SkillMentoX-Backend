import multer from "multer";

const storage = multer.memoryStorage(); // keep file in memory buffer
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;

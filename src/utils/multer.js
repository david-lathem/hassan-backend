import multer from "multer";
import path from "node:path";
import AppError from "./appError.js";

const __dirname = import.meta.dirname;

const uploadDir = path.join(__dirname, "..", "alerts");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const channelId = req.params.channelid;

    cb(null, `${channelId}.mp4`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(new AppError("Only MP4 files are allowed", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
});

export default upload;

import multer from "multer";
import type { Request } from "express";

// Use memory storage for multer, which stores the uploaded files in memory as Buffer objects
const storage = multer.memoryStorage();

// Define validation filter to ensure only audio files are accepted
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("audio/")) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only audio files are allowed!")); // Reject the file
    }
};

export const uploadAudio = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    }
})
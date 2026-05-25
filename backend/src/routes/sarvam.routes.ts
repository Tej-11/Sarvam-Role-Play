import { Router } from "express";
import { transcribeAudioController } from "../controllers/sarvam.controller.js";
import { uploadAudio } from "../config/multer.config.js";

export const sarvamRouter = Router();


sarvamRouter.route('/transcribeAudio')
    .post(uploadAudio.single('audio'), transcribeAudioController);
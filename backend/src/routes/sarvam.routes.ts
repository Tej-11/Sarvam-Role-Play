import { Router } from "express";
import { analyzeTextController, textToSpeechController, transcribeAudioController } from "../controllers/sarvam.controller.js";
import { uploadAudio } from "../config/multer.config.js";

export const sarvamRouter = Router();


sarvamRouter.route('/transcribeAudio')
    .post(uploadAudio.single('audio'), transcribeAudioController);

sarvamRouter.route('/analyzeText')
    .post(analyzeTextController);

sarvamRouter.route('/textToSpeech')
    .post(textToSpeechController);
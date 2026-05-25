import { Router } from "express";
import { transcribeAudioController } from "../controllers/sarvam.controller.js";

export const sarvamRouter = Router();


sarvamRouter.route('/transcribeAudio')
    .post(transcribeAudioController)
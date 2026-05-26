

import type { Request, Response, NextFunction } from 'express';
import { sarvamClient } from '../config/sarvam.config.js';
import { analyzeTextService, transcribeAudioService } from '../services/sarvam.services.js';


export const transcribeAudioController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const audioFile = req.file;
        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }
        const sarvamResponse = await transcribeAudioService(
            audioFile.buffer,
            audioFile.originalname,
            audioFile.mimetype
        );
        return res.json(sarvamResponse);
    } catch (error) {
        next(error);
    }
}

export const analyzeTextController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const playerResponse = req.body.text;
        if (!playerResponse) {
            return res.status(400).json({ error: 'No text provided' });
        }
        const sarvamResponse = await analyzeTextService(playerResponse);
        return res.json(sarvamResponse);
    } catch (error) {
        next(error);
    }
}
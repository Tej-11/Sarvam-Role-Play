

import type { Request, Response, NextFunction } from 'express';
import { sarvamClient } from '../config/sarvam.config.js';
import { transcribeAudioService } from '../services/sarvam.services.js';


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
        res.json(sarvamResponse);
    } catch (error) {
        next(error);
    }
}
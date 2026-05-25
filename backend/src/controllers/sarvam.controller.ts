

import type { Request, Response, NextFunction } from 'express';


export const transcribeAudioController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Your transcription logic here
        console.log('Received audio file for transcription:', req);
        res.status(200).json({ message: 'Audio file received for transcription' });
    } catch (error) {
        next(error);
    }
}
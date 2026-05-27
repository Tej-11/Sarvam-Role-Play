

import type { Request, Response, NextFunction } from 'express';
import { sarvamClient } from '../config/sarvam.config.js';
import { analyzeTextService, textToSpeechService, textToSpeechStreamingService, transcribeAudioService } from '../services/sarvam.services.js';


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

export const textToSpeechController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const text = req.body.text;
        const targetLanguage = req.body.targetLanguage || 'en-IN';
        const speaker = req.body.speaker || 'shubh';
        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }
        const audioBuffer = await textToSpeechService(text, targetLanguage, speaker);
        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'content-length': audioBuffer.length,
        });
        return res.end(audioBuffer);
    } catch (error) {
        next(error);
    }
};

export const textToSpeechStreamingController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const text = req.body.text;
        const targetLanguage = req.body.targetLanguage || 'en-IN';
        const speaker = req.body.speaker || 'shubh';
        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        console.log('Starting streaming TTS for:', { text, targetLanguage, speaker });

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        try {
            const stream = textToSpeechStreamingService(text, targetLanguage, speaker);
            let chunkCount = 0;
            for await (const chunk of stream) {
                chunkCount++;
                console.log(`Streaming chunk ${chunkCount}, size: ${chunk.length}`);
                const base64Chunk = chunk.toString('base64');
                res.write(`data: ${JSON.stringify({ text: base64Chunk })}\n\n`);
            }
            console.log(`Streaming complete. Total chunks: ${chunkCount}`);
            res.end();
        } catch (streamError) {
            console.error('Streaming error:', streamError);
            res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
            res.end();
        }
    } catch (error) {
        next(error);
    }
}
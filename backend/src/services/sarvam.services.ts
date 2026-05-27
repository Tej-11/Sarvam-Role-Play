import { SarvamAI } from "sarvamai";
import { sarvamClient } from "../config/sarvam.config.js";
import { getTextToSpeechLanguageCode, getTextToSpeechSpeakerCode } from "../utils/sarvamAi.utils.js";

// All the business logic related to Sarvam API can be implemented here. This keeps the controller clean and focused on handling HTTP requests and responses.
export const transcribeAudioService = async (audioBuffer: Buffer, originalName: string, mimeType: string): Promise<{ transcript: string }> => {
    try {
        const response = await sarvamClient.speechToText.transcribe({
            file: {
                data: audioBuffer,
                name: originalName,
                type: mimeType,
            },
            model: 'saaras:v3',
            mode: 'transcribe'
        });
        return { transcript: response.transcript };
    } catch (error: any) {
        if (error instanceof Error) {
            throw new Error(`Error transcribing audio: ${error.message}`);
        } else {
            throw new Error(`Error transcribing audio: ${String(error)}`);
        }
    }
}

export const analyzeTextService = async (playerResponse: string): Promise<{ nlpResponse: string }> => {
    try {
        const response = await sarvamClient.chat.completions({
            model: "sarvam-105b",
            messages: [
                {
                    role: "user",
                    content: playerResponse
                },
            ]
        });
        return { nlpResponse: response.choices[0]?.message.content ?? "" };
    } catch (error: any) {
        if (error instanceof Error) {
            throw new Error(`Error analyzing text: ${error.message}`);
        } else {
            throw new Error(`Error analyzing text: ${String(error)}`);
        }
    }
}


export const textToSpeechService = async (text: string, targetLanguage: string, speaker: string): Promise<Buffer> => {
    try {
        const languageCode = getTextToSpeechLanguageCode(targetLanguage);
        const speakerCode = getTextToSpeechSpeakerCode(speaker);
        const response = await sarvamClient.textToSpeech.convert({
            text: text,
            model: "bulbul:v3",
            target_language_code: languageCode,
            speaker: speakerCode
        });
        const base64Audio = response.audios[0] ?? '';
        const audioBuffer = Buffer.from(base64Audio, 'base64');
        return audioBuffer;
    } catch (error: any) {
        if (error instanceof Error) {
            throw new Error(`Error converting text to speech: ${error.message}`);
        } else {
            throw new Error(`Error converting text to speech: ${String(error)}`);
        }
    }
}

export const textToSpeechStreamingService = async function* (text: string, targetLanguage: string, speaker: string): AsyncGenerator<Buffer> {
    try {
        const languageCode = getTextToSpeechLanguageCode(targetLanguage);
        const speakerCode = getTextToSpeechSpeakerCode(speaker);
        const response = await sarvamClient.textToSpeech.convertStream({
            text: text,
            model: "bulbul:v3",
            target_language_code: languageCode,
            speaker: speakerCode,
            output_audio_codec: "mp3"
        });

        // Handle the BinaryResponse - extract the actual stream data
        const streamData = (response as any).data || response;

        if (streamData && typeof streamData[Symbol.asyncIterator] === 'function') {
            for await (const chunk of streamData) {
                yield Buffer.from(chunk);
            }
        } else if (streamData && typeof (streamData as any).stream === 'function') {
            for await (const chunk of (streamData as any).stream()) {
                yield Buffer.from(chunk);
            }
        } else {
            throw new Error('Unable to read stream from response');
        }
    } catch (error: any) {
        if (error instanceof Error) {
            throw new Error(`Error converting text to speech: ${error.message}`);
        } else {
            throw new Error(`Error converting text to speech: ${String(error)}`);
        }

    }
}
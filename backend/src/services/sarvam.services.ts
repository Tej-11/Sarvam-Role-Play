import { sarvamClient } from "../config/sarvam.config.js";
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
    } catch (error: any ) {
            if(error instanceof Error) {
                throw new Error(`Error analyzing text: ${error.message}`);
            } else {
                throw new Error(`Error analyzing text: ${String(error)}`);
            }
    }
}
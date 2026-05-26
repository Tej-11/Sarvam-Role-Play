import { apiClient } from "./client";

export const transcribeAudio = async (formData: FormData): Promise<{ transcript: string }> => {
    return apiClient("/sarvam/transcribeAudio", {
        method: "POST",
        body: formData
    });
}

export const analyzeText = async (text: string): Promise<{ nlpResponse: string }> => {
    return apiClient("/sarvam/analyzeText", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    });
}

export const textToSpeech = async (text: string, targetLanguage = 'en-IN', speaker = 'shubh'): Promise<ArrayBuffer> => {
    return apiClient("/sarvam/textToSpeech", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, targetLanguage, speaker }),
        responseType: 'arraybuffer'
    });
}
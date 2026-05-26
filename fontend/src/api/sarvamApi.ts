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
import { apiClient } from "./client";

export const transcribeAudio = async (formData: FormData): Promise<{ transcript: string }> => {
    return apiClient("/sarvam/transcribeAudio", {
        method: "POST",
        body: formData
    });
}

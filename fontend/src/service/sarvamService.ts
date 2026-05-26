import { analyzeText, transcribeAudio } from "../api/sarvamApi";

export const getAudioTranscript = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    const rawType = audioBlob.type.split("/")[1] || "webm";
    const extension = rawType.split(";")[0]; // Handle cases like "audio/webm; codecs=opus"
    const fileName = `audio.${extension}`;
    formData.append("audio", audioBlob, fileName);
    const rawData = await transcribeAudio(formData);
    return rawData.transcript;
}

export const getNLPResponse = async (transcript: string): Promise<string> => {
    const rawData = await analyzeText(transcript);
    return rawData.nlpResponse;
}
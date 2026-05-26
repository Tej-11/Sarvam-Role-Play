import { analyzeText, textToSpeech, transcribeAudio } from "../api/sarvamApi";

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

export const getTextToSpeech = async (text: string, targetLanguage = 'en-IN', speaker = 'shubh') => {
    const audioBuffer = await textToSpeech(text, targetLanguage, speaker);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const decodedAudio = await audioCtx.decodeAudioData(audioBuffer);
    const playerNode = audioCtx.createBufferSource();
    playerNode.buffer = decodedAudio;
    playerNode.connect(audioCtx.destination);
    playerNode.start(0);
}
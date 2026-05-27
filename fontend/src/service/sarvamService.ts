import { analyzeText, textToSpeech, textToSpeechStream, transcribeAudio } from "../api/sarvamApi";

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

export const getTextToSpeechStream = async (text: string, targetLanguage = 'en-IN', speaker = 'shubh'): Promise<void> => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let currentPlaybackTime = audioCtx.currentTime;
    const playedChunks: AudioBuffer[] = [];

    for await (const chunk of textToSpeechStream(text, targetLanguage, speaker)) {
        if (!chunk) {
            console.warn('Received empty chunk, skipping');
            continue;
        }

        try {
            const base64String = chunk.trim();
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const decodedAudio = await audioCtx.decodeAudioData(bytes.buffer);
            playedChunks.push(decodedAudio);

            // Play immediately with proper scheduling
            const playerNode = audioCtx.createBufferSource();
            playerNode.buffer = decodedAudio;
            playerNode.connect(audioCtx.destination);

            // Calculate start time based on total duration of all previously played chunks
            const startTime = Math.max(audioCtx.currentTime, currentPlaybackTime);
            playerNode.start(startTime);

            currentPlaybackTime = startTime + decodedAudio.duration;
            console.log(`Playing chunk, duration: ${decodedAudio.duration}, next start: ${currentPlaybackTime}`);
        } catch (error) {
            console.error("Error decoding audio chunk:", error);
        }
    }
}
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
    await new Promise<void>((resolve) => {
        playerNode.onended = () => resolve();
    });
}

// ---------------------------------------------------------------------------
// TRUE STREAMING TTS PLAYBACK via MediaSource API
//
// WHY NOT decodeAudioData:
//   decodeAudioData(buffer) requires a COMPLETE valid audio file in memory.
//   Feeding partial MP3 bytes to it causes garbled/failed decodes.
//   This forces collecting ALL chunks first — destroying any streaming benefit.
//
// WHY MediaSource WORKS for streaming:
//   MediaSource exposes a SourceBuffer that accepts raw MP3 bytes incrementally.
//   The browser's native MP3 decoder handles frame boundaries internally —
//   it accumulates bytes until it has a complete MP3 frame, then decodes it.
//   Audio starts playing after the first ~0.5s of audio is buffered,
//   while remaining chunks continue arriving over the network.
//
// END-TO-END DATA FLOW:
//   Sarvam backend
//     → SSE frames: data: {"text": "<base64 MP3 bytes>"}    ← network streams progressively
//
//   streamingApiClient (client.ts)
//     → reads fetch ReadableStream, parses SSE, yields JSON  ← JS receives progressively
//
//   textToSpeechStream (sarvamApi.ts)
//     → extracts chunk.text (base64 string), yields it
//
//   HERE (getTextToSpeechStream)
//     → base64 → Uint8Array → SourceBuffer.appendBuffer()   ← fed immediately, no waiting
//     → audio element plays while more chunks arrive         ← TRUE streaming ✅
// ---------------------------------------------------------------------------
export const getTextToSpeechStream = async (
    text: string,
    targetLanguage = 'en-IN',
    speaker = 'shubh'
): Promise<void> => {

    console.log('[TTS] ▶ start | text:', text.slice(0, 60) + (text.length > 60 ? '...' : ''));

    // MediaSource bridges a JS-controlled byte stream to an HTMLMediaElement.
    // The audio element reads from this MediaSource instead of a file URL.
    const mediaSource = new MediaSource();
    const audio = new Audio();

    // createObjectURL wraps MediaSource in a blob: URL the audio element can use.
    audio.src = URL.createObjectURL(mediaSource);
    console.log('[TTS] MediaSource + audio element created');

    // ── STEP 1: Wait for 'sourceopen' before touching SourceBuffer ──────────
    // The browser fires 'sourceopen' once the audio element has attached to the
    // MediaSource. Calling addSourceBuffer() before this throws InvalidStateError.
    const sourceBuffer = await new Promise<SourceBuffer>((resolve) => {
        mediaSource.addEventListener('sourceopen', () => {
            console.log('[TTS] sourceopen fired → adding SourceBuffer(audio/mpeg)');
            // 'audio/mpeg' = MP3. The browser's streaming MP3 decoder handles
            // partial frames — it buffers bytes until a full frame is available.
            resolve(mediaSource.addSourceBuffer('audio/mpeg'));
        }, { once: true });
    });

    // ── STEP 2: Append queue ─────────────────────────────────────────────────
    // SourceBuffer allows only ONE appendBuffer() at a time.
    // While sb.updating === true, a second appendBuffer() throws InvalidStateError.
    // Solution: queue all incoming chunks; drain one-at-a-time via 'updateend'.
    const queue: Uint8Array[] = [];
    let streamDone = false;   // flips true once all SSE chunks have arrived
    let chunkCount = 0;
    let totalBytes = 0;

    const drainQueue = () => {
        // Do nothing if an append is already in progress or nothing is queued
        if (sourceBuffer.updating || queue.length === 0) return;
        const next = queue.shift()!;
        console.log(`[TTS:SourceBuffer] appendBuffer | ${next.length} bytes | queue remaining: ${queue.length}`);
        sourceBuffer.appendBuffer(next);
    };

    // 'updateend' fires when the current appendBuffer() call completes.
    // This is the ONLY safe place to trigger the next append.
    sourceBuffer.addEventListener('updateend', () => {
        if (queue.length > 0) {
            // More chunks waiting — keep draining
            drainQueue();
        } else if (streamDone) {
            // All network data received AND all appends flushed →
            // tell the audio element there is no more data coming.
            console.log('[TTS:SourceBuffer] all chunks flushed → endOfStream()');
            mediaSource.endOfStream();
        }
    });

    // ── STEP 3: Start playback immediately ──────────────────────────────────
    // audio.play() is called NOW, before any data has arrived.
    // The audio element enters a "waiting" state until the browser has buffered
    // enough decoded frames (~0.5–2s). It starts automatically — no extra trigger.
    // This is what enables low-latency playback start.
    audio.play().catch((err) => console.warn('[TTS:Audio] play() blocked:', err));

    audio.addEventListener('waiting',  () => console.log('[TTS:Audio] waiting  — buffering...'));
    audio.addEventListener('canplay',  () => console.log('[TTS:Audio] canplay  — enough buffered to start'));
    audio.addEventListener('playing',  () => console.log('[TTS:Audio] playing  — audio output active'));
    audio.addEventListener('stalled',  () => console.warn('[TTS:Audio] stalled  — data not arriving fast enough'));

    // ── STEP 4: Receive SSE chunks and feed them immediately ────────────────
    // Each `chunk` is a base64 string = raw MP3 bytes (NOT a complete MP3 file).
    // Multiple chunks together form one continuous MP3 stream.
    // The SourceBuffer MP3 decoder stitches frames across chunk boundaries.
    console.log('[TTS] SSE receive loop starting...');

    for await (const chunk of textToSpeechStream(text, targetLanguage, speaker)) {
        if (!chunk) continue;
        try {
            // base64 string → binary string → Uint8Array of raw MP3 bytes
            const binaryString = atob(chunk.trim());
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            chunkCount++;
            totalBytes += bytes.length;
            console.log(`[TTS] chunk #${chunkCount} | ${bytes.length} bytes | cumulative: ${totalBytes} bytes`);

            // Push to queue and attempt to drain immediately.
            // If SourceBuffer.updating === true, drainQueue() is a no-op —
            // 'updateend' will pick it up when the current append finishes.
            queue.push(bytes);
            drainQueue();

        } catch (err) {
            console.error(`[TTS] chunk #${chunkCount} base64 decode failed:`, err);
        }
    }

    console.log(`[TTS] SSE stream ended | ${chunkCount} chunks | ${totalBytes} bytes total`);

    // ── STEP 5: Signal end of stream ─────────────────────────────────────────
    // Mark that no more chunks are coming from the network.
    // If SourceBuffer is idle right now, close the stream immediately.
    // If an append is in-flight, the 'updateend' listener handles endOfStream().
    streamDone = true;
    if (!sourceBuffer.updating && queue.length === 0) {
        console.log('[TTS:SourceBuffer] idle at stream end → endOfStream() immediately');
        mediaSource.endOfStream();
    }

    // ── STEP 6: Await full playback ──────────────────────────────────────────
    // Resolve only when 'ended' fires so the caller (e.g. handleRecordingStreamSubmit)
    // waits for audio to finish before updating chat history / UI state.
    await new Promise<void>((resolve, reject) => {
        audio.addEventListener('ended', () => {
            console.log('[TTS:Audio] ended — playback complete');
            URL.revokeObjectURL(audio.src); // release blob URL memory
            resolve();
        }, { once: true });

        audio.addEventListener('error', () => {
            const msg = audio.error?.message ?? 'unknown error';
            console.error('[TTS:Audio] error —', msg);
            URL.revokeObjectURL(audio.src);
            reject(new Error(`Audio playback error: ${msg}`));
        }, { once: true });
    });

    console.log('[TTS] ■ done');
};

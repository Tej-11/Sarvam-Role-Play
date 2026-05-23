export type RecorderStatus = 'inactive' | 'recording' | 'paused';
export type TimerCallback = (seconds: number, formattedTime: string) => void

export class AudioRecorder {

    private mediaRecorder: MediaRecorder | null = null; // handles the recording process
    private audioChunks: Blob[] = []; // holds chunks of audio data as they are recorded
    private stream: MediaStream | null = null; // holds the acual hardware connection

    private recordingSeconds: number = 0;
    private timerIntervalId: number | null = null;
    private onTimerUpdateCallback: TimerCallback | null = null;



    get getRecorderStatus(): RecorderStatus {
        if (!this.mediaRecorder) return 'inactive';
        return this.mediaRecorder.state as RecorderStatus;
    }

    // Allows external code to register a callback function that will be called every second with the updated recording time
    onTimeUpdate(callback: TimerCallback): void {
        this.onTimerUpdateCallback = callback;
    }


    async startRecording(): Promise<void> {
        try {
            this.recordingSeconds = 0;
            // 1. Request access to the user's microphone
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // 2. Initialize the MediaRecorder with the obtained audio stream
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];
            // 3. event listener to collect audio data as it becomes available
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            }
            // 4. Start the recording process with 100ms timeslice to ensure data is collected
            this.mediaRecorder.start(100);
            this.startTimer();
        } catch (error) {
            console.error("Error starting audio recording:", error);
            throw error;
        }
    }

    pauseRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            this.stopTimer();
        } else {
            console.warn("Cannot pause: Recorder is not actively recording");
        }
    }

    resumeRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            this.startTimer();
        } else {
            console.warn("Cannot resume: Recorder is not paused");
        }
    }

    stopRecording(): Promise<{ blob: Blob, url: string }> {
        return new Promise(
            (resolve, reject) => {
                // 1. Check if the media recorder is initialized
                if (!this.mediaRecorder) {
                    reject(new Error("Recorder not initialized."))
                    return;
                }
                this.stopTimer();
                // 2. Handle the stop event to compile the final audio file
                this.mediaRecorder.onstop = () => {
                    // 2.1. Combine chunks into a single Blob
                    const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
                    // 2.2. Create an object URL for playback/download
                    const audioUrl = URL.createObjectURL(audioBlob);
                    // 2.3 Stops the tracks to release the microphone resource
                    if (this.stream) {
                        this.stream.getTracks().forEach(track => track.stop());
                    }
                    // 2.4. Resolve the promise with the audio data
                    resolve({ blob: audioBlob, url: audioUrl });
                };
                // 3. Stop the media recorder
                this.mediaRecorder.stop();
            }
        );
    }

    private startTimer(): void {
        if (this.timerIntervalId) return;

        this.timerIntervalId = window.setInterval(() => {
            this.recordingSeconds++;
            if (this.onTimerUpdateCallback) {
                this.onTimerUpdateCallback(this.recordingSeconds, this.formatTime(this.recordingSeconds));
                console.log("Seconds ", this.recordingSeconds)
            }
        }, 1000);
    }

    private stopTimer(): void {
        if (this.timerIntervalId) {
            clearInterval(this.timerIntervalId);
            this.timerIntervalId = null;
        }
    }


    private formatTime(totalSeconds: number): string {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(seconds).padStart(2, '0');

        return `${paddedMinutes}:${paddedSeconds}`;
    }
}
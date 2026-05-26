import { useEffect, useRef, useState } from "react";
import { AudioRecorder, RecorderStatus } from "../utils/AudioRecorder";
import { useRecorderContext } from "../context/RecorderContext";
import { getAudioTranscript, getNLPResponse, getTextToSpeech } from "../service/sarvamService";
import styles from "./Recorderv2.module.css";

export const ChatWindowRecorder = () => {
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [timeDisplay, setTimeDisplay] = useState<String>("00:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { playerAudioURL, playerAudioBlob, recorderStatus, setRecordingData, updateRecorderStatus, setPlayerTranscript, setNpcTranscript, addChatMessage } = useRecorderContext();

  useEffect(() => {
    const audioRecorder = new AudioRecorder();
    audioRecorder.onTimeUpdate((_, formattedTime) => {
      setTimeDisplay(formattedTime);
    });
    updateRecorderStatus(audioRecorder.getRecorderStatus);
    audioRecorderRef.current = audioRecorder;

    return () => {
      if (playerAudioURL) URL.revokeObjectURL(playerAudioURL);
    };
  }, []);

  const handleStartRecording = async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    try {
      if (playerAudioURL) {
        URL.revokeObjectURL(playerAudioURL);
        setRecordingData(null, null);
      }
      setTimeDisplay("00:00");
      await recorder.startRecording();
      updateRecorderStatus(recorder.getRecorderStatus);
    } catch (error) {
      alert("Microphone access is required to start recording.");
    }
  };

  const handleStopRecording = async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    const { blob, url } = await recorder.stopRecording();
    setRecordingData(url, blob);
    updateRecorderStatus("inactive");

    if (audioElementRef.current) {
      audioElementRef.current.src = url;
    }
  };

  const handlePauseResumeRecording = () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    if (recorderStatus === "recording") {
      recorder.pauseRecording();
    } else if (recorderStatus === "paused") {
      recorder.resumeRecording();
    }
    updateRecorderStatus(recorder.getRecorderStatus);
  };

  const handleRerecording = async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    const confirmResult = window.confirm("Discard current recording and restart?");
    if (!confirmResult) return;

    if (recorder.getRecorderStatus !== "inactive") {
      await recorder.stopRecording();
    }

    try {
      if (playerAudioURL) {
        URL.revokeObjectURL(playerAudioURL);
        setRecordingData(null, null);
      }
      setTimeDisplay("00:00");
      await recorder.startRecording();
      updateRecorderStatus(recorder.getRecorderStatus);
    } catch (error) {
      alert("Failed to restart recording.");
    }
  };

  const handleSubmit = async () => {
    if (!playerAudioBlob) {
      alert("Please record audio before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const transcript = await getAudioTranscript(playerAudioBlob);
      const nlpResponse = await getNLPResponse(transcript);
      await getTextToSpeech(nlpResponse);
      setPlayerTranscript(transcript);
      setNpcTranscript(nlpResponse);

      // Add messages to chat
      addChatMessage({ sender: "player", content: transcript });
      addChatMessage({ sender: "npc", content: nlpResponse });

      // Clear the recording after successful submission
      if (playerAudioURL) {
        URL.revokeObjectURL(playerAudioURL);
        setRecordingData(null, null);
      }
    } catch (error) {
      console.error("Error submitting recording:", error);
      alert("Failed to submit recording. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.inputContainer}>
      {/* Dynamic Main Input Bar Area */}
      <div className={styles.inputRow}>

        {/* INACTIVE STATE: Placeholder Text Input (Like standard WhatsApp layout) */}
        {recorderStatus === "inactive" && !playerAudioURL && (
          <div className={styles.textInputPlaceholder}>
            Type a message or press mic to record audio...
          </div>
        )}

        {/* ACTIVE RECORDING STATE: Shows status pulse, timer, and action icons */}
        {recorderStatus !== "inactive" && (
          <div className={styles.liveRecordingArea}>
            <span className={`${styles.statusDot} ${recorderStatus === "recording" ? styles.pulse : ""}`}></span>
            <span className={styles.timer}>{timeDisplay}</span>
            <span className={styles.statusText}>
              {recorderStatus === "recording" ? "Recording..." : "Paused"}
            </span>
          </div>
        )}

        {/* REVIEW PLAYBACK STATE: Audio player replaces input box once done */}
        {recorderStatus === "inactive" && playerAudioURL && (
          <div className={styles.playbackWrapper}>
            <audio
              ref={audioElementRef}
              src={playerAudioURL}
              controls
              className={styles.compactAudio}
              onError={(e) => console.error("Audio error:", e.currentTarget.error)}
            />
          </div>
        )}

        {/* CONTROLS ZONE: Right-docked buttons that adapt to state */}
        <div className={styles.buttonActionGroup}>

          {/* Pause / Resume Trigger */}
          {recorderStatus !== "inactive" && (
            <button
              onClick={handlePauseResumeRecording}
              className={`${styles.actionBtn} ${styles.btnSecondary}`}
              title={recorderStatus === "recording" ? "Pause" : "Resume"}
            >
              {recorderStatus === "recording" ? "Pause" : "Resume"}
            </button>
          )}

          {/* Restart Trigger */}
          {recorderStatus !== "inactive" && (
            <button
              onClick={handleRerecording}
              className={`${styles.actionBtn} ${styles.btnDanger}`}
              title="Restart Recording"
            >
              Redo
            </button>
          )}

          {/* Primary Action Button (Start mic or Stop/Save mic) */}
          {recorderStatus === "inactive" ? (
            <button
              onClick={handleStartRecording}
              className={`${styles.actionBtn} ${styles.btnMic}`}
              title="Start Voice Note"
            >
              Record
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className={`${styles.actionBtn} ${styles.btnStop}`}
              title="Done / Save"
            >
              Done
            </button>
          )}
        </div>
      </div>

      {/* SUBMIT BUTTON: Appears after recording is complete */}
      {recorderStatus === "inactive" && playerAudioURL && (
        <div className={styles.submitSection}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`${styles.submitBtn} ${isSubmitting ? styles.submitting : ""}`}
          >
            {isSubmitting ? "Submitting..." : "Submit Recording"}
          </button>
        </div>
      )}
    </div>
  );
};
import { useEffect, useRef, useState } from "react";
import { AudioRecorder, RecorderStatus } from "../utils/AudioRecorder";
import { useRecorderContext } from "../context/RecorderContext";
import styles from "./Recorder.module.css";

export const Recorder = () => {
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [timeDisplay, setTimeDisplay] = useState<String>("00:00");

  const { audioURL, audioBlob, status, setRecordingData, updateStatus} = useRecorderContext();

  useEffect(() => {
    const audioRecorder = new AudioRecorder();
    audioRecorder.onTimeUpdate((_, formattedTime) => {
      setTimeDisplay(formattedTime);
    });
    updateStatus(audioRecorder.getRecorderStatus);
    audioRecorderRef.current = audioRecorder;

    return () => {
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, []);

  const handleStartRecording = async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    if (status === "inactive") {
      try {
        if (audioURL) {
          URL.revokeObjectURL(audioURL);
          setRecordingData(null, null);
        }
        setTimeDisplay("00:00");
        await recorder.startRecording();
        updateStatus(recorder.getRecorderStatus);
      } catch (error) {
        alert(
          "Microphone access is required to start recording. Please allow access and try again.",
        );
      }
    } else {
      const { blob, url } = await recorder.stopRecording();
      setRecordingData(url, blob);
      updateStatus("inactive");

      if (audioElementRef.current) {
        audioElementRef.current.src = url;
      }
    }
  };

  const handlePauseResumeRecording = () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    if (status === "recording") {
      recorder.pauseRecording();
    } else if (status === "paused") {
      recorder.resumeRecording();
    }
    updateStatus(recorder.getRecorderStatus);
  };

  const handleRerecording = async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    const confirmResult = window.confirm(
      "Are you sure you want to discard the current recording and start a new one?",
    );
    if (!confirmResult) return;

    if (recorder.getRecorderStatus !== "inactive") {
      await recorder.stopRecording();
    }

    try {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setRecordingData(null, null);
      }
      setTimeDisplay("00:00");
      await recorder.startRecording();
      updateStatus(recorder.getRecorderStatus);
    } catch (error) {
      alert(
        "Failed to start recording. Please allow microphone access and try again.",
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoArea}>
        <span>
          {status === "inactive" && audioURL
            ? "Finished"
            : status === "recording"
              ? "Recording..."
              : status === "paused"
                ? "Paused"
                : "Ready"}
        </span>
        <span className={styles.timer}>{timeDisplay}</span>
      </div>
      <div className={styles.controls}>
        {/* Start and Stop Recording Buttons */}
        <button
          onClick={handleStartRecording}
          className={`${styles.btn} ${status === "inactive" ? styles.btnRecord : styles.btnStop}`}
        >
          {status === "inactive" ? "Start Recording" : "Stop Recording"}
        </button>
        {/* Pause and Resume Buttons */}
        {status !== "inactive" && (
          <button
            onClick={handlePauseResumeRecording}
            className={`${styles.btn} ${styles.btnPause}`}
          >
            {status === "recording" ? "Pause" : "Resume"}
          </button>
        )}
        {/* Re-record Button */}
        {status !== 'inactive' && (
            <button
                onClick={handleRerecording}
                className={`${styles.btn}`}
            >
                Re-record
            </button>
        )}
      </div>
      {/* Playback Audio Node */}
      {audioURL && (
          <div className={styles.playbackContainer}>
              <audio
                  ref={audioElementRef}
                  src={audioURL}
                  controls
                  className={styles.audioNode}
                  onError={(e) => console.error("Audio playback error:", e.currentTarget.error)}
              />
          </div>
      )}
    </div>
  );
};

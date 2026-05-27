import { useEffect, useRef, useState } from "react";
import { AudioRecorder } from "../utils/AudioRecorder";
import { useRecorderContext } from "../context/RecorderContext";
import styles from "./Recorder.module.css";

export const Recorder = () => {
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [timeDisplay, setTimeDisplay] = useState<String>("00:00");

  const { playerAudioURL, recorderStatus, setRecordingData, updateRecorderStatus} = useRecorderContext();

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
  }, [playerAudioURL]);

  const handleStartRecording = async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    if (recorderStatus === "inactive") {
      try {
        if (playerAudioURL) {
          URL.revokeObjectURL(playerAudioURL);
          setRecordingData(null, null);
        }
        setTimeDisplay("00:00");
        await recorder.startRecording();
        updateRecorderStatus(recorder.getRecorderStatus);
      } catch (error) {
        alert(
          "Microphone access is required to start recording. Please allow access and try again.",
        );
      }
    } else {
      const { blob, url } = await recorder.stopRecording();
      setRecordingData(url, blob);
      updateRecorderStatus("inactive");

      if (audioElementRef.current) {
        audioElementRef.current.src = url;
      }
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

    const confirmResult = window.confirm(
      "Are you sure you want to discard the current recording and start a new one?",
    );
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
      alert(
        "Failed to start recording. Please allow microphone access and try again.",
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoArea}>
        <span>
          {recorderStatus === "inactive" && playerAudioURL
            ? "Finished"
            : recorderStatus === "recording"
              ? "Recording..."
              : recorderStatus === "paused"
                ? "Paused"
                : "Ready"}
        </span>
        <span className={styles.timer}>{timeDisplay}</span>
      </div>
      <div className={styles.controls}>
        {/* Start and Stop Recording Buttons */}
        <button
          onClick={handleStartRecording}
          className={`${styles.btn} ${recorderStatus === "inactive" ? styles.btnRecord : styles.btnStop}`}
        >
          {recorderStatus === "inactive" ? "Start Recording" : "Stop Recording"}
        </button>
        {/* Pause and Resume Buttons */}
        {recorderStatus !== "inactive" && (
          <button
            onClick={handlePauseResumeRecording}
            className={`${styles.btn} ${styles.btnPause}`}
          >
            {recorderStatus === "recording" ? "Pause" : "Resume"}
          </button>
        )}
        {/* Re-record Button */}
        {recorderStatus !== 'inactive' && (
            <button
                onClick={handleRerecording}
                className={`${styles.btn}`}
            >
                Re-record
            </button>
        )}
      </div>
      {/* Playback Audio Node */}
      {playerAudioURL && (
          <div className={styles.playbackContainer}>
              <audio
                  ref={audioElementRef}
                  src={playerAudioURL}
                  controls
                  className={styles.audioNode}
                  onError={(e) => console.error("Audio playback error:", e.currentTarget.error)}
              />
          </div>
      )}
    </div>
  );
};

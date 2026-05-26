import { useEffect, useRef, useState } from "react";
import { AudioRecorder } from "../utils/AudioRecorder";
import { useRecorderContext } from "../context/RecorderContext";

interface AudioRecorderState {
  timeDisplay: string;
  audioRecorderRef: React.MutableRefObject<AudioRecorder | null>;
  audioElementRef: React.MutableRefObject<HTMLAudioElement | null>;
  handleStartRecording: () => Promise<void>;
  handleStopRecording: () => Promise<void>;
  handlePauseResumeRecording: () => void;
  handleRerecording: () => Promise<void>;
  clearRecording: () => void;
}

export const useAudioRecorder = (): AudioRecorderState => {
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [timeDisplay, setTimeDisplay] = useState<string>("00:00");

  const {
    playerAudioURL,
    recorderStatus,
    setRecordingData,
    updateRecorderStatus,
  } = useRecorderContext();

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
  }, [playerAudioURL, updateRecorderStatus]);

  const clearRecording = () => {
    if (playerAudioURL) {
      URL.revokeObjectURL(playerAudioURL);
      setRecordingData(null, null);
    }
    setTimeDisplay("00:00");
  };

  const handleStartRecording = async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    try {
      clearRecording();
      await recorder.startRecording();
      updateRecorderStatus(recorder.getRecorderStatus);
    } catch (error) {
      alert("Microphone access is required to start recording. Please allow access and try again.");
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

    const confirmResult = window.confirm(
      "Are you sure you want to discard the current recording and start a new one?"
    );
    if (!confirmResult) return;

    try {
      if (recorder.getRecorderStatus !== "inactive") {
        await recorder.stopRecording();
      }
      clearRecording();
      await recorder.startRecording();
      updateRecorderStatus(recorder.getRecorderStatus);
    } catch (error) {
      alert("Failed to start recording. Please allow microphone access and try again.");
    }
  };

  return {
    timeDisplay,
    audioRecorderRef,
    audioElementRef,
    handleStartRecording,
    handleStopRecording,
    handlePauseResumeRecording,
    handleRerecording,
    clearRecording,
  };
};

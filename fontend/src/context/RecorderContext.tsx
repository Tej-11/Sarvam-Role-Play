import { Blob } from "buffer";
import { RecorderStatus } from "../utils/AudioRecorder";
import { createContext, ReactNode, useContext, useState } from "react";

interface RecorderContextType {
  audioURL: string | null;
  audioBlob: globalThis.Blob | null;
  status: RecorderStatus;
  setRecordingData: (url: string | null, blob: globalThis.Blob | null) => void;
  updateStatus: (status: RecorderStatus) => void;
  audioTranscript?: string | null;
  setAudioTranscript: (transcript: string | null) => void;
}

const RecorderContext = createContext<RecorderContextType | undefined>(
  undefined,
);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<globalThis.Blob | null>(null);
  const [status, setStatus] = useState<RecorderStatus>("inactive");
  const [audioTranscript, setAudioTranscript] = useState<string | null>(null);

  const setRecordingData = (
    url: string | null,
    blob: globalThis.Blob | null,
  ) => {
    setAudioURL(url);
    setAudioBlob(blob);
  };

  const updateStatus = (newStatus: RecorderStatus) => {
    setStatus(newStatus);
  };

  return (
    <RecorderContext.Provider
      value={{
        audioURL,
        audioBlob,
        status,
        setRecordingData,
        updateStatus,
        audioTranscript,
        setAudioTranscript,
      }}
    >
      {children}
    </RecorderContext.Provider>
  );
};

export const useRecorderContext = (): RecorderContextType => {
  const context = useContext(RecorderContext);
  if (!context) {
    throw new Error("useRecorderContext must be used within an AudioProvider");
  }
  return context;
};

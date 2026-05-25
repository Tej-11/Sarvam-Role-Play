import { createContext, ReactNode, useContext, useState } from "react";
import { RecorderStatus } from "../utils/AudioRecorder";

interface ChatMessage {
  sender: "player" | "npc";
  content: string;
}

interface RecorderContextType {
  playerAudioURL: string | null;
  playerAudioBlob: globalThis.Blob | null;
  recorderStatus: RecorderStatus;
  playerTranscript: string | null;

  npcTranscript: string | null;

  setRecordingData: (url: string | null, blob: globalThis.Blob | null) => void;
  updateRecorderStatus: (status: RecorderStatus) => void;
  setPlayerTranscript: (transcript: string | null) => void;
  setNpcTranscript: (transcript: string | null) => void;
}

const RecorderContext = createContext<RecorderContextType | undefined>(
  undefined,
);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [playerAudioURL, setPlayerAudioURL] = useState<string | null>(null);
  const [playerAudioBlob, setPlayerAudioBlob] =
    useState<globalThis.Blob | null>(null);
  const [recorderStatus, setRecorderStatus] =
    useState<RecorderStatus>("inactive");
  const [playerTranscript, setPlayerTranscript] = useState<string | null>(null);
  const [npcTranscript, setNpcTranscript] = useState<string | null>(null);

  const setRecordingData = (
    url: string | null,
    blob: globalThis.Blob | null,
  ) => {
    setPlayerAudioURL(url);
    setPlayerAudioBlob(blob);
  };

  const updateStatus = (newStatus: RecorderStatus) => {
    setRecorderStatus(newStatus);
  };

  return (
    <RecorderContext.Provider
      value={{
        playerAudioURL,
        playerAudioBlob,
        recorderStatus,
        playerTranscript,
        npcTranscript,
        setRecordingData,
        updateRecorderStatus: updateStatus,
        setPlayerTranscript,
        setNpcTranscript: (transcript: string | null) =>
          setNpcTranscript(transcript ?? ""),
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

import { createContext, ReactNode, useContext, useState } from "react";
import { RecorderStatus } from "../utils/AudioRecorder";
import {
  getAudioTranscript,
  getTextToSpeech,
  getTextToSpeechStream,
} from "../service/sarvamService";
import { getOpenAIResponse } from "../service/openaiService";
import { isValidChunk } from "../utils/isValidChunk";
import { get } from "http";

export type SubmitType =
  | "normal"
  | "chunkedNormal"
  | "stream"
  | "delayedStream";
interface ChatMessage {
  sender: "player" | "npc";
  content: string;
}

interface StoredChatMessage extends ChatMessage {
  id: string;
  time: string;
}

interface RecorderContextType {
  playerAudioURL: string | null;
  playerAudioBlob: globalThis.Blob | null;
  recorderStatus: RecorderStatus;
  playerTranscript: string | null;

  npcTranscript: string | null;

  chatMessages: StoredChatMessage[];

  selectedTargetLanguage: string;
  selectedSpeaker: string;

  setRecordingData: (url: string | null, blob: globalThis.Blob | null) => void;
  updateRecorderStatus: (status: RecorderStatus) => void;
  setPlayerTranscript: (transcript: string | null) => void;
  setNpcTranscript: (transcript: string | null) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  setSelectedTargetLanguage: (language: string) => void;
  setSelectedSpeaker: (speaker: string) => void;
  handleRecordingStreamSubmit: (
    audioBlob: globalThis.Blob,
    playerAudioURL: string | null,
  ) => Promise<void>;
  handleRecordingDelayedStreamSubmit: (
    audioBlob: globalThis.Blob,
    playerAudioURL: string | null,
  ) => Promise<void>;
  handleNormalSubmit: (
    audioBlob: globalThis.Blob,
    playerAudioURL: string | null,
  ) => Promise<void>;
  handleChunkedNormalSubmit: (
    audioBlob: globalThis.Blob,
    playerAudioURL: string | null,
  ) => Promise<void>;
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
  const [chatMessages, setChatMessages] = useState<StoredChatMessage[]>([]);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState("en-IN");
  const [selectedSpeaker, setSelectedSpeaker] = useState("shubh");

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

  const addChatMessage = (message: ChatMessage) => {
    const storedMessage: StoredChatMessage = {
      ...message,
      id: `${Date.now()}-${Math.random()}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, storedMessage]);
  };

  const clearChatMessages = () => {
    setChatMessages([]);
  };

  const handleRecordingStreamSubmit = async (
    audioBlob: globalThis.Blob,
    playerAudioURL: string | null,
  ) => {
    try {
      const transcript = await getAudioTranscript(audioBlob);

      setPlayerTranscript(transcript);
      addChatMessage({ sender: "player", content: transcript });
      if (playerAudioURL) {
        URL.revokeObjectURL(playerAudioURL);
      }
      setRecordingData(null, null);

      let fullResponse = "";
      for await (const chunk of getOpenAIResponse(transcript)) {
        fullResponse += chunk;
        setNpcTranscript(fullResponse);
        // const trimmedChunk = chunk.trim();
        // if (trimmedChunk && /[a-zA-Zऀ-ॿ]/.test(trimmedChunk)) {
        // }
      }
      await getTextToSpeechStream(
        fullResponse,
        selectedTargetLanguage,
        selectedSpeaker,
      );
      addChatMessage({ sender: "npc", content: fullResponse });
    } catch (error) {
      console.error("Error submitting recording:", error);
      throw error;
    }
  };

  const handleRecordingDelayedStreamSubmit = async (
    audioBlob: globalThis.Blob,
    playerAudioURL: string | null,
  ) => {
    try {
      const transcript = await getAudioTranscript(audioBlob);

      setPlayerTranscript(transcript);
      addChatMessage({ sender: "player", content: transcript });
      if (playerAudioURL) {
        URL.revokeObjectURL(playerAudioURL);
      }
      setRecordingData(null, null);

      let fullResponse = "";
      let validChunk = "";
      let hasReceivedValidChunk = false;
      for await (const chunk of getOpenAIResponse(transcript)) {
        validChunk = validChunk + chunk;
        hasReceivedValidChunk = isValidChunk(validChunk);
        if (hasReceivedValidChunk) {
          fullResponse += validChunk;
          setNpcTranscript(fullResponse);
          await getTextToSpeechStream(
            validChunk,
            selectedTargetLanguage,
            selectedSpeaker,
          );
          validChunk = "";
        }
      }
      addChatMessage({ sender: "npc", content: fullResponse });
    } catch (error) {
      console.error("Error submitting recording:", error);
      throw error;
    }
  };

  const handleNormalSubmit = async (
    audioBlob: globalThis.Blob,
    playerAudioURL: string | null,
  ) => {
    try {
      const transcript = await getAudioTranscript(audioBlob);

      setPlayerTranscript(transcript);
      addChatMessage({ sender: "player", content: transcript });
      if (playerAudioURL) {
        URL.revokeObjectURL(playerAudioURL);
      }
      setRecordingData(null, null);

      let fullResponse = "";
      for await (const chunk of getOpenAIResponse(transcript)) {
        fullResponse += chunk;
      }
      setNpcTranscript(fullResponse);
      await getTextToSpeech(
        fullResponse,
        selectedTargetLanguage,
        selectedSpeaker,
      );
      addChatMessage({ sender: "npc", content: fullResponse });
    } catch (error) {
      console.error("Error submitting recording:", error);
      throw error;
    }
  };

  const handleChunkedNormalSubmit = async (
    audioBlob: globalThis.Blob,
    playerAudioURL: string | null,
  ) => {
    try {
      const transcript = await getAudioTranscript(audioBlob);

      setPlayerTranscript(transcript);
      addChatMessage({ sender: "player", content: transcript });
      if (playerAudioURL) {
        URL.revokeObjectURL(playerAudioURL);
      }
      setRecordingData(null, null);

      let fullResponse = "";
      let validChunk = "";
      let hasReceivedValidChunk = false;
      for await (const chunk of getOpenAIResponse(transcript)) {
        validChunk = validChunk + chunk;
        hasReceivedValidChunk = isValidChunk(validChunk);
        if (hasReceivedValidChunk) {
          fullResponse += validChunk;
          setNpcTranscript(fullResponse);
          await getTextToSpeech(
            validChunk,
            selectedTargetLanguage,
            selectedSpeaker,
          );
          validChunk = "";
        }
      }
      addChatMessage({ sender: "npc", content: fullResponse });
    } catch (error) {
      console.error("Error submitting recording:", error);
      throw error;
    }
  };

  return (
    <RecorderContext.Provider
      value={{
        playerAudioURL,
        playerAudioBlob,
        recorderStatus,
        playerTranscript,
        npcTranscript,
        chatMessages,
        selectedTargetLanguage,
        selectedSpeaker,
        setRecordingData,
        updateRecorderStatus: updateStatus,
        setPlayerTranscript,
        setNpcTranscript: (transcript: string | null) =>
          setNpcTranscript(transcript),
        addChatMessage,
        clearChatMessages,
        setSelectedTargetLanguage,
        setSelectedSpeaker,
        handleRecordingStreamSubmit,
        handleRecordingDelayedStreamSubmit,
        handleNormalSubmit,
        handleChunkedNormalSubmit,
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

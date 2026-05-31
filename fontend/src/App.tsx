import React from "react";
import "./App.css";
import { Recorder } from "./components/Recorder";
import { AudioProvider, useRecorderContext } from "./context/RecorderContext";
import { TranscriptSection } from "./components/TranscriptSection";
import { ChatWindow } from "./components/ChatWindow";
import { LanguageSpeakerSelector } from "./components/LanguageSpeakerSelector";
import { SubmitType } from "./context/RecorderContext";

function AppContent() {
  const [showChat, setShowChat] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {
    playerAudioBlob,
    playerAudioURL,
    handleRecordingStreamSubmit,
    handleRecordingDelayedStreamSubmit,
    handleNormalSubmit,
    handleChunkedNormalSubmit,
  } = useRecorderContext();

  const handleNormalClick = async () => {
    if (!playerAudioBlob) {
      alert("Please record audio before transcribing.");
      return;
    }
    setIsSubmitting(true);
    try {
      await handleNormalSubmit(playerAudioBlob, playerAudioURL);
    } catch (error) {
      alert("Failed to submit recording. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStreamClick = async () => {
    if (!playerAudioBlob) {
      alert("Please record audio before transcribing.");
      return;
    }
    setIsSubmitting(true);
    try {
      await handleRecordingStreamSubmit(playerAudioBlob, playerAudioURL);
    } catch (error) {
      alert("Failed to submit recording. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = async (SubmitType: SubmitType) => {
    if (!playerAudioBlob) {
      alert("Please record audio before transcribing.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (SubmitType === "normal") {
        await handleNormalSubmit(playerAudioBlob, playerAudioURL);
      } else if (SubmitType === "chunkedNormal") {
        await handleChunkedNormalSubmit(playerAudioBlob, playerAudioURL);
      } 
      else if (SubmitType === "stream") {
        await handleRecordingStreamSubmit(playerAudioBlob, playerAudioURL);
      } else if (SubmitType === "delayedStream") {
        await handleRecordingDelayedStreamSubmit(playerAudioBlob, playerAudioURL);
      }
    } catch (error) {
      alert("Failed to submit recording. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="App">
      <div className="toggle-container">
        <button
          className={`toggle-button ${showChat ? "active" : ""}`}
          onClick={() => setShowChat(!showChat)}
          aria-label="Toggle between Chat and Recorder"
        >
          <span className="toggle-label">{showChat ? "Chat" : "Recorder"}</span>
          <div className="toggle-switch">
            <div className="toggle-circle"></div>
          </div>
        </button>
      </div>
      {showChat ? (
        <ChatWindow />
      ) : (
        <>
          <div className="InputSection">
            <Recorder />
            <LanguageSpeakerSelector
              containerClassName="SelectionsContainer"
              groupClassName="SelectionGroup"
            />
            <div className="button-group">
              <button onClick={() => handleSubmitClick("normal")} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Normal Submit"}
              </button>
              <button onClick={() => handleSubmitClick("chunkedNormal")} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Chunked Normal Submit"}
              </button>
              <button onClick={() => handleSubmitClick("stream")} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Stream Submit"}
              </button>
              <button onClick={() => handleSubmitClick("delayedStream")} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Delayed Stream Submit"}
              </button>
            </div>
          </div>
          <div className="TranscriptSection">
            <TranscriptSection />
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App;

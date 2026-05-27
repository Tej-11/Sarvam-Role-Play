import React from "react";
import "./App.css";
import { Recorder } from "./components/Recorder";
import { AudioProvider, useRecorderContext } from "./context/RecorderContext";
import { TranscriptSection } from "./components/TranscriptSection";
import { ChatWindow } from "./components/ChatWindow";
import { LanguageSpeakerSelector } from "./components/LanguageSpeakerSelector";

function AppContent() {
  const [showChat, setShowChat] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {
    playerAudioBlob,
    playerAudioURL,
    handleRecordingSubmit,
    handleNormalSubmit,
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
      await handleRecordingSubmit(playerAudioBlob, playerAudioURL);
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
              <button onClick={handleNormalClick} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Normal Submit"}
              </button>
              <button onClick={handleStreamClick} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Stream Submit"}
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

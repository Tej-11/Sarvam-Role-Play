import React from "react";
import "./App.css";
import { Recorder } from "./components/Recorder";
import { AudioProvider, useRecorderContext } from "./context/RecorderContext";
import {
  getAudioTranscript,
  getNLPResponse,
  getTextToSpeech,
} from "./service/sarvamService";
import { TranscriptSection } from "./components/TranscriptSection";
import { ChatWindow } from "./components/ChatWindow";
import { LanguageSpeakerSelector } from "./components/LanguageSpeakerSelector";

function AppContent() {
  const [showChat, setShowChat] = React.useState(true);
  const {
    playerAudioBlob,
    setPlayerTranscript,
    setNpcTranscript,
    selectedTargetLanguage,
    selectedSpeaker,
  } = useRecorderContext();
  const handleClick = async () => {
    if (!playerAudioBlob) {
      alert("Please record audio before transcribing.");
      return;
    }
    const transcript = await getAudioTranscript(playerAudioBlob);
    const nlpResponse = await getNLPResponse(transcript);
    await getTextToSpeech(nlpResponse, selectedTargetLanguage, selectedSpeaker);
    setPlayerTranscript(transcript);
    setNpcTranscript(nlpResponse);
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
            <button onClick={handleClick}>Transcribe</button>
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

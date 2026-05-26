import React, { use } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Recorder } from "./components/Recorder";
import { AudioProvider, useRecorderContext } from "./context/RecorderContext";
import { getAudioTranscript, getNLPResponse } from "./service/sarvamService";
import { TranscriptSection } from "./components/TranscriptSection";

function AppContent() {
  const {
    playerAudioURL,
    playerAudioBlob,
    recorderStatus,
    setRecordingData,
    updateRecorderStatus,
    playerTranscript,
    setPlayerTranscript,
    setNpcTranscript
  } = useRecorderContext();
  const handleClick = async () => {
    if (!playerAudioBlob) {
      alert("Please record audio before transcribing.");
      return;
    }
    const transcript = await getAudioTranscript(playerAudioBlob);
    const nlpResponse = await getNLPResponse(transcript);
    setPlayerTranscript(transcript);
    setNpcTranscript(nlpResponse);
  };

  return (
    <div className="App">
      <div className="InputSection">
        <Recorder />
        <button onClick={handleClick}>Transcribe</button>
      </div>
      <div className="TranscriptSection">
        <TranscriptSection />
      </div>
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

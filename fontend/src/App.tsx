import React, { use } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Recorder } from "./components/Recorder";
import { AudioProvider, useRecorderContext } from "./context/RecorderContext";
import { getAudioTranscript } from "./service/sarvamService";
import { TranscriptSection } from "./components/TranscriptSection";

function AppContent() {
  const {
    audioURL,
    audioBlob,
    status,
    setRecordingData,
    updateStatus,
    audioTranscript,
    setAudioTranscript,
  } = useRecorderContext();
  const handleTranscribe = async () => {
    if (!audioBlob) {
      alert("Please record audio before transcribing.");
      return;
    }
    const transcript = await getAudioTranscript(audioBlob);
    setAudioTranscript(transcript);
  };

  return (
    <div className="App">
      <div className="InputSection">
        <Recorder />
        <button onClick={handleTranscribe}>Transcribe</button>
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

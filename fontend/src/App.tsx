import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Recorder } from "./components/Recorder";
import { AudioProvider } from "./context/RecorderContext";

function AppContent() {

  return (
    <div className="App">
      <div className="InputSection">
        <Recorder />
      </div>
      <div className="TranscriptSection">
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

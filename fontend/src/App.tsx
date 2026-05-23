import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Recorder } from "./components/Recorder";

function App() {
  return (
    <div className="App">
      <div className="InputSection">
        <Recorder />
      </div>
      <div className="TranscriptSection"></div>
    </div>
  );
}

export default App;

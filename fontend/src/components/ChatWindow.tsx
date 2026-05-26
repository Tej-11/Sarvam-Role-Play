import React from "react";
import { ChatWindowRecorder } from "./Recorderv2";
import { useRecorderContext } from "../context/RecorderContext";
import { TARGET_LANGUAGES, SPEAKERS } from "../constants";
import styles from "./ChatWindow.module.css";

export const ChatWindow: React.FC = () => {
  const {
    chatMessages,
    selectedTargetLanguage,
    setSelectedTargetLanguage,
    selectedSpeaker,
    setSelectedSpeaker
  } = useRecorderContext();

  return (
    <div className={styles.chatContainer}>
      {/* Header Area */}
      <div className={styles.chatHeader}>
        <div className={styles.avatar}>A</div>
        <div className={styles.headerInfo}>
          <h3>Game Actor (NPC)</h3>
          <span>Online</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className={styles.messageArea}>
        {chatMessages.map((msg) => {
          const isPlayer = msg.sender === "player";
          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${isPlayer ? styles.playerRow : styles.npcRow}`}
            >
              <div className={`${styles.bubble} ${isPlayer ? styles.playerBubble : styles.npcBubble}`}>
                <p className={styles.messageText}>{msg.content}</p>
                <span className={styles.messageTime}>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Controls Area */}
      <div className={styles.selectionsBar}>
        <div className={styles.selectionsContainer}>
          <div className={styles.selectionGroup}>
            <label htmlFor="chatTargetLanguage">Language:</label>
            <select
              id="chatTargetLanguage"
              value={selectedTargetLanguage}
              onChange={(e) => setSelectedTargetLanguage(e.target.value)}
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.selectionGroup}>
            <label htmlFor="chatSpeaker">Speaker:</label>
            <select
              id="chatSpeaker"
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
            >
              {SPEAKERS.map((speaker) => (
                <option key={speaker} value={speaker}>
                  {speaker}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action/Recorder Section */}
      <div className={styles.bottomBar}>
        <ChatWindowRecorder />
      </div>
    </div>
  );
};
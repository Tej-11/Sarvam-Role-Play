import React from "react";
import { ChatWindowRecorder } from "./Recorderv2";
import { useRecorderContext } from "../context/RecorderContext";
import styles from "./ChatWindow.module.css";

export const ChatWindow: React.FC = () => {
  const { chatMessages } = useRecorderContext();

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

      {/* Bottom Sticky Action/Recorder Section */}
      <div className={styles.bottomBar}>
        <ChatWindowRecorder />
      </div>
    </div>
  );
};
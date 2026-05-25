import React from "react";
import styles from "./TranscriptSection.module.css";
import { TranscriptPane } from "./TranscriptPane";
import { useRecorderContext } from "../context/RecorderContext";

export const TranscriptSection: React.FC = () => {
    const { audioTranscript } = useRecorderContext();
    const npcTranscript = "NPC: Welcome to the world of role-playing! How can I assist you today?";
    return (
        <div className={styles.transcriptSectionContainer}>
            <TranscriptPane
                title="Player Transcript"
                transcript={audioTranscript ?? ""}
                placeholder="No transcript available"
                variant="player"
            />
            <TranscriptPane
                title="NPC Transcript"
                transcript={npcTranscript}
                placeholder="No transcript available"
                variant="actor"
            />
        </div>
    );
}
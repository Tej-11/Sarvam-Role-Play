import React from "react";
import styles from "./TranscriptSection.module.css";
import { TranscriptPane } from "./TranscriptPane";

export const TranscriptSection: React.FC = () => {
    const playerTranscript = "This should be fetched from the backend or state management";
    const npcTranscript = "This should also be fetched from the backend or state management"; 
    return (
        <div className={styles.transcriptSectionContainer}>
            <TranscriptPane
                title="Player Transcript"
                transcript={playerTranscript}
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
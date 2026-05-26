import React from "react";
import styles from "./TranscriptSection.module.css";
import { TranscriptPane } from "./TranscriptPane";
import { useRecorderContext } from "../context/RecorderContext";

export const TranscriptSection: React.FC = () => {
    const { playerTranscript, npcTranscript } = useRecorderContext();
    return (
        <div className={styles.transcriptSectionContainer}>
            <TranscriptPane
                title="Player Transcript"
                transcript={playerTranscript ?? ""}
                placeholder="No transcript available"
                variant="player"
            />
            <TranscriptPane
                title="NPC Transcript"
                transcript={npcTranscript ?? ""}
                placeholder="No transcript available"
                variant="actor"
            />
        </div>
    );
}
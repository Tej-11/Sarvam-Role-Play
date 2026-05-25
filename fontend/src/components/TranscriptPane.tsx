import React from "react";
import styles from "./TranscriptPane.module.css";

interface TranscriptPaneProps {
  title: string;
  transcript: string;
  placeholder: string;
  variant: "player" | "actor";
}

export const TranscriptPane : React.FC<TranscriptPaneProps> = ({
    title,
    transcript,
    placeholder,
    variant
}) => {
    const themeClass = variant === "player" ? styles.bgPlayer : styles.bgActor;
    const combinedPaneStyles = `${styles.transcriptPane} ${themeClass}`;
    return (
        <div className={combinedPaneStyles}>
            <div className={styles.transcriptPaneHeader}>
                <span className={styles.badge}>{title}</span>
            </div>
            <div className={styles.transcriptPaneBody}>
                <p className={transcript ? styles.transcriptFilled : styles.transcriptPlaceholder}>
                    {transcript || placeholder}
                </p>
            </div>
        </div>
    );
}

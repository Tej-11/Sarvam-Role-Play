import React from "react";
import { useRecorderContext } from "../context/RecorderContext";
import { TARGET_LANGUAGES, SPEAKERS } from "../constants";
import styles from "./LanguageSpeakerSelector.module.css";

interface Props {
  containerClassName?: string;
  groupClassName?: string;
  selectClassName?: string;
}

export const LanguageSpeakerSelector: React.FC<Props> = ({
  containerClassName,
  groupClassName,
  selectClassName,
}) => {
  const { selectedTargetLanguage, setSelectedTargetLanguage, selectedSpeaker, setSelectedSpeaker } =
    useRecorderContext();

  return (
    <div className={containerClassName || styles.selectionsContainer}>
      <div className={groupClassName || styles.selectionGroup}>
        <label htmlFor="targetLanguage">Language:</label>
        <select
          id="targetLanguage"
          value={selectedTargetLanguage}
          onChange={(e) => setSelectedTargetLanguage(e.target.value)}
          className={selectClassName}
        >
          {TARGET_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      <div className={groupClassName || styles.selectionGroup}>
        <label htmlFor="speaker">Speaker:</label>
        <select
          id="speaker"
          value={selectedSpeaker}
          onChange={(e) => setSelectedSpeaker(e.target.value)}
          className={selectClassName}
        >
          {SPEAKERS.map((speaker) => (
            <option key={speaker} value={speaker}>
              {speaker}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

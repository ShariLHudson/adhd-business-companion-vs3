"use client";

import { appendSpeechText, useSpeechToText } from "@/lib/growth/useSpeechToText";
import "@/app/companion/growth-journal.css";

type GrowthMicButtonProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

/** Microphone for Growth writing surfaces — appends dictated text. */
export function GrowthMicButton({
  value,
  onChange,
  disabled = false,
  className = "",
}: GrowthMicButtonProps) {
  const { isSupported, isListening, startListening, stopListening, error } =
    useSpeechToText();

  if (!isSupported) return null;

  function toggle() {
    if (disabled) return;
    if (isListening) {
      stopListening();
      return;
    }
    startListening((spoken) => {
      onChange(appendSpeechText(value, spoken));
    });
  }

  return (
    <div className={`growth-mic ${className}`.trim()}>
      <button
        type="button"
        className={`growth-mic__btn${isListening ? " growth-mic__btn--listening" : ""}`}
        onClick={toggle}
        disabled={disabled}
        aria-label="Use microphone"
        aria-pressed={isListening}
        title={isListening ? "Listening..." : "Use microphone"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="growth-mic__icon"
          aria-hidden="true"
        >
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
          <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
        </svg>
      </button>
      {isListening ? (
        <span className="growth-mic__status" role="status">
          Listening...
        </span>
      ) : null}
      {error ? (
        <span className="growth-mic__error" role="status">
          {error}
        </span>
      ) : null}
    </div>
  );
}

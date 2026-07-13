"use client";

import { useEffect, useRef } from "react";
import { appendVoiceText } from "@/components/companion/VoiceAnswerField";
import { COMMUNICATION_ANCHOR_TEST_IDS } from "@/lib/companionCommunicationAnchor";
import {
  appendSpeechText,
  useSpeechToText,
} from "@/lib/growth/useSpeechToText";
import "@/app/companion/form-voice-entry.css";

export { appendVoiceText };

type Props = {
  /** Currently focused field key — transcription targets this field. */
  activeFieldKey: string | null;
  /** Human label for the active field (shown in the hint). */
  activeFieldLabel?: string | null;
  /** Called with spoken text for the active field. */
  onTranscript: (fieldKey: string, spokenText: string) => void;
  className?: string;
  /** Accessibility / tooltip title for the mic. */
  micTitle?: string;
};

/**
 * One shared form-level voice control for Spark Estate editable forms.
 *
 * Reuses:
 * - Chat mic SVG icon (`ChatInputBar` visual)
 * - Shared speech hook (`useSpeechToText`) — same Web Speech API stack
 *
 * Place once per form — not beside every field.
 * Flow: focus a field → press mic → speak → transcript inserts into that field.
 */
export function FormVoiceEntryControl({
  activeFieldKey,
  activeFieldLabel,
  onTranscript,
  className,
  micTitle = "Voice input",
}: Props) {
  const { isSupported, isListening, startListening, stopListening, error } =
    useSpeechToText();
  const activeFieldKeyRef = useRef(activeFieldKey);
  const onTranscriptRef = useRef(onTranscript);
  activeFieldKeyRef.current = activeFieldKey;
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    if (!activeFieldKey && isListening) {
      stopListening();
    }
  }, [activeFieldKey, isListening, stopListening]);

  const hasTarget = Boolean(activeFieldKey);
  const hint = error
    ? error
    : !hasTarget
      ? "Select a field, then speak"
      : activeFieldLabel
        ? `Speaking into: ${activeFieldLabel}`
        : "Speaking into the selected field";

  function toggleListening() {
    if (!isSupported) return;
    if (isListening) {
      stopListening();
      return;
    }
    if (!activeFieldKeyRef.current) return;
    startListening((spoken) => {
      const key = activeFieldKeyRef.current;
      if (!key) return;
      onTranscriptRef.current(key, spoken);
    });
  }

  if (!isSupported) return null;

  return (
    <div
      className={`form-voice-entry${className ? ` ${className}` : ""}`}
      data-testid="form-voice-entry"
    >
      <button
        type="button"
        data-testid={COMMUNICATION_ANCHOR_TEST_IDS.mic}
        data-icon-slot="voice-input"
        onClick={toggleListening}
        disabled={!hasTarget && !isListening}
        aria-label={
          isListening
            ? "Stop listening"
            : hasTarget
              ? micTitle
              : "Select a field first, then use voice input"
        }
        aria-pressed={isListening}
        title={
          hasTarget
            ? micTitle
            : "Select a field first, then use voice input"
        }
        className={`form-voice-entry__mic flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
          isListening
            ? "mic-active bg-[#1e4f4f] text-white shadow-lg"
            : "bg-[#f5f0e8] text-[#1e4f4f] hover:bg-[#efe8de]"
        }`}
      >
        {/* Same SVG mic as ChatInputBar — do not invent a new icon. */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
          data-temp-icon="microphone"
        >
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
          <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
        </svg>
      </button>
      <p className="form-voice-entry__hint" role="status" aria-live="polite">
        {hint}
      </p>
    </div>
  );
}

/**
 * Append spoken text into a controlled field value.
 * Prefer this helper when wiring FormVoiceEntryControl to form state.
 */
export function applyFormVoiceTranscript(
  currentValue: string,
  spokenText: string,
): string {
  return appendSpeechText(currentValue, spokenText);
}

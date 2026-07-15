"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import {
  CLEAR_MY_MIND_CAPTURE_SUPPORT_LINES,
  CLEAR_MY_MIND_INPUT_PLACEHOLDER,
} from "@/lib/clearMyMindCopy";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onVoiceUsed: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  shareConfirming: boolean;
  /** Large writing surface for guided Capture (~65–70% of panel). */
  expansive?: boolean;
  /** Quiet autosave indicator — Saving… / Saved / error. */
  draftStatusLabel?: string | null;
};

export function ClearMyMindCaptureCard({
  value,
  onChange,
  onFocus,
  onVoiceUsed,
  inputRef,
  shareConfirming,
  expansive = false,
  draftStatusLabel = null,
}: Props) {
  const [supportIndex, setSupportIndex] = useState(0);

  const supportLine = useMemo(() => {
    if (!value.trim() || shareConfirming) return null;
    return CLEAR_MY_MIND_CAPTURE_SUPPORT_LINES[
      supportIndex % CLEAR_MY_MIND_CAPTURE_SUPPORT_LINES.length
    ];
  }, [value, shareConfirming, supportIndex]);

  useEffect(() => {
    if (!value.trim() || shareConfirming) return;
    const id = window.setInterval(() => {
      setSupportIndex((i) => i + 1);
    }, 12000);
    return () => window.clearInterval(id);
  }, [value, shareConfirming]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (expansive) {
      el.style.height = "";
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.max(140, el.scrollHeight)}px`;
  }, [value, inputRef, expansive]);

  return (
    <div
      className={`clear-my-mind-capture-card${
        expansive ? " clear-my-mind-capture-card--expansive" : ""
      }`}
      data-testid="clear-my-mind-capture-card"
    >
      <div className="clear-my-mind-input-card">
        <VoiceAnswerField
          value={value}
          inputRef={inputRef}
          onChange={onChange}
          onFocus={onFocus}
          onVoiceUsed={onVoiceUsed}
          voiceProminent={false}
          placeholder={CLEAR_MY_MIND_INPUT_PLACEHOLDER}
          inputClassName={`clear-my-mind-capture clear-my-mind-capture--expand clear-my-mind-journal-field w-full resize-none outline-none${
            expansive ? " clear-my-mind-journal-field--expansive" : ""
          }`}
          micTitle="Speak what's on your mind"
        />
        {supportLine ? (
          <p className="clear-my-mind-support-line" role="status" aria-live="polite">
            {supportLine}
          </p>
        ) : null}
        {draftStatusLabel ? (
          <p
            className="clear-my-mind-draft-status"
            role="status"
            aria-live="polite"
            data-testid="clear-my-mind-draft-status"
          >
            {draftStatusLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

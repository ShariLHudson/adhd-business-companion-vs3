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
};

export function ClearMyMindCaptureCard({
  value,
  onChange,
  onFocus,
  onVoiceUsed,
  inputRef,
  shareConfirming,
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
    el.style.height = "auto";
    el.style.height = `${Math.max(140, el.scrollHeight)}px`;
  }, [value, inputRef]);

  return (
    <div className="clear-my-mind-capture-card" data-testid="clear-my-mind-capture-card">
      <div className="clear-my-mind-input-card">
        <VoiceAnswerField
          value={value}
          inputRef={inputRef}
          onChange={onChange}
          onFocus={onFocus}
          onVoiceUsed={onVoiceUsed}
          voiceProminent={false}
          placeholder={CLEAR_MY_MIND_INPUT_PLACEHOLDER}
          inputClassName="clear-my-mind-capture clear-my-mind-capture--expand clear-my-mind-journal-field w-full resize-none outline-none"
          micTitle="Speak what's on your mind"
        />
        {supportLine ? (
          <p className="clear-my-mind-support-line" role="status" aria-live="polite">
            {supportLine}
          </p>
        ) : null}
      </div>
    </div>
  );
}

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
          inputClassName="clear-my-mind-capture clear-my-mind-capture--expand w-full resize-none rounded-xl border border-[#e8e0d4]/80 bg-white/55 px-3 py-2.5 text-base leading-relaxed text-[#1f1c19] outline-none min-h-[9rem] shadow-none focus:border-[#1e4f4f]/35 focus:ring-2 focus:ring-[#1e4f4f]/10"
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

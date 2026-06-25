"use client";

import { MicButton } from "@/components/companion/MicButton";

/** Append spoken text — never auto-submit; user can edit or speak again. */
export function appendVoiceText(current: string, spoken: string): string {
  const t = spoken.trim();
  if (!t) return current;
  const base = current.trim();
  if (!base) return t;
  // Pauses between voice finals usually mark separate thoughts — commas help Smart Split.
  const separator = base.endsWith(",") ? " " : ", ";
  return `${base}${separator}${t}`;
}

type VoiceAnswerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  autoFocus?: boolean;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  /** Accessibility label for the mic — not shown visually. */
  micTitle?: string;
  onFocus?: () => void;
  onVoiceUsed?: () => void;
  voiceProminent?: boolean;
  /** @deprecated Layout is always compact (icon beside field). */
  compact?: boolean;
};

/**
 * Standard question answer UI: text field with mic icon beside it (no visible label).
 */
export function VoiceAnswerField({
  value,
  onChange,
  placeholder,
  id,
  autoFocus,
  multiline = true,
  className = "",
  inputClassName,
  micTitle = "Voice input",
  onFocus,
  onVoiceUsed,
  voiceProminent = false,
}: VoiceAnswerFieldProps) {
  const fieldCls =
    inputClassName ??
    (multiline
      ? "min-h-[3.25rem] flex-1 resize-none rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f] focus:ring-2 focus:ring-[#1e4f4f]/10"
      : "min-h-[2.75rem] flex-1 rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] focus:ring-2 focus:ring-[#1e4f4f]/10");

  return (
    <div className={className}>
      <div
        className={`flex items-start gap-3 ${voiceProminent ? "clear-my-mind-voice-row" : "gap-2"}`}
      >
        <MicButton
          prominent={voiceProminent}
          onText={(t) => {
            onVoiceUsed?.();
            onChange(appendVoiceText(value, t));
          }}
          title={micTitle}
        />
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={fieldCls}
          />
        ) : (
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={fieldCls}
          />
        )}
      </div>
    </div>
  );
}

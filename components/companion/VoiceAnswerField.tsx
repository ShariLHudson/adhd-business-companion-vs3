"use client";

import { MicButton } from "@/components/companion/MicButton";

/** Append spoken text — never auto-submit; user can edit or speak again. */
export function appendVoiceText(current: string, spoken: string): string {
  const t = spoken.trim();
  if (!t) return current;
  return current.trim() ? `${current.trim()} ${t}` : t;
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
  micTitle?: string;
  /** Compact layout: answer field + Speak row — no large voice header. */
  compact?: boolean;
};

/**
 * Standard question answer UI: voice row above the text field.
 * Speech fills the field; user edits or taps mic again before submitting.
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
  micTitle = "Speak your answer instead of typing",
  compact = false,
}: VoiceAnswerFieldProps) {
  const fieldCls =
    inputClassName ??
    (multiline
      ? compact
        ? "min-h-[3.25rem] w-full resize-none rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f] focus:ring-2 focus:ring-[#1e4f4f]/10"
        : "min-h-[120px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
      : compact
        ? "w-full rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] focus:ring-2 focus:ring-[#1e4f4f]/10"
        : "w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]");

  if (compact) {
    return (
      <div className={className}>
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={fieldCls}
          />
        )}
        <div className="mt-2 flex items-center gap-2">
          <MicButton
            onText={(t) => onChange(appendVoiceText(value, t))}
            title={micTitle}
          />
          <span className="text-sm font-semibold text-[#1e4f4f]">Speak</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <MicButton
          onText={(t) => onChange(appendVoiceText(value, t))}
          title={micTitle}
        />
        <span className="text-sm font-semibold text-[#1e4f4f]">Voice Input</span>
      </div>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`mt-2 ${fieldCls}`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`mt-2 ${fieldCls}`}
        />
      )}
    </div>
  );
}

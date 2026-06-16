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
}: VoiceAnswerFieldProps) {
  const fieldCls =
    inputClassName ??
    (multiline
      ? "min-h-[120px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
      : "w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]");

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

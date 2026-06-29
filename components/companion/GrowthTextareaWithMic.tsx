"use client";

import { GrowthMicButton } from "@/components/companion/GrowthMicButton";
import "@/app/companion/growth-journal.css";

type GrowthTextareaWithMicProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  inputClassName?: string;
  wrapperClassName?: string;
  disabled?: boolean;
};

/** Growth textarea with mic — for cards and forms outside the journal compose card. */
export function GrowthTextareaWithMic({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
  inputClassName,
  wrapperClassName = "",
  disabled,
}: GrowthTextareaWithMicProps) {
  return (
    <div
      className={`growth-textarea-with-mic ${wrapperClassName} ${className}`.trim()}
    >
      <GrowthMicButton
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="growth-mic--inline"
      />
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClassName ?? "growth-textarea-with-mic__input"}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { CoverTitleTone } from "@/lib/journalGazebo/coverTitleContrast";
import { playPenScratchSound } from "@/lib/journalGazebo/ritualSounds";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  label: string;
  active?: boolean;
  variant?: "default" | "studio";
  tone?: CoverTitleTone;
  placeholder?: string;
  focusDelayMs?: number;
};

/**
 * Embossed title on leather — letters press in as typed; no visible text field chrome.
 */
export function JournalCoverEmbossInput({
  id,
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  label,
  active = true,
  variant = "default",
  tone = "on-dark",
  placeholder = "",
  focusDelayMs,
}: Props) {
  const lineRef = useRef<HTMLDivElement>(null);
  const lastSoundRef = useRef(0);
  const delay = focusDelayMs ?? (variant === "studio" ? 180 : 1100);

  useEffect(() => {
    if (!autoFocus || !active) return;
    const timer = window.setTimeout(() => lineRef.current?.focus(), delay);
    return () => window.clearTimeout(timer);
  }, [active, autoFocus, delay]);

  useEffect(() => {
    const el = lineRef.current;
    if (!el || el.textContent === value) return;
    el.textContent = value;
  }, [value]);

  if (!active) return null;

  return (
    <div
      className={[
        "jg-cover-emboss",
        variant === "studio" ? "jg-cover-emboss--studio" : "",
        tone === "on-light" ? "jg-cover-emboss--on-light" : "jg-cover-emboss--on-dark",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
    >
      <span className="jg-cover-emboss__label-visually-hidden" id={`${id}-label`}>
        {label}
      </span>
      {!value && placeholder ? (
        <p className="jg-cover-emboss__ghost" aria-hidden="true">
          {placeholder}
        </p>
      ) : null}
      <div className="jg-cover-emboss__letters" aria-hidden={!value}>
        {value.split("").map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="jg-cover-emboss__letter"
            style={{ animationDelay: `${index * (variant === "studio" ? 130 : 40)}ms` }}
          >
            {char === " " ? "\u00a0" : char}
          </span>
        ))}
      </div>
      <div
        ref={lineRef}
        id={id}
        role="textbox"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        aria-labelledby={`${id}-label`}
        className="jg-cover-emboss__input"
        onInput={() => {
          const text = (lineRef.current?.textContent ?? "").replace(/\n/g, " ");
          onChange(text);
          const now = Date.now();
          if (now - lastSoundRef.current > 140) {
            lastSoundRef.current = now;
            playPenScratchSound();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
          }
        }}
      />
      {variant === "studio" ? (
        <span className="jg-cover-emboss__caret jg-cover-emboss__caret--studio" aria-hidden="true" />
      ) : (
        <span className="jg-cover-emboss__caret" aria-hidden="true" />
      )}
    </div>
  );
}

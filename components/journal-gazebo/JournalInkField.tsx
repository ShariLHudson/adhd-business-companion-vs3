"use client";

import { useEffect, useRef } from "react";
import { playPenScratchSound } from "@/lib/journalGazebo/ritualSounds";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  label: string;
  revealFrom?: string | null;
  variant?: "paper" | "cover-emboss";
  showPen?: boolean;
};

/**
 * Ink on paper — contenteditable line; no browser textarea chrome.
 * Cover variant: gold emboss on leather, no blinking caret — pen rests beside.
 */
export function JournalInkField({
  id,
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  label,
  revealFrom = null,
  variant = "paper",
  showPen = true,
}: Props) {
  const lineRef = useRef<HTMLDivElement>(null);
  const lastSoundRef = useRef(0);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => {
      lineRef.current?.focus();
      placeCaretAtEnd(lineRef.current);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  useEffect(() => {
    const el = lineRef.current;
    if (!el || el.textContent === value) return;
    el.textContent = value;
  }, [value]);

  function placeCaretAtEnd(el: HTMLElement | null) {
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  function handleInput() {
    const text = lineRef.current?.textContent ?? "";
    onChange(text.replace(/\n/g, " "));
    const now = Date.now();
    if (now - lastSoundRef.current > 140) {
      lastSoundRef.current = now;
      playPenScratchSound();
    }
  }

  return (
    <div
      className={[
        "jg-ink-field",
        variant === "cover-emboss" ? "jg-ink-field--cover-emboss" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="jg-ink-field__label-visually-hidden" id={`${id}-label`}>
        {label}
      </span>
      <div
        ref={lineRef}
        id={id}
        role="textbox"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        aria-labelledby={`${id}-label`}
        className={[
          "jg-ink-field__line",
          variant === "cover-emboss" ? "jg-ink-field__line--cover-emboss" : "",
          revealFrom ? "jg-ink-field__line--revealing" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-placeholder=" "
        onInput={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
          }
        }}
      />
      {revealFrom ? (
        <span className="jg-ink-field__ghost" aria-hidden="true">
          {revealFrom}
        </span>
      ) : null}
      {showPen ? (
        <span
          className={[
            "jg-ink-field__pen",
            variant === "cover-emboss" ? "jg-ink-field__pen--heirloom" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}

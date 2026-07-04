import { appendSpeechText } from "@/lib/growth/useSpeechToText";

/** Spoken cues → punctuation / breaks (longest phrases first). */
const SPOKEN_CUES: { pattern: RegExp; replace: string }[] = [
  { pattern: /\bnew paragraph\b/gi, replace: "\n\n" },
  { pattern: /\bline break\b/gi, replace: "\n" },
  { pattern: /\bnew line\b/gi, replace: "\n" },
  { pattern: /\bquestion mark\b/gi, replace: "?" },
  { pattern: /\bexclamation (?:mark|point)\b/gi, replace: "!" },
  { pattern: /\bfull stop\b/gi, replace: "." },
  { pattern: /\bperiod\b/gi, replace: "." },
  { pattern: /\bcomma\b/gi, replace: "," },
  { pattern: /\bsemicolon\b/gi, replace: ";" },
  { pattern: /\bcolon\b/gi, replace: ":" },
  { pattern: /\bdash\b/gi, replace: " — " },
  { pattern: /\bellipsis\b/gi, replace: "…" },
];

function applySpokenCues(spoken: string): string {
  let text = spoken;
  for (const { pattern, replace } of SPOKEN_CUES) {
    text = text.replace(pattern, replace);
  }
  return text.replace(/\s+([.,!?;:])/g, "$1").replace(/([.,!?;:])(?=\S)/g, "$1 ");
}

/** Append dictated journal text — honors new paragraph and punctuation cues. */
export function appendJournalDictationText(current: string, spoken: string): string {
  const transformed = applySpokenCues(spoken.trim());
  if (!transformed) return current;

  if (transformed.includes("\n")) {
    const base = current.trimEnd();
    const lead = transformed.startsWith("\n") ? "" : base && !base.endsWith("\n") ? " " : "";
    const merged = `${base}${lead}${transformed}`;
    return merged.trimStart();
  }

  return appendSpeechText(current, transformed);
}

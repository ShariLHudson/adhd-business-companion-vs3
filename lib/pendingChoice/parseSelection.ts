import { parseOptionSelection } from "@/lib/workspaceSop";
import { capabilityById } from "@/lib/estateCapabilityRegistry/catalog";
import type { PendingChoiceItem } from "./types";

const ORDINAL_WORDS: Record<string, number> = {
  first: 0,
  "1st": 0,
  one: 0,
  second: 1,
  "2nd": 1,
  two: 1,
  third: 2,
  "3rd": 2,
  three: 2,
  fourth: 3,
  "4th": 3,
  four: 3,
};

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function choiceSearchText(choice: PendingChoiceItem): string {
  const aliasText =
    choice.capability != null
      ? (capabilityById(choice.capability)?.aliases ?? []).join(" ")
      : "";
  return [
    choice.label,
    choice.description ?? "",
    choice.destination ?? "",
    choice.capability ?? "",
    choice.id,
    aliasText,
  ]
    .join(" ")
    .toLowerCase()
    .replace(/™/g, "")
    .replace(/-/g, " ");
}

function parseNumberIndex(userText: string, count: number): number | null {
  const t = normalize(userText);

  /** "the coffee one" is a label cue — not ordinal "one". */
  if (/\bthe\s+\w+\s+one\b/.test(t)) return null;

  const fromSop = parseOptionSelection(userText, count);
  if (fromSop !== null) return fromSop;

  const letsDo = t.match(/\b(?:let'?s|we'?ll|i'?ll|go with|do|pick|choose|take)\s+(?:option\s+|number\s+|#)?(\d+)\b/);
  if (letsDo) {
    const idx = Number.parseInt(letsDo[1]!, 10) - 1;
    if (idx >= 0 && idx < count) return idx;
  }

  const numberWord = t.match(/\bnumber\s+(one|two|three|four|1|2|3|4)\b/);
  if (numberWord) {
    const mapped = ORDINAL_WORDS[numberWord[1]!] ?? Number.parseInt(numberWord[1]!, 10) - 1;
    if (mapped >= 0 && mapped < count) return mapped;
  }

  for (const [word, idx] of Object.entries(ORDINAL_WORDS)) {
    if (idx >= count) continue;
    if (new RegExp(`\\b${word}\\b`).test(t)) return idx;
  }

  const theNth = t.match(/\bthe\s+(first|second|third|fourth)(?:\s+one)?\b/);
  if (theNth?.[1] && theNth[1] in ORDINAL_WORDS) {
    const idx = ORDINAL_WORDS[theNth[1]!]!;
    if (idx < count) return idx;
  }

  return null;
}

function matchLabel(userText: string, choice: PendingChoiceItem): boolean {
  const t = normalize(userText);
  const label = normalize(choice.label.replace(/™/g, ""));
  if (label.length >= 3 && (t === label || t.includes(label))) return true;

  const dest = choice.destination?.replace(/-/g, " ").toLowerCase();
  if (dest && dest.length >= 3 && t.includes(dest)) return true;

  const theOne = t.match(/\b(?:the\s+)?(\w+)\s+one\b/);
  if (theOne?.[1]) {
    const cue = theOne[1]!.toLowerCase();
    if (cue.length >= 3 && choiceSearchText(choice).includes(cue)) return true;
  }

  const search = choiceSearchText(choice);
  const tokens = label.split(/\s+/).filter((w) => w.length >= 4);
  if (tokens.length > 0 && tokens.every((w) => t.includes(w))) return true;

  return false;
}

/** Parse member reply against numbered choices — index or natural language label. */
export function parsePendingChoiceSelection(
  userText: string,
  choices: readonly PendingChoiceItem[],
): PendingChoiceItem | null {
  if (!choices.length) return null;
  const trimmed = userText.trim();
  if (!trimmed) return null;

  const idx = parseNumberIndex(trimmed, choices.length);
  if (idx !== null && choices[idx]) return choices[idx]!;

  for (const choice of choices) {
    if (matchLabel(trimmed, choice)) return choice;
  }

  return null;
}

export function isLikelyMenuSelectionInput(
  userText: string,
  choiceCount: number,
): boolean {
  if (choiceCount < 1) return false;
  const t = userText.trim();
  if (!t) return false;
  if (parseNumberIndex(t, choiceCount) !== null) return true;
  if (/^(?:yes|yep|sure|okay|ok)\.?$/i.test(t)) return true;
  if (/\b(?:the\s+)?\w+\s+one\b/i.test(t)) return true;
  if (/\b(?:first|second|third|fourth|number\s+(?:one|two|three|four|\d))\b/i.test(t)) {
    return true;
  }
  return t.split(/\s+/).length <= 6;
}

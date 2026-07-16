import { parseOptionSelection } from "@/lib/workspaceSop";
import { capabilityById } from "@/lib/estateCapabilityRegistry/catalog";
import {
  isPendingMenuExpansionRequest,
  isPendingMenuMetaQuestion,
  isQuestionShapedMenuInput,
} from "./listContinuation";
import type { PendingChoiceItem } from "./types";

/** Shared place words — never match a menu item on one token alone. */
const GENERIC_PLACE_TOKENS = new Set([
  "room",
  "house",
  "garden",
  "deck",
  "nook",
  "studio",
  "library",
  "hall",
  "pond",
  "gazebo",
]);

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

const STANDALONE_ORDINAL_RE =
  /^(?:the\s+)?(?:first|second|third|fourth|1st|2nd|3rd|4th|one|two|three|four)(?:\s+one)?\.?$/i;

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
    .replace(/\u2122/g, "")
    .replace(/-/g, " ");
}

function parseBareNumericSelection(
  userText: string,
  count: number,
): number | null {
  const t = normalize(userText);

  const bareDigit = t.match(/^(?:#|option\s+)?(\d+)\.?$/);
  if (bareDigit) {
    const idx = Number.parseInt(bareDigit[1]!, 10) - 1;
    if (idx >= 0 && idx < count) return idx;
  }

  if (STANDALONE_ORDINAL_RE.test(t)) {
    const word = t.replace(/^(?:the\s+)?/, "").replace(/\s+one\.?$/, "");
    const idx = ORDINAL_WORDS[word.replace(/\.$/, "")];
    if (idx !== undefined && idx >= 0 && idx < count) return idx;
  }

  return null;
}

function parseNumberIndex(userText: string, count: number): number | null {
  const t = normalize(userText);

  if (
    isQuestionShapedMenuInput(userText) ||
    isPendingMenuMetaQuestion(userText) ||
    isPendingMenuExpansionRequest(userText)
  ) {
    return null;
  }

  /** "the coffee one" is a label cue — not ordinal "one". Ordinals stay numeric. */
  if (
    /\bthe\s+\w+\s+one\b/.test(t) &&
    !/\bthe\s+(?:first|second|third|fourth|1st|2nd|3rd|4th)\s+one\b/.test(t)
  ) {
    return null;
  }

  const bare = parseBareNumericSelection(userText, count);
  if (bare !== null) return bare;

  const fromSop = parseOptionSelection(userText, count);
  if (fromSop !== null) return fromSop;

  const letsDo = t.match(
    /\b(?:let'?s|we'?ll|i'?ll|go with|do|pick|choose|take)\s+(?:option\s+|number\s+|#)?(\d+)\b/,
  );
  if (letsDo) {
    const idx = Number.parseInt(letsDo[1]!, 10) - 1;
    if (idx >= 0 && idx < count) return idx;
  }

  const numberWord = t.match(/\bnumber\s+(one|two|three|four|1|2|3|4)\b/);
  if (numberWord) {
    const mapped =
      ORDINAL_WORDS[numberWord[1]!] ??
      Number.parseInt(numberWord[1]!, 10) - 1;
    if (mapped >= 0 && mapped < count) return mapped;
  }

  const theNth = t.match(/\bthe\s+(first|second|third|fourth)(?:\s+one)?\b/);
  if (theNth?.[1] && theNth[1] in ORDINAL_WORDS) {
    const idx = ORDINAL_WORDS[theNth[1]!]!;
    if (idx < count) return idx;
  }

  return null;
}

function matchLabel(userText: string, choice: PendingChoiceItem): boolean {
  const t = normalize(userText).replace(/^(?:the|a|an)\s+/, "");
  const label = normalize(choice.label.replace(/\u2122/g, ""));
  if (label.length >= 3 && (t === label || t.includes(label) || label.includes(t))) {
    // Avoid matching bare generic tokens like "room" alone.
    if (!(t.split(/\s+/).length === 1 && GENERIC_PLACE_TOKENS.has(t))) {
      return true;
    }
  }

  const dest = choice.destination?.replace(/-/g, " ").toLowerCase();
  if (dest && dest.length >= 3 && (t.includes(dest) || dest.includes(t))) {
    if (!(t.split(/\s+/).length === 1 && GENERIC_PLACE_TOKENS.has(t))) {
      return true;
    }
  }

  const theOne = t.match(/\b(?:the\s+)?(\w+)\s+one\b/);
  if (theOne?.[1]) {
    const cue = theOne[1]!.toLowerCase();
    if (cue.length >= 3 && choiceSearchText(choice).includes(cue)) return true;
  }

  const tokens = label.split(/\s+/).filter((w) => w.length >= 3);
  if (tokens.length > 0 && tokens.every((w) => t.includes(w))) {
    if (
      tokens.length === 1 &&
      GENERIC_PLACE_TOKENS.has(tokens[0]!.toLowerCase())
    ) {
      return false;
    }
    return true;
  }

  // Distinctive token (≥4 chars) unique enough: "tea" → Tea Room, "hammock" → Lakeside Hammock
  const distinctive = t
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !GENERIC_PLACE_TOKENS.has(w));
  if (distinctive.length > 0 && distinctive.every((w) => choiceSearchText(choice).includes(w))) {
    return true;
  }

  return false;
}

/** "Not 3, I meant 2" / "not the third — the second" → corrected index. */
function parseCorrectedNumberIndex(
  userText: string,
  count: number,
): number | null {
  const t = normalize(userText);
  const meantDigit = t.match(
    /\bnot\s+(?:option\s+|number\s+|#)?(\d+)\b.{0,40}\b(?:meant|mean|want)\s+(?:option\s+|number\s+|#)?(\d+)\b/,
  );
  if (meantDigit?.[2]) {
    const idx = Number.parseInt(meantDigit[2]!, 10) - 1;
    if (idx >= 0 && idx < count) return idx;
  }
  const meantOrdinal = t.match(
    /\bnot\s+(?:the\s+)?(first|second|third|fourth)\b.{0,40}\b(?:meant|mean|want)\s+(?:the\s+)?(first|second|third|fourth)\b/,
  );
  if (meantOrdinal?.[2] && meantOrdinal[2] in ORDINAL_WORDS) {
    const idx = ORDINAL_WORDS[meantOrdinal[2]!]!;
    if (idx < count) return idx;
  }
  return null;
}

/** Parse member reply against numbered choices — index or natural language label. */
export function parsePendingChoiceSelection(
  userText: string,
  choices: readonly PendingChoiceItem[],
): PendingChoiceItem | null {
  if (!choices.length) return null;
  const trimmed = userText.trim();
  if (!trimmed) return null;

  if (
    isQuestionShapedMenuInput(trimmed) ||
    isPendingMenuMetaQuestion(trimmed) ||
    isPendingMenuExpansionRequest(trimmed)
  ) {
    return null;
  }

  const corrected = parseCorrectedNumberIndex(trimmed, choices.length);
  if (corrected !== null && choices[corrected]) return choices[corrected]!;

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

  if (
    isQuestionShapedMenuInput(t) ||
    isPendingMenuMetaQuestion(t) ||
    isPendingMenuExpansionRequest(t)
  ) {
    return false;
  }

  if (parseNumberIndex(t, choiceCount) !== null) return true;
  if (/^(?:yes|yep|sure|okay|ok)\.?$/i.test(t)) return true;
  if (/\b(?:the\s+)?\w+\s+one\b/i.test(t)) return true;
  if (
    /\b(?:first|second|third|fourth|number\s+(?:one|two|three|four|\d))\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return t.split(/\s+/).length <= 6;
}

export {
  isPendingMenuMetaQuestion,
  isPendingMenuExpansionRequest,
  isQuestionShapedMenuInput,
} from "./listContinuation";

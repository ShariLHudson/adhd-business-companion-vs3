/**
 * Response length — shortest that preserves warmth.
 */

import type { CqriLengthCategory } from "./types";

export function selectLengthCategory(input: {
  userText: string;
  repairActive?: boolean;
  responseKind: string;
  archetype?: string;
  wantsSummary?: boolean;
}): CqriLengthCategory {
  if (input.repairActive || input.responseKind === "repair") {
    return "expanded";
  }
  if (input.wantsSummary || input.responseKind === "summary") {
    return "expanded";
  }
  const brief =
    input.userText.trim().length <= 24 ||
    /^(yes|no|ok|okay|idk|dunno|sure|maybe|not sure)\b/i.test(
      input.userText.trim(),
    );
  if (brief || input.archetype === "overwhelm") {
    return "very-short";
  }
  return "short";
}

export function applyLengthBudget(
  text: string,
  category: CqriLengthCategory,
): string {
  const t = text.trim();
  if (!t) return t;
  const sentences = t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (category === "very-short") {
    return sentences.slice(0, 2).join(" ").trim() || t;
  }
  if (category === "short") {
    return sentences.slice(0, 4).join(" ").trim() || t;
  }
  return sentences.slice(0, 6).join(" ").trim() || t;
}

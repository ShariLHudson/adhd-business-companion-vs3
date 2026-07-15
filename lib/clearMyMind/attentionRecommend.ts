/**
 * Honest single-item attention recommendation — never invent confidence.
 */

import type { BrainDumpEntry } from "@/lib/companionStore";
import { displayClearMyMindText } from "@/lib/clearMyMind/originalText";

export type AttentionRecommendation = {
  hasRecommendation: boolean;
  entryId?: string;
  text?: string;
  reason: string;
};

const TIME_SENSITIVE =
  /\b(pay|rent|bill|tax|deadline|due|urgent|today|tomorrow|asap|invoice|client email|respond to)\b/i;
const QUICK_WIN =
  /\b(call|email|text|buy|order|schedule|book|send|reply)\b/i;

export function recommendAttentionItem(
  entries: BrainDumpEntry[],
  excludedIds: Set<string> = new Set(),
): AttentionRecommendation {
  const candidates = entries.filter((e) => !excludedIds.has(e.id));
  if (candidates.length === 0) {
    return {
      hasRecommendation: false,
      reason:
        "Nothing clearly stands out without a little more information. We can choose together, or you can save everything for later.",
    };
  }

  const scored = candidates.map((entry) => {
    const text = displayClearMyMindText(entry);
    let score = 0;
    let why = "";
    if (TIME_SENSITIVE.test(text)) {
      score += 3;
      why = "it may be time-sensitive and could remove one worry quickly";
    }
    if (QUICK_WIN.test(text) && text.split(/\s+/).length <= 8) {
      score += 1;
      if (!why) why = "it looks like a small, concrete action you could finish soon";
    }
    return { entry, text, score, why };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0]!;
  if (top.score < 2) {
    return {
      hasRecommendation: false,
      reason:
        "Nothing clearly stands out without a little more information. We can choose together, or you can save everything for later.",
    };
  }

  return {
    hasRecommendation: true,
    entryId: top.entry.id,
    text: top.text,
    reason: `I’d consider starting with “${top.text}” because ${top.why}.`,
  };
}

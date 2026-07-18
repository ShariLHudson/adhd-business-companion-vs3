/**
 * Anti-copy safeguard for Gold Standard integration (package 199).
 * Retrieve patterns, not canned answers.
 */

import { getGoldStandardById } from "@/lib/goldStandardConversationLibrary";
import type { ConversationPlan } from "./types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceOverlapRatio(a: string, b: string): number {
  const as = normalize(a)
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 20);
  const bs = new Set(
    normalize(b)
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 20),
  );
  if (as.length === 0) return 0;
  let hits = 0;
  for (const s of as) {
    if (bs.has(s)) hits += 1;
  }
  return hits / as.length;
}

/** True when draft is too close to a retrieved gold-standard assistant turn. */
export function isVerbatimGoldCopy(
  draft: string,
  plan: ConversationPlan,
): boolean {
  const d = normalize(draft);
  if (d.length < 24) return false;

  for (const id of plan.goldExampleIds.slice(0, 4)) {
    const entry = getGoldStandardById(id);
    if (!entry) continue;
    for (const turn of entry.turns) {
      if (turn.role !== "assistant") continue;
      const g = normalize(turn.content);
      if (g.length < 24) continue;
      // Exact or near-exact full turn
      if (d === g) return true;
      if (d.length > 40 && g.includes(d) && d.length / g.length > 0.85) {
        return true;
      }
      if (d.includes(g) && g.length / d.length > 0.85) return true;
      if (sentenceOverlapRatio(draft, turn.content) >= 0.67) return true;
    }
  }
  return false;
}

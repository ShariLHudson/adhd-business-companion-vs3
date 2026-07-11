/**
 * Detect shared-capability signals from member utterance + context.
 */

import { SHARED_CAPABILITY_CATALOG } from "./catalog";
import type { SharedCapabilityId } from "./types";

export type CapabilitySignal = {
  id: SharedCapabilityId;
  score: number;
  matchedPatterns: string[];
};

const ROOM_BIAS: Partial<Record<string, SharedCapabilityId[]>> = {
  "decision-compass": ["decision_making", "planning"],
  "creative-studio": ["content_creation", "brainstorming", "strategy"],
  "art-studio": ["content_creation", "brainstorming"],
  "strategy-studio": ["strategy", "planning"],
  "momentum-institute": ["research", "learning", "problem_solving"],
  "study-hall": ["research", "learning"],
  library: ["learning", "research", "organization"],
  journal: ["reflection"],
  gardens: ["celebration", "reflection"],
  "celebration-garden": ["celebration", "reflection"],
  "celebration-room": ["celebration"],
  "clear-my-mind": ["organization", "planning"],
  conservatory: ["brainstorming", "reflection"],
  "evidence-vault": ["reflection", "learning"],
};

/**
 * Score capabilities from text. Higher = stronger signal.
 */
export function detectCapabilitySignals(
  userText: string,
  visualRoom?: string | null,
): CapabilitySignal[] {
  const text = userText.trim();
  if (!text) return [];

  const scores = new Map<SharedCapabilityId, CapabilitySignal>();

  for (const cap of Object.values(SHARED_CAPABILITY_CATALOG)) {
    const matched: string[] = [];
    let score = 0;
    for (const pattern of cap.intentPatterns) {
      if (pattern.test(text)) {
        matched.push(pattern.source);
        score += 2;
      }
    }
    if (score > 0) {
      scores.set(cap.id, { id: cap.id, score, matchedPatterns: matched });
    }
  }

  if (visualRoom) {
    const bias = ROOM_BIAS[visualRoom.trim().toLowerCase()];
    if (bias) {
      for (const id of bias) {
        const existing = scores.get(id);
        if (existing) {
          existing.score += 1;
        } else {
          scores.set(id, {
            id,
            score: 0.5,
            matchedPatterns: [`room:${visualRoom}`],
          });
        }
      }
    }
  }

  return [...scores.values()].sort((a, b) => b.score - a.score);
}

export function topCapabilityId(
  signals: CapabilitySignal[],
): SharedCapabilityId | null {
  const top = signals[0];
  if (!top || top.score < 1) return null;
  return top.id;
}

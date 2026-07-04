/**
 * Estate Matcher™ — score user messages against the capability index.
 */

import type { IntentCategory } from "@/lib/intentRoutingIntelligence";
import type {
  EstateMatchConfidence,
  EstateMatchResult,
  EstateRegistryEntry,
} from "./types";
import {
  estateCapabilityIndex,
  type EstateCapabilityIndex,
} from "./estateCapabilityIndex";

export type EstateMatcherInput = {
  userText: string;
  emotionalState?: string | null;
  overwhelmed?: boolean;
  intentCategory?: IntentCategory | null;
};

/** Product rules — high-confidence estate signals (not generic encyclopedia paths). */
const PRODUCT_RULES: {
  pattern: RegExp;
  entryId: string;
  score: number;
  reason: string;
}[] = [
  {
    pattern: /\bwhat(?:'s| is) (?:a )?peaceful place\b/i,
    entryId: "peaceful-places",
    score: 30,
    reason: 'definitional question about Peaceful Places™ — estate invitation, not dictionary',
  },
  {
    pattern: /\bpeaceful places?\b/i,
    entryId: "peaceful-places",
    score: 12,
    reason: "mentions Peaceful Places™",
  },
  {
    pattern: /\b(?:i'?m|i am|feeling|so) overwhelmed\b/i,
    entryId: "momentum-builder",
    score: 22,
    reason: "overwhelm → forward motion coaching",
  },
  {
    pattern: /\boverwhelm(?:ed|ing)?\b/i,
    entryId: "momentum-builder",
    score: 14,
    reason: "overwhelm signal",
  },
  {
    pattern: /\bclear (?:my )?(?:thoughts|mind|head)\b/i,
    entryId: "clear-my-mind",
    score: 22,
    reason: "clear thoughts → Clear My Mind™",
  },
  {
    pattern: /\bbrain dump\b/i,
    entryId: "clear-my-mind",
    score: 18,
    reason: "brain dump → Clear My Mind™",
  },
  {
    pattern: /\b(?:can'?t|cannot) decide\b/i,
    entryId: "decision-compass",
    score: 22,
    reason: "indecision → Decision Compass™",
  },
  {
    pattern: /\b(?:research|explore).*\b(?:ai|artificial intelligence)\b/i,
    entryId: "observatory",
    score: 20,
    reason: "research AI → Observatory™",
  },
  {
    pattern: /\b(?:want|need) to research\b/i,
    entryId: "observatory",
    score: 14,
    reason: "research intent → Observatory™",
  },
  {
    pattern: /\bpeaceful music\b/i,
    entryId: "peaceful-places",
    score: 20,
    reason: "peaceful music → Peaceful Places™",
  },
  {
    pattern: /\b(?:help )?(?:creating|create) (?:a )?workshop\b/i,
    entryId: "creative-studio",
    score: 22,
    reason: "workshop creation → Create",
  },
  {
    pattern: /\b(?:write|writing|draft).*\bnewsletter\b/i,
    entryId: "creative-studio",
    score: 26,
    reason: "newsletter writing → Create",
  },
  {
    pattern: /\bnewsletter\b/i,
    entryId: "creative-studio",
    score: 18,
    reason: "newsletter → Create",
  },
  {
    pattern: /\b(?:write|writing|draft).*\b(?:email|e-mail|blog|post|presentation)\b/i,
    entryId: "creative-studio",
    score: 22,
    reason: "content writing → Create",
  },
  {
    pattern: /\blearn(?:ing)? (?:about )?pricing\b/i,
    entryId: "momentum-institute",
    score: 20,
    reason: "learn pricing → Momentum Institute™",
  },
  {
    pattern: /\borganize (?:my )?thoughts\b/i,
    entryId: "clear-my-mind",
    score: 20,
    reason: "organize thoughts → Clear My Mind™",
  },
  {
    pattern:
      /\boverwhelm(?:ed|ing)?\b.*\b(?:don'?t|do not) know\b.*\b(?:start|where)\b/i,
    entryId: "momentum-builder",
    score: 28,
    reason: "overwhelmed + stuck at start → Momentum Builder™",
  },
  {
    pattern: /\b(?:don'?t|do not) know where to start\b/i,
    entryId: "momentum-builder",
    score: 20,
    reason: "don't know where to start → Momentum Builder™",
  },
  {
    pattern: /\bcan'?t decide what to do first\b/i,
    entryId: "momentum-builder",
    score: 22,
    reason: "first step paralysis → Momentum Builder™",
  },
  {
    pattern: /\b(?:need to|want to|help me) focus\b/i,
    entryId: "momentum-builder",
    score: 20,
    reason: "focus intent → Momentum Builder™",
  },
  {
    pattern: /\b(?:need|want).*\b(?:calm|peace|quiet)\b/i,
    entryId: "peaceful-places",
    score: 18,
    reason: "calm need → Peaceful Places™",
  },
  {
    pattern: /\bresearch ai tools?\b/i,
    entryId: "observatory",
    score: 22,
    reason: "research AI tools → Observatory™",
  },
  {
    pattern: /\b(?:want|need) to relax\b/i,
    entryId: "peaceful-places",
    score: 22,
    reason: "relax intent → Peaceful Places™",
  },
  {
    pattern: /\b(?:want|need) (?:some )?peace\b/i,
    entryId: "peaceful-places",
    score: 20,
    reason: "peace need → Peaceful Places™",
  },
  {
    pattern: /\b(?:want|need) to (?:create|make) something\b/i,
    entryId: "creative-studio",
    score: 22,
    reason: "create intent → Create",
  },
  {
    pattern: /\b(?:want|need) to reflect\b/i,
    entryId: "growth-journal",
    score: 20,
    reason: "reflect intent → Growth Journal™",
  },
  {
    pattern: /\b(?:want|need) to relax\b/i,
    entryId: "peaceful-places",
    score: 22,
    reason: "relax intent → Peaceful Places™",
  },
  {
    pattern: /\b(?:want|need) to (?:create|make) something\b/i,
    entryId: "creative-studio",
    score: 20,
    reason: "create intent → Create",
  },
  {
    pattern: /\b(?:want|need) to reflect\b/i,
    entryId: "growth-journal",
    score: 20,
    reason: "reflect intent → Growth Journal™",
  },
  {
    pattern: /\bteach me about\b/i,
    entryId: "momentum-institute",
    score: 16,
    reason: "teach me → Momentum Institute™",
  },
  {
    pattern: /\b(?:imposter|impostor) syndrome\b/i,
    entryId: "momentum-institute",
    score: 22,
    reason: "imposter syndrome → Momentum Institute™ drawer",
  },
  {
    pattern: /\b(?:lack of |low )?confidence\b/i,
    entryId: "momentum-institute",
    score: 20,
    reason: "confidence → Momentum Institute™ drawer",
  },
  {
    pattern: /\bnetwork(?:ing)?\b/i,
    entryId: "momentum-institute",
    score: 18,
    reason: "networking → Momentum Institute™ drawer",
  },
  {
    pattern: /\bcustomer psychology\b/i,
    entryId: "momentum-institute",
    score: 22,
    reason: "customer psychology → Momentum Institute™ drawer",
  },
  {
    pattern: /\bresearch ai\b/i,
    entryId: "observatory",
    score: 22,
    reason: "research AI → Observatory™",
  },
];

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/[?!.]+$/, "");
}

function scoreToConfidence(score: number): {
  confidence: EstateMatchConfidence;
  confidenceScore: number;
} {
  const confidenceScore = Math.min(1, score / 28);
  if (score >= 18) return { confidence: "high", confidenceScore };
  if (score >= 10) return { confidence: "medium", confidenceScore };
  if (score >= 5) return { confidence: "low", confidenceScore };
  return { confidence: "none", confidenceScore };
}

function scoreEntry(
  entry: EstateRegistryEntry,
  normalized: string,
  index: EstateCapabilityIndex,
  input: EstateMatcherInput,
  scores: Map<string, { score: number; reasons: string[] }>,
) {
  const bucket = scores.get(entry.id) ?? { score: 0, reasons: [] };
  const add = (points: number, reason: string) => {
    bucket.score += points;
    if (!bucket.reasons.includes(reason)) bucket.reasons.push(reason);
    scores.set(entry.id, bucket);
  };

  for (const [phrase, entryId] of index.byPhrase) {
    if (entryId === entry.id && normalized.includes(phrase)) {
      add(16, `phrase: "${phrase}"`);
    }
  }

  for (const keyword of entry.keywords) {
    const kw = keyword.toLowerCase();
    if (kw.includes(" ") && normalized.includes(kw)) {
      add(10, `keyword phrase: "${kw}"`);
    } else if (new RegExp(`\\b${escapeRegex(kw)}\\b`, "i").test(normalized)) {
      add(6, `keyword: ${kw}`);
    }
  }

  const emotion = input.emotionalState?.toLowerCase();
  if (emotion && entry.emotionalStates?.some((e) => emotion.includes(e))) {
    add(8, `emotional state: ${emotion}`);
  }

  if (input.overwhelmed && entry.id === "momentum-builder") {
    add(10, "overwhelmed flag");
  }

  if (
    input.intentCategory &&
    entry.intents?.includes(input.intentCategory)
  ) {
    add(6, `intent: ${input.intentCategory}`);
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchEstateCapabilities(
  input: EstateMatcherInput,
  index: EstateCapabilityIndex = estateCapabilityIndex(),
): EstateMatchResult[] {
  const normalized = normalizeText(input.userText);
  if (!normalized) return [];

  const scores = new Map<string, { score: number; reasons: string[] }>();

  for (const rule of PRODUCT_RULES) {
    if (rule.pattern.test(input.userText)) {
      const bucket = scores.get(rule.entryId) ?? { score: 0, reasons: [] };
      bucket.score += rule.score;
      bucket.reasons.push(rule.reason);
      scores.set(rule.entryId, bucket);
    }
  }

  for (const entry of index.entries.values()) {
    scoreEntry(entry, normalized, index, input, scores);
  }

  const results: EstateMatchResult[] = [];
  for (const [id, { score, reasons }] of scores) {
    if (score <= 0) continue;
    const entry = index.entries.get(id);
    if (!entry || entry.status !== "live") continue;
    const { confidence, confidenceScore } = scoreToConfidence(score);
    if (confidence === "none") continue;
    results.push({ entry, score, confidence, confidenceScore, reasons });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function bestEstateMatch(
  input: EstateMatcherInput,
): EstateMatchResult | null {
  const matches = matchEstateCapabilities(input);
  return matches[0] ?? null;
}

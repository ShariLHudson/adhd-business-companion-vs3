/**
 * Shari's voice for Clear My Mind — warm, grounded, never clinical.
 *
 * Companion Covenant: relationship before intelligence.
 * Agency Principle: presence before recommendation.
 */

import type { BrainDumpEntry } from "./companionStore";
import type { ThoughtCluster } from "./brainDumpClusterModel";
import { generateMentalLandscapeInsight } from "./mentalLandscapeInsight";
import type { ReliefCompanionHints } from "./reliefIntelligence";

const EMOTIONAL_WEIGHT_RE =
  /\b(?:overwhelm(?:ed)?|anxious|anxiety|stressed|stress|exhausted|tired|scared|worried|frustrated|stuck|behind|panic|burned?\s*out|heavy|alone|afraid|can't|cannot)\b/i;

const SHORT_HOLD_LINES = [
  "I've got it.",
  "Thank you for sharing that.",
  "I'm glad you told me.",
] as const;

const WARM_HOLD_LINES = [
  "Thank you for trusting me with that.",
  "I'm really glad you shared that with me.",
  "I've got it.",
] as const;

const HEAVY_HOLD_LINES = [
  "That sounds like a lot to be carrying.",
  "I'm really glad you shared that with me.",
  "We don't have to solve everything right now.",
  "I've got it.",
] as const;

const MULTI_HOLD_LINES = [
  "I've got all of this.",
  "Thank you for trusting me with that.",
  "We don't have to solve everything right now.",
] as const;

const VOICE_AFFIRM_LINES = [
  "I'm glad you told me.",
  "I've got it.",
  "Thank you for sharing that.",
] as const;

export type ReliefHoldContext = {
  parts: string[];
  /** 1-based share count this session */
  submissionIndex: number;
  hints?: ReliefCompanionHints;
};

function wordCount(parts: string[]): number {
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

function hasEmotionalWeight(parts: string[]): boolean {
  return EMOTIONAL_WEIGHT_RE.test(parts.join(" "));
}

function pickLine(lines: readonly string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return lines[Math.abs(hash) % lines.length]!;
}

/**
 * Immediate response after Share — companion relief, not confirmation.
 * Never summarizes or analyzes what the user wrote.
 */
export function shariImmediateHoldResponse(
  input: string[] | ReliefHoldContext,
): string {
  const parts = Array.isArray(input) ? input : input.parts;
  const submissionIndex = Array.isArray(input) ? 1 : input.submissionIndex;
  const hints = Array.isArray(input) ? undefined : input.hints;
  const words = wordCount(parts);
  const seed = `${parts.join("|")}:${submissionIndex}`;
  const heavy = hasEmotionalWeight(parts);

  if (hints?.prefersShortResponses || (parts.length === 1 && words <= 6)) {
    return pickLine(SHORT_HOLD_LINES, seed);
  }

  if (hints?.prefersVoice && parts.length === 1 && words <= 24 && !heavy) {
    return pickLine(VOICE_AFFIRM_LINES, seed);
  }

  if (heavy || words >= 45) {
    return pickLine(HEAVY_HOLD_LINES, seed);
  }

  if (parts.length > 1) {
    return pickLine(MULTI_HOLD_LINES, seed);
  }

  if (words <= 18) {
    return pickLine(SHORT_HOLD_LINES, seed);
  }

  return pickLine(WARM_HOLD_LINES, seed);
}

export function shariPermissionLine(): string {
  return "You don't have to organize anything first. Messy is welcome — half sentences, voice notes, whatever comes out.";
}

export function shariPostShareAcknowledgment(raw: string): string {
  const seed = raw.slice(0, 48);
  const lines = [
    "That's a lot to carry.",
    "I'm glad you didn't have to hold onto it by yourself.",
    "Thank you for trusting me with that.",
  ] as const;
  return pickLine(lines, seed);
}

export function shariVisibleThinkingLine(seed: number): string {
  const lines = [
    "I'm looking for themes.",
    "Some of these thoughts seem connected.",
    "I'm noticing a few things that may be causing the most pressure.",
    "I'm sorting these into manageable pieces.",
  ] as const;
  return lines[Math.abs(seed) % lines.length]!;
}

export function shariReleasePrompt(count: number): string {
  if (count === 0) {
    return "What's taking up space in your head right now?";
  }
  return "What else is taking up space?";
}

export const CLEAR_MY_MIND_ACK_CONTINUE_LABEL =
  "See what I'm noticing";

/** Secondary acknowledgment — warm, never inventory-like. */
export function shariReceiveAcknowledgment(entries: BrainDumpEntry[]): string {
  if (entries.length === 0) {
    return "I'm here whenever you're ready.";
  }
  const seed = entries.map((e) => e.id).join(":");
  if (entries.length === 1) {
    return pickLine(
      [
        "I'm glad you let that out here.",
        "You don't have to carry that alone anymore.",
        "I've got it.",
      ],
      seed,
    );
  }
  return pickLine(
    [
      "Thank you for trusting me with this.",
      "I'm holding all of it — you can breathe.",
      "We don't have to solve everything right now.",
    ],
    seed,
  );
}

export function shariUnderstandingOpener(
  clusters: ThoughtCluster[],
  totalThoughts: number,
): string {
  const insight = generateMentalLandscapeInsight(clusters, totalThoughts);
  return `I'm beginning to see what's here. ${insight}`;
}

const REFLECTING_LINES = [
  "I'm sitting with this for a moment...",
  "I'm here with you...",
  "Take your time...",
] as const;

export function shariReflectingLine(seed = 0): string {
  return REFLECTING_LINES[Math.abs(seed) % REFLECTING_LINES.length];
}

export function shariPatternsLine(clusterCount: number): string {
  if (clusterCount <= 1) {
    return "A few threads are starting to come together.";
  }
  return "I'm noticing how some of these thoughts relate to each other.";
}

export type ClearMyMindChoiceId =
  | "rest"
  | "explore"
  | "focus"
  | "return";

export type ClearMyMindChoice = {
  id: ClearMyMindChoiceId;
  label: string;
  subline: string;
};

export const CLEAR_MY_MIND_CHOICES: ClearMyMindChoice[] = [
  {
    id: "rest",
    label: "Leave it here for now",
    subline: "Relief is enough. I'll keep everything safe.",
  },
  {
    id: "explore",
    label: "Explore one theme",
    subline: "Only if something wants your attention.",
  },
  {
    id: "focus",
    label: "Make one thing today's focus",
    subline: "Just one — not a whole list.",
  },
  {
    id: "return",
    label: "Come back later",
    subline: "This will be here when you need it.",
  },
];

export function shariChoiceReflection(choiceId: ClearMyMindChoiceId): string {
  switch (choiceId) {
    case "rest":
      return "That's enough for today. You did the hard part.";
    case "explore":
      return "We'll take it gently — one thread at a time.";
    case "focus":
      return "One thing. That's all we need right now.";
    case "return":
      return "I'll be here whenever you're ready.";
  }
}

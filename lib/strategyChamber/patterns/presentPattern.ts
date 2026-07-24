/**
 * Member-facing pattern presentation — warm, tentative, evidence-based.
 * Never “This is who you are.”
 */

import type { StrategicPatternCandidate } from "./types";

export type StrategicPatternPresentation = {
  patternId: string;
  headline: string;
  observation: string;
  evidenceCountLabel: string;
  confidenceLabel: string;
  meaning?: string;
  futureUse?: string;
  caution: string;
  /** Soft invitation — never a demand. */
  reviewPrompt: string;
};

export function presentStrategicPattern(
  pattern: StrategicPatternCandidate,
): StrategicPatternPresentation {
  const evidenceCountLabel =
    pattern.supportingDecisionCount === 1
      ? "1 related decision"
      : `${pattern.supportingDecisionCount} related decisions`;

  const confidenceLabel =
    pattern.confidence === "high"
      ? "stronger support across several decisions"
      : pattern.confidence === "moderate"
        ? "some support across a few decisions"
        : "early signal — still uncertain";

  return {
    patternId: pattern.id,
    headline: "This may be worth noticing",
    observation: pattern.tentativeObservation,
    evidenceCountLabel,
    confidenceLabel,
    meaning: pattern.possibleStrategicMeaning,
    futureUse: pattern.possibleFutureUse,
    caution:
      "This is a possible pattern from your strategic history — not a label, diagnosis, or permanent truth. You decide whether it is useful.",
    reviewPrompt:
      "Would you like me to keep this in mind for future strategic conversations, set it aside, or wait for more examples?",
  };
}

/**
 * Guard: pattern copy must not sound like identity labeling.
 */
export function patternPresentationIsSafe(
  presentation: StrategicPatternPresentation,
): boolean {
  const blob = [
    presentation.headline,
    presentation.observation,
    presentation.meaning,
    presentation.futureUse,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const banned = [
    "this is who you are",
    "you always",
    "you never",
    "diagnos",
    "adhd",
    "personality",
    "your type",
    "psychological",
  ];
  return !banned.some((b) => blob.includes(b));
}

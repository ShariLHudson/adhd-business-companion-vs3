/**
 * Environment companion messages — tiny adjustments, no shame.
 */

import { adjustmentLabel, explainEnvironment } from "./environmentInsights";
import type { EnvironmentOffer, EnvironmentSnapshot } from "./types";

const OFFER_INTROS = [
  "It may not be the task. Your environment might be making this harder.",
  "Would it help to make one tiny environment adjustment before starting?",
  "Before we plan, do you need quiet, movement, or less visual clutter?",
];

export function buildEnvironmentCompanionOffer(
  snapshot: EnvironmentSnapshot,
): string {
  const idx =
    Math.abs(hashCode(snapshot.recommendedAdjustment)) % OFFER_INTROS.length;
  const intro = OFFER_INTROS[idx]!;
  return `${intro} One idea: ${adjustmentLabel(snapshot.recommendedAdjustment).toLowerCase()}.`;
}

export function buildEnvironmentOffer(
  snapshot: EnvironmentSnapshot,
): EnvironmentOffer {
  return {
    snapshot,
    companionOffer: buildEnvironmentCompanionOffer(snapshot),
    insight: explainEnvironment(snapshot),
    createdAt: snapshot.createdAt,
  };
}

export function environmentHintForChat(snapshot: EnvironmentSnapshot): string {
  return [
    "ENVIRONMENT READ (user is not the problem — tiny adjustments only):",
    explainEnvironment(snapshot),
    "Companion tone: suggest ONE small change — never shame clutter or say clean your whole room.",
    "No productivity guilt. User stays in control.",
    "Do not mention this block to the user.",
  ].join("\n");
}

export function environmentAdjustPrompt(snapshot: EnvironmentSnapshot): string {
  return `Help me with one tiny environment adjustment: ${adjustmentLabel(snapshot.recommendedAdjustment).toLowerCase()}.`;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

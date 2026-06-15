/**
 * Decision support copy — calmer, clearer, never prescriptive.
 */

import { supportMethodLabel } from "./decisionInsights";
import type {
  DecisionOffer,
  DecisionSnapshot,
  DecisionSupportMethod,
} from "./types";

const OFFER_BY_METHOD: Record<DecisionSupportMethod, string[]> = {
  reduce_options: [
    "Let's narrow this to the two options that actually matter.",
    "There may be more choices than you need right now — want to trim to two realistic paths?",
  ],
  clarify_goal: [
    "Before comparing options — what are we trying to protect or achieve here?",
    "Want to clarify the goal first? That often makes the choice lighter.",
  ],
  good_enough_choice: [
    "This may not need a perfect answer yet. Would a small test help instead?",
    "A good-enough choice that moves you forward can beat another round of research.",
  ],
  future_self_lens: [
    "Which option might Future You appreciate most — even if it's not the flashiest today?",
  ],
  energy_match: [
    "Given today's energy, which option feels doable — not just ideal?",
  ],
  impact_effort_lens: [
    "Want to compare impact and effort side by side — without picking for you?",
  ],
  reversible_vs_irreversible: [
    "This may not be a permanent decision. Would it help to choose a small test instead?",
  ],
  park_it: [
    "This might not be the best moment for a big decision. Want to park it and choose the next tiny action instead?",
    "If it's not urgent, we can park this safely and come back when you have more capacity.",
  ],
};

export function buildCompanionDecisionOffer(
  snapshot: DecisionSnapshot,
  rotationKey = "0",
): string {
  const pool = OFFER_BY_METHOD[snapshot.recommendedFrame];
  const idx =
    Math.abs(hashCode(rotationKey)) % Math.max(1, pool.length);
  return pool[idx] ?? pool[0]!;
}

export function buildDecisionOffer(snapshot: DecisionSnapshot): DecisionOffer {
  const rotationKey = `${snapshot.recommendedFrame}:${snapshot.decisionType}`;
  return {
    snapshot,
    companionOffer: buildCompanionDecisionOffer(snapshot, rotationKey),
    insight: buildDecisionInsightShort(snapshot),
    createdAt: snapshot.createdAt,
  };
}

function buildDecisionInsightShort(snapshot: DecisionSnapshot): string {
  const primary = snapshot.blockers[0];
  if (!primary) return "Decision support — your choice stays yours.";
  if (primary === "too_many_options") {
    return "Too many options — narrowing may help.";
  }
  if (primary === "fear_of_wrong_choice") {
    return "Fear of wrong choice — test before committing.";
  }
  if (primary === "high_cognitive_load") {
    return "High load — park or shrink the decision.";
  }
  return `${supportMethodLabel(snapshot.recommendedFrame)} may reduce friction.`;
}

export function decisionHintForChat(snapshot: DecisionSnapshot): string {
  return [
    "DECISION SUPPORT (help user decide lightly — never decide for them):",
    `State: ${snapshot.decisionState} (${snapshot.confidence} confidence)`,
    `Recommended frame: ${supportMethodLabel(snapshot.recommendedFrame)}`,
    `Suggested next step: ${snapshot.suggestedNextStep}`,
    "Companion tone:",
    "- Do NOT say “You should do this.”",
    "- Instead: “Based on what you've told me, this option seems to create the least friction and still moves you forward.”",
    "- No pressure, fear, urgency, or shame about indecision.",
    "- Always preserve user choice.",
    "Do not mention this block to the user.",
  ].join("\n");
}

export function narrowPrompt(snapshot: DecisionSnapshot): string {
  return `Help me narrow this decision: ${snapshot.suggestedNextStep}`;
}

export function parkPrompt(snapshot: DecisionSnapshot): string {
  return `Let's park this decision for now. ${snapshot.suggestedNextStep}`;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/**
 * Business OS companion copy — gentle sorting, no pressure.
 */

import { explainBusinessHealth } from "./businessInsights";
import type { BusinessOSSnapshot, BusinessOSSortOffer } from "./types";

export function buildBusinessSortOffer(
  snapshot: BusinessOSSnapshot,
): BusinessOSSortOffer {
  return {
    snapshot,
    companionOffer:
      "It looks like your business has several moving pieces right now. Would it help to sort them into what matters now, what can wait, and what needs a system?",
    createdAt: snapshot.createdAt,
  };
}

export function businessSortAcceptMessage(snapshot: BusinessOSSnapshot): string {
  const actions = snapshot.recommendedActions
    .map((a) => `• ${a.label}`)
    .join("\n");
  return [
    "Let's sort gently — no pressure to fix everything.",
    "",
    "What matters now:",
    actions || "• One small step on your most active project",
    "",
    "What can wait:",
    "• New ideas and side quests (park them without guilt)",
    "",
    "What may need a system:",
    snapshot.businessAreas.find((a) => a.area === "operations")?.summary ??
      "• Repeated steps you've done more than twice",
  ].join("\n");
}

export function businessHintForChat(snapshot: BusinessOSSnapshot): string {
  return [
    "BUSINESS OS READ (behind the scenes — reduce cognitive load, never hustle or fear):",
    explainBusinessHealth(snapshot),
    `Top actions: ${snapshot.recommendedActions.map((a) => a.label).join("; ") || "none"}`,
    "Tone: help remember, organize, prioritize — user well-being before growth.",
    "Avoid: you're behind, hustle, fear-based urgency.",
    "Optional: offer gentle business sorting if fragmentation is high.",
    "Do not mention this block to the user unless offering sort help.",
  ].join("\n");
}

export { dismissBusinessOSSortOffer } from "./businessStore";

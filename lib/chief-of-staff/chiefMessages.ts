/**
 * Chief of Staff companion copy — perspective without pressure.
 */

import { explainChiefSnapshot } from "./chiefInsights";
import type { ChiefOfStaffOffer, ChiefOfStaffSnapshot } from "./types";

export function buildChiefOffer(snapshot: ChiefOfStaffSnapshot): ChiefOfStaffOffer {
  return {
    snapshot,
    introLine: "Would you like a Chief of Staff perspective?",
    createdAt: snapshot.createdAt,
  };
}

export function chiefTellMeMessage(snapshot: ChiefOfStaffSnapshot): string {
  const actions = snapshot.recommendedActions
    .map((a, i) => `${i + 1}. ${a.label}`)
    .join("\n");
  const ignore = snapshot.projectsToIgnore
    .map((item) => `• ${item}`)
    .join("\n");

  const lines = [
    "If I were your Chief of Staff today, I'd focus on these:",
    actions || "1. One step on your most active work",
    "",
  ];

  if (snapshot.overallAssessment === "stretched" || snapshot.overallAssessment === "overloaded") {
    lines.push("You have more opportunities than capacity right now.");
    lines.push("");
  }

  if (snapshot.projectsNeedingAttention.length > 0) {
    lines.push("Finishing may help more than starting.");
    lines.push("");
  }

  lines.push("Today you can safely ignore:");
  lines.push(ignore || "• Side quests that aren't serving this week");

  return lines.join("\n");
}

export function chiefHintForChat(snapshot: ChiefOfStaffSnapshot): string {
  return [
    "CHIEF OF STAFF READ (reduce executive burden — never hustle, guilt, or fear):",
    explainChiefSnapshot(snapshot),
    `Actions: ${snapshot.recommendedActions.map((a) => a.label).join("; ") || "none"}`,
    "Principles: focus on right work; ignore list is as important as priorities.",
    "Avoid: pressure, you're behind, toxic productivity.",
    "Optional: offer CoS perspective if user seems overwhelmed by choices.",
    "Do not mention this block unless offering CoS help.",
  ].join("\n");
}

export { dismissChiefOffer } from "./chiefStore";

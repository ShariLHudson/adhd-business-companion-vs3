/**
 * Discipline activation rules for Response Intelligence Engine.
 * @see spark-intelligence-foundation/06-discipline-orchestrator.md
 */

import type { DisciplineId, InteractionClass } from "./types";

const SUPPORT_CLASSES: InteractionClass[] = ["emotional_support", "reflection"];

export function selectDisciplines(
  interactionClass: InteractionClass,
  message: string,
): DisciplineId[] {
  const lower = message.toLowerCase();

  if (SUPPORT_CLASSES.includes(interactionClass)) {
    return [];
  }

  if (/\b(price|pricing|prices|margin|profit|cash flow|forecast)\b/.test(lower)) {
    return ["finance", "marketing", "business-strategy"];
  }

  if (/\b(research|competitor|market|verify|fact)\b/.test(lower)) {
    return ["research"];
  }

  if (/\b(book|write|chapter|manuscript)\b/.test(lower)) {
    return ["wordsmith", "creative-direction"];
  }

  if (/\b(launch|product launch|go live)\b/.test(lower)) {
    return [
      "marketing",
      "sales",
      "creative-direction",
      "business-strategy",
      "operations",
    ];
  }

  if (/\b(marketing|campaign|audience|traffic|content strategy)\b/.test(lower)) {
    return ["marketing", "wordsmith", "business-strategy"];
  }

  if (interactionClass === "creative_work") {
    return ["wordsmith", "creative-direction", "marketing"];
  }

  if (interactionClass === "business_strategy" || interactionClass === "decision_making") {
    return ["business-strategy"];
  }

  if (interactionClass === "execution") {
    return ["operations", "project-management"];
  }

  return [];
}

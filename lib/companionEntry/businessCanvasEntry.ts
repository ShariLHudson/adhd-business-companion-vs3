/**
 * Business Canvas™ — Companion Intelligence™ entry (explain-first, permission-gated).
 * Users hear "Business Canvas™" only. Framework selection is internal.
 */

import {
  BUSINESS_CANVAS_USER_LABEL,
  companionFrameworkLabelForType,
  selectCanvasFrameworkAfterPermission,
} from "@/lib/visualFocus/businessCanvas/architecture";
import type { BusinessCanvasTypeId } from "@/lib/visualFocus/businessCanvas/types";
import {
  explainFirstOfferForBusinessCanvas,
  formatExplainFirstOfferMessage,
} from "./recommendationCopy";

const BUSINESS_CANVAS_SITUATION_PATTERNS: RegExp[] = [
  /\bsales?\s+(?:are\s+)?slow(?:ing)?\b/i,
  /\brevenue\s+(?:is\s+)?(?:down|flat|stuck)\b/i,
  /\bwhy\s+(?:are|isn't|isnt|aren't|arent)\s+.*\bsales?\b/i,
  /\bunderstand\s+(?:why\s+)?(?:my\s+)?(?:sales|revenue|business)\b/i,
  /\b(?:audience|offer|marketing|revenue)\b.*\b(?:connect|gap|disconnect)\b/i,
  /\bhow\s+(?:my\s+)?business\s+(?:works?|fits?\s+together)\b/i,
  /\bbusiness\s+(?:isn't|isnt)\s+(?:working|growing)\b/i,
  /\bwhere\s+(?:is|are)\s+(?:the\s+)?(?:gap|leak|bottleneck)\b/i,
];

/** True when chat suggests a Business Canvas™ opportunity (not auto-open). */
export function isBusinessCanvasSituationSignal(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return BUSINESS_CANVAS_SITUATION_PATTERNS.some((re) => re.test(t));
}

export { explainFirstOfferForBusinessCanvas };

/** Example companion line — Business Canvas™ only, no framework names. */
export function formatBusinessCanvasCompanionOffer(text: string): string {
  return formatExplainFirstOfferMessage(explainFirstOfferForBusinessCanvas(text));
}

/**
 * Hint for companion-chat when a Business Canvas™ explain-first offer fits.
 * DO NOT name internal frameworks (Business Model Canvas™, Lean Canvas™, etc.).
 */
export function companionBusinessCanvasEntryHintForChat(text: string): string | null {
  if (!isBusinessCanvasSituationSignal(text)) return null;

  return [
    "BUSINESS CANVAS™ ENTRY (mandatory):",
    `Offer ${BUSINESS_CANVAS_USER_LABEL} only — NOT framework names (no Business Model Canvas™, Lean Canvas™, etc. on this turn).`,
    "Explain what it is, why it helps, what they will receive, then ask permission.",
    `Example tone: "${formatBusinessCanvasCompanionOffer(text).split("\n").join(" ")}"`,
    "Wait for approval before opening any workspace.",
    "AFTER approval only: internally select the best canvas framework — do not announce framework name unless user asks.",
    `Internal framework hint (Companion only): ${companionFrameworkLabelForType(
      selectCanvasFrameworkAfterPermission(text),
    )}`,
  ].join("\n");
}

/** @internal After permission — which framework to seed (not shown to user by default). */
export function resolveBusinessCanvasFrameworkForOpen(
  text: string,
): BusinessCanvasTypeId {
  return selectCanvasFrameworkAfterPermission(text);
}

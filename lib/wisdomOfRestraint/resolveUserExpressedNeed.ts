import { evaluateCompanionNeedsIntelligence } from "@/lib/companionNeedsIntelligence";

const VAGUE_RE = /^(?:fine|ok(?:ay)?|meh|idk|ugh|busy|bad|good)\.?$/i;

const EXPLICIT_ROOM_INTENT_RE =
  /\b(?:plan(?:ning)?(?:\s+(?:my\s+)?day)?|planning table|window seat|brain dump|clear my mind|focus (?:buddy|studio|timer)|creative studio|take me to|show me the|let'?s (?:plan|focus|write|brainstorm)|need to (?:plan|focus|write|brainstorm|sort)|want to (?:plan|focus|write)|ready to plan)\b/i;

const EXPLICIT_RELIEF_INTENT_RE =
  /\b(?:clear my mind|brain dump|unload|let (?:it|this) out|talk it through|vent|get (?:it|this) out of my head)\b/i;

/**
 * Recommendation Test — has the guest actually expressed a need?
 */
export function userExpressedRoomNeed(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed || VAGUE_RE.test(trimmed)) return false;
  if (EXPLICIT_ROOM_INTENT_RE.test(trimmed)) return true;
  if (EXPLICIT_RELIEF_INTENT_RE.test(trimmed)) return true;

  const needs = evaluateCompanionNeedsIntelligence({
    text: trimmed,
    cognitiveLoadLevel: "moderate",
  });

  if (needs.confidence === "low") return false;
  if (needs.recommendedPlaceId === "living-room") return false;

  if (needs.primaryNeed === "relief") {
    return EXPLICIT_RELIEF_INTENT_RE.test(trimmed);
  }

  return true;
}

/** Emotional states where we sit first — no redirect unless explicit need. */
export function toneNeedsSittingFirst(
  tone: import("@/lib/arrivalExperience/types").RealityEmotionalTone,
): boolean {
  return (
    tone === "grief" ||
    tone === "flooded" ||
    tone === "heavy" ||
    tone === "low" ||
    tone === "spark" ||
    tone === "celebration"
  );
}

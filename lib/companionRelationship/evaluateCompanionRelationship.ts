import { resolveLearningOffer } from "./learning";
import {
  getCompanionRelationshipStyle,
  recordCompanionRelationshipVisitPattern,
} from "./preferenceStore";
import { rhythmForStyle } from "./styles";
import {
  applyVisitIntentToRhythm,
  resolveVisitIntent,
} from "./visitAwareness";
import type {
  CompanionRelationshipInput,
  CompanionRelationshipVerdict,
} from "./types";
import { COMPANION_RELATIONSHIP_CONSTITUTIONAL_RULE } from "./types";

/**
 * Companion Relationship™ — adjusts rhythm, never Shari.
 */
export function evaluateCompanionRelationship(
  input: CompanionRelationshipInput = {},
): CompanionRelationshipVerdict {
  if (input.recordVisitPattern) {
    recordCompanionRelationshipVisitPattern(input.recordVisitPattern);
  }

  const style = input.style ?? getCompanionRelationshipStyle();
  const visitIntent = resolveVisitIntent({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const baseRhythm = rhythmForStyle(style);
  const rhythm = applyVisitIntentToRhythm(baseRhythm, visitIntent);
  const learningOffer = resolveLearningOffer({ style });

  return {
    style,
    visitIntent,
    rhythm,
    learningOffer,
    constitutionalRule: COMPANION_RELATIONSHIP_CONSTITUTIONAL_RULE,
  };
}

/** Whether environmental storytelling modules should run this visit */
export function shouldShowEnvironmentalStorytelling(
  rhythm: CompanionRelationshipVerdict["rhythm"],
  sessionVisitIndex: number,
): boolean {
  switch (rhythm.environmentalStorytelling) {
    case "minimal":
      return sessionVisitIndex % 4 === 0;
    case "occasional":
      return sessionVisitIndex % 2 === 0;
    case "frequent":
      return true;
    default:
      return sessionVisitIndex % 2 === 0;
  }
}

/** Memory Triggers™ frequency gate per relationship rhythm */
export function isMemoryTriggerVisitEligible(
  rhythm: CompanionRelationshipVerdict["rhythm"],
  sessionVisitIndex: number,
): boolean {
  const mod = Math.max(2, rhythm.memoryTriggerVisitModulo);
  return sessionVisitIndex % mod === 0;
}

/** Everyday Life frequency gate per relationship rhythm */
export function isEverydayLifeVisitEligible(
  rhythm: CompanionRelationshipVerdict["rhythm"],
  sessionVisitIndex: number,
): boolean {
  const mod = Math.max(1, rhythm.everydayLifeVisitModulo);
  return sessionVisitIndex % mod !== 0;
}

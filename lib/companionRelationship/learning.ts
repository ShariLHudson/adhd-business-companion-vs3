import type {
  CompanionRelationshipLearningState,
  CompanionRelationshipStyle,
} from "./types";
import {
  getCompanionRelationshipLearning,
  markCompanionRelationshipOfferShown,
} from "./preferenceStore";

const QUICK_WORK_THRESHOLD = 5;
const LINGER_THRESHOLD = 5;

export const LEARNING_OFFER_QUIET =
  "I've noticed you usually like to jump right into what you're working on. I can always keep things short if you'd like." as const;

export const LEARNING_OFFER_FRONT_PORCH =
  "I know some people enjoy visiting for a bit before getting to work. If that's you, we can always take our time." as const;

/**
 * Offer once — never pressure, never repeat.
 */
export function resolveLearningOffer(input: {
  style: CompanionRelationshipStyle;
  learning?: CompanionRelationshipLearningState;
}): string | null {
  const learning = input.learning ?? getCompanionRelationshipLearning();
  if (learning.offerShownFor) return null;

  if (
    input.style !== "quiet-companion" &&
    learning.quickWorkVisitCount >= QUICK_WORK_THRESHOLD
  ) {
    return LEARNING_OFFER_QUIET;
  }

  if (
    input.style !== "front-porch-companion" &&
    learning.lingerVisitCount >= LINGER_THRESHOLD
  ) {
    return LEARNING_OFFER_FRONT_PORCH;
  }

  return null;
}

export function acceptLearningOfferSuggestion(
  offer: string,
): CompanionRelationshipStyle | null {
  if (offer === LEARNING_OFFER_QUIET) {
    markCompanionRelationshipOfferShown("suggest-quiet");
    return "quiet-companion";
  }
  if (offer === LEARNING_OFFER_FRONT_PORCH) {
    markCompanionRelationshipOfferShown("suggest-front-porch");
    return "front-porch-companion";
  }
  return null;
}

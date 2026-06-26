/**
 * The Character of Shari™
 *
 * Timeless qualities — not branding, not tone, character.
 * @see docs/companion-homestead/CHARACTER_OF_SHARI.md
 */

export type {
  CharacterCheck,
  CharacterCheckId,
  CharacterEvaluation,
  CharacterFilterContext,
  CharacterInteractionKind,
  CharacterVerdict,
} from "./types";

export {
  CHARACTER_BEFORE_CONVERSATION_QUESTION,
  CHARACTER_GOVERNING_QUESTION,
  SHARI_CORE_TRAITS,
  SHARI_IS_NOT,
  type ShariCoreTrait,
  type ShariIsNotRole,
} from "./traits";

export {
  CHARACTER_PERFORMATIVE_PATTERNS,
  CHARACTER_ROLE_PATTERNS,
  violatesCharacterRole,
  violatesCharacterVoice,
} from "./rules";

export {
  evaluateCharacterFilter,
  passesCharacterFilter,
} from "./evaluateCharacterFilter";

export {
  applyCharacterToArrivalRecommendation,
  evaluateWelcomeCharacter,
  filterQuestionThroughCharacter,
  filterSpokenThroughCharacter,
} from "./applyCharacterFilter";

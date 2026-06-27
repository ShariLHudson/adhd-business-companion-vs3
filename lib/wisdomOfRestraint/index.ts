/**
 * Wisdom of Restraint
 *
 * Knowing when to do nothing is part of caring.
 * @see docs/companion-homestead/WISDOM_OF_RESTRAINT.md
 */

export type {
  RestraintCheck,
  RestraintCheckId,
  RestraintContext,
  RestraintEvaluation,
  RestraintInteractionKind,
  RestraintVerdict,
} from "./types";

export {
  RESTRAINT_CURIOSITY_PATTERNS,
  RESTRAINT_PERFORMANCE_PATTERNS,
  RESTRAINT_WHY_ABSENCE_PATTERNS,
  asksWhyAfterAbsence,
  violatesRestraintVoice,
} from "./rules";

export {
  toneNeedsSittingFirst,
  userExpressedRoomNeed,
} from "./resolveUserExpressedNeed";

export {
  evaluateRestraintFilter,
  passesRestraintFilter,
} from "./evaluateRestraintFilter";

export {
  applyRestraintToArrivalRecommendation,
  enforceOneThingAtATime,
  evaluateWelcomeRestraint,
  filterQuestionThroughRestraint,
  filterSpokenLineThroughRestraint,
} from "./applyRestraint";

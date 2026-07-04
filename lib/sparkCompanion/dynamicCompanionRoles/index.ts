export {
  clearCompanionRoleSession,
  isCompanionRoleSessionStale,
  loadCompanionRoleSession,
  saveCompanionRoleSession,
} from "./companionRoleSession";
export {
  evaluateCompanionRole,
  shouldSuppressEmotionalLayerForRole,
  shouldSuppressTaskLayerForRole,
} from "./evaluateCompanionRole";
export {
  dynamicCompanionRoleHintForChat,
  DYNAMIC_COMPANION_ROLES_PROMPT_BLOCK,
} from "./dynamicCompanionRoleHintForChat";
export {
  ASSUME_COMPETENCE_RULE,
  COMPANION_ROLE_DESCRIPTIONS,
  COMPANION_ROLE_PERSONALITY,
  CREATE_DO_OPENING_EXAMPLES,
  SPARK_FOUR_ROLES_SUMMARY,
} from "./principles";
export {
  CREATE_DO_RE,
  DISCOVER_LEARN_RE,
  hasCreateSignals,
  hasDiscoverSignals,
  hasSupportSignals,
  hasThinkSignals,
} from "./roleSignals";
export {
  COMPANION_ROLE_GOVERNING_QUESTION,
  SPARK_FOUR_ROLES,
  type CompanionRole,
  type CompanionRoleDecision,
  type CompanionRoleSession,
  type EvaluateCompanionRoleInput,
} from "./types";

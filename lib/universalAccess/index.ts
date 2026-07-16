export {
  UNIVERSAL_ACCESS_FULFILL_LINES,
  UNIVERSAL_ACCESS_LAW,
  UNIVERSAL_ACCESS_NEVER_SAY,
  UNIVERSAL_ACCESS_ROUTING_ORDER,
  isVagueNavigationFallback,
  pickUniversalAccessFulfillLine,
  violatesUniversalAccessBlockLanguage,
} from "./universalAccessStandard";
export { ackForUniversalCapability } from "./capabilityAck";
export {
  detectUniversalCapabilityRequest,
  isUniversalCapabilityRequest,
  type UniversalCapabilityId,
  type UniversalCapabilityRequest,
} from "./detectUniversalCapabilityRequest";
export {
  isExplicitCapabilityIntent,
  resolveExplicitCapabilityIntent,
} from "./resolveExplicitCapabilityIntent";
export {
  UNIVERSAL_ACCESS_GLOBAL_ROUTING_RULE,
  UNIVERSAL_CAPABILITY_ACTIONS,
  type UniversalCapabilityActionId,
} from "./universalCapabilityActions";
export {
  BREATHE_UNIVERSAL_ALIASES,
  BREATHE_UNIVERSAL_PATTERN,
  detectBreathePatternHint,
  isBreatheUniversalRequest,
  type BreatheLaunchOptions,
  type BreathePatternHint,
} from "./breatheUniversalAccess";

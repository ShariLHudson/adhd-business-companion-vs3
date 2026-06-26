/**
 * Quiet Moments™ — designing everything between conversations.
 * @see docs/companion-homestead/QUIET_MOMENTS.md
 */

export {
  QUIET_MOMENTS_PHASES,
  SHARI_QUIET_POSTURES,
  type ForbiddenIdleCopyVerdict,
  type QuietMomentsInput,
  type QuietMomentsIntelligence,
  type QuietMomentsPhase,
  type ShariQuietPosture,
  type TemporalDrift,
} from "./types";

export {
  COMMUNICATION_ANCHOR_QUIET_RULES,
  FORBIDDEN_IDLE_ENTERTAINMENT,
  FORBIDDEN_IDLE_QUOTE_ROTATION,
  FORBIDDEN_IDLE_SURVEILLANCE,
  anyForbiddenIdlePattern,
  assertNotForbiddenIdleCopy,
  isForbiddenIdleCopy,
} from "./forbiddenIdle";

export {
  QUIET_AMBIENT_MOMENTS,
  resolveQuietMotions,
  resolveShariQuietPosture,
  type QuietAmbientMoment,
} from "./catalog";

export {
  evaluateQuietMoments,
  mergeQuietMotions,
} from "./evaluateQuietMoments";

export {
  passesFiveMinuteTest,
  resolveQuietMomentsPhase,
  resolveTemporalDrift,
  shouldWelcomeReturnWithoutGuilt,
} from "./temporalDrift";

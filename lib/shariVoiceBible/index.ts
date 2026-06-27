/**
 * Shari Voice Bible
 *
 * Permanent communication foundation for the ADHD Business Ecosystem™.
 * Every companion sentence originates here — not ad-hoc copy.
 */

export type {
  ShariEmotionalTag,
  ShariLivingRoomOpening,
  ShariRelationshipStage,
  ShariSeason,
  ShariTimeOfDay,
  ShariVoiceCategory,
  ShariVoiceContext,
  ShariVoiceKind,
  ShariVoiceLine,
  ShariVoiceSelection,
} from "./types";

export { VOICE_COOLDOWN_DEFAULTS } from "./types";

export {
  SHARI_VOICE_BIBLE_ENTRIES,
  SHARI_VOICE_BIBLE_ENTRY_COUNT,
} from "./entries";

export {
  assertShariVoice,
  personalizeWithName,
  sanitizeShariVoice,
  trimToOpeningLength,
  violatesShariVoice,
  SHARI_VOICE_PRINCIPLES,
  SHARI_BANNED_PATTERNS,
} from "./rules";

export {
  cooldownForKind,
  clearVoiceUsageForTests,
  isCompositeOpeningOnCooldown,
  isLineOnCooldown,
  recordVoiceUsage,
  relationshipStageFromVisits,
} from "./cooldownStore";

export { resolveVoiceContext } from "./resolveVoiceContext";
export type { ResolvedVoiceContext } from "./resolveVoiceContext";

export {
  selectClarifyQuestion,
  selectEchoLine,
  selectVoiceLine,
  selectWalkingLine,
} from "./selectVoiceLine";

export { recordOpeningComposite } from "./cooldownStore";

export {
  composeBibleChatPlaceholder,
  composeBibleClarify,
  composeBibleEcho,
  composeBibleGreeting,
  composeBibleReconnectionQuestion,
  composeBibleSoftPresence,
  composeLivingRoomOpening,
} from "./composeLivingRoomOpening";

export { composeRoomInvitation, composeWalkingLine } from "./composeRoomInvitation";

export {
  interpolateVoiceTemplate,
  shortTopicLabel,
} from "./interpolate";

/** @deprecated Use violatesShariVoice */
export { violatesShariVoice as containsBannedPhrase } from "./rules";

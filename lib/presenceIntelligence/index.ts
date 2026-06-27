/**
 * Presence Intelligence
 *
 * Quiet preparation before arrival — not memory, not personalization.
 * @see docs/companion-homestead/PRESENCE_INTELLIGENCE.md
 */

export type {
  PresenceIntelligence,
  PresenceIntelligenceInput,
  PresencePosture,
  PresencePreparation,
} from "./types";

export {
  PRESENCE_BANNED_PATTERNS,
  assertPresenceVoice,
  violatesPresenceVoice,
} from "./rules";

export { resolvePresencePreparation } from "./resolvePreparation";
export { resolvePresencePosture } from "./resolvePosture";
export { evaluatePresenceIntelligence } from "./evaluatePresenceIntelligence";
export { mapPresenceToGuestPreparation } from "./mapToGuestPreparation";

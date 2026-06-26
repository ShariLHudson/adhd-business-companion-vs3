import type { PresenceIntelligence, PresenceIntelligenceInput } from "./types";
import { resolvePresencePosture } from "./resolvePosture";
import { resolvePresencePreparation } from "./resolvePreparation";

/**
 * Presence Intelligence™ — quiet preparation before the guest arrives.
 * Not memory. Not personalization. Hospitality.
 */
export function evaluatePresenceIntelligence(
  input: PresenceIntelligenceInput,
): PresenceIntelligence {
  return {
    preparation: resolvePresencePreparation(input),
    posture: resolvePresencePosture(input),
  };
}

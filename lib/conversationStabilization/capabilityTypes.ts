/**
 * Canonical conversation routing capabilities (Estate Intelligence Check branches).
 */

export type EstateCapability =
  | "session_continue"
  | "navigation"
  | "room"
  | "feature"
  | "object"
  | "experience"
  | "discovery"
  | "help"
  | "research"
  | "create"
  | "capture"
  | "retrieval";

export type CapabilityConfidence = "high" | "medium" | "low";

export type CapabilityEvaluation = {
  capability: EstateCapability;
  eligible: boolean;
  confidence: CapabilityConfidence;
  reason: string;
};

/** Estate-only branches — evaluated when task goals do not block. */
export const ESTATE_INTELLIGENCE_CAPABILITIES: readonly EstateCapability[] = [
  "navigation",
  "room",
  "feature",
  "object",
  "experience",
  "discovery",
  "help",
] as const;

/** Task branches — always evaluated; outrank estate when eligible. */
export const TASK_CAPABILITIES: readonly EstateCapability[] = [
  "session_continue",
  "research",
  "create",
  "capture",
  "retrieval",
] as const;

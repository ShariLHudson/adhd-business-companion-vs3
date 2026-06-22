/**
 * Sprint 2B-B PR 1 — Learning gates (collection safety).
 * Profile learning is flag-gated and independent of the Signal Bus.
 */

import { isProfileLearningEnabled } from "./featureFlags";
import { resolveSignalTraitMapping } from "./signalMapping";
import {
  allowsTrustEvolution,
  validateTrustAttribution,
  type TrustAttributionMvp,
  type TrustCausationType,
} from "./trustAttribution";
import type { IntelligenceSignal } from "./types";

export type { TrustAttributionMvp, TrustCausationType } from "./trustAttribution";

/** @deprecated Use TrustAttributionMvp */
export type TrustAttributionInput = TrustAttributionMvp;

export { isProfileLearningEnabled } from "./featureFlags";

export function isTrustSignal(signal: IntelligenceSignal): boolean {
  if (signal.domain === "trust") return true;
  const mapping = resolveSignalTraitMapping(signal.category);
  if (!mapping) return false;
  return mapping.paths.some((path) => path.startsWith("relationship.trust."));
}

/**
 * Trust trait evolution requires valid attribution (PR 3+).
 * Until attribution is wired, trust signals never evolve even when profile learning is ON.
 */
export function isTrustLearningAllowed(
  attribution?: TrustAttributionMvp | null,
): boolean {
  if (!isProfileLearningEnabled()) return false;
  if (!attribution) return false;
  return allowsTrustEvolution(validateTrustAttribution(attribution));
}

/** Whether a signal may update profile traits. */
export function shouldEvolveFromSignal(
  signal: IntelligenceSignal,
  attribution?: TrustAttributionMvp | null,
): boolean {
  if (!isProfileLearningEnabled()) return false;
  if (isTrustSignal(signal)) {
    return isTrustLearningAllowed(attribution);
  }
  return true;
}

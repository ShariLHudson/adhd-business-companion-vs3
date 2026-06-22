/**
 * Intelligence Layer — public API.
 * Signals → Profile evolution → Companion personalization (consume only).
 */

export type {
  IntelligenceProfile,
  IntelligenceSignal,
  IntelligenceSignalDomain,
  CompanionPersonalization,
  CompanionIntelligenceSlice,
  TraitScore,
  HumanIntelligence,
  RelationshipIntelligence,
  BusinessIntelligence,
  AdhdIntelligence,
} from "./types";

export { INTELLIGENCE_PROFILE_UPDATED } from "./types";

export {
  getIntelligenceProfile,
  createEmptyIntelligenceProfile,
  saveIntelligenceProfile,
} from "./profileStore";

export {
  appendIntelligenceSignal,
  queryIntelligenceSignals,
  countSignalsByCategory,
} from "./signalStore";

export {
  evolveIntelligenceProfileFromSignals,
  topTraitsFromMap,
} from "./profileEvolution";

export {
  buildCompanionPersonalization,
  getCompanionIntelligenceSlice,
  formatCompanionIntelligenceForPrompt,
} from "./companionConsumer";

export {
  ingestClassifiedUserSignals,
  recordIntelligenceSignal,
  recordWorkspaceSignal,
  recordCreationSignal,
  recordBusinessActivitySignal,
  recordEnergySignal,
  recordTrustSignal,
} from "./ingest";

export { resolveSignalTraitMapping, listMappedSignalCategories } from "./signalMapping";

// Sprint 1 PR-A — Unified Signal Bus infrastructure (shadow mode; flags default OFF)
export {
  isUnifiedSignalBusEnabled,
  isSignalBusValidationStrict,
  isSignalBusDedupEnabled,
  isSignalBusDiagnosticsEnabled,
  isSignalBusDevWarningsEnabled,
  SIGNAL_BUS_FLAG_KEYS,
} from "./featureFlags";

export type {
  CompanionSignal,
  CompanionSignalInput,
  EmitResult,
  EmitErrorCode,
  SignalDomain,
  SignalAction,
  ShadowBusMetrics,
  SignalParityDiscrepancy,
} from "./signalBusTypes";

export { SIGNAL_BUS_UPDATED, SIGNAL_BUS_SCHEMA_VERSION } from "./signalBusTypes";

export {
  emitCompanionSignal,
  benchmarkEmitCompanionSignal,
} from "./signalBus";

export {
  lookupRegistryEntry,
  listAllRegistryKeys,
  getRegistryCoverageReport,
  inferDomainForCategory,
  SIGNAL_REGISTRY,
} from "./signalRegistry";

export {
  getShadowBusMetrics,
  compareSignalParity,
  compareEmittedParity,
  exposeShadowMetricsToWindow,
  resetShadowDiagnosticsForTests,
} from "./shadowDiagnostics";

export { SHADOW_SIGNAL_STORE_KEY, queryShadowSignals } from "./shadowSignalStore";

import { evolveIntelligenceProfileFromSignals } from "./profileEvolution";
import { getIntelligenceProfile } from "./profileStore";

/** Reconcile profile from signal log (e.g. on app boot). */
export function hydrateIntelligenceProfile(): ReturnType<typeof getIntelligenceProfile> {
  return evolveIntelligenceProfileFromSignals();
}

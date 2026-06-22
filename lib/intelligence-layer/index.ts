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
  getLastChatBusSummary,
} from "./ingest";

export { resolveSignalTraitMapping, listMappedSignalCategories } from "./signalMapping";

// Sprint 1 — Unified Signal Bus (shadow mode; flags default OFF)
export {
  isUnifiedSignalBusEnabled,
  isSignalBusValidationStrict,
  isSignalBusDedupEnabled,
  isSignalBusDiagnosticsEnabled,
  isSignalBusDevWarningsEnabled,
  isProfileLearningEnabled,
  isTrustInspectorEnabled,
  SIGNAL_BUS_FLAG_KEYS,
  PROFILE_LEARNING_FLAG_KEYS,
  TRUST_INSPECTOR_FLAG_KEYS,
} from "./featureFlags";

export {
  isTrustLearningAllowed,
  isTrustSignal,
  shouldEvolveFromSignal,
} from "./learningGates";

export type { TrustAttributionMvp, TrustCausationType } from "./trustAttribution";

export {
  recordTrustEvidence,
  ensureTrustSession,
  TRUST_PIPELINE_EMITTER,
} from "./trustSignals";

export type {
  TrustSignalCategory,
  RecordTrustEvidenceInput,
  RecordTrustEvidenceResult,
} from "./trustSignals";

export {
  getTrustCollectionDiagnostics,
  resetTrustDiagnosticsForTests,
} from "./trustDiagnostics";

export {
  appendTrustAuditEntry,
  clearTrustAuditLog,
  getTrustAuditLog as getPersistedTrustAuditLog,
  resetTrustAuditLogForTests,
} from "./trustEvolutionAudit";

export type { TrustAuditEntry, TrustAuditTraitDelta } from "./trustEvolutionAudit";

export {
  getTrustAuditLog,
  getTrustInspectorSummary,
  getTrustTraitSnapshot,
  buildTrustInspectorReport,
  exposeTrustInspectorToWindow,
} from "./trustInspector";

export type {
  TrustAuditLogFilter,
  TrustInspectorSummary,
  TrustTraitSnapshot,
  TrustTraitSnapshotItem,
  TrustTraitStatus,
} from "./trustInspector";

export type {
  TrustEvolutionDecision,
  TrustEvolutionBlockedReason,
  TrustCollectionDiagnostics,
} from "./trustDiagnostics";

export {
  resolveOfferBucket,
  isRegisteredInterventionBucket,
  listInterventionBuckets,
} from "./interventionRegistry";

export {
  initCompanionSession,
  touchCompanionSession,
  getCompanionSession,
  getOrCreateCompanionSession,
} from "./companionSession";

export {
  observeEcosystemSuppressions,
  observeGovernorTurnSurface,
  GOVERNOR_TRUST_EMITTER,
} from "./governorTrustSignals";

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
  reportShadowParityAfterChatTurn,
  exposeShadowMetricsToWindow,
  resetShadowDiagnosticsForTests,
} from "./shadowDiagnostics";

export {
  classifyAndEmitChatSignals,
  legacyKeysFromClassified,
} from "./chatSignalAdapter";

export {
  mirrorIntelligenceSignalToBus,
  mirrorIntelligenceSignalsToBus,
  legacyKeyFromIntelligenceSignal,
} from "./legacySignalMirror";

export { SHADOW_SIGNAL_STORE_KEY, queryShadowSignals } from "./shadowSignalStore";

import { evolveIntelligenceProfileFromSignals } from "./profileEvolution";
import { getIntelligenceProfile } from "./profileStore";

/** Reconcile profile from signal log (e.g. on app boot). */
export function hydrateIntelligenceProfile(): ReturnType<typeof getIntelligenceProfile> {
  return evolveIntelligenceProfileFromSignals();
}

/**
 * Intelligence layer feature flags.
 * Sprint 1 — Signal Bus. Sprint 2B-B — Profile learning.
 * All defaults OFF: zero production behavior change.
 */

const LS_PROFILE_LEARNING = "companion-flag-profile-learning";
const LS_UNIFIED_BUS = "companion-flag-unified-signal-bus";
const LS_VALIDATION_STRICT = "companion-flag-signal-bus-validation-strict";
const LS_DEDUP = "companion-flag-signal-bus-dedup";
const LS_DIAGNOSTICS = "companion-flag-signal-bus-diagnostics";
const LS_DEV_WARNINGS = "companion-flag-signal-bus-dev-warnings";
const LS_TRUST_INSPECTOR = "companion-flag-trust-inspector";
const LS_CHAMBER_INTELLIGENCE_PILOT = "companion-flag-chamber-intelligence-pilot";
const LS_CHAMBER_ACTIVATION_V2 = "companion-flag-chamber-activation-v2";
const LS_WORK_IDENTITY_V1 = "companion-flag-work-identity-v1";

function readLocalStorageFlag(key: string): boolean | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(key);
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return null;
}

function envTrue(name: string): boolean {
  return process.env[name] === "true" || process.env[name] === "1";
}

/** Master gate — profile trait evolution. Default: false. Independent of Signal Bus. */
export function isProfileLearningEnabled(): boolean {
  const override = readLocalStorageFlag(LS_PROFILE_LEARNING);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_PROFILE_LEARNING");
}

/** Master gate — shadow bus emit + mirror hooks. Default: false. */
export function isUnifiedSignalBusEnabled(): boolean {
  const override = readLocalStorageFlag(LS_UNIFIED_BUS);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_UNIFIED_SIGNAL_BUS");
}

/** Unknown domain:category → reject emit. Default: false (warn-only). */
export function isSignalBusValidationStrict(): boolean {
  const override = readLocalStorageFlag(LS_VALIDATION_STRICT);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_SIGNAL_BUS_VALIDATION_STRICT");
}

/** 60s dedupe window on bus. Default: true when bus enabled. */
export function isSignalBusDedupEnabled(): boolean {
  const override = readLocalStorageFlag(LS_DEDUP);
  if (override !== null) return override;
  if (!isUnifiedSignalBusEnabled()) return false;
  return process.env.NEXT_PUBLIC_SIGNAL_BUS_DEDUP !== "false";
}

/** Parity metrics + in-memory discrepancy buffer. */
export function isSignalBusDiagnosticsEnabled(): boolean {
  const override = readLocalStorageFlag(LS_DIAGNOSTICS);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_SIGNAL_BUS_DIAGNOSTICS");
}

/** console.warn on registry miss, validation reject, dedupe skip. */
export function isSignalBusDevWarningsEnabled(): boolean {
  const override = readLocalStorageFlag(LS_DEV_WARNINGS);
  if (override !== null) return override;
  return process.env.NODE_ENV === "development";
}

/** Persisted trust evolution audit log. Default: false. Observe-only. */
export function isTrustInspectorEnabled(): boolean {
  const override = readLocalStorageFlag(LS_TRUST_INSPECTOR);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_TRUST_INSPECTOR");
}

/**
 * Chamber Intelligence pilot (I-1/I-2) — gates deep per-expert selection
 * (frameworks, ADHD translations, knowledge-source flags) for Marketing,
 * Systems, and Events only. Default: false. When off, chamberExpertiseHintForChat
 * behaves exactly as it did before this pilot (thinking pattern + themes only).
 * See docs/estate/CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md.
 */
export function isChamberIntelligencePilotEnabled(): boolean {
  const override = readLocalStorageFlag(LS_CHAMBER_INTELLIGENCE_PILOT);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT");
}

/**
 * Chamber Activation V2 (V2-2) — gates the corrected eligibility rule,
 * outcomeSignals scoring, generalist tiebreak, and contested/co-primary
 * detection in resolveChamberExpertActivationV2.
 *
 * Default: TRUE as of 2026-08-07, after two rounds of founder-language
 * validation (43 realistic scenarios) plus the Spark Council Reality
 * Test — see docs/estate/CHAMBER_ACTIVATION_V2_VALIDATION_SET.md and
 * docs/estate/CHAMBER_ACTIVATION_V2_DEFAULT_FLIP.md. Set
 * NEXT_PUBLIC_CHAMBER_ACTIVATION_V2=false (or "0") to roll back to V1
 * (resolveChamberExpertActivation) — zero behavior change from before
 * this flip when rolled back.
 */
export function isChamberActivationV2Enabled(): boolean {
  const override = readLocalStorageFlag(LS_CHAMBER_ACTIVATION_V2);
  if (override !== null) return override;
  const raw = process.env.NEXT_PUBLIC_CHAMBER_ACTIVATION_V2;
  return raw !== "false" && raw !== "0";
}

/**
 * Work Identity — Commitment Recognition, Slice 1A (observe-only).
 *
 * Gates a single, additional call to `resolveCommitmentGate` at the
 * existing Support Gate checkpoint in CompanionPageClient.tsx. When
 * enabled, the gate's decision is computed from the same inputs Create
 * Fast Path already has on hand and recorded to an in-memory-only
 * diagnostic log (`lib/workIdentity/commitmentGateDiagnostics.ts`) —
 * never localStorage, never a durable record. No WorkId is created, no
 * storage is written, and no Create/Exploration/Research/Support
 * behavior changes when this flag is on or off — see
 * docs/estate/WORK_IDENTITY_SLICE_0_REVIEW.md §5 and
 * docs/estate/WORK_IDENTITY_IMPLEMENTATION_PLAN.md. Default: false.
 */
export function isWorkIdentityV1Enabled(): boolean {
  const override = readLocalStorageFlag(LS_WORK_IDENTITY_V1);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_WORK_IDENTITY_V1");
}

export const PROFILE_LEARNING_FLAG_KEYS = {
  profileLearning: LS_PROFILE_LEARNING,
} as const;

export const TRUST_INSPECTOR_FLAG_KEYS = {
  trustInspector: LS_TRUST_INSPECTOR,
} as const;

export const CHAMBER_INTELLIGENCE_PILOT_FLAG_KEYS = {
  chamberIntelligencePilot: LS_CHAMBER_INTELLIGENCE_PILOT,
} as const;

export const CHAMBER_ACTIVATION_V2_FLAG_KEYS = {
  chamberActivationV2: LS_CHAMBER_ACTIVATION_V2,
} as const;

export const WORK_IDENTITY_V1_FLAG_KEYS = {
  workIdentityV1: LS_WORK_IDENTITY_V1,
} as const;

export const SIGNAL_BUS_FLAG_KEYS = {
  unifiedBus: LS_UNIFIED_BUS,
  validationStrict: LS_VALIDATION_STRICT,
  dedup: LS_DEDUP,
  diagnostics: LS_DIAGNOSTICS,
  devWarnings: LS_DEV_WARNINGS,
} as const;

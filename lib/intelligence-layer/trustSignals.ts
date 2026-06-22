/**
 * Sprint 2B-B PR 4 — Central trust evidence API.
 */

import {
  getOrCreateCompanionSession,
  touchCompanionSession,
} from "./companionSession";
import { isProfileLearningEnabled, shouldEvolveFromSignal } from "./learningGates";
import { applySignalIncrementally } from "./profileEvolution";
import { getIntelligenceProfile, saveIntelligenceProfile } from "./profileStore";
import { resolveOfferBucket } from "./interventionRegistry";
import { appendIntelligenceSignal } from "./signalStore";
import { emitCompanionSignal } from "./signalBus";
import type { SignalAction } from "./signalBusTypes";
import { isUnifiedSignalBusEnabled, isTrustInspectorEnabled } from "./featureFlags";
import {
  buildTrustAttribution,
  type TrustAttributionMvp,
  type TrustCausationType,
} from "./trustAttribution";
import {
  logTrustEvolutionDecision,
  recordTrustSignalRecorded,
  type TrustEvolutionBlockedReason,
  type TrustEvolutionDecision,
} from "./trustDiagnostics";
import { getIntelligenceSignalStore } from "./signalStore";
import { resolveSignalTraitMapping } from "./signalMapping";
import { appendTrustAuditEntry, type TrustAuditTraitDelta } from "./trustEvolutionAudit";
import type { IntelligenceProfile, IntelligenceSignal, IntelligenceSignalValence, TraitScore } from "./types";

export const TRUST_PIPELINE_EMITTER = "companion.trust-pipeline";

export type TrustSignalCategory =
  | "trust.suggestion_accepted"
  | "trust.suggestion_dismissed"
  | "trust.suggestion_ignored"
  | "trust.intervention_started"
  | "trust.intervention_completed"
  | "trust.intervention_abandoned"
  | "trust.offer_suppressed"
  | "trust.offer_blocked"
  | "trust.offer_rendered";

const NEVER_EVOLVE_CATEGORIES = new Set<string>([
  "offer_rendered",
  "offer_suppressed",
  "offer_blocked",
  "intervention_started",
  "intervention_abandoned",
]);

export type RecordTrustEvidenceInput = {
  category: TrustSignalCategory;
  /** UI slug or stable bucket — resolved via intervention registry. */
  offerKey: string;
  source: string;
  emitter?: string;
  causationType?: TrustCausationType;
  valence?: IntelligenceSignalValence;
  meta?: Record<string, string | number | boolean>;
};

export type RecordTrustEvidenceResult = {
  signal: IntelligenceSignal;
  attribution: TrustAttributionMvp | null;
  decision: TrustEvolutionDecision;
  busMirrored: boolean;
};

function busCategoryFromTrustId(category: TrustSignalCategory): string {
  return category.startsWith("trust.") ? category.slice("trust.".length) : category;
}

function defaultValence(
  busCategory: string,
): IntelligenceSignalValence {
  if (busCategory === "suggestion_accepted" || busCategory === "intervention_completed") {
    return "positive";
  }
  if (busCategory === "suggestion_dismissed" || busCategory === "intervention_abandoned") {
    return "negative";
  }
  return "neutral";
}

function busActionForCategory(busCategory: string): SignalAction {
  switch (busCategory) {
    case "suggestion_accepted":
      return "accepted";
    case "suggestion_dismissed":
      return "dismissed";
    case "suggestion_ignored":
      return "ignored";
    case "intervention_completed":
      return "completed";
    case "intervention_abandoned":
      return "failed";
    default:
      return "observed";
  }
}

function syncProfileSignalCount(): void {
  const current = getIntelligenceProfile();
  const next = structuredClone(current);
  next.signalCount = getIntelligenceSignalStore().signals.length;
  next.updatedAt = new Date().toISOString();
  saveIntelligenceProfile(next);
}

const TRUST_TRAIT_PREFIX = "relationship.trust.";

function getTraitAtPath(
  profile: IntelligenceProfile,
  path: string,
): TraitScore | null {
  const parts = path.split(".");
  if (parts.length !== 3) return null;
  const [section, subsection, trait] = parts;
  if (section !== "relationship" || subsection !== "trust") return null;
  return profile.relationship.trust[trait] ?? null;
}

function trustTraitPathsForCategory(busCategory: string): string[] {
  const mapping = resolveSignalTraitMapping(busCategory);
  if (!mapping) return [];
  return mapping.paths.filter((path) => path.startsWith(TRUST_TRAIT_PREFIX));
}

function snapshotTrustTraits(
  profile: IntelligenceProfile,
  paths: string[],
): Record<string, TraitScore | null> {
  const snap: Record<string, TraitScore | null> = {};
  for (const path of paths) {
    const trait = getTraitAtPath(profile, path);
    snap[path] = trait ? structuredClone(trait) : null;
  }
  return snap;
}

function computeTraitDeltas(
  before: Record<string, TraitScore | null>,
  after: Record<string, TraitScore | null>,
): TrustAuditTraitDelta[] {
  const deltas: TrustAuditTraitDelta[] = [];
  for (const path of Object.keys(before)) {
    const prev = before[path] ?? null;
    const next = after[path];
    if (!next) continue;
    const prevJson = prev ? JSON.stringify(prev) : null;
    const nextJson = JSON.stringify(next);
    if (prevJson !== nextJson) {
      deltas.push({ path, before: prev, after: next });
    }
  }
  return deltas;
}

function persistTrustAuditEntry(opts: {
  signal: IntelligenceSignal;
  busCategory: string;
  input: RecordTrustEvidenceInput;
  emitter: string;
  attributionValidation: ReturnType<typeof buildTrustAttribution>;
  decision: TrustEvolutionDecision;
  traitDeltas: TrustAuditTraitDelta[];
}): void {
  if (!isTrustInspectorEnabled()) return;
  try {
    const { signal, busCategory, input, emitter, attributionValidation, decision, traitDeltas } =
      opts;
    const meta = signal.meta ?? {};
    appendTrustAuditEntry({
      id: signal.id,
      at: signal.at,
      trustCategory: input.category,
      busCategory,
      source: signal.source,
      emitter,
      valence: signal.valence ?? defaultValence(busCategory),
      sessionId: typeof meta.sessionId === "string" ? meta.sessionId : undefined,
      productId: typeof meta.productId === "string" ? meta.productId : undefined,
      offerKey: typeof meta.offerKey === "string" ? meta.offerKey : input.offerKey,
      interventionBucket:
        typeof meta.interventionBucket === "string" ? meta.interventionBucket : null,
      causationType:
        typeof meta.causationType === "string" ? meta.causationType : undefined,
      attributionValid: attributionValidation.ok,
      attributionError: attributionValidation.ok
        ? undefined
        : attributionValidation.code,
      evolve: decision.evolve,
      reason: decision.reason,
      traitDeltas,
    });
  } catch {
    /* audit must never affect collection */
  }
}

function resolveEvolutionDecision(
  signal: IntelligenceSignal,
  busCategory: string,
  attribution: TrustAttributionMvp | null,
  attributionValidation: ReturnType<typeof buildTrustAttribution>,
): TrustEvolutionDecision {
  const base = {
    at: signal.at,
    signalId: signal.id,
    category: `trust.${busCategory}` as TrustSignalCategory,
  };

  if (NEVER_EVOLVE_CATEGORIES.has(busCategory)) {
    const reason: TrustEvolutionBlockedReason =
      busCategory === "offer_suppressed"
        ? "system_causation"
        : busCategory === "offer_blocked"
          ? "system_causation"
          : "render_only_signal";
    return { ...base, evolve: false, reason };
  }

  if (!isProfileLearningEnabled()) {
    return { ...base, evolve: false, reason: "profile_learning_disabled" };
  }

  if (!attributionValidation.ok || !attribution) {
    const reason: TrustEvolutionBlockedReason =
      attributionValidation.ok === false &&
      attributionValidation.code === "unknown_intervention_bucket"
        ? "unknown_intervention_bucket"
        : "attribution_invalid";
    return { ...base, evolve: false, reason };
  }

  if (attribution.causationType !== "user_action") {
    return { ...base, evolve: false, reason: "system_causation" };
  }

  if (!shouldEvolveFromSignal(signal, attribution)) {
    return { ...base, evolve: false, reason: "gates_blocked" };
  }

  return { ...base, evolve: true, reason: "evolved" };
}

function mirrorTrustSignalToBus(
  signal: IntelligenceSignal,
  busCategory: string,
  emitter: string,
): boolean {
  if (!isUnifiedSignalBusEnabled()) return false;
  try {
    const result = emitCompanionSignal({
      domain: "trust",
      category: busCategory,
      action: busActionForCategory(busCategory),
      source: signal.source,
      valence: signal.valence,
      meta: signal.meta,
      emitter,
      at: signal.at,
    });
    return result.ok;
  } catch {
    return false;
  }
}

/**
 * Record trust evidence: signal always stored; trait evolution gated.
 */
export function recordTrustEvidence(
  input: RecordTrustEvidenceInput,
): RecordTrustEvidenceResult {
  const session = touchCompanionSession();
  const busCategory = busCategoryFromTrustId(input.category);
  const causationType = input.causationType ?? "user_action";
  const resolvedBucket = resolveOfferBucket(input.offerKey);

  const attributionValidation = buildTrustAttribution({
    sessionId: session.sessionId,
    productId: session.productId,
    offerKey: resolvedBucket ?? input.offerKey,
    causationType,
  });

  const attribution = attributionValidation.ok
    ? attributionValidation.attribution
    : null;

  const meta: Record<string, string | number | boolean> = {
    trustCategory: input.category,
    sessionId: session.sessionId,
    productId: session.productId,
    causationType,
    offerKey: input.offerKey,
    ...(resolvedBucket ? { interventionBucket: resolvedBucket } : {}),
    ...(input.meta ?? {}),
  };

  if (!attributionValidation.ok) {
    meta.attributionError = attributionValidation.code;
  }

  const signal = appendIntelligenceSignal({
    domain: "trust",
    category: busCategory,
    source: input.source,
    valence: input.valence ?? defaultValence(busCategory),
    meta,
  });

  recordTrustSignalRecorded();

  const emitter = input.emitter ?? TRUST_PIPELINE_EMITTER;
  const busMirrored = mirrorTrustSignalToBus(signal, busCategory, emitter);

  const decision = resolveEvolutionDecision(
    signal,
    busCategory,
    attribution,
    attributionValidation,
  );

  const trustPaths = trustTraitPathsForCategory(busCategory);
  const traitsBeforeEvolution =
    decision.evolve && trustPaths.length > 0
      ? snapshotTrustTraits(getIntelligenceProfile(), trustPaths)
      : {};

  if (decision.evolve && attribution) {
    applySignalIncrementally(signal, attribution);
  } else {
    syncProfileSignalCount();
  }

  logTrustEvolutionDecision(decision);

  const traitDeltas =
    decision.evolve && trustPaths.length > 0
      ? computeTraitDeltas(
          traitsBeforeEvolution,
          snapshotTrustTraits(getIntelligenceProfile(), trustPaths),
        )
      : [];

  persistTrustAuditEntry({
    signal,
    busCategory,
    input,
    emitter,
    attributionValidation,
    decision,
    traitDeltas,
  });

  return { signal, attribution, decision, busMirrored };
}

/** Ensure a session exists without recording trust evidence. */
export function ensureTrustSession(): ReturnType<typeof getOrCreateCompanionSession> {
  return getOrCreateCompanionSession();
}

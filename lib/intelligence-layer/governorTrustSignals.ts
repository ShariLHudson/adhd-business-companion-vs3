/**
 * Sprint 2B-B PR 5 — Observational governor / ecosystem trust signals.
 * Records system-caused suppression; never user rejection.
 */

import type {
  CompanionGovernorInput,
  TurnSurface,
} from "@/lib/companionGovernor";
import type { AppSection } from "@/lib/companionUi";
import type {
  EcosystemSnapshot,
  EcosystemSuppression,
} from "@/lib/ecosystem-intelligence/types";

import { resolveOfferBucket } from "./interventionRegistry";
import { recordTrustEvidence } from "./trustSignals";
import type { RecordTrustEvidenceResult } from "./trustSignals";

export const GOVERNOR_TRUST_EMITTER = "companion.governor-trust";

const DEDUPE_MS = 60_000;

/** Ecosystem suppression id → intervention registry alias */
const SUPPRESSION_OFFER_KEYS: Record<EcosystemSuppression, string> = {
  activation_offer: "activation_offer",
  loop_offer: "loop_offer",
  relationship_offer: "relationship_offer",
  decision_offer: "decision_offer",
  environment_offer: "environment_offer",
  future_shari_offer: "future_shari_offer",
  momentum_offer: "momentum_offer",
  opportunity_offer: "opportunity_offer",
  business_os_sort: "business_os_sort",
  chief_of_staff: "chief_of_staff",
  day_designer: "day_designer",
  predictive_support_offer: "predictive_support_offer",
  productivity_nudges: "generic_tip",
  business_nudges: "generic_tip",
  founder_growth_nudges: "generic_tip",
};

const SECTION_OFFER_KEYS: Partial<Record<AppSection, string>> = {
  "plan-my-day": "plan-my-day",
  "content-generator": "create",
  "brain-dump": "brain-dump",
  breathe: "breathe",
  focus: "focus-session",
};

const recentEmitAt = new Map<string, number>();

function dedupeKey(parts: string[]): string {
  return parts.join("|");
}

function shouldEmit(key: string, nowMs: number): boolean {
  const last = recentEmitAt.get(key);
  if (last != null && nowMs - last < DEDUPE_MS) return false;
  recentEmitAt.set(key, nowMs);
  return true;
}

function safeRecord(
  fn: () => RecordTrustEvidenceResult,
): RecordTrustEvidenceResult | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

export function suppressionToOfferKey(
  suppression: EcosystemSuppression,
): string {
  return SUPPRESSION_OFFER_KEYS[suppression] ?? "generic_tip";
}

export function inferGovernorIntendedOfferKey(
  surface: TurnSurface,
  input: CompanionGovernorInput,
): string {
  if (surface.pendingOfferSection) {
    return SECTION_OFFER_KEYS[surface.pendingOfferSection] ?? "workspace_open";
  }
  if (input.dayDesignerActive) return "day_designer";
  if (input.createBuilderActive) return "create";
  if (input.businessStrategyActive) return "create";
  return "generic_tip";
}

export function observeEcosystemSuppressions(
  snapshot: EcosystemSnapshot,
): RecordTrustEvidenceResult[] {
  const results: RecordTrustEvidenceResult[] = [];
  const nowMs = Date.parse(snapshot.createdAt) || Date.now();

  for (const suppression of snapshot.suppressions) {
    const offerKey = suppressionToOfferKey(suppression);
    const key = dedupeKey([
      "ecosystem",
      "offer_suppressed",
      suppression,
      offerKey,
    ]);
    if (!shouldEmit(key, nowMs)) continue;

    const result = safeRecord(() =>
      recordTrustEvidence({
        category: "trust.offer_suppressed",
        offerKey,
        source: `ecosystem:suppression:${suppression}`,
        emitter: GOVERNOR_TRUST_EMITTER,
        causationType: "system_suppressed",
        meta: {
          governorRuleId: "ecosystem_priority",
          ecosystemSuppression: suppression,
          intendedBucket: resolveOfferBucket(offerKey) ?? offerKey,
          ecosystemTopSignal: snapshot.topSignal,
          ecosystemRecommendedSurface: snapshot.recommendedSurface,
        },
      }),
    );
    if (result) results.push(result);
  }

  return results;
}

export function observeGovernorTurnSurface(
  surface: TurnSurface,
  input: CompanionGovernorInput,
): RecordTrustEvidenceResult[] {
  const results: RecordTrustEvidenceResult[] = [];
  const nowMs = Date.now();

  if (surface.suppressCards) {
    const offerKey = inferGovernorIntendedOfferKey(surface, input);
    const key = dedupeKey(["governor", "offer_blocked", "suppressCards", offerKey]);
    if (shouldEmit(key, nowMs)) {
      const result = safeRecord(() =>
        recordTrustEvidence({
          category: "trust.offer_blocked",
          offerKey,
          source: `governor:block:suppressCards`,
          emitter: GOVERNOR_TRUST_EMITTER,
          causationType: "system_blocked",
          meta: {
            governorRuleId: "suppressCards",
            intendedBucket: resolveOfferBucket(offerKey) ?? offerKey,
            governorLane: surface.lane,
            governorOutcome: surface.outcome,
          },
        }),
      );
      if (result) results.push(result);
    }
  }

  return results;
}

/** Test-only reset. */
export function resetGovernorTrustDedupeForTests(): void {
  recentEmitAt.clear();
}

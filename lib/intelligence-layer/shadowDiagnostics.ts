/**
 * Shadow bus diagnostics — parity comparison and metrics (no user-visible UI).
 */

import type {
  ShadowBusMetrics,
  SignalParityDiscrepancy,
} from "./signalBusTypes";
import { queryShadowSignals } from "./shadowSignalStore";
import {
  isSignalBusDevWarningsEnabled,
  isSignalBusDiagnosticsEnabled,
  isUnifiedSignalBusEnabled,
} from "./featureFlags";
import { getLastChatBusSummary } from "./ingest";

const MAX_DISCREPANCIES = 200;
const MAX_PARITY_HISTORY = 100;

type MetricsState = {
  totalEmits: number;
  dedupedEmits: number;
  registryMisses: number;
  validationFailures: number;
  parityChecks: number;
  parityPasses: number;
  lastDiscrepancies: SignalParityDiscrepancy[];
};

const state: MetricsState = {
  totalEmits: 0,
  dedupedEmits: 0,
  registryMisses: 0,
  validationFailures: 0,
  parityChecks: 0,
  parityPasses: 0,
  lastDiscrepancies: [],
};

export function resetShadowDiagnosticsForTests(): void {
  state.totalEmits = 0;
  state.dedupedEmits = 0;
  state.registryMisses = 0;
  state.validationFailures = 0;
  state.parityChecks = 0;
  state.parityPasses = 0;
  state.lastDiscrepancies = [];
}

export function recordBusEmit(opts: {
  deduped: boolean;
  registryMiss?: boolean;
}): void {
  if (!opts.deduped) {
    state.totalEmits += 1;
  } else {
    state.dedupedEmits += 1;
  }
  if (opts.registryMiss) {
    state.registryMisses += 1;
  }
}

export function recordValidationFailure(): void {
  state.validationFailures += 1;
}

function pushDiscrepancy(d: SignalParityDiscrepancy): void {
  state.lastDiscrepancies = [d, ...state.lastDiscrepancies].slice(
    0,
    MAX_DISCREPANCIES,
  );
  if (isSignalBusDiagnosticsEnabled() && isSignalBusDevWarningsEnabled()) {
    console.info("[SignalBus] parity discrepancy", d);
  }
}

/**
 * Compare legacy domain:category keys vs shadow store within a time window.
 * Shadow may have fewer entries due to bus dedupe — allowed delta ≤ 1 per turn.
 */
export function compareSignalParity(
  legacyKeys: string[],
  windowMs: number = 60_000,
): { pass: boolean; discrepancy?: SignalParityDiscrepancy } {
  state.parityChecks += 1;
  const since = new Date(Date.now() - windowMs).toISOString();
  const shadow = queryShadowSignals({ since });
  const shadowKeys = shadow.map((s) => `${s.domain}:${s.category}`);

  const legacySet = new Set(legacyKeys);
  const shadowSet = new Set(shadowKeys);

  const missingInShadow = legacyKeys.filter((k) => !shadowSet.has(k));
  const extraInShadow = shadowKeys.filter((k) => !legacySet.has(k));

  const countDelta = Math.abs(legacyKeys.length - shadowKeys.length);
  const pass =
    missingInShadow.length === 0 &&
    extraInShadow.length <= 1 &&
    countDelta <= 1;

  if (pass) {
    state.parityPasses += 1;
    return { pass: true };
  }

  const discrepancy: SignalParityDiscrepancy = {
    at: new Date().toISOString(),
    legacyKeys: [...legacyKeys],
    shadowKeys: [...shadowKeys],
    missingInShadow,
    extraInShadow,
  };
  pushDiscrepancy(discrepancy);
  return { pass: false, discrepancy };
}

export function getShadowBusMetrics(): ShadowBusMetrics {
  const attempts = state.totalEmits + state.dedupedEmits;
  return {
    totalEmits: state.totalEmits,
    dedupedEmits: state.dedupedEmits,
    registryMisses: state.registryMisses,
    validationFailures: state.validationFailures,
    parityChecks: state.parityChecks,
    parityPasses: state.parityPasses,
    parityPassRate:
      state.parityChecks === 0
        ? 1
        : state.parityPasses / state.parityChecks,
    duplicateRate: attempts === 0 ? 0 : state.dedupedEmits / attempts,
    lastDiscrepancies: state.lastDiscrepancies.slice(0, MAX_PARITY_HISTORY),
  };
}

/** Compare legacy keys to keys emitted this chat turn (not global shadow window). */
export function compareEmittedParity(
  legacyKeys: string[],
  shadowKeys: string[],
): { pass: boolean; discrepancy?: SignalParityDiscrepancy } {
  state.parityChecks += 1;
  const legacySet = new Set(legacyKeys);
  const shadowSet = new Set(shadowKeys);

  const missingInShadow = legacyKeys.filter((k) => !shadowSet.has(k));
  const extraInShadow = shadowKeys.filter((k) => !legacySet.has(k));
  const countDelta = Math.abs(legacyKeys.length - shadowKeys.length);
  const pass =
    missingInShadow.length === 0 &&
    extraInShadow.length <= 1 &&
    countDelta <= 1;

  if (pass) {
    state.parityPasses += 1;
    return { pass: true };
  }

  const discrepancy: SignalParityDiscrepancy = {
    at: new Date().toISOString(),
    legacyKeys: [...legacyKeys],
    shadowKeys: [...shadowKeys],
    missingInShadow,
    extraInShadow,
  };
  pushDiscrepancy(discrepancy);
  return { pass: false, discrepancy };
}

/** Call after chat ingest when diagnostics enabled. */
export function reportShadowParityAfterChatTurn(): void {
  if (!isUnifiedSignalBusEnabled() || !isSignalBusDiagnosticsEnabled()) {
    return;
  }
  const summary = getLastChatBusSummary();
  if (!summary) return;
  const shadowKeys = summary.emitted.map((s) => `${s.domain}:${s.category}`);
  compareEmittedParity(summary.legacyKeys, shadowKeys);
}

/** Dev-only global for founder QA (not exposed in production UI). */
export function exposeShadowMetricsToWindow(): void {
  if (
    typeof window === "undefined" ||
    !isSignalBusDiagnosticsEnabled() ||
    process.env.NODE_ENV === "production"
  ) {
    return;
  }
  (
    window as unknown as { __companionSignalBusMetrics?: () => ShadowBusMetrics }
  ).__companionSignalBusMetrics = getShadowBusMetrics;
}

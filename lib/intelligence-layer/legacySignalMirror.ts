/**
 * Mirrors legacy IntelligenceSignal records to shadow bus (flag-gated).
 */

import type { IntelligenceSignal } from "./types";
import { isUnifiedSignalBusEnabled } from "./featureFlags";
import { emitCompanionSignal } from "./signalBus";
import type { CompanionSignal, EmitResult, SignalDomain } from "./signalBusTypes";

const LEGACY_EMITTER = "companion.legacy-mirror";

function mapLegacyDomain(domain: IntelligenceSignal["domain"]): SignalDomain {
  return domain as SignalDomain;
}

/**
 * Mirror one legacy signal to bus. Swallows all errors; never throws.
 */
export function mirrorIntelligenceSignalToBus(
  signal: IntelligenceSignal,
): EmitResult | null {
  if (!isUnifiedSignalBusEnabled()) return null;

  try {
    return emitCompanionSignal({
      domain: mapLegacyDomain(signal.domain),
      category: signal.category,
      source: signal.source,
      valence: signal.valence,
      meta: signal.meta,
      emitter: LEGACY_EMITTER,
      action: "observed",
      at: signal.at,
    });
  } catch {
    return null;
  }
}

export function legacyKeyFromIntelligenceSignal(
  signal: IntelligenceSignal,
): string {
  return `${signal.domain}:${signal.category}`;
}

export type LegacyMirrorBatch = {
  mirrored: CompanionSignal[];
  legacyKeys: string[];
};

export function mirrorIntelligenceSignalsToBus(
  signals: IntelligenceSignal[],
): LegacyMirrorBatch {
  const mirrored: CompanionSignal[] = [];
  const legacyKeys: string[] = [];
  for (const signal of signals) {
    legacyKeys.push(legacyKeyFromIntelligenceSignal(signal));
    const result = mirrorIntelligenceSignalToBus(signal);
    if (result?.ok && !result.deduped) {
      mirrored.push(result.signal);
    }
  }
  return { mirrored, legacyKeys };
}

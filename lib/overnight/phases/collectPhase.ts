import type { CollectPhasePayload, CollectedSignal, OvernightSignalSource } from "../types";
import { overnightSampleRepository } from "../repositories/sample";

const ALL_SOURCES: OvernightSignalSource[] = [
  "research",
  "companion",
  "founder",
  "postcraft",
  "gohighlevel",
  "analytics",
  "mission",
  "decision-vault",
  "customer-feedback",
  "ai-news",
  "technology",
  "competitors",
];

function countBySource(signals: CollectedSignal[]): Record<OvernightSignalSource, number> {
  const counts = Object.fromEntries(ALL_SOURCES.map((s) => [s, 0])) as Record<
    OvernightSignalSource,
    number
  >;
  for (const sig of signals) {
    counts[sig.source] = (counts[sig.source] ?? 0) + 1;
  }
  return counts;
}

export function runCollectPhase(): CollectPhasePayload {
  const signals = overnightSampleRepository.listSignals();
  return {
    signals,
    sourceCounts: countBySource(signals),
  };
}

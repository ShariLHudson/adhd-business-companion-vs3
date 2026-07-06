import type { FounderFrictionPattern } from "../types";
import { founderProfileSampleRepository } from "../repositories/sample";
import { mergedObservations } from "../history/observationHistory";
import { isObservationalPhrase } from "./patternEngine";

export function listFrictionPatterns(): FounderFrictionPattern[] {
  const sample = founderProfileSampleRepository.friction();
  const negativeObs = mergedObservations().filter((o) => o.outcome === "negative" || o.kind === "friction_signal");

  const fromObs: FounderFrictionPattern[] = negativeObs
    .filter((o) => !sample.some((f) => f.noticedPhrase.includes(o.context)))
    .slice(0, 2)
    .map((o) => ({
      id: `fric-runtime-${o.id}`,
      kind: o.kind === "context_switching" ? ("context_switch" as const) : ("delay" as const),
      noticedPhrase: `I've noticed ${o.observation.charAt(0).toLowerCase()}${o.observation.slice(1)}`,
      occurrences: o.evidenceCount,
      reduction: "Reduce competing surfaces — protect one focus block.",
      lastSeenAt: o.lastNoticedAt,
    }));

  return [...sample, ...fromObs].filter((f) => isObservationalPhrase(f.noticedPhrase));
}

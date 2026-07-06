import type { FounderStrength, FounderSuccessOutcome } from "../types";
import { founderProfileSampleRepository } from "../repositories/sample";
import { mergedObservations } from "../history/observationHistory";
import { isObservationalPhrase } from "./patternEngine";

export function listStrengths(): FounderStrength[] {
  const sample = founderProfileSampleRepository.strengths();
  const positiveObs = mergedObservations().filter((o) => o.outcome === "positive");

  const fromObs: FounderStrength[] = positiveObs
    .filter((o) => o.confidence >= 75 && !sample.some((s) => s.evidence.includes(o.id)))
    .slice(0, 2)
    .map((o) => ({
      id: `str-runtime-${o.id}`,
      title: o.context,
      noticedPhrase: `I've noticed ${o.observation.charAt(0).toLowerCase()}${o.observation.slice(1)}`,
      outcomes: ["momentum", "finished_projects"] as FounderSuccessOutcome[],
      repeatability: o.confidence,
      evidence: [o.id],
    }));

  return [...sample, ...fromObs].filter((s) => isObservationalPhrase(s.noticedPhrase));
}

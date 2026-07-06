import type { FounderPattern } from "../types";
import { founderProfileSampleRepository } from "../repositories/sample";
import { mergedObservations } from "../history/observationHistory";

const FORBIDDEN_LABEL_PATTERNS = [
  /\byou are\b/i,
  /\byou're a\b/i,
  /\bpersonality\b/i,
  /\btype\b/i,
  /\benneagram\b/i,
  /\bmbti\b/i,
  /\bintrovert\b/i,
  /\bextrovert\b/i,
];

export function isObservationalPhrase(phrase: string): boolean {
  if (!phrase.startsWith("I've noticed")) return false;
  return !FORBIDDEN_LABEL_PATTERNS.some((re) => re.test(phrase));
}

export function buildPatternsFromObservations(): FounderPattern[] {
  const sample = founderProfileSampleRepository.patterns();
  const observations = mergedObservations();

  const runtimePatterns: FounderPattern[] = observations
    .filter((o) => o.evidenceCount >= 2 && o.confidence >= 50 && !sample.some((p) => p.evidence.includes(o.id)))
    .slice(0, 3)
    .map((o) => ({
      id: `pat-runtime-${o.id}`,
      title: o.context,
      noticedPhrase: `I've noticed ${o.observation.charAt(0).toLowerCase()}${o.observation.slice(1)}`,
      summary: o.observation,
      evidence: [o.id],
      confidence: o.confidence,
      trend: o.decayWeight >= 0.9 ? ("strengthening" as const) : ("stable" as const),
      category: o.outcome === "negative" ? ("friction" as const) : ("habit" as const),
      observationKinds: [o.kind],
    }));

  return [...sample, ...runtimePatterns].filter((p) => isObservationalPhrase(p.noticedPhrase));
}

export function listPatterns(): FounderPattern[] {
  return buildPatternsFromObservations();
}

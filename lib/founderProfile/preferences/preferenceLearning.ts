import type { FounderPreference } from "../types";
import { founderProfileSampleRepository } from "../repositories/sample";
import { listPatterns, isObservationalPhrase } from "../patterns/patternEngine";

export function listPreferences(): FounderPreference[] {
  const sample = founderProfileSampleRepository.preferences();
  const patterns = listPatterns();

  const fromPatterns: FounderPreference[] = patterns
    .filter((p) => p.category === "habit" || p.category === "workflow" || p.category === "preference")
    .filter((p) => !sample.some((pref) => pref.noticedPhrase === p.noticedPhrase))
    .slice(0, 2)
    .map((p) => ({
      id: `pref-from-${p.id}`,
      area: p.category,
      noticedPhrase: p.noticedPhrase,
      detail: p.summary,
      confidence: p.confidence,
      evolving: true,
    }));

  return [...sample, ...fromPatterns].filter((p) => isObservationalPhrase(p.noticedPhrase));
}

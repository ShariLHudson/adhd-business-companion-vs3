import type { CompareResultsInput, CompareResultsOutput } from "../types";
import { improvementSampleRepository } from "../repositories/sample";

export function compareResults(input: CompareResultsInput): CompareResultsOutput | null {
  const experimentA = improvementSampleRepository.getExperiment(input.experimentIdA);
  if (!experimentA) return null;

  const experimentB = input.experimentIdB
    ? improvementSampleRepository.getExperiment(input.experimentIdB) ?? undefined
    : undefined;

  const lessonsA = experimentA.lessons;
  const lessonsB = experimentB?.lessons ?? [];
  const sharedLessons = lessonsA.filter((l) => lessonsB.includes(l));

  let recommendation = experimentA.recommendation ?? "Continue monitoring with evidence.";
  if (experimentA.status === "completed" && experimentA.result) {
    recommendation = experimentA.recommendation ?? `Apply lesson: ${experimentA.lessons[0] ?? "Review institutional memory."}`;
  }
  if (experimentB?.status === "completed" && sharedLessons.length > 0) {
    recommendation = `Shared lesson across experiments: ${sharedLessons[0]}`;
  }

  return {
    experimentA,
    experimentB,
    sharedLessons,
    recommendation,
  };
}

export function listHistory(improvementId?: string) {
  const history = improvementSampleRepository.history();
  return improvementId ? history.filter((h) => h.improvementId === improvementId) : history;
}

export function listRelationships(entityId?: string) {
  const rels = improvementSampleRepository.relationships();
  if (!entityId) return rels;
  return rels.filter((r) => r.fromId === entityId || r.toId === entityId);
}

export function institutionalMemoryLinks() {
  return improvementSampleRepository
    .opportunities()
    .flatMap((o) =>
      o.evidence
        .filter((e) => e.institutionalMemoryId)
        .map((e) => ({
          opportunityId: o.id,
          institutionalMemoryId: e.institutionalMemoryId!,
          label: e.label,
        })),
    );
}

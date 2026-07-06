import type { BusinessDecision, BusinessReasoning, InstitutionalMemory } from "../types";
import { institutionalMemorySampleRepository } from "../repositories/sample";

export function findDecisionHistory(decisionId: string): BusinessDecision | null {
  const memory = institutionalMemorySampleRepository.get(decisionId);
  if (!memory || memory.kind !== "decision") return null;
  return memory as BusinessDecision;
}

export function buildBusinessReasoning(decisionId: string): BusinessReasoning | null {
  const decision = findDecisionHistory(decisionId);
  if (!decision) return null;

  const wasSuccessful = decision.actualOutcome.toLowerCase().includes("advanced") ||
    decision.actualOutcome.toLowerCase().includes("supports");

  return {
    memoryId: decision.id,
    title: decision.title,
    whyDecided: decision.whyThisHappened,
    alternatives: decision.alternativesConsidered,
    evidenceSummary: decision.evidence.map((e) => e.label).join("; ") || "Sample evidence on file.",
    wasSuccessful,
    wouldDecideSameToday: decision.wouldDoAgain === true,
    narrative: [
      `Why did we decide this? ${decision.whyThisHappened}`,
      `Alternatives considered: ${decision.alternativesConsidered.join(" · ") || "None recorded."}`,
      `Expected: ${decision.expectedOutcome}`,
      `Actual: ${decision.actualOutcome}`,
      wasSuccessful
        ? "Was it successful? Directionally yes — mission advanced."
        : "Was it successful? Too early or mixed — revisit when more signal exists.",
      decision.wouldDoAgain === true
        ? "Would we make the same decision today? Yes."
        : "Would we make the same decision today? With adjustments.",
    ],
  };
}

export function listAllDecisions(): BusinessDecision[] {
  return institutionalMemorySampleRepository
    .list()
    .filter((m): m is BusinessDecision => m.kind === "decision");
}

export function decisionsForMission(missionId: string): BusinessDecision[] {
  return institutionalMemorySampleRepository
    .forMission(missionId)
    .filter((m): m is BusinessDecision => m.kind === "decision");
}

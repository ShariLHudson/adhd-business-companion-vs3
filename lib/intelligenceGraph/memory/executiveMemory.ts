import type { ExecutiveMemoryRecord } from "../types";
import { intelligenceGraphSampleRepository } from "../repositories/sample";

export function listExecutiveMemory(): ExecutiveMemoryRecord[] {
  return intelligenceGraphSampleRepository.listExecutiveMemory();
}

export function getExecutiveMemory(decisionNodeId: string): ExecutiveMemoryRecord | null {
  return intelligenceGraphSampleRepository.getExecutiveMemory(decisionNodeId) ?? null;
}

export function explainRediscoveredDecision(
  decisionNodeId: string,
): { memory: ExecutiveMemoryRecord; narrative: string[] } | null {
  const memory = getExecutiveMemory(decisionNodeId);
  if (!memory) return null;

  const narrative = [
    `In ${memory.decidedAt.slice(0, 4)}, you decided: ${memory.decisionTitle}.`,
    `Why then: ${memory.whyItWasMade}`,
    memory.whatChanged
      ? `What changed since: ${memory.whatChanged}`
      : "Conditions are largely unchanged.",
    memory.shouldReconsider
      ? `Consider revisiting: ${memory.reconsiderRationale ?? "Conditions may warrant a fresh look."}`
      : `Still aligned: ${memory.reconsiderRationale ?? "The original reasoning holds."}`,
  ];

  return { memory, narrative };
}

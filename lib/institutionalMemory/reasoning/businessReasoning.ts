import type { BusinessReasoning } from "../types";
import { buildBusinessReasoning, findDecisionHistory } from "../decisions/decisionHistory";

export function findBusinessReasoning(decisionId: string): BusinessReasoning | null {
  return buildBusinessReasoning(decisionId);
}

export function explainDecision(decisionId: string): string[] {
  const reasoning = findBusinessReasoning(decisionId);
  return reasoning?.narrative ?? [];
}

export function decisionExists(decisionId: string): boolean {
  return findDecisionHistory(decisionId) !== null;
}

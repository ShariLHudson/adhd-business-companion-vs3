import type { StrategyWorkItem } from "../../types";
import type { EvidenceStrength } from "../../domainModel";
import { EVIDENCE_STRENGTH_LABEL } from "../../domainModel";

export function listAssumptions(item: StrategyWorkItem): string[] {
  return (item.assumptions ?? []).map((a) => a.trim()).filter(Boolean);
}

export function listFacts(item: StrategyWorkItem): string[] {
  return (item.knownFacts ?? []).map((a) => a.trim()).filter(Boolean);
}

export function evidenceLabel(strength: EvidenceStrength): string {
  return EVIDENCE_STRENGTH_LABEL[strength];
}

export function needsFactAssumptionSplit(item: StrategyWorkItem): boolean {
  const assumptions = listAssumptions(item);
  const statements = item.memberStatements?.length ?? 0;
  return (
    statements >= 2 &&
    assumptions.length === 0 &&
    /\b(think|maybe|probably|everyone|always|never)\b/i.test(
      (item.memberStatements ?? []).join(" "),
    )
  );
}

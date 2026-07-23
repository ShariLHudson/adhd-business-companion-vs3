import type { StrategyWorkItem } from "../../types";
import type { EvidenceQuality } from "../types";

export function listAssumptions(item: StrategyWorkItem): string[] {
  return (item.assumptions ?? []).map((a) => a.trim()).filter(Boolean);
}

export function listFacts(item: StrategyWorkItem): string[] {
  return (item.knownFacts ?? []).map((a) => a.trim()).filter(Boolean);
}

export function evidenceLabel(quality: EvidenceQuality): string {
  switch (quality) {
    case "confirmed":
      return "We know this";
    case "strong_signal":
      return "This appears likely";
    case "limited_signal":
      return "We have some indication";
    case "anecdotal":
      return "This is based on a limited signal";
    case "assumed":
      return "This is still an assumption";
    case "conflicting":
      return "The evidence is mixed";
    default:
      return "We do not know this yet";
  }
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

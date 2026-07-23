import type { StrategyWorkItem } from "../../types";

export function capacityAppearsTight(item: StrategyWorkItem): boolean {
  const blob = [
    item.currentReality,
    ...(item.constraints ?? []),
    ...(item.memberStatements ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /\b(overwhelm|no time|capacity|burn(ed)? out|exhausted|too much|spread thin|bandwidth)\b/.test(
    blob,
  );
}

export function capacityCheckQuestion(): string {
  return "Even if this is a good idea, is there enough room to support it right now?";
}

export function shouldPreferStabilizeOrTest(item: StrategyWorkItem): boolean {
  return capacityAppearsTight(item);
}

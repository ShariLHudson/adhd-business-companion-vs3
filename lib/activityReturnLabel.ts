import type { AppSection } from "@/lib/companionUi";
import { STRATEGIES_HUB } from "@/lib/strategyCatalog";

export type StrategyOpenView =
  | "home"
  | "adhd"
  | "business"
  | "saved"
  | "recommended";

export function activityReturnLabel(
  strategyOpenView?: StrategyOpenView,
  section?: AppSection,
): string {
  if (strategyOpenView) {
    if (strategyOpenView === "home") return "Strategies";
    return STRATEGIES_HUB[strategyOpenView]?.title ?? "Strategies";
  }
  if (section === "guided-exercises") return "Guided Exercises";
  return "Focus";
}

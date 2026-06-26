import type { LivingChangeItem } from "@/lib/livingLifeEngine/types";
import { centerAllowsBorderLife } from "./rules";

/**
 * Living Border gate — living changes affect borders only; center stays stable.
 */
export function filterLivingChangesToBorder(
  changes: LivingChangeItem[],
): LivingChangeItem[] {
  if (centerAllowsBorderLife()) return changes;

  return changes.filter((change) => {
    if (change.cause.includes("center-panel")) return false;
    if (change.cause.includes("workspace-overlay")) return false;
    return true;
  });
}

export function livingChangeMapsToBorder(change: LivingChangeItem): boolean {
  return Boolean(
    change.hospitality ||
      change.wildlife ||
      change.kinsey ||
      change.motion ||
      change.heroMotion ||
      change.objects?.length,
  );
}

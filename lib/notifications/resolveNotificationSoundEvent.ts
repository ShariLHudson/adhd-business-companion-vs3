import type { Deliverable } from "@/lib/rhythms/loadManager";
import type { NotificationSoundEventKind } from "./notificationSoundTypes";

/**
 * Map a due deliverable to a sound family.
 * Priority Alert only when priority is explicitly critical.
 * Attention Needed is reserved for overdue paths that opt in separately.
 */
export function resolveDeliverableSoundEvent(
  item: Deliverable,
): NotificationSoundEventKind {
  if (item.kind === "rhythm") return "rhythm";
  if (item.priority === "critical") return "priority-alert";
  return "reminder";
}

import type { AttentionFilterResult, InterruptionClass } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";

export type FilterableItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  leverageScore?: number;
  missionId?: MissionId;
};

export function applyAttentionFilter(
  item: FilterableItem,
  activeMissionId: MissionId,
): AttentionFilterResult {
  const neededToday = (item.leverageScore ?? 50) >= 80;
  const movesActiveMission = item.missionId === activeMissionId || item.source === "executive_decision";
  const reducesFriction = ["continuous_improvement", "command_center", "executive_decision"].includes(item.source);
  const canWait = !neededToday && (item.leverageScore ?? 0) < 70;
  const shouldStayHidden = canWait && !movesActiveMission;

  const passes =
    neededToday && (movesActiveMission || reducesFriction) && !shouldStayHidden;

  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    source: item.source,
    neededToday,
    movesActiveMission,
    reducesFriction,
    canWait,
    shouldStayHidden,
    passes: passes || (neededToday && reducesFriction),
  };
}

export function filterItems(items: FilterableItem[], activeMissionId: MissionId): AttentionFilterResult[] {
  return items.map((item) => applyAttentionFilter(item, activeMissionId));
}

export function classifyInterruption(
  item: FilterableItem,
  filter: AttentionFilterResult,
): InterruptionClass {
  if (filter.passes && filter.neededToday && item.source === "executive_decision") {
    return "interrupt_immediately";
  }
  if (filter.passes && filter.neededToday) return "mention_today";
  if (filter.canWait && filter.movesActiveMission) return "mention_this_week";
  if (filter.shouldStayHidden) return "never_mention";
  return "mention_later";
}

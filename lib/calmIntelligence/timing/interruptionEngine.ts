import type { InterruptionClass } from "../types";
import type { FilterableItem } from "../attention/attentionFilter";
import { applyAttentionFilter, classifyInterruption } from "../attention/attentionFilter";
import type { MissionId } from "@/lib/founder/missions/types";

export function classifyInterruptions(
  items: FilterableItem[],
  activeMissionId: MissionId,
): { id: string; title: string; classification: InterruptionClass }[] {
  return items.map((item) => {
    const filter = applyAttentionFilter(item, activeMissionId);
    return {
      id: item.id,
      title: item.title,
      classification: classifyInterruption(item, filter),
    };
  });
}

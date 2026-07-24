/**
 * Confirm Decision Record + capture Strategic Memory in one intentional step.
 */

import { getStrategyWorkItem, updateStrategyWorkItem } from "../strategyWorkItemStore";
import type { StrategyWorkItem } from "../types";
import { captureStrategicDecisionMemory } from "./captureDecisionMemory";
import type { StrategicDecisionMemory } from "./types";

export function confirmStrategyDecisionRecord(
  strategyWorkItemId: string,
): { workItem: StrategyWorkItem; memory: StrategicDecisionMemory | null } | null {
  const item = getStrategyWorkItem(strategyWorkItemId);
  if (!item?.chosenDirection?.trim()) return null;

  const workItem = updateStrategyWorkItem(item.id, {
    decisionRecordConfirmed: true,
    status:
      item.status === "handed_off" || item.status === "completed"
        ? item.status
        : "direction_chosen",
  });
  if (!workItem) return null;

  const memory = captureStrategicDecisionMemory(workItem.id);
  return { workItem, memory };
}

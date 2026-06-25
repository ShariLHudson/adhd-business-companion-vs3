/**
 * CycleState resolver — protect flow and dignity.
 * @see constitution.ts — resolveCycleState
 */

import type { CompanionMemorySnapshot, CycleState, DayMode } from "./types";

export function resolveCycleState(
  memory: CompanionMemorySnapshot,
  dayMode: DayMode,
): CycleState {
  if (memory.sessionFlags?.hyperfocusActive || dayMode === "hyperfocus") {
    return "protected";
  }
  return "orienting";
}

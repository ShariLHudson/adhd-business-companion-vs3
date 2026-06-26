/**
 * Gather ecosystem memory for Live Reality™ — all workspaces share one snapshot.
 * Adapters only; reasoning stays in Companion Brain™.
 */

import { gatherPlanDayMemory } from "@/lib/planMyDay/companionBrainClient/gatherPlanDayMemory";
import type { CompanionMemorySnapshot } from "@/lib/companionBrain";

/**
 * Unified memory for a reasoning cycle.
 * Expands as more workspaces feed signals (projects, focus, captures, …).
 */
export function gatherEcosystemMemory(dayKey: string): CompanionMemorySnapshot {
  return gatherPlanDayMemory(dayKey);
}

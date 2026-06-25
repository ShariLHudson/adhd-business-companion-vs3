/**
 * Plan My Day™ client of Companion Brain™.
 * Experience layer — translates brain output for daily planning.
 */

import { CompanionBrain, type ReasoningCycleResult } from "@/lib/companionBrain";
import type { CompanionMemorySnapshot } from "@/lib/companionBrain";

export type DailyCompanionCycleResult = ReasoningCycleResult & {
  experience: "plan-my-day";
};

/**
 * Run the Daily Companion Cycle™ for Plan My Day™.
 * Plan My Day supplies memory; the brain supplies judgment.
 */
export function runPlanMyDayCompanionCycle(
  memory: CompanionMemorySnapshot,
): DailyCompanionCycleResult {
  const result = CompanionBrain.runReasoningCycle(memory);
  return { ...result, experience: "plan-my-day" };
}

export { mapFixtureToCompanionMemory } from "./mapFixtureToMemory";
export { mapEcosystemToCompanionMemory } from "./mapMemoryFromEcosystem";
export type { EcosystemMemoryInput } from "./mapMemoryFromEcosystem";

/**
 * Plan My Day client of Companion Brain.
 * Experience layer — translates brain output for daily planning.
 */

import { CompanionBrain, type ReasoningCycleResult } from "@/lib/companionBrain";
import type { CompanionMemorySnapshot } from "@/lib/companionBrain";

export type DailyCompanionCycleResult = ReasoningCycleResult & {
  experience: "plan-my-day";
};

/**
 * Run the Daily Companion Cycle for Plan My Day.
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
export { gatherPlanDayMemory } from "./gatherPlanDayMemory";
export { presentPlanDayOrientation, formatInvitation, dayModeAtmosphereClass, shouldSkipOrientation, partitionLivingBoard, livingBoardSubtitle } from "./presentJudgment";
export type { PlanDayOrientationPresentation, LivingBoardPartition } from "./presentJudgment";
export { materializeConfirmedProposals } from "./materializeProposals";
export {
  readPlanDaySession,
  markPlanDayLiving,
  markPlanDayFlexible,
  markPlanDayOrienting,
  resetPlanDaySessionForTests,
} from "./planDaySession";
export type { PlanDaySession, PlanDaySessionPhase, PlanDayLivingEntry } from "./planDaySession";
export { curatePlanBoardForJudgment, countHeldByCompanion, FOCUS_CAP, READY_CAP } from "./curateLivingBoard";
export { resolvePlanDayChapter, planDayChapterSubtitle, PLAN_MY_DAY_TITLE } from "./planDayJourney";
export type { PlanDayJourneyChapter } from "./planDayJourney";
export { whyTodayForItem } from "./whyToday";
export { REMIND_PRESETS, shariRemindAcknowledgment, shariRemindLaterLine } from "./planDayRemindMe";
export type { RemindPreset } from "./planDayRemindMe";
export { diffBoardCuration, formatBoardStewardshipMessage, holdingTransparencyLine, heldItemsLongTermLine } from "./boardStewardship";
export type { BoardCurationDiff } from "./boardStewardship";
export { gatherFlexiblePlanningContext, FLEXIBLE_PLANNING_INTRO } from "./flexiblePlanning";
export type { FlexiblePlanningContext } from "./flexiblePlanning";
export {
  gatherPlanAdjustmentPresentation,
  applyPlanSwap,
  hidePlanItemForToday,
  addPlanAlternativeToFocus,
  PLAN_ADJUSTMENT_INTRO,
  PLAN_ADJUSTMENT_REALITY_LINK,
} from "./planAdjustment";
export type {
  PlanAdjustmentPresentation,
  PlanSwapOffer,
  PlanSwapOption,
} from "./planAdjustment";
export { usePlanDayCompanionCycle } from "./usePlanDayCompanionCycle";
export type { PlanDayCompanionPresentation } from "./usePlanDayCompanionCycle";

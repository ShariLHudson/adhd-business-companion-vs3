/**
 * Today's Path™ — planning table object (not a task list).
 * Built from existing EF + momentum signals — no duplicate planning logic.
 *
 * @see docs/MOMENTUM_BUILDER_V1_ORCHESTRATION.md
 */

import type { MomentumSnapshot } from "@/lib/momentum-intelligence/types";
import { isLargeProjectRequest } from "@/lib/sparkCoreIntelligence/executiveFunctionEngine/detection";
import { simplifyNextStep } from "@/lib/sparkCoreIntelligence/executiveFunctionEngine/nextStep";
import { breakdownLargeTask } from "@/lib/sparkCoreIntelligence/executiveFunctionEngine/taskBreakdown";
import type { ExecutiveFunctionResult } from "@/lib/sparkCoreIntelligence/executiveFunctionEngine/types";
import type {
  MomentumConversationDiscovery,
  MomentumRoomOrchestration,
  TodaysPath,
  TodaysPathDraftInput,
  TodaysPathEasyWin,
  TodaysPathFocusSession,
} from "./types";

export type BuildTodaysPathInput = TodaysPathDraftInput & {
  executiveFunction: ExecutiveFunctionResult;
  momentum: MomentumSnapshot;
  now?: Date;
};

function newId(prefix: string, now: Date): string {
  return `${prefix}-${now.getTime()}`;
}

/** Draft Today's Path™ — only sections that are useful; no empty placeholders. */
export function buildTodaysPathDraft(input: BuildTodaysPathInput): TodaysPath | null {
  const { discovery, orchestration, executiveFunction, momentum, now = new Date() } =
    input;

  if (orchestration.hiddenStrategy.confidence === "low") {
    return null;
  }

  const primarySignal = executiveFunction.state.primary;
  const tinyStep =
    executiveFunction.guidance.nextStep ??
    simplifyNextStep({
      message: discovery.rawMemberText,
      primarySignal,
      openLoopLabel: executiveFunction.openLoopsRecalled[0]?.label,
    });

  const breakdown =
    executiveFunction.guidance.taskBreakdown ??
    (isLargeProjectRequest(discovery.rawMemberText)
      ? breakdownLargeTask(discovery.rawMemberText)
      : null);

  const firstStepLabel =
    breakdown?.startWith ??
    breakdown?.phases[0]?.tinyFirstAction ??
    tinyStep.action ??
    null;

  if (!firstStepLabel && discovery.energy === "unknown") {
    return null;
  }

  const easyWins: TodaysPathEasyWin[] = [];
  if (discovery.energy === "low" || momentum.momentumLevel === "restarting") {
    const win = momentum.wins[0];
    if (win) {
      easyWins.push({
        id: newId("easy-win", now),
        label: win.label,
        estimatedMinutes: 5,
      });
    } else if (firstStepLabel) {
      easyWins.push({
        id: newId("easy-win", now),
        label: firstStepLabel,
        estimatedMinutes: tinyStep.effort?.minutes ?? 5,
      });
    }
  }

  const focusSessions: TodaysPathFocusSession[] = [];
  if (
    discovery.energy === "high" &&
    discovery.availableTimeMinutes &&
    discovery.availableTimeMinutes >= 25
  ) {
    focusSessions.push({
      id: newId("focus", now),
      label: "One protected block for what matters most",
      durationMinutes: Math.min(discovery.availableTimeMinutes, 45),
    });
  }

  const headline = headlineForApproach(orchestration.hiddenStrategy.approach);

  return {
    kind: "todays-path",
    id: newId("todays-path", now),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    headline,
    firstStep: firstStepLabel
      ? {
          id: newId("first-step", now),
          label: firstStepLabel,
          estimatedMinutes: tinyStep.effort?.minutes,
          rationale: tinyStep.whyStartHere,
        }
      : null,
    easyWins,
    focusSessions,
    roadblocks: discovery.roadblocks,
    tomorrowStartsHere: null,
    discovery,
    orchestration,
    status: "draft",
  };
}

function headlineForApproach(
  approach: MomentumRoomOrchestration["hiddenStrategy"]["approach"],
): string {
  switch (approach) {
    case "recover":
      return "Today can be smaller — that's enough.";
    case "break_down":
      return "One honest first step.";
    case "prioritize":
      return "What matters most today.";
    case "decide":
      return "A clear choice unlocks motion.";
    case "celebrate":
      return "You already moved — let's build on it.";
    default:
      return "Forward, gently.";
  }
}

/**
 * Workspace integrations — Conversation, Memory, Momentum, Guild, Create, Strategy, Focus/Greenhouse.
 */

import type { ExecutiveFunctionResult, WorkspaceIntegrationHint } from "./types";
import type { ConversationTurnResult } from "../conversationEngine/types";

export type MomentumEFBridge = {
  celebrateReturn?: boolean;
  reduceChoices: boolean;
  companionOffer?: string;
};

export type MemoryEFBridge = {
  recallOpenLoops: boolean;
  openLoopLabels: string[];
};

export function integrationHintsForWorkspace(
  workspace?: WorkspaceIntegrationHint,
): WorkspaceIntegrationHint[] {
  const base: WorkspaceIntegrationHint[] = ["conversation", "memory", "momentum"];
  if (!workspace) return base;

  const map: Partial<Record<WorkspaceIntegrationHint, WorkspaceIntegrationHint[]>> = {
    guild: ["conversation", "memory", "momentum", "guild"],
    create: ["conversation", "memory", "create"],
    strategy: ["conversation", "memory", "strategy"],
    focus: ["conversation", "memory", "momentum", "focus"],
    greenhouse: ["conversation", "memory", "momentum", "greenhouse"],
  };

  return map[workspace] ?? [...base, workspace];
}

export function bridgeToMomentum(ef: ExecutiveFunctionResult): MomentumEFBridge {
  return {
    celebrateReturn: ef.state.primary === "returning_after_absence",
    reduceChoices: ef.state.singleRecommendationOnly,
    companionOffer: ef.guidance.memberFacingLead,
  };
}

export function bridgeToMemory(ef: ExecutiveFunctionResult): MemoryEFBridge {
  return {
    recallOpenLoops: ef.openLoopsRecalled.length > 0,
    openLoopLabels: ef.openLoopsRecalled.map((l) => l.label),
  };
}

export function enrichConversationTurn(
  result: ConversationTurnResult,
  ef: ExecutiveFunctionResult,
): ConversationTurnResult {
  const efSummary = {
    state: {
      primary: ef.state.primary,
      needsEmpathyFirst: ef.state.needsEmpathyFirst,
      singleRecommendationOnly: ef.state.singleRecommendationOnly,
    },
    cognitiveLoad: {
      value: ef.cognitiveLoad.value,
      level: ef.cognitiveLoad.level,
      reduceBeforeAsking: ef.cognitiveLoad.reduceBeforeAsking,
    },
    memberFacingLead: [
      ef.guidance.memberFacingLead,
      ef.guidance.nextStep.action,
      ef.guidance.effortEstimate?.phrase,
    ]
      .filter(Boolean)
      .join(" "),
    nextStep: {
      action: ef.guidance.nextStep.action,
      whyStartHere: ef.guidance.nextStep.whyStartHere,
    },
  };

  if (result.action.type !== "respond") {
    return { ...result, executiveFunction: efSummary };
  }

  return {
    ...result,
    action: {
      ...result.action,
      guidance: [result.action.guidance, `Executive Function: ${ef.guidance.composeGuidance}`]
        .filter(Boolean)
        .join(" "),
      depth:
        ef.state.needsEmpathyFirst && result.action.depth !== "empathy_first"
          ? "empathy_first"
          : result.action.depth,
    },
    executiveFunction: efSummary,
  };
}

export function suggestWorkspaceForEF(ef: ExecutiveFunctionResult): WorkspaceIntegrationHint | undefined {
  if (ef.state.primary === "overwhelm" || ef.cognitiveLoad.level === "overloaded") {
    return "greenhouse";
  }
  if (ef.state.primary === "ready_to_start" && ef.guidance.taskBreakdown) {
    return "strategy";
  }
  if (/\b(write|draft|create)\b/i.test(ef.guidance.nextStep.action)) {
    return "create";
  }
  if (ef.state.primary === "task_paralysis") {
    return "focus";
  }
  return undefined;
}

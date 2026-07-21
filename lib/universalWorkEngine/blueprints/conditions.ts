/**
 * Blueprint condition evaluation (conditional sections / depth gates).
 */

import type {
  BlueprintCondition,
  BlueprintDepthMode,
  WorkBlueprintState,
} from "./types";
import { DEPTH_RANK } from "./types";

export function evaluateBlueprintCondition(
  condition: BlueprintCondition | undefined,
  state: Pick<
    WorkBlueprintState,
    "knownContext" | "answeredQuestions" | "depthMode"
  >,
): boolean {
  if (!condition || condition.kind === "always") return true;
  switch (condition.kind) {
    case "known_context_equals":
      return (state.knownContext[condition.key] ?? "") === condition.value;
    case "known_context_truthy": {
      const v = (state.knownContext[condition.key] ?? "").trim().toLowerCase();
      return Boolean(v) && v !== "false" && v !== "no" && v !== "0";
    }
    case "question_answered":
      return Boolean(state.answeredQuestions[condition.questionId]?.trim());
    case "question_equals":
      return (
        (state.answeredQuestions[condition.questionId] ?? "") === condition.value
      );
    case "depth_at_least":
      return DEPTH_RANK[state.depthMode] >= DEPTH_RANK[condition.mode];
    case "and":
      return condition.conditions.every((c) =>
        evaluateBlueprintCondition(c, state),
      );
    case "or":
      return condition.conditions.some((c) =>
        evaluateBlueprintCondition(c, state),
      );
    default:
      return false;
  }
}

export function resolveActiveSections(
  sections: readonly {
    id: string;
    role: string;
    condition?: BlueprintCondition;
  }[],
  state: Pick<
    WorkBlueprintState,
    "knownContext" | "answeredQuestions" | "depthMode"
  >,
  depthMode: BlueprintDepthMode = state.depthMode,
): { visibleSectionIds: string[]; activeConditionalSectionIds: string[] } {
  const evalState = { ...state, depthMode };
  const visibleSectionIds: string[] = [];
  const activeConditionalSectionIds: string[] = [];

  for (const section of sections) {
    if (section.role === "hidden_system") {
      // System sections exist but are never member-visible in maps.
      continue;
    }
    if (section.role === "required") {
      visibleSectionIds.push(section.id);
      continue;
    }
    if (section.role === "conditional") {
      const triggered = evaluateBlueprintCondition(section.condition, evalState);
      if (triggered) {
        visibleSectionIds.push(section.id);
        activeConditionalSectionIds.push(section.id);
      }
      continue;
    }
    if (section.role === "optional") {
      // Optional sections surface in Guided+ unless condition blocks them.
      if (DEPTH_RANK[depthMode] < DEPTH_RANK.guided_build) continue;
      if (
        section.condition &&
        !evaluateBlueprintCondition(section.condition, evalState)
      ) {
        continue;
      }
      visibleSectionIds.push(section.id);
    }
  }

  return { visibleSectionIds, activeConditionalSectionIds };
}

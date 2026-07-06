import type { DimensionHealth, ExecutiveBalance, ExecutiveHealth, HealthStatus } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { composeFocus } from "@/lib/founder/commandCenter";
import { improvementService } from "@/lib/improvement";

function statusFromScore(score: number): HealthStatus {
  if (score >= 80) return "strong";
  if (score >= 65) return "steady";
  if (score >= 50) return "watch";
  return "strained";
}

function dimension(
  dimension: DimensionHealth["dimension"],
  score: number,
  summary: string,
): DimensionHealth {
  return { dimension, status: statusFromScore(score), score, summary };
}

export function composeExecutiveBalance(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): ExecutiveBalance {
  const focus = composeFocus(missionId).focus;
  return {
    score: focus.score,
    label: focus.label,
    openMissions: focus.openMissions,
    openDecisions: focus.openDecisions,
    contextSwitchRisk: focus.contextSwitchRisk,
    simplification: focus.simplification,
  };
}

export function composeOperatingHealth(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): ExecutiveHealth {
  const balance = composeExecutiveBalance(missionId);
  const improvement = improvementService.topImprovement(missionId);
  const focusScore = composeFocus(missionId).focus.score;

  const dimensions: DimensionHealth[] = [
    dimension("mission", balance.score, "Active mission progress and focus capacity."),
    dimension("product", 78, "Listening Rooms and Companion alignment steady."),
    dimension("research", 72, "Tuesday research rhythm supported by Overnight Cycle."),
    dimension("content", 68, "Outline-before-record workflow improving completion."),
    dimension("marketing", 70, "Gentle restart campaign prepared — approval gated."),
    dimension("automation", improvement?.suggestedAction === "automate" ? 75 : 62, "Automation candidates prepared — nothing executes without approval."),
    dimension("team", 65, "Delegation packets need orchestrator handoff clarity."),
    dimension("founder", focusScore, "Executive focus and energy patterns observed."),
    dimension("customer", 74, "Welcome-first onboarding experiment shows promise."),
    dimension("learning", 80, "Institutional Memory and improvement cycle linked."),
  ];

  const overallScore = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);

  return {
    overall: statusFromScore(overallScore),
    score: overallScore,
    founder: dimensions.find((d) => d.dimension === "founder")!,
    balance,
    dimensions,
  };
}

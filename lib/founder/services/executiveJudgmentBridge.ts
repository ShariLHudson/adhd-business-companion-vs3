/**
 * Founder bridge — Executive Judgment Engine
 */
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  composeExecutiveJudgmentView,
  composeJudgmentDetail,
  executiveJudgmentEngineService,
} from "@/lib/executiveJudgmentEngine";
import { getJudgmentEngineCenterBootstrap } from "@/lib/founder/judgmentEngineCenter";

export function prepareFounderExecutiveJudgmentEngine(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    bootstrap: getJudgmentEngineCenterBootstrap(),
    view: composeExecutiveJudgmentView(),
    principle: executiveJudgmentEngineService.sampleRepository().principle(),
  };
}

export function prepareFounderJudgmentDetail(
  recommendationId: string,
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
) {
  return {
    product: "founder" as const,
    missionId,
    detail: composeJudgmentDetail(recommendationId),
    principle: executiveJudgmentEngineService.sampleRepository().principle(),
  };
}

/**
 * Duplicate prevention across origins — same destination ≠ new Work.
 */

import { getWorkBlueprintState } from "../blueprints/workBlueprintStateStore";
import type { RelatedWorkHit } from "./findRelatedWork";
import type {
  DuplicateRiskAssessment,
  DuplicateRiskSignal,
  UniversalLaunchContract,
} from "./types";

const RECENT_MS = 1000 * 60 * 60 * 6; // 6 hours

export function assessDuplicateRisk(input: {
  contract: UniversalLaunchContract;
  related: readonly RelatedWorkHit[];
  nowMs?: number;
}): DuplicateRiskAssessment {
  const { contract, related } = input;
  const now = input.nowMs ?? Date.now();

  if (contract.forceNew) {
    return {
      riskLevel: "none",
      signals: [],
      candidateWorkId: null,
      candidateTitle: null,
    };
  }

  if (related.length === 0) {
    return {
      riskLevel: "none",
      signals: [],
      candidateWorkId: null,
      candidateTitle: null,
    };
  }

  const top = related[0]!;
  const signals = new Set<DuplicateRiskSignal>();

  for (const reason of top.matchReasons) {
    if (
      reason === "hinted_work_id" ||
      reason === "same_work_type" ||
      reason === "similar_title_or_intent" ||
      reason === "related_project" ||
      reason === "related_blueprint" ||
      reason === "related_conversation" ||
      reason === "matching_cartography_node" ||
      reason === "matching_chamber_or_board"
    ) {
      signals.add(reason);
    }
  }

  const state = getWorkBlueprintState(top.workId);
  if (state) {
    const age = now - Date.parse(state.updatedAt);
    if (Number.isFinite(age) && age >= 0 && age < RECENT_MS) {
      signals.add("recent_creation");
    }
    const hasContent = Object.values(state.sectionContent).some((v) =>
      Boolean(v?.trim()),
    );
    if (hasContent) signals.add("active_incomplete");
    if (
      contract.clearMyMindThoughtId &&
      state.knownContext.clear_my_mind_thought_id ===
        contract.clearMyMindThoughtId
    ) {
      signals.add("matching_source_content");
    }
  }

  const strong =
    signals.has("hinted_work_id") ||
    signals.has("matching_cartography_node") ||
    (signals.has("related_blueprint") && signals.has("similar_title_or_intent")) ||
    (signals.has("same_work_type") && signals.has("active_incomplete") && signals.size >= 3);

  const riskLevel =
    strong || signals.size >= 3
      ? "likely"
      : signals.size >= 1
        ? "possible"
        : "none";

  return {
    riskLevel,
    signals: [...signals],
    candidateWorkId: top.workId,
    candidateTitle: top.title,
  };
}

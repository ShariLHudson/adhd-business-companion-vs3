/**
 * Search related existing Work before creating a duplicate.
 */

import { listWorkRelationships } from "../cartography/workRelationships";
import {
  listWorkIdentities,
  getWorkIdentity,
} from "../identity/workIdentityStore";
import {
  listWorkBlueprintStates,
  getWorkBlueprintState,
} from "../blueprints/workBlueprintStateStore";
import { getBlueprint } from "../blueprints/registry";
import type { CanonicalWorkId } from "../types";
import type { UniversalLaunchContract } from "./types";

export type RelatedWorkHit = {
  workId: CanonicalWorkId;
  title: string;
  workTypeId: string | null;
  blueprintId: string | null;
  matchReasons: string[];
};

function titleForState(workId: string): string {
  const state = getWorkBlueprintState(workId);
  if (!state) return workId;
  const bp = getBlueprint(state.blueprintId, state.blueprintVersion);
  return (
    state.sectionContent.purpose?.trim() ||
    state.sectionContent.event_type?.trim() ||
    state.knownContext.purpose?.trim() ||
    bp?.title ||
    workId
  );
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 2);
}

/**
 * Find related Work from hints, relationships, and loose intent match.
 */
export function findRelatedWork(
  contract: UniversalLaunchContract,
  workTypeId: string | null,
  blueprintId: string | null,
): RelatedWorkHit[] {
  const hits = new Map<string, RelatedWorkHit>();

  const add = (workId: string, reason: string) => {
    const identity = getWorkIdentity(workId);
    const state = getWorkBlueprintState(workId);
    if (!identity && !state) return;
    const existing = hits.get(workId);
    if (existing) {
      if (!existing.matchReasons.includes(reason)) {
        existing.matchReasons = [...existing.matchReasons, reason];
      }
      return;
    }
    hits.set(workId, {
      workId: workId as CanonicalWorkId,
      title: titleForState(workId),
      workTypeId: state?.workTypeId ?? identity?.workTypeId ?? null,
      blueprintId: state?.blueprintId ?? null,
      matchReasons: [reason],
    });
  };

  if (contract.relatedWorkId?.trim()) {
    add(contract.relatedWorkId.trim(), "hinted_work_id");
  }

  if (contract.cartographyNodeId?.trim()) {
    for (const state of listWorkBlueprintStates()) {
      const match = listWorkRelationships(state.workId).some(
        (r) =>
          r.toRef.kind === "cartography_node" &&
          r.toRef.id === contract.cartographyNodeId,
      );
      if (match) add(state.workId, "matching_cartography_node");
    }
  }

  if (contract.projectId?.trim()) {
    for (const state of listWorkBlueprintStates()) {
      const match = listWorkRelationships(state.workId).some(
        (r) =>
          r.toRef.kind === "project" && r.toRef.id === contract.projectId,
      );
      if (match) add(state.workId, "related_project");
    }
  }

  if (blueprintId) {
    for (const state of listWorkBlueprintStates()) {
      if (state.blueprintId === blueprintId) {
        add(state.workId, "related_blueprint");
      }
    }
  }

  if (workTypeId) {
    for (const state of listWorkBlueprintStates()) {
      if (state.workTypeId === workTypeId) add(state.workId, "same_work_type");
    }
    for (const id of listWorkIdentities()) {
      if (id.workTypeId === workTypeId) add(id.workId, "same_work_type");
    }
  }

  const message = [contract.originalUserMessage, contract.userIntent]
    .filter(Boolean)
    .join(" ");
  const tokens = tokenize(message);
  if (tokens.length > 0) {
    for (const state of listWorkBlueprintStates()) {
      const blob = [
        titleForState(state.workId),
        state.blueprintId,
        ...Object.values(state.sectionContent),
      ]
        .join(" ")
        .toLowerCase();
      const overlap = tokens.filter((t) => blob.includes(t));
      if (overlap.length >= 2) {
        add(state.workId, "similar_title_or_intent");
      }
    }
  }

  if (contract.conversationId?.trim()) {
    for (const state of listWorkBlueprintStates()) {
      if (state.knownContext.conversation_id === contract.conversationId) {
        add(state.workId, "related_conversation");
      }
    }
  }

  if (contract.chamberMemberId || contract.boardReviewId) {
    for (const state of listWorkBlueprintStates()) {
      if (
        (contract.chamberMemberId &&
          state.knownContext.chamber_member_id === contract.chamberMemberId) ||
        (contract.boardReviewId &&
          state.knownContext.board_review_id === contract.boardReviewId)
      ) {
        add(state.workId, "matching_chamber_or_board");
      }
    }
  }

  return [...hits.values()].sort(
    (a, b) => b.matchReasons.length - a.matchReasons.length,
  );
}

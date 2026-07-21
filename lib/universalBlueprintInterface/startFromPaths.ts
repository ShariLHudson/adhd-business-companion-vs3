/**
 * Three start paths — Scratch · Blueprint · Previous Work.
 * Interface never mints IDs outside UWE public APIs.
 */

import {
  buildWorkFromPreviousWork,
  getBlueprint,
  initializeWorkFromBlueprint,
  listWorkBlueprintStates,
  requireBlueprint,
  type BlueprintDepthMode,
  type WorkBlueprintState,
  type WorkOrigin,
} from "@/lib/universalWorkEngine";
import {
  applyKnownContextReuseDecision,
  proposeKnownContextReuse,
} from "./knownContextReuse";
import type {
  KnownContextReuseDecision,
  PreviousWorkBrowserItem,
  UniversalBlueprintInitResult,
} from "./types";

export function startFromBlueprintPath(input: {
  blueprintId: string;
  workTypeId: string;
  depthMode?: BlueprintDepthMode;
  version?: string | null;
  origin?: WorkOrigin;
  knownContext?: Readonly<Record<string, string>>;
  reuseDecision?: KnownContextReuseDecision;
  inferredKeys?: readonly string[];
}): UniversalBlueprintInitResult {
  const proposals = proposeKnownContextReuse({
    blueprintId: input.blueprintId,
    knownContext: input.knownContext ?? {},
    inferredKeys: input.inferredKeys,
    version: input.version,
  });

  const approvedContext = input.reuseDecision
    ? applyKnownContextReuseDecision(proposals, input.reuseDecision)
    : {};

  const state = initializeWorkFromBlueprint({
    blueprintId: input.blueprintId,
    workTypeId: input.workTypeId,
    depthMode: input.depthMode,
    version: input.version,
    origin: input.origin ?? "create",
    knownContext: approvedContext,
  });

  return {
    state,
    definition: requireBlueprint(state.blueprintId, state.blueprintVersion),
  };
}

export function listCompatiblePreviousWork(
  workTypeId: string,
): PreviousWorkBrowserItem[] {
  const states = listWorkBlueprintStates().filter(
    (s) => s.workTypeId === workTypeId,
  );

  return states
    .map((s) => toPreviousItem(s))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function toPreviousItem(state: WorkBlueprintState): PreviousWorkBrowserItem {
  const bp = getBlueprint(state.blueprintId, state.blueprintVersion);
  const reusable = (bp?.sections ?? [])
    .filter((sec) => {
      if (sec.role === "hidden_system") return false;
      if (/(?:private|notes?_private|internal_notes)/i.test(sec.id)) {
        return false;
      }
      return Boolean(state.sectionContent[sec.id]?.trim());
    });

  return {
    workId: state.workId,
    title:
      state.sectionContent.purpose?.trim() ||
      state.sectionContent.event_type?.trim() ||
      bp?.title ||
      "Previous work",
    blueprintId: state.blueprintId,
    blueprintTitle: bp?.title ?? state.blueprintId,
    depthMode: state.depthMode,
    updatedAt: state.updatedAt,
    reusableSectionIds: reusable.map((s) => s.id),
    reusableSectionTitles: reusable.map((s) => s.title),
  };
}

export function startFromPreviousWorkPath(input: {
  sourceWorkId: string;
  targetWorkTypeId: string;
  blueprintId: string;
  approvedSectionIds: readonly string[];
  depthMode?: BlueprintDepthMode;
  origin?: WorkOrigin;
  knownContext?: Readonly<Record<string, string>>;
}): UniversalBlueprintInitResult {
  const state = buildWorkFromPreviousWork({
    sourceWorkId: input.sourceWorkId as WorkBlueprintState["workId"],
    targetWorkTypeId: input.targetWorkTypeId,
    blueprintId: input.blueprintId,
    approvedSectionIds: input.approvedSectionIds,
    depthMode: input.depthMode,
    origin: input.origin ?? "duplicate",
    knownContext: input.knownContext,
  });

  return {
    state,
    definition: requireBlueprint(state.blueprintId, state.blueprintVersion),
  };
}

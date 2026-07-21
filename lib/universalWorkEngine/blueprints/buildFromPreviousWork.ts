/**
 * Build From Previous Work — selective reuse with provenance.
 * Does not copy history, private notes, completed tasks, or outdated decisions by default.
 */

import { allocateCanonicalWorkId } from "../identity/allocateCanonicalWorkId";
import { linkWorkRelationship } from "../cartography/workRelationships";
import type { CanonicalWorkId } from "../types";
import { recordBlueprintAudit } from "./auditHistory";
import { assertBlueprintCompatible } from "./initializeFromBlueprint";
import { resolveActiveSections } from "./conditions";
import {
  getWorkBlueprintState,
  putWorkBlueprintState,
  requireWorkBlueprintState,
} from "./workBlueprintStateStore";
import type {
  BuildFromPreviousOptions,
  WorkBlueprintState,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

const PRIVATE_NOTE_SECTION_RE = /(?:private|notes?_private|internal_notes)/i;

/**
 * Create a new Work from a compatible previous Work item.
 * Copies only approved reusable section content.
 */
export function buildWorkFromPreviousWork(
  options: BuildFromPreviousOptions,
): WorkBlueprintState {
  const source = requireWorkBlueprintState(options.sourceWorkId);
  const bp = assertBlueprintCompatible(
    options.blueprintId,
    options.targetWorkTypeId,
  );

  if (source.workTypeId !== options.targetWorkTypeId) {
    // Still allow when Blueprint is compatible with target; source type may differ
    // only if Blueprint lists the target. Source content filtered by approval.
  }

  const approved = new Set(options.approvedSectionIds);
  const sectionContent: Record<string, string> = {};

  for (const section of bp.sections) {
    if (section.role === "hidden_system") continue;
    const defaultVal =
      bp.defaultValues?.[section.id] ?? section.defaultValue ?? "";
    if (
      approved.has(section.id) &&
      !PRIVATE_NOTE_SECTION_RE.test(section.id)
    ) {
      const reused = (source.sectionContent[section.id] ?? "").trim();
      sectionContent[section.id] = reused || defaultVal;
    } else {
      sectionContent[section.id] = defaultVal;
    }
  }

  const workId = allocateCanonicalWorkId({
    origin: options.origin ?? "duplicate",
    workTypeId: options.targetWorkTypeId,
  });

  // Guard: never reuse the source Work ID.
  if (workId === source.workId) {
    throw new Error(
      "build-from-previous-work refused to reuse the source Work ID",
    );
  }

  const depthMode = options.depthMode ?? source.depthMode;
  const knownContext = { ...(options.knownContext ?? {}) };
  const draft: WorkBlueprintState = {
    workId,
    workTypeId: options.targetWorkTypeId,
    blueprintId: bp.blueprintId,
    blueprintVersion: bp.version,
    depthMode,
    origin: options.origin ?? "duplicate",
    sectionContent,
    answeredQuestions: {},
    skippedQuestionIds: [],
    knownContext,
    activeConditionalSectionIds: [],
    provenance: {
      kind: "previous_work",
      sourceWorkId: source.workId,
      sourceBlueprintId: source.blueprintId,
      sourceBlueprintVersion: source.blueprintVersion,
      reusedSectionIds: [...approved],
    },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const { activeConditionalSectionIds } = resolveActiveSections(
    bp.sections,
    draft,
    depthMode,
  );
  const state = putWorkBlueprintState({
    ...draft,
    activeConditionalSectionIds,
  });

  linkWorkRelationship({
    fromWorkId: workId,
    toRef: { kind: "work", id: source.workId },
    relationship: "reused_from",
    note: `Built from previous work; reused sections: ${[...approved].join(", ") || "(none)"}`,
  });

  linkWorkRelationship({
    fromWorkId: workId,
    toRef: { kind: "blueprint", id: bp.blueprintId },
    relationship: "implements",
    note: `blueprint@${bp.version}`,
  });

  recordBlueprintAudit({
    blueprintId: bp.blueprintId,
    blueprintVersion: bp.version,
    workId,
    action: "build_from_previous",
    detail: `sourceWork=${source.workId};reused=${[...approved].join(",")}`,
  });

  // Source Work must remain intact.
  const sourceAfter = getWorkBlueprintState(source.workId);
  if (!sourceAfter || sourceAfter.workId !== source.workId) {
    throw new Error("build-from-previous-work must not mutate or replace source");
  }

  return state;
}

export function provenanceForWork(
  workId: CanonicalWorkId | string,
): WorkBlueprintState["provenance"] | null {
  return getWorkBlueprintState(workId)?.provenance ?? null;
}

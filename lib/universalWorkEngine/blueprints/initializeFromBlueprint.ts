/**
 * Blueprint → Work initialization, depth switching, upgrades, adaptation.
 * Never overwrites user-entered work without explicit approval.
 */

import { allocateCanonicalWorkId } from "../identity/allocateCanonicalWorkId";
import type { CanonicalWorkId, WorkOrigin } from "../types";
import { requireWorkTypePackage } from "../registry/universalWorkTypeRegistry";
import { resolveActiveSections } from "./conditions";
import { recordBlueprintAudit } from "./auditHistory";
import {
  getBlueprint,
  isBlueprintCompatibleWithWorkType,
  requireBlueprint,
  resolveBlueprintVersion,
} from "./registry";
import {
  getWorkBlueprintState,
  listWorkBlueprintStates,
  putWorkBlueprintState,
  requireWorkBlueprintState,
} from "./workBlueprintStateStore";
import type {
  BlueprintDepthMode,
  BlueprintDefinition,
  WorkBlueprintState,
} from "./types";
import {
  ALL_BLUEPRINT_DEPTH_MODES,
  IncompatibleBlueprintError,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function seedSectionContent(
  blueprint: BlueprintDefinition,
  knownContext: Record<string, string>,
): Record<string, string> {
  const content: Record<string, string> = {};
  for (const section of blueprint.sections) {
    if (section.role === "hidden_system") continue;
    const fromDefault =
      blueprint.defaultValues?.[section.id] ?? section.defaultValue ?? "";
    const fromContext = knownContext[section.id] ?? "";
    content[section.id] = fromContext || fromDefault;
  }
  return content;
}

export type InitializeWorkFromBlueprintInput = {
  blueprintId: string;
  workTypeId: string;
  depthMode?: BlueprintDepthMode;
  version?: string | null;
  origin?: WorkOrigin;
  knownContext?: Record<string, string>;
  /** Adopt an existing Work ID instead of minting (resume / migration). */
  workId?: CanonicalWorkId;
};

export function assertBlueprintCompatible(
  blueprintId: string,
  workTypeId: string,
  version?: string | null,
): BlueprintDefinition {
  requireWorkTypePackage(workTypeId);
  const resolvedVersion = resolveBlueprintVersion(blueprintId, version);
  const bp = requireBlueprint(blueprintId, resolvedVersion);
  if (!isBlueprintCompatibleWithWorkType(blueprintId, workTypeId, resolvedVersion)) {
    throw new IncompatibleBlueprintError(blueprintId, workTypeId);
  }
  return bp;
}

/** Create Work from Blueprint — one Work ID for all depth modes. */
export function initializeWorkFromBlueprint(
  input: InitializeWorkFromBlueprintInput,
): WorkBlueprintState {
  const depthMode = input.depthMode ?? "guided_build";
  if (!ALL_BLUEPRINT_DEPTH_MODES.includes(depthMode)) {
    throw new Error(`Unsupported Blueprint depth mode: ${depthMode}`);
  }

  const bp = assertBlueprintCompatible(
    input.blueprintId,
    input.workTypeId,
    input.version,
  );

  const workId =
    input.workId ??
    allocateCanonicalWorkId({
      origin: input.origin ?? "create",
      workTypeId: input.workTypeId,
    });

  const knownContext = { ...(input.knownContext ?? {}) };
  const sectionContent = seedSectionContent(bp, knownContext);
  const draftState: WorkBlueprintState = {
    workId,
    workTypeId: input.workTypeId,
    blueprintId: bp.blueprintId,
    blueprintVersion: bp.version,
    depthMode,
    origin: input.origin ?? "create",
    sectionContent,
    answeredQuestions: {},
    skippedQuestionIds: [],
    knownContext,
    activeConditionalSectionIds: [],
    provenance: {
      kind: "blueprint",
      sourceBlueprintId: bp.blueprintId,
      sourceBlueprintVersion: bp.version,
    },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const { activeConditionalSectionIds } = resolveActiveSections(
    bp.sections,
    draftState,
    depthMode,
  );
  const state = putWorkBlueprintState({
    ...draftState,
    activeConditionalSectionIds,
  });

  recordBlueprintAudit({
    blueprintId: bp.blueprintId,
    blueprintVersion: bp.version,
    workId,
    action: "initialize",
    detail: `depth=${depthMode}`,
  });

  return state;
}

/**
 * Change Quick Start / Guided Build / Complete Planning without creating new Work.
 */
export function changeBlueprintDepthMode(
  workId: CanonicalWorkId | string,
  depthMode: BlueprintDepthMode,
): WorkBlueprintState {
  if (!ALL_BLUEPRINT_DEPTH_MODES.includes(depthMode)) {
    throw new Error(`Unsupported Blueprint depth mode: ${depthMode}`);
  }
  const state = requireWorkBlueprintState(workId);
  const bp = requireBlueprint(state.blueprintId, state.blueprintVersion);
  const next: WorkBlueprintState = {
    ...state,
    depthMode,
    updatedAt: nowIso(),
  };
  const { activeConditionalSectionIds } = resolveActiveSections(
    bp.sections,
    next,
    depthMode,
  );
  const saved = putWorkBlueprintState({
    ...next,
    activeConditionalSectionIds,
  });
  recordBlueprintAudit({
    blueprintId: state.blueprintId,
    blueprintVersion: state.blueprintVersion,
    workId: state.workId,
    action: "change_depth",
    detail: `${state.depthMode}->${depthMode}`,
  });
  return saved;
}

/**
 * Upgrade Blueprint version — preserves user-entered section content.
 * Conflicting blueprint defaults are held for approval, never applied silently.
 */
export function upgradeWorkBlueprint(
  workId: CanonicalWorkId | string,
  targetVersion?: string | null,
): WorkBlueprintState {
  const state = requireWorkBlueprintState(workId);
  const resolved = resolveBlueprintVersion(state.blueprintId, targetVersion);
  const bp = requireBlueprint(state.blueprintId, resolved);
  if (!bp.compatibleWorkTypeIds.includes(state.workTypeId)) {
    throw new IncompatibleBlueprintError(bp.blueprintId, state.workTypeId);
  }

  const pendingOverwriteApprovals: Record<string, string> = {};
  const sectionContent = { ...state.sectionContent };

  for (const section of bp.sections) {
    if (section.role === "hidden_system") continue;
    const existing = (sectionContent[section.id] ?? "").trim();
    const incoming =
      bp.defaultValues?.[section.id] ?? section.defaultValue ?? "";
    if (!existing && incoming) {
      sectionContent[section.id] = incoming;
    } else if (existing && incoming && existing !== incoming) {
      // Do not overwrite — hold for approval.
      pendingOverwriteApprovals[section.id] = incoming;
    } else if (!(section.id in sectionContent)) {
      sectionContent[section.id] = incoming;
    }
  }

  const next: WorkBlueprintState = {
    ...state,
    blueprintVersion: bp.version,
    sectionContent,
    pendingOverwriteApprovals:
      Object.keys(pendingOverwriteApprovals).length > 0
        ? pendingOverwriteApprovals
        : undefined,
    updatedAt: nowIso(),
  };
  const { activeConditionalSectionIds } = resolveActiveSections(
    bp.sections,
    next,
    next.depthMode,
  );
  const saved = putWorkBlueprintState({
    ...next,
    activeConditionalSectionIds,
  });
  recordBlueprintAudit({
    blueprintId: state.blueprintId,
    blueprintVersion: bp.version,
    workId: state.workId,
    action: "upgrade",
    detail: `${state.blueprintVersion}->${bp.version}`,
  });
  return saved;
}

/** Explicit approval to apply a pending overwrite for one section. */
export function approveBlueprintOverwrite(
  workId: CanonicalWorkId | string,
  sectionId: string,
): WorkBlueprintState {
  const state = requireWorkBlueprintState(workId);
  const pending = state.pendingOverwriteApprovals?.[sectionId];
  if (pending == null) {
    return state;
  }
  const remaining = { ...(state.pendingOverwriteApprovals ?? {}) };
  delete remaining[sectionId];
  const next: WorkBlueprintState = {
    ...state,
    sectionContent: {
      ...state.sectionContent,
      [sectionId]: pending,
    },
    pendingOverwriteApprovals:
      Object.keys(remaining).length > 0 ? remaining : undefined,
    updatedAt: nowIso(),
  };
  putWorkBlueprintState(next);
  recordBlueprintAudit({
    blueprintId: state.blueprintId,
    blueprintVersion: state.blueprintVersion,
    workId: state.workId,
    action: "approve_overwrite",
    detail: sectionId,
  });
  return next;
}

/** Adapt Blueprint suggestions to current known context without mutating Work body. */
export function adaptBlueprintForContext(
  blueprintId: string,
  knownContext: Record<string, string>,
  version?: string | null,
): {
  blueprint: BlueprintDefinition;
  visibleSectionIds: string[];
  activeConditionalSectionIds: string[];
} {
  const bp = requireBlueprint(
    blueprintId,
    resolveBlueprintVersion(blueprintId, version),
  );
  const probe: Pick<
    WorkBlueprintState,
    "knownContext" | "answeredQuestions" | "depthMode"
  > = {
    knownContext,
    answeredQuestions: {},
    depthMode: "guided_build",
  };
  const resolved = resolveActiveSections(bp.sections, probe);
  return { blueprint: bp, ...resolved };
}

export function updateWorkSectionFromBlueprintState(
  workId: CanonicalWorkId | string,
  sectionId: string,
  content: string,
): WorkBlueprintState {
  const state = requireWorkBlueprintState(workId);
  const next: WorkBlueprintState = {
    ...state,
    sectionContent: {
      ...state.sectionContent,
      [sectionId]: content,
    },
    updatedAt: nowIso(),
  };
  return putWorkBlueprintState(next);
}

export function getBlueprintOrNull(blueprintId: string): BlueprintDefinition | null {
  return getBlueprint(blueprintId);
}

export function workIdsUsingBlueprint(blueprintId: string): CanonicalWorkId[] {
  return listWorkBlueprintStates()
    .filter((s) => s.blueprintId === blueprintId)
    .map((s) => s.workId);
}

// Keep getWorkBlueprintState re-exported for callers that init then read.
export { getWorkBlueprintState };

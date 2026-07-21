/**
 * Blueprint usage (“Where this is used”) and impact analysis (100).
 * Counts come from WorkBlueprintState + workRelationships — no second graph.
 */

import { listWorkRelationships } from "../../cartography/workRelationships";
import { listWorkBlueprintStates } from "../workBlueprintStateStore";
import { previewBlueprintStructureUpdate } from "../structureEditing";
import { getBlueprint, listBlueprintVersions } from "../registry";
import type { BlueprintDefinition } from "../types";
import type {
  BlueprintImpactPreview,
  BlueprintUsageSummary,
  BlueprintUsageWorkRef,
} from "./intelligenceTypes";

function countTargetKind(
  workIds: readonly string[],
  kind: string,
): number {
  let n = 0;
  const seen = new Set<string>();
  for (const workId of workIds) {
    for (const rel of listWorkRelationships(workId, {
      targetKind: kind as never,
    })) {
      const key = `${rel.toRef.kind}::${rel.toRef.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      n += 1;
    }
  }
  return n;
}

function countBrokenRefs(workIds: readonly string[]): number {
  let n = 0;
  for (const workId of workIds) {
    for (const rel of listWorkRelationships(workId)) {
      if (!rel.toRef.id?.trim()) n += 1;
    }
  }
  return n;
}

export function summarizeBlueprintUsage(
  blueprintId: string,
): BlueprintUsageSummary {
  const works = listWorkBlueprintStates().filter(
    (s) => s.blueprintId === blueprintId,
  );
  const worksByVersion: Record<string, number> = {};
  const refs: BlueprintUsageWorkRef[] = [];
  for (const w of works) {
    worksByVersion[w.blueprintVersion] =
      (worksByVersion[w.blueprintVersion] ?? 0) + 1;
    refs.push({
      workId: w.workId,
      blueprintVersion: w.blueprintVersion,
      workTypeId: w.workTypeId,
    });
  }
  const workIds = works.map((w) => w.workId);
  return {
    activeWorkCount: works.length,
    worksByVersion,
    linkedProjects: countTargetKind(workIds, "project"),
    linkedCalendar: countTargetKind(workIds, "calendar-event"),
    linkedTasks: countTargetKind(workIds, "task"),
    linkedVisualThinking: countTargetKind(workIds, "visual-thinking"),
    linkedFiles: countTargetKind(workIds, "file"),
    linkedResearch: countTargetKind(workIds, "research"),
    linkedGoals: countTargetKind(workIds, "goal"),
    linkedPeople: countTargetKind(workIds, "person"),
    relatedWork: countTargetKind(workIds, "work"),
    brokenReferences: countBrokenRefs(workIds),
    works: refs,
  };
}

function sectionsWithExternalConnections(workIds: readonly string[]): number {
  const sectionIds = new Set<string>();
  for (const workId of workIds) {
    for (const rel of listWorkRelationships(workId, {
      sourceEntityType: "section",
    })) {
      if (rel.sourceEntityId) sectionIds.add(rel.sourceEntityId);
    }
  }
  return sectionIds.size;
}

export function previewBlueprintImpact(input: {
  blueprintId: string;
  fromVersion?: string | null;
  toVersion?: string | null;
}): BlueprintImpactPreview {
  const usage = summarizeBlueprintUsage(input.blueprintId);
  const versions = listBlueprintVersions(input.blueprintId);
  const latest = versions[versions.length - 1] ?? null;
  const fromVersion = input.fromVersion ?? latest;
  const toVersion = input.toVersion ?? latest;

  let added: string[] = [];
  let removed: string[] = [];
  let renamed: { id: string; from: string; to: string }[] = [];
  let moved: string[] = [];

  if (fromVersion && toVersion && fromVersion !== toVersion) {
    try {
      const preview = previewBlueprintStructureUpdate(
        input.blueprintId,
        fromVersion,
        toVersion,
      );
      added = [...preview.addedSectionIds];
      removed = [...preview.removedSectionIds];
      renamed = [...preview.renamedSections];
      moved = [...preview.movedSectionIds];
    } catch {
      /* keep empty structural preview */
    }
  }

  const versionsInUse = Object.keys(usage.worksByVersion);
  const stayOn =
    versionsInUse.length === 1
      ? versionsInUse[0]
      : versionsInUse.join(", ") || fromVersion || "their current version";

  const memberMessage =
    usage.activeWorkCount === 0
      ? "No active Work uses this blueprint yet. Changes will only affect new Work you create."
      : `Existing Works will remain on ${stayOn}. New Works will use ${toVersion ?? "the latest version"}.`;

  return {
    blueprintId: input.blueprintId,
    fromVersion,
    toVersion,
    activeWorksUsingBlueprint: usage.activeWorkCount,
    versionsInUse,
    linkedProjects: usage.linkedProjects,
    linkedCalendar: usage.linkedCalendar,
    linkedTasks: usage.linkedTasks,
    linkedVisualThinking: usage.linkedVisualThinking,
    sectionsWithExternalConnections: sectionsWithExternalConnections(
      usage.works.map((w) => w.workId),
    ),
    memberMessage,
    addedSectionIds: added,
    removedSectionIds: removed,
    renamedSections: renamed,
    movedSectionIds: moved,
  };
}

export function formatWhereThisIsUsed(usage: BlueprintUsageSummary): string[] {
  const lines: string[] = [];
  if (usage.activeWorkCount > 0) {
    lines.push(
      `${usage.activeWorkCount} active Work${usage.activeWorkCount === 1 ? "" : "s"}`,
    );
  }
  if (usage.linkedProjects > 0) {
    lines.push(
      `${usage.linkedProjects} Project${usage.linkedProjects === 1 ? "" : "s"}`,
    );
  }
  if (usage.linkedCalendar > 0) {
    lines.push(
      `${usage.linkedCalendar} Calendar item${usage.linkedCalendar === 1 ? "" : "s"}`,
    );
  }
  if (usage.linkedTasks > 0) {
    lines.push(
      `${usage.linkedTasks} Task${usage.linkedTasks === 1 ? "" : "s"}`,
    );
  }
  if (usage.linkedVisualThinking > 0) {
    lines.push(
      `${usage.linkedVisualThinking} Visual map${usage.linkedVisualThinking === 1 ? "" : "s"}`,
    );
  }
  if (lines.length === 0) {
    lines.push("Not used by any Work yet");
  }
  if (usage.brokenReferences > 0) {
    lines.push(
      `${usage.brokenReferences} connection${usage.brokenReferences === 1 ? "" : "s"} need attention`,
    );
  }
  return lines;
}

/** Resolve definition for impact when only id known. */
export function requireBlueprintForUsage(
  blueprintId: string,
  version?: string | null,
): BlueprintDefinition | null {
  return getBlueprint(blueprintId, version);
}

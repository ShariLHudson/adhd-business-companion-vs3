import { newCreationWorkspaceId, nowIso } from "./ids";
import type { CreationWorkspace, CreationWorkspaceItem } from "./types";

/**
 * Create an alternative version without overwriting the current draft.
 */
export function createWorkspaceAlternative(
  workspace: CreationWorkspace,
  label: string,
  transform: (items: CreationWorkspaceItem[]) => CreationWorkspaceItem[],
): CreationWorkspace {
  const now = nowIso();
  const draft = workspace.items.filter(
    (i) => i.groupId !== "research" && i.status !== "removed",
  );
  const altItems = transform(structuredClone(draft)).map((item) => ({
    ...item,
    id: newCreationWorkspaceId("cwi"),
    workspaceId: workspace.id,
    origin: "alternative" as const,
    createdAt: now,
    updatedAt: now,
  }));
  const alt = {
    id: newCreationWorkspaceId("cwa"),
    workspaceId: workspace.id,
    label,
    description: `Alternative: ${label}`,
    items: altItems,
    createdAt: now,
  };
  return {
    ...workspace,
    alternatives: [...workspace.alternatives, alt],
    alternativeIds: [...workspace.alternativeIds, alt.id],
    updatedAt: now,
    workspaceVersion: workspace.workspaceVersion + 1,
  };
}

export function createShorterAlternative(
  workspace: CreationWorkspace,
  label = "Shorter version",
): CreationWorkspace {
  return createWorkspaceAlternative(workspace, label, (items) =>
    items.map((item) => ({
      ...item,
      body: item.body
        .split(/\n+/)
        .slice(0, Math.max(2, Math.ceil(item.body.split(/\n+/).length / 2)))
        .join("\n"),
      summary: item.summary.slice(0, 80),
    })),
  );
}

export function snapshotWorkspaceVersion(
  workspace: CreationWorkspace,
  label: string,
): CreationWorkspace {
  const now = nowIso();
  const version = {
    id: newCreationWorkspaceId("cwv"),
    workspaceId: workspace.id,
    label,
    snapshotItemIds: workspace.items.map((i) => i.id),
    items: structuredClone(workspace.items),
    origin: "user",
    createdAt: now,
  };
  return {
    ...workspace,
    versions: [...workspace.versions, version],
    versionHistoryIds: [...workspace.versionHistoryIds, version.id],
    currentVersionId: version.id,
    updatedAt: now,
  };
}

/**
 * Restore a prior version without deleting later versions.
 */
export function restoreWorkspaceVersion(
  workspace: CreationWorkspace,
  versionId: string,
): CreationWorkspace {
  const version = workspace.versions.find((v) => v.id === versionId);
  if (!version) return workspace;
  const now = nowIso();
  const safety = {
    id: newCreationWorkspaceId("cwv"),
    workspaceId: workspace.id,
    label: "Before restore",
    snapshotItemIds: workspace.items.map((i) => i.id),
    items: structuredClone(workspace.items),
    origin: "system",
    createdAt: now,
  };
  return {
    ...workspace,
    items: structuredClone(version.items),
    sectionIds: version.items
      .filter((i) => i.groupId !== "research")
      .map((i) => i.id),
    itemIds: version.items.map((i) => i.id),
    versions: [...workspace.versions, safety],
    versionHistoryIds: [...workspace.versionHistoryIds, safety.id],
    currentVersionId: version.id,
    updatedAt: now,
    lastOpenedAt: now,
    workspaceVersion: workspace.workspaceVersion + 1,
  };
}

export function replaceDraftWithAlternative(
  workspace: CreationWorkspace,
  alternativeId: string,
): CreationWorkspace {
  const alt = workspace.alternatives.find((a) => a.id === alternativeId);
  if (!alt) return workspace;
  const withSnapshot = snapshotWorkspaceVersion(
    workspace,
    "Before alternative replace",
  );
  const now = nowIso();
  const researchItems = withSnapshot.items.filter((i) => i.groupId === "research");
  return {
    ...withSnapshot,
    items: [...alt.items, ...researchItems],
    sectionIds: alt.items.map((i) => i.id),
    itemIds: [...alt.items, ...researchItems].map((i) => i.id),
    updatedAt: now,
    workspaceVersion: withSnapshot.workspaceVersion + 1,
  };
}

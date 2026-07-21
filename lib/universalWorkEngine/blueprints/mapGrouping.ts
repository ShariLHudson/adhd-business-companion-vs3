/**
 * Workshop Map grouping — flat vs collapsible groups (099).
 * Threshold is configurable; not Event-hard-coded.
 */

import type { BlueprintGroup, BlueprintSectionDef } from "./types";

/** Maps with this many sections (or more) use groups when groups are defined. */
export const DEFAULT_GROUP_MAP_THRESHOLD = 12;

export type WorkshopMapSectionInput = {
  id: string;
  label: string;
  content: string;
  skipped: boolean;
};

export type WorkshopMapGroupView = {
  groupId: string;
  title: string;
  description?: string;
  order: number;
  sectionIds: string[];
  completedCount: number;
  totalCount: number;
  collapsedByDefault: boolean;
};

export function shouldUseGroupedMap(
  sectionCount: number,
  options?: {
    threshold?: number;
    groups?: readonly BlueprintGroup[] | null;
  },
): boolean {
  const threshold = options?.threshold ?? DEFAULT_GROUP_MAP_THRESHOLD;
  const groups = options?.groups ?? [];
  if (!groups.length) return false;
  return sectionCount >= threshold;
}

function isSectionComplete(
  section: WorkshopMapSectionInput,
  completedSectionIds?: readonly string[],
): boolean {
  if (section.skipped) return true;
  if (completedSectionIds?.includes(section.id)) return true;
  return Boolean(section.content.trim());
}

/**
 * Build map presentation: flat list or grouped views.
 * Unknown section ids fall into an "Other" group when grouping is active.
 */
export function buildWorkshopMapGroups(input: {
  sections: readonly WorkshopMapSectionInput[];
  groups?: readonly BlueprintGroup[] | null;
  completedSectionIds?: readonly string[];
  threshold?: number;
}): {
  mode: "flat" | "grouped";
  groups: WorkshopMapGroupView[];
  flatSectionIds: string[];
} {
  const visible = input.sections.filter((s) => s.id);
  const flatSectionIds = visible.map((s) => s.id);
  const groups = [...(input.groups ?? [])].sort((a, b) => a.order - b.order);

  if (
    !shouldUseGroupedMap(visible.length, {
      threshold: input.threshold,
      groups,
    })
  ) {
    return { mode: "flat", groups: [], flatSectionIds };
  }

  const byId = new Map(visible.map((s) => [s.id, s]));
  const assigned = new Set<string>();
  const views: WorkshopMapGroupView[] = [];

  for (const g of groups) {
    const sectionIds = g.sectionIds.filter((id) => byId.has(id));
    for (const id of sectionIds) assigned.add(id);
    const completedCount = sectionIds.filter((id) =>
      isSectionComplete(byId.get(id)!, input.completedSectionIds),
    ).length;
    views.push({
      groupId: g.groupId,
      title: g.title,
      description: g.description,
      order: g.order,
      sectionIds,
      completedCount,
      totalCount: sectionIds.length,
      collapsedByDefault: g.collapsedByDefault ?? false,
    });
  }

  const orphanIds = flatSectionIds.filter((id) => !assigned.has(id));
  if (orphanIds.length) {
    const completedCount = orphanIds.filter((id) =>
      isSectionComplete(byId.get(id)!, input.completedSectionIds),
    ).length;
    views.push({
      groupId: "group-other",
      title: "Other",
      order: 999,
      sectionIds: orphanIds,
      completedCount,
      totalCount: orphanIds.length,
      collapsedByDefault: true,
    });
  }

  return { mode: "grouped", groups: views, flatSectionIds };
}

/** Which group should start open: active section's group, else first non-default-collapsed. */
export function resolveInitiallyOpenGroupIds(input: {
  groups: readonly WorkshopMapGroupView[];
  activeSectionId?: string | null;
  pinnedOpenGroupIds?: readonly string[];
}): string[] {
  if (input.pinnedOpenGroupIds?.length) {
    return [...input.pinnedOpenGroupIds];
  }
  if (input.activeSectionId) {
    const host = input.groups.find((g) =>
      g.sectionIds.includes(input.activeSectionId!),
    );
    if (host) return [host.groupId];
  }
  const first = input.groups.find((g) => !g.collapsedByDefault) ?? input.groups[0];
  return first ? [first.groupId] : [];
}

/** Apply group membership onto flat BlueprintSectionDef list (order within groups). */
export function flattenSectionsFromGroups(
  sections: readonly BlueprintSectionDef[],
  groups: readonly BlueprintGroup[],
): BlueprintSectionDef[] {
  const byId = new Map(sections.map((s) => [s.id, s]));
  const out: BlueprintSectionDef[] = [];
  const seen = new Set<string>();
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);
  let order = 0;
  for (const g of sortedGroups) {
    for (const id of g.sectionIds) {
      const s = byId.get(id);
      if (!s || s.softDeleted || seen.has(id)) continue;
      seen.add(id);
      out.push({ ...s, groupId: g.groupId, order: order++ });
    }
  }
  for (const s of sections) {
    if (s.softDeleted || seen.has(s.id)) continue;
    out.push({ ...s, order: order++ });
  }
  return out;
}

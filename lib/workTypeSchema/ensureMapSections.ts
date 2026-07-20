import type { WorkTypeMapSectionDef, WorkshopMapSectionState } from "./types";

/**
 * 077/080 — Merge stored section content onto a Full Workshop Map.
 * Shared by every Work Type. Never drops known member content.
 */
export function ensureWorkshopMapSectionsComplete<
  T extends WorkshopMapSectionState,
>(
  mapSections: readonly WorkTypeMapSectionDef[],
  stored: readonly T[] | null | undefined,
  emptyStatus: T["status"] = "empty" as T["status"],
): T[] {
  const byId = new Map((stored ?? []).map((s) => [s.id, s]));
  return mapSections.map((def) => {
    const live = byId.get(def.id);
    if (!live) {
      return {
        id: def.id,
        title: def.title,
        content: "",
        status: emptyStatus,
      } as T;
    }
    return {
      ...live,
      id: def.id,
      title: (live.title?.trim() || def.title) as string,
    } as T;
  });
}

export function workshopMapIds(
  mapSections: readonly WorkTypeMapSectionDef[],
): readonly string[] {
  return mapSections.map((s) => s.id);
}

export function workshopMapToTemplateSections(
  mapSections: readonly WorkTypeMapSectionDef[],
): Array<{ id: string; label: string }> {
  return mapSections.map((s) => ({ id: s.id, label: s.title }));
}

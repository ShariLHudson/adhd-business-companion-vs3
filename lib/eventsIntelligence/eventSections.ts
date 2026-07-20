import type { EventSection, EventSectionId } from "./types";
import { EVENT_PLAN_MAP_SECTIONS } from "@/lib/workTypeSchema/schemas/eventPlanMap";
import {
  ensureWorkshopMapSectionsComplete,
  workshopMapIds,
} from "@/lib/workTypeSchema/ensureMapSections";

/**
 * Event Record storage adapters over the shared Event Plan Work Type map.
 * Map behavior (open/save/complete) is NOT defined here — see createWorkspaceV2 + workTypeSchema.
 */

export const EVENT_SECTION_DEFS: ReadonlyArray<{
  id: EventSectionId;
  title: string;
}> = EVENT_PLAN_MAP_SECTIONS.map((d) => ({
  id: d.id as EventSectionId,
  title: d.title,
}));

/** Canonical 080 Full Workshop Map section ids (order-sensitive). */
export const EVENT_080_WORKSHOP_MAP_IDS: readonly EventSectionId[] =
  workshopMapIds(EVENT_PLAN_MAP_SECTIONS) as EventSectionId[];

export function createEmptyEventSections(
  seeds?: Partial<Record<EventSectionId, string>>,
): EventSection[] {
  return EVENT_SECTION_DEFS.map((def) => {
    const content = seeds?.[def.id]?.trim() ?? "";
    return {
      id: def.id,
      title: def.title,
      content,
      status: content ? ("drafting" as const) : ("empty" as const),
    };
  });
}

export function updateEventSection(
  sections: EventSection[],
  sectionId: EventSectionId,
  content: string,
  status: EventSection["status"] = "drafting",
): EventSection[] {
  return sections.map((s) =>
    s.id === sectionId
      ? { ...s, content: content.trim(), status: content.trim() ? status : "empty" }
      : s,
  );
}

export function getEventSection(
  sections: EventSection[],
  sectionId: EventSectionId,
): EventSection | undefined {
  return sections.find((s) => s.id === sectionId);
}

/**
 * Hydrate Event Record sections onto the shared Event Plan map.
 * Uses shared ensureWorkshopMapSectionsComplete — not Event-only merge logic.
 */
export function ensureEventSectionsComplete(
  sections: EventSection[] | null | undefined,
): EventSection[] {
  return ensureWorkshopMapSectionsComplete(
    EVENT_PLAN_MAP_SECTIONS,
    sections,
    "empty",
  ) as EventSection[];
}

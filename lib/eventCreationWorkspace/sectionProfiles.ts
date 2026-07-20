/**
 * Per event-type: which sections are needed now vs available in the full map.
 * 052A — Section asset links come from the Event Capability Registry, not hardcoding.
 */

import type { EventSectionId, EventTypeId } from "@/lib/eventsIntelligence/types";
import { EVENT_SECTION_DEFS } from "@/lib/eventsIntelligence/eventSections";
import { registryCapabilitiesForSection } from "@/lib/eventsIntelligence/eventAssetRegistry/sectionCapabilityPanel";
import { EVENT_PLAN_DEFAULT_FOCUS } from "@/lib/workTypeSchema/schemas/eventPlanMap";
import type { EventWorkspaceSectionDef } from "./types";

/** Chamber doorway hints per section (expertise, not asset lists). */
const SECTION_CHAMBER: Partial<Record<EventSectionId, string | null>> = {
  outcomes: "events",
  purpose: "events",
  audience: "events",
  format: "events",
  dates: "project-management",
  venue: "events",
  budget: "finance",
  revenue_pricing: "finance",
  agenda: "events",
  speakers: "events",
  sponsors: "marketing",
  vendors: "events",
  volunteers: "events",
  registration: "events",
  marketing: "marketing",
  communications: "content",
  attendee_experience: "client-relationships",
  accessibility: "events",
  technology: "systems",
  production: "events",
  day_of_operations: "events",
  run_of_show: "events",
  safety: "events",
  contingencies: "events",
  post_event_follow_up: "client-relationships",
  measurement: "events",
  archive_and_reuse: "events",
  final_review: "events",
  hospitality: "events",
  staff: "events",
  supplies: "events",
  swag: "events",
};

/** Foundation + early planning — from shared Event Plan schema. */
const BASE_FOCUS: readonly EventSectionId[] =
  EVENT_PLAN_DEFAULT_FOCUS as EventSectionId[];

const TYPE_FOCUS_EXTRA: Partial<Record<EventTypeId, readonly EventSectionId[]>> = {
  retreat: [
    "agenda",
    "attendee_experience",
    "hospitality",
    "volunteers",
    "registration",
    "accessibility",
  ],
  workshop: ["agenda", "registration", "technology", "attendee_experience"],
  webinar: ["agenda", "registration", "technology", "marketing", "communications"],
  conference: [
    "agenda",
    "speakers",
    "sponsors",
    "vendors",
    "registration",
    "marketing",
    "run_of_show",
  ],
  summit: [
    "agenda",
    "speakers",
    "sponsors",
    "registration",
    "marketing",
    "run_of_show",
  ],
  panel: ["agenda", "speakers", "registration", "technology", "marketing"],
  launch: ["agenda", "marketing", "registration", "communications", "vendors"],
  networking: ["agenda", "registration", "hospitality", "marketing"],
  church_community: [
    "agenda",
    "volunteers",
    "hospitality",
    "communications",
    "accessibility",
  ],
  community: [
    "agenda",
    "volunteers",
    "hospitality",
    "communications",
    "accessibility",
  ],
  training: ["agenda", "registration", "attendee_experience", "technology"],
  fundraiser: ["agenda", "sponsors", "marketing", "registration", "budget"],
  trade_show: ["agenda", "vendors", "sponsors", "registration", "marketing"],
  multi_day: [
    "agenda",
    "speakers",
    "vendors",
    "volunteers",
    "registration",
    "run_of_show",
    "hospitality",
  ],
  custom: ["agenda", "registration", "marketing"],
};

export function focusSectionIdsForEventType(
  eventType: EventTypeId,
): EventSectionId[] {
  const extra = TYPE_FOCUS_EXTRA[eventType] ?? TYPE_FOCUS_EXTRA.custom ?? [];
  return [...new Set([...BASE_FOCUS, ...extra])];
}

/**
 * Section defs for the Workspace — assets resolved dynamically from the Registry (052A).
 */
export function allEventWorkspaceSectionDefs(
  eventType?: EventTypeId,
): EventWorkspaceSectionDef[] {
  return EVENT_SECTION_DEFS.map((def) => {
    const caps = registryCapabilitiesForSection(def.id, eventType);
    return {
      id: def.id,
      title: def.title,
      /** @deprecated Prefer registryAssetTypeIds — kept for Create Asset bridge */
      linkedAssetIds: caps
        .map((c) => c.createAssetRegistryId)
        .filter((id): id is string => Boolean(id)),
      registryAssetTypeIds: caps.map((c) => c.assetTypeId),
      chamberMemberId: SECTION_CHAMBER[def.id] ?? "events",
    };
  });
}

export function workspaceLabelForEventType(
  eventType: EventTypeId,
  eventTypeLabel: string,
): string {
  if (eventType === "retreat") return "Retreat Creation Workspace";
  if (eventType === "workshop") return "Workshop Creation Workspace";
  if (eventType === "webinar") return "Webinar Creation Workspace";
  if (eventType === "conference" || eventType === "summit") {
    return "Conference Creation Workspace";
  }
  if (eventType === "launch") return "Launch Event Workspace";
  if (eventType === "training") return "Training Creation Workspace";
  return `${eventTypeLabel} Creation Workspace`;
}

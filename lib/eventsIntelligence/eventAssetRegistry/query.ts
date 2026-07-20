import type { EventLifecyclePhase, EventSectionId, EventTypeId } from "../types";
import { EVENT_ASSET_DEFINITIONS } from "./definitions";
import type { EventAssetDefinition, EventTypeApplicability } from "./types";

const BY_ID = new Map(
  EVENT_ASSET_DEFINITIONS.map((d) => [d.assetTypeId, d]),
);

const BY_ALIAS = new Map<string, EventAssetDefinition>();
for (const d of EVENT_ASSET_DEFINITIONS) {
  BY_ALIAS.set(d.assetTypeId, d);
  BY_ALIAS.set(d.canonicalName.toLowerCase(), d);
  BY_ALIAS.set(d.userFacingName.toLowerCase(), d);
  for (const a of d.aliases) {
    BY_ALIAS.set(a.toLowerCase(), d);
  }
}

export function listEventAssetDefinitions(): readonly EventAssetDefinition[] {
  return EVENT_ASSET_DEFINITIONS;
}

export function getEventAssetDefinition(
  assetTypeId: string,
): EventAssetDefinition | null {
  return BY_ID.get(assetTypeId) ?? null;
}

/** Resolve by id, canonical name, user-facing name, or alias — still one definition. */
export function resolveEventAssetDefinition(
  nameOrId: string,
): EventAssetDefinition | null {
  const key = nameOrId.trim().toLowerCase();
  if (!key) return null;
  return (
    BY_ID.get(key) ??
    BY_ALIAS.get(key) ??
    BY_ID.get(key.replace(/\s+/g, "_")) ??
    null
  );
}

export function isEventTypeApplicable(
  applicability: EventTypeApplicability,
  eventType: EventTypeId,
): boolean {
  if (applicability.mode === "all") return true;
  if (applicability.mode === "include") {
    return applicability.eventTypes.includes(eventType);
  }
  return !applicability.eventTypes.includes(eventType);
}

export function listEventAssetsForEventType(
  eventType: EventTypeId,
  options?: {
    phase?: EventLifecyclePhase;
    sectionId?: EventSectionId;
    requiredLevel?: EventAssetDefinition["requiredLevel"];
    activeOnly?: boolean;
  },
): EventAssetDefinition[] {
  return EVENT_ASSET_DEFINITIONS.filter((d) => {
    if (options?.activeOnly !== false && d.status === "deprecated") return false;
    if (!isEventTypeApplicable(d.applicableEventTypes, eventType)) return false;
    if (options?.phase && !d.lifecyclePhases.includes(options.phase)) {
      return false;
    }
    if (options?.sectionId && !d.eventSections.includes(options.sectionId)) {
      return false;
    }
    if (options?.requiredLevel && d.requiredLevel !== options.requiredLevel) {
      return false;
    }
    return true;
  });
}

/** Core + conditional assets typically needed early — not a dump of all. */
export function listFocusEventAssetsForType(
  eventType: EventTypeId,
): EventAssetDefinition[] {
  return listEventAssetsForEventType(eventType).filter(
    (d) =>
      d.requiredLevel === "core" ||
      (d.requiredLevel === "conditional" &&
        d.recommendationRules.some((r) => (r.priority ?? 99) <= 2)),
  );
}

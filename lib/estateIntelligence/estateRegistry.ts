/**
 * Estate Registry™ — central catalog (aggregates registration adapters).
 *
 * **Adapter (Phase B):** Intelligence/routing extensions (tools, lifecycle, sections).
 * Place identity must align with `canonicalEstateRegistry.ts` — not a competing place list.
 *
 * @see lib/estate/canonicalEstateRegistry.ts
 * @see docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md
 */

import type { EstateRegistryEntry } from "./types";
import { ROOM_REGISTRATIONS } from "./registrations/rooms";
import { TOOL_REGISTRATIONS } from "./registrations/tools";
import { KNOWLEDGE_REGISTRATIONS } from "./registrations/knowledge";
import {
  PLANNED_ESTATE_CATALOG,
  WELCOME_HOME_ENTRY,
} from "./registrations/planned";

export const ESTATE_REGISTRY_ENTRIES: readonly EstateRegistryEntry[] = [
  WELCOME_HOME_ENTRY,
  ...ROOM_REGISTRATIONS,
  ...TOOL_REGISTRATIONS,
  ...KNOWLEDGE_REGISTRATIONS,
  ...PLANNED_ESTATE_CATALOG,
] as const;

const BY_ID = new Map<string, EstateRegistryEntry>(
  ESTATE_REGISTRY_ENTRIES.map((entry) => [entry.id, entry]),
);

export function estateRegistryEntryById(
  id: string,
): EstateRegistryEntry | undefined {
  return BY_ID.get(id);
}

export function liveEstateRegistryEntries(): EstateRegistryEntry[] {
  return ESTATE_REGISTRY_ENTRIES.filter((e) => e.status === "live");
}

export function registerEstateEntries(
  entries: readonly EstateRegistryEntry[],
): Map<string, EstateRegistryEntry> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

/** Re-export starter registrations for tests and adapters. */
export {
  PEACEFUL_PLACES_ENTRY,
  MOMENTUM_BUILDER_ENTRY,
  CLEAR_MY_MIND_ENTRY,
  CREATIVE_STUDIO_ENTRY,
  COFFEE_HOUSE_ENTRY,
} from "./registrations/rooms";
export {
  DECISION_COMPASS_ENTRY,
  SOUNDSCAPES_FOCUS_AUDIO_ENTRY,
} from "./registrations/tools";
export {
  LIBRARY_ENTRY,
  MOMENTUM_INSTITUTE_ENTRY,
  OBSERVATORY_ENTRY,
} from "./registrations/knowledge";

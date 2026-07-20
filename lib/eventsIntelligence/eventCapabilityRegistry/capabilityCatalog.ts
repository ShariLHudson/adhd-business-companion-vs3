/**
 * 053 — Query the Event Capability Registry (Layer 1).
 */

import type { EventFormat, EventSectionId, EventTypeId } from "../types";
import type { FormatApplicability } from "../eventAssetRegistry/types";
import { EVENT_CAPABILITY_DEFINITIONS } from "./capabilities";
import type {
  EventCapabilityDefinition,
  EventCapabilityId,
} from "./types";

export function listEventCapabilities(): readonly EventCapabilityDefinition[] {
  return EVENT_CAPABILITY_DEFINITIONS.filter((c) => c.status !== "deprecated");
}

export function getEventCapability(
  capabilityId: EventCapabilityId | string,
): EventCapabilityDefinition | null {
  return (
    EVENT_CAPABILITY_DEFINITIONS.find((c) => c.capabilityId === capabilityId) ??
    null
  );
}

export function isFormatApplicable(
  applicability: FormatApplicability,
  format: EventFormat,
): boolean {
  if (applicability.mode === "all") return true;
  if (format === "unspecified") {
    // Still show during planning — physical/virtual specifics soft-filter later
    return true;
  }
  if (applicability.mode === "include") {
    return applicability.formats.includes(format);
  }
  if (applicability.mode === "exclude") {
    return !applicability.formats.includes(format);
  }
  if (applicability.mode === "defer_until_format") {
    return applicability.prefer.includes(format);
  }
  return true;
}

export function capabilitiesForSection(
  sectionId: EventSectionId,
  options?: {
    format?: EventFormat;
    eventType?: EventTypeId;
  },
): EventCapabilityDefinition[] {
  return listEventCapabilities().filter((c) => {
    if (!c.relatedSectionIds.includes(sectionId)) return false;
    if (
      options?.format &&
      !isFormatApplicable(c.formatApplicability, options.format)
    ) {
      return false;
    }
    return true;
  });
}

export function resolveCapabilityAlias(
  text: string,
): EventCapabilityDefinition | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  let best: { cap: EventCapabilityDefinition; len: number } | null = null;
  for (const cap of listEventCapabilities()) {
    for (const alias of [cap.userFacingName, cap.canonicalName, ...cap.aliases]) {
      const a = alias.toLowerCase();
      if (t === a || t.includes(a) || a.includes(t)) {
        if (!best || a.length > best.len) best = { cap, len: a.length };
      }
    }
  }
  return best?.cap ?? null;
}

export function capabilitiesForAssetType(
  assetTypeId: string,
): EventCapabilityDefinition[] {
  return listEventCapabilities().filter((c) =>
    c.assetTypeIds.includes(assetTypeId),
  );
}

/** Integrity: every capability references known sections; unique ids */
export function assertEventCapabilityRegistryIntegrity(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const c of EVENT_CAPABILITY_DEFINITIONS) {
    if (seen.has(c.capabilityId)) {
      errors.push(`Duplicate capability: ${c.capabilityId}`);
    }
    seen.add(c.capabilityId);
    if (!c.assetTypeIds.length) {
      errors.push(`${c.capabilityId}: no asset types linked`);
    }
    if (!c.relatedSectionIds.length) {
      errors.push(`${c.capabilityId}: no sections linked`);
    }
  }
  return errors;
}

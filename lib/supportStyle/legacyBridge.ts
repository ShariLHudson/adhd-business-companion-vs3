import type { SupportStyle as LegacySupportStyle } from "@/lib/companionStore";
import type { SupportStyleId } from "./types";

/**
 * The explicit legacy migration boundary (ADR-012 Phase 4b): the only place
 * that accepts the legacy alphabet and converts it to canonical. `| string`
 * stays broad on purpose — it also normalizes raw wire values from older or
 * uncontrolled clients, not just the narrowed `LegacySupportStyle` type.
 */
export function supportStyleIdFromLegacy(
  value: LegacySupportStyle | string | null | undefined,
): SupportStyleId {
  switch (value) {
    case "solutions":
    case "practical-first":
      return "practical-first";
    case "understand":
    case "sos":
    case "gentle-first":
      return "gentle-first";
    case "listen":
    case "talk-it-through":
      return "talk-it-through";
    case "step-by-step":
      return "step-by-step";
    case "give-me-choices":
      return "give-me-choices";
    case "custom":
      return "custom";
    case "balanced":
    case "adaptive":
    default:
      return "adaptive";
  }
}

/** Keep older readers (routing, tone prefs) working. */
export function legacySupportStyleFromId(
  id: SupportStyleId,
): LegacySupportStyle {
  switch (id) {
    case "practical-first":
      return "solutions";
    case "gentle-first":
      return "understand";
    case "talk-it-through":
      return "listen";
    case "step-by-step":
    case "give-me-choices":
    case "adaptive":
    case "custom":
    default:
      return "balanced";
  }
}

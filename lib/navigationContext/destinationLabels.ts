/**
 * Destination id → display label — leaf (no navigationBack / Create graph).
 */

import { DESTINATION_LABELS } from "./types";

/**
 * Safe, readable fallback for an unmapped destination id — never the raw id
 * itself (no hyphens/slugs in member-facing text). Kept local rather than
 * importing workspaceMode's humanizer to preserve this file's "leaf, no
 * Create graph" contract.
 */
function humanizeDestinationId(destinationId: string): string {
  const words = destinationId.split(/[-_]/).filter(Boolean);
  if (!words.length) return "This screen";
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function labelForDestinationId(destinationId: string): string {
  const known = DESTINATION_LABELS[destinationId];
  if (known) return known;
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[navigation-labels] Unmapped destination id "${destinationId}" — add an entry to DESTINATION_LABELS in lib/navigationContext/types.ts.`,
    );
  }
  return humanizeDestinationId(destinationId);
}

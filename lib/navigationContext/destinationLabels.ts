/**
 * Destination id → display label — leaf (no navigationBack / Create graph).
 */

import { DESTINATION_LABELS } from "./types";

export function labelForDestinationId(destinationId: string): string {
  return DESTINATION_LABELS[destinationId] ?? destinationId;
}

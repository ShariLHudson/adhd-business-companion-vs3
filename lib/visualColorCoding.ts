import type { VisualMode } from "@/lib/companionStore";
import { visualModeLabel } from "@/lib/visualColorModes";

/** Minimal (`off`) disables category and adaptive color coding on items/cards. */
export function isCategoryColorCodingEnabled(mode: VisualMode): boolean {
  return mode !== "off";
}

/** Proof string for Settings debug — confirms the saved pref value. */
export function activeColorModeProofLabel(mode: VisualMode): string {
  return `Color mode active: ${visualModeLabel(mode)}`;
}

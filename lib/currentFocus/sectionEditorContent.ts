/**
 * Per-section editor content — keyed by work/creation id + section/focus id.
 * Never seed from shared draftContent or another section's buffer.
 */

import { readFocusRecoveryBuffer } from "@/lib/creationDurable";
import type { CanonicalCurrentFocus } from "./types";

/** Stable editor binding key: workId + sectionId (focusId fallback). */
export function sectionEditorContentKey(focus: Pick<
  CanonicalCurrentFocus,
  "creationId" | "sectionId" | "focusId"
>): string {
  const workId = focus.creationId.trim();
  const sectionKey = (focus.sectionId ?? focus.focusId).trim();
  return `${workId}::${sectionKey}`;
}

/**
 * Resolve textarea seed for a Focus.
 * Order: section-scoped recovery → this section's savedContent → empty.
 * Does not read workflow.draftContent or any shared draft buffer.
 */
export function resolveSectionEditorSeed(
  focus: CanonicalCurrentFocus,
  options?: { readRecovery?: boolean },
): string {
  const readRecovery = options?.readRecovery !== false;
  if (readRecovery && typeof window !== "undefined") {
    const recovered = readFocusRecoveryBuffer(focus.creationId, focus.focusId);
    if (recovered != null) return recovered;
  }
  // Explicit empty string is valid — do not treat as missing.
  if (typeof focus.savedContent === "string") {
    return focus.savedContent;
  }
  return "";
}

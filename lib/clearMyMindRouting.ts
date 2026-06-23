import type { AppSection } from "./companionUi";

/** Canonical section id for Clear My Mind — one experience, always standalone. */
export const CLEAR_MY_MIND_SECTION: AppSection = "brain-dump";

export function isClearMyMindSection(
  section: AppSection | null | undefined,
): boolean {
  return section === CLEAR_MY_MIND_SECTION;
}

/**
 * Clear My Mind is a full-screen capture + Mental Landscape experience.
 * It must never open in the split beside-chat workspace rail.
 */
export function shouldOpenClearMyMindStandalone(
  section: AppSection | null | undefined,
): boolean {
  return isClearMyMindSection(section);
}

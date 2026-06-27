import type { AppSection } from "./companionUi";

/** Canonical section id for Clear My Mind — one experience, always standalone. */
export const CLEAR_MY_MIND_SECTION: AppSection = "brain-dump";

export function isClearMyMindSection(
  section: AppSection | null | undefined,
): boolean {
  return section === CLEAR_MY_MIND_SECTION;
}

export type ClearMyMindOpenSource = "nav_fullscreen" | "chat_beside";

/**
 * Clear My Mind always opens as its own full-screen room — never beside chat.
 */
export function shouldOpenClearMyMindStandalone(
  section: AppSection | null | undefined,
  _source: ClearMyMindOpenSource = "nav_fullscreen",
): boolean {
  return isClearMyMindSection(section);
}

/** @deprecated Constitutional rule — Clear My Mind never opens beside chat. */
export function shouldOpenClearMyMindBesideChat(
  _section: AppSection | null | undefined,
): boolean {
  return false;
}

/**
 * Global UI rule: START CLOSED. OPEN BY CHOICE.
 *
 * Expandable sections (accordions, dropdown lists, project groups) start
 * collapsed when a user enters a screen. Preference is remembered while
 * they stay on the page via component state.
 *
 * Covered screens: Projects, My Work, Strategies, Templates, Snippets,
 * Saved Work (drafts), Resume (Today), Evidence Bank (when added).
 */
export const SECTIONS_START_COLLAPSED = true;

/** Initial open state for a collapsible section on screen entry. */
export function initialSectionOpen(
  /** Reserved for future per-user persistence — always closed on entry today. */
  _persistedOpen?: boolean,
): boolean {
  return SECTIONS_START_COLLAPSED ? false : Boolean(_persistedOpen);
}

/** Build a section-id map with every section collapsed on screen entry. */
export function initialCollapsedSectionMap(
  ...sectionIds: string[]
): Record<string, boolean> {
  return Object.fromEntries(sectionIds.map((id) => [id, false]));
}

/** Toggle one section in a map while preserving others on the same page. */
export function toggleSectionInMap(
  prev: Record<string, boolean>,
  id: string,
): Record<string, boolean> {
  return { ...prev, [id]: !prev[id] };
}

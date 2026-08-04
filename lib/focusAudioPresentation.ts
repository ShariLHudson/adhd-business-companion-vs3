/**
 * P0.27 — Focus audio panel titles by playlist category.
 */

const CATEGORY_PANEL_TITLES: Record<string, string> = {
  "calm-brain": "Calm Audio",
  "deep-work": "Focus Audio",
  "sleep-sounds": "Sleep Audio",
  nature: "Nature Audio",
};

export function focusAudioPanelTitle(categoryId?: string | null): string {
  if (!categoryId) return "Focus Audio";
  return CATEGORY_PANEL_TITLES[categoryId] ?? "Focus Audio";
}

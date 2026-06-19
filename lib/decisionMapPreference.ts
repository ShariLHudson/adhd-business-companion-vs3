export const DECISION_MAP_VISIBLE_KEY = "companion-decision-map-visible-v1";
export const DECISION_VISUAL_VIEW_KEY = "companion-decision-visual-view-v1";

export type DecisionVisualViewMode = "mindmap" | "infographic";

export function loadDecisionMapVisible(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(DECISION_MAP_VISIBLE_KEY);
    if (raw === null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

export function saveDecisionMapVisible(visible: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DECISION_MAP_VISIBLE_KEY, visible ? "1" : "0");
  } catch {
    /* noop */
  }
}

export function loadDecisionVisualView(): DecisionVisualViewMode {
  if (typeof window === "undefined") return "mindmap";
  try {
    const raw = localStorage.getItem(DECISION_VISUAL_VIEW_KEY);
    return raw === "infographic" ? "infographic" : "mindmap";
  } catch {
    return "mindmap";
  }
}

export function saveDecisionVisualView(mode: DecisionVisualViewMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DECISION_VISUAL_VIEW_KEY, mode);
  } catch {
    /* noop */
  }
}

export const BRAIN_DUMP_VISUAL_VISIBLE_KEY = "companion-brain-dump-visual-visible-v1";
export const BRAIN_DUMP_VISUAL_VIEW_KEY = "companion-brain-dump-visual-view-v1";
export const BRAIN_DUMP_LIBRARY_LAYOUT_KEY = "companion-brain-dump-library-layout-v1";

export type BrainDumpVisualViewMode = "cluster" | "mindmap" | "infographic";
export type BrainDumpLibraryLayout = "list" | "categories" | "mindmap";

export function loadBrainDumpVisualVisible(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(BRAIN_DUMP_VISUAL_VISIBLE_KEY);
    if (raw === null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

export function saveBrainDumpVisualVisible(visible: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BRAIN_DUMP_VISUAL_VISIBLE_KEY, visible ? "1" : "0");
  } catch {
    /* noop */
  }
}

export function loadBrainDumpVisualView(): BrainDumpVisualViewMode {
  if (typeof window === "undefined") return "cluster";
  try {
    const raw = localStorage.getItem(BRAIN_DUMP_VISUAL_VIEW_KEY);
    if (raw === "mindmap" || raw === "infographic") return raw;
    return "cluster";
  } catch {
    return "cluster";
  }
}

export function saveBrainDumpVisualView(mode: BrainDumpVisualViewMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BRAIN_DUMP_VISUAL_VIEW_KEY, mode);
  } catch {
    /* noop */
  }
}

export function loadBrainDumpLibraryLayout(): BrainDumpLibraryLayout {
  if (typeof window === "undefined") return "categories";
  try {
    const raw = localStorage.getItem(BRAIN_DUMP_LIBRARY_LAYOUT_KEY);
    if (raw === "list" || raw === "mindmap") return raw;
    return "categories";
  } catch {
    return "categories";
  }
}

export function saveBrainDumpLibraryLayout(layout: BrainDumpLibraryLayout): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BRAIN_DUMP_LIBRARY_LAYOUT_KEY, layout);
  } catch {
    /* noop */
  }
}

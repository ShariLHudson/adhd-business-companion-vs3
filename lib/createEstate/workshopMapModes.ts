/**
 * Spec 127 (20–28) — Progressive Workshop Map modes.
 * Focus Mode is default; Full Map is earned, never dumped on first visit.
 */

export type WorkshopMapPresentationMode = "focus" | "organized" | "full";

export const WORKSHOP_MAP_MODE_STORAGE_KEY = "spark.create.workshopMapMode.v1";
export const WORKSHOP_MAP_FAMILIARITY_KEY = "spark.create.workshopMapFamiliarity.v1";

/** >5 sections → organize into categories (127 / req 20). */
export const ORGANIZE_MAP_SECTION_THRESHOLD = 6;

export const WORKSHOP_MAP_MODE_LABELS: Record<
  WorkshopMapPresentationMode,
  string
> = {
  focus: "Focus",
  organized: "Organized",
  full: "Full plan",
};

type FamiliarityState = {
  visitCount: number;
  completedSectionsSeen: number;
  usedOrganizedOrFull: boolean;
};

function readFamiliarity(): FamiliarityState {
  if (typeof window === "undefined") {
    return { visitCount: 0, completedSectionsSeen: 0, usedOrganizedOrFull: false };
  }
  try {
    const raw = window.localStorage.getItem(WORKSHOP_MAP_FAMILIARITY_KEY);
    if (!raw) {
      return { visitCount: 0, completedSectionsSeen: 0, usedOrganizedOrFull: false };
    }
    const parsed = JSON.parse(raw) as Partial<FamiliarityState>;
    return {
      visitCount: Number(parsed.visitCount) || 0,
      completedSectionsSeen: Number(parsed.completedSectionsSeen) || 0,
      usedOrganizedOrFull: Boolean(parsed.usedOrganizedOrFull),
    };
  } catch {
    return { visitCount: 0, completedSectionsSeen: 0, usedOrganizedOrFull: false };
  }
}

function writeFamiliarity(next: FamiliarityState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WORKSHOP_MAP_FAMILIARITY_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

/** Full Map unlocks after familiarity — never on first Create visit. */
export function isWorkshopMapFullUnlocked(): boolean {
  const f = readFamiliarity();
  return (
    f.usedOrganizedOrFull ||
    f.visitCount >= 3 ||
    f.completedSectionsSeen >= 2
  );
}

export function noteWorkshopMapVisit(input?: {
  completedSectionCount?: number;
  mode?: WorkshopMapPresentationMode;
}): void {
  const f = readFamiliarity();
  const completed = Math.max(
    f.completedSectionsSeen,
    input?.completedSectionCount ?? 0,
  );
  const used =
    f.usedOrganizedOrFull ||
    input?.mode === "organized" ||
    input?.mode === "full";
  writeFamiliarity({
    visitCount: f.visitCount + 1,
    completedSectionsSeen: completed,
    usedOrganizedOrFull: used,
  });
}

export function readWorkshopMapModePreference(): WorkshopMapPresentationMode {
  if (typeof window === "undefined") return "focus";
  try {
    const raw = window.localStorage.getItem(WORKSHOP_MAP_MODE_STORAGE_KEY);
    if (raw === "focus" || raw === "organized" || raw === "full") {
      if (raw === "full" && !isWorkshopMapFullUnlocked()) return "focus";
      return raw;
    }
  } catch {
    /* ignore */
  }
  return "focus";
}

export function writeWorkshopMapModePreference(
  mode: WorkshopMapPresentationMode,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WORKSHOP_MAP_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  if (mode === "organized" || mode === "full") {
    noteWorkshopMapVisit({ mode });
  }
}

/**
 * Focus Mode: current section + next two incomplete sections (in map order).
 */
export function resolveFocusModeSectionIds(input: {
  orderedSectionIds: readonly string[];
  activeSectionId?: string | null;
  isComplete: (sectionId: string) => boolean;
}): string[] {
  const ordered = input.orderedSectionIds.filter(Boolean);
  if (!ordered.length) return [];

  const active =
    (input.activeSectionId && ordered.includes(input.activeSectionId)
      ? input.activeSectionId
      : null) ??
    ordered.find((id) => !input.isComplete(id)) ??
    ordered[0]!;

  const start = ordered.indexOf(active);
  const out: string[] = [active];
  for (let i = start + 1; i < ordered.length && out.length < 3; i++) {
    const id = ordered[i]!;
    if (!input.isComplete(id)) out.push(id);
  }
  // If fewer than 3 incomplete ahead, fill with following sections for continuity.
  for (let i = start + 1; i < ordered.length && out.length < 3; i++) {
    const id = ordered[i]!;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/** Category progress line — calm plan language, not unfinished-item count. */
export function formatCategoryProgressLine(input: {
  title: string;
  completedCount: number;
  totalCount: number;
}): string {
  const title = input.title.trim() || "Plan";
  const done = Math.max(0, input.completedCount);
  const total = Math.max(0, input.totalCount);
  return `${title} — ${done} of ${total} complete`;
}

/** Overall map reassurance when categories exist. */
export function formatPlanProgressSummary(input: {
  categoriesComplete: number;
  categoriesTotal: number;
  activeCategoryTitle?: string | null;
}): string {
  const active = input.activeCategoryTitle?.trim();
  if (active) {
    return formatCategoryProgressLine({
      title: active,
      completedCount: input.categoriesComplete,
      totalCount: input.categoriesTotal,
    });
  }
  if (input.categoriesTotal <= 0) return "You have a clear path forward.";
  return `${input.categoriesComplete} of ${input.categoriesTotal} areas complete`;
}

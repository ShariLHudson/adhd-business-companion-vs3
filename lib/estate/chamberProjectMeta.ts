/**
 * Chamber project metadata — extends existing Project records without migration.
 */

export type ChamberProjectMomentumState =
  | "idea"
  | "exploring"
  | "active"
  | "blocked"
  | "complete"
  | "archived";

export type ChamberProjectBlockerCategory =
  | "unclear-next-step"
  | "too-big"
  | "missing-information"
  | "lack-of-time"
  | "low-energy"
  | "fear-or-uncertainty";

export type ChamberProjectMeta = {
  projectId: string;
  momentumState: ChamberProjectMomentumState;
  desiredOutcome?: string;
  whyItMatters?: string;
  currentStateNote?: string;
  blockerCategory?: ChamberProjectBlockerCategory;
  completedAchievement?: string;
  completedLesson?: string;
  completedAt?: string;
  linkedWinId?: string;
  linkedEvidenceId?: string;
};

const META_KEY = "chamber-project-meta-v1";

function readAll(): ChamberProjectMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ChamberProjectMeta =>
        Boolean(entry) &&
        typeof (entry as ChamberProjectMeta).projectId === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(entries: ChamberProjectMeta[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(META_KEY, JSON.stringify(entries));
  } catch {
    /* quota */
  }
}

export function getChamberProjectMeta(
  projectId: string,
): ChamberProjectMeta | null {
  return readAll().find((entry) => entry.projectId === projectId) ?? null;
}

export function saveChamberProjectMeta(
  input: ChamberProjectMeta,
): ChamberProjectMeta {
  const next = readAll().filter((entry) => entry.projectId !== input.projectId);
  next.push(input);
  writeAll(next);
  return input;
}

export const CHAMBER_PROJECT_RESUME_KEY = "chamber-project-resume-id";

export function stageChamberProjectResume(projectId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CHAMBER_PROJECT_RESUME_KEY, projectId);
  } catch {
    /* quota */
  }
}

export function consumeChamberProjectResume(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAMBER_PROJECT_RESUME_KEY);
    sessionStorage.removeItem(CHAMBER_PROJECT_RESUME_KEY);
    return raw?.trim() || null;
  } catch {
    return null;
  }
}

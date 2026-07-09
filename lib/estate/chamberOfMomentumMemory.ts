/**
 * Chamber of Momentum™ — data and memory architecture (Phase 6).
 * Connects project, momentum, evidence, wins, patterns, blockers, and preferences
 * without duplicating domain stores.
 *
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_DATA_AND_MEMORY_ARCHITECTURE_SPECIFICATION_PHASE6.md
 */

import {
  getMomentumEvents,
  getProjects,
  type Project,
} from "@/lib/companionStore";
import { createEvidenceEntry } from "@/lib/evidenceBankStore";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";
import type {
  ChamberIntelligenceAssessment,
  ChamberStuckBlocker,
} from "./chamberOfMomentumIntelligence";
import {
  getChamberProjectMeta,
  saveChamberProjectMeta,
  type ChamberProjectBlockerCategory,
  type ChamberProjectMeta,
  type ChamberProjectMomentumState,
} from "./chamberProjectMeta";

export type ChamberMemoryCategory =
  | "project"
  | "momentum-history"
  | "evidence"
  | "wins"
  | "pattern"
  | "blocker"
  | "preference";

export type ChamberPatternKey =
  | "small-first-step"
  | "visual-planning"
  | "deadlines"
  | "encouragement"
  | "examples"
  | "low-energy-mode";

export type ChamberPreferenceKey =
  | "communication-style"
  | "planning-style"
  | "encouragement-style"
  | "detail-level"
  | "best-work-time";

export type ChamberPatternObservation = {
  pattern: ChamberPatternKey;
  strength: number;
  lastObservedAt: string;
  context?: string;
};

export type ChamberBlockerOccurrence = {
  id: string;
  category: string;
  occurredAt: string;
  projectId?: string;
  context?: string;
};

export type ChamberPreference = {
  key: ChamberPreferenceKey;
  value: string;
  updatedAt: string;
};

export type ChamberProjectMemory = {
  projectId: string;
  name: string;
  desiredOutcome: string;
  status: ChamberProjectMomentumState;
  nextAction: string;
  blockerCategory?: ChamberProjectBlockerCategory;
  completedAchievement?: string;
  completedLesson?: string;
  completedAt?: string;
  linkedWinId?: string;
  linkedEvidenceId?: string;
};

export type ChamberMemorySnapshot = {
  projects: ChamberProjectMemory[];
  recentMomentum: ReturnType<typeof getMomentumEvents>;
  patternObservations: ChamberPatternObservation[];
  recentBlockers: ChamberBlockerOccurrence[];
  preferences: ChamberPreference[];
};

const PATTERNS_KEY = "chamber-momentum-patterns-v1";
const BLOCKERS_KEY = "chamber-momentum-blockers-v1";
const PREFERENCES_KEY = "chamber-momentum-preferences-v1";

const MAX_BLOCKER_HISTORY = 40;
const MAX_PATTERN_STRENGTH = 12;

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readPatterns(): ChamberPatternObservation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PATTERNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ChamberPatternObservation =>
        Boolean(entry) &&
        typeof (entry as ChamberPatternObservation).pattern === "string",
    );
  } catch {
    return [];
  }
}

function writePatterns(entries: ChamberPatternObservation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PATTERNS_KEY, JSON.stringify(entries));
  } catch {
    /* quota */
  }
}

function readBlockers(): ChamberBlockerOccurrence[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BLOCKERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ChamberBlockerOccurrence =>
        Boolean(entry) && typeof (entry as ChamberBlockerOccurrence).id === "string",
    );
  } catch {
    return [];
  }
}

function writeBlockers(entries: ChamberBlockerOccurrence[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      BLOCKERS_KEY,
      JSON.stringify(entries.slice(0, MAX_BLOCKER_HISTORY)),
    );
  } catch {
    /* quota */
  }
}

function readPreferences(): ChamberPreference[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ChamberPreference =>
        Boolean(entry) && typeof (entry as ChamberPreference).key === "string",
    );
  } catch {
    return [];
  }
}

function writePreferences(entries: ChamberPreference[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(entries));
  } catch {
    /* quota */
  }
}

export function recordChamberPatternObservation(
  pattern: ChamberPatternKey,
  context?: string,
): ChamberPatternObservation {
  const now = new Date().toISOString();
  const existing = readPatterns().find((entry) => entry.pattern === pattern);
  const next: ChamberPatternObservation = {
    pattern,
    strength: Math.min(
      MAX_PATTERN_STRENGTH,
      (existing?.strength ?? 0) + 1,
    ),
    lastObservedAt: now,
    context: context?.trim() || existing?.context,
  };
  const merged = [
    next,
    ...readPatterns().filter((entry) => entry.pattern !== pattern),
  ];
  writePatterns(merged);
  return next;
}

export function recordChamberBlockerOccurrence(input: {
  category: ChamberProjectBlockerCategory | ChamberStuckBlocker | "overwhelm" | "too-many-ideas";
  projectId?: string;
  context?: string;
}): ChamberBlockerOccurrence {
  const entry: ChamberBlockerOccurrence = {
    id: newId("cb"),
    category: input.category,
    occurredAt: new Date().toISOString(),
    projectId: input.projectId,
    context: input.context?.trim() || undefined,
  };
  writeBlockers([entry, ...readBlockers()]);
  return entry;
}

export function saveChamberPreference(
  key: ChamberPreferenceKey,
  value: string,
): ChamberPreference {
  const pref: ChamberPreference = {
    key,
    value: value.trim(),
    updatedAt: new Date().toISOString(),
  };
  const next = [pref, ...readPreferences().filter((entry) => entry.key !== key)];
  writePreferences(next);
  return pref;
}

export function getChamberPreference(
  key: ChamberPreferenceKey,
): ChamberPreference | null {
  return readPreferences().find((entry) => entry.key === key) ?? null;
}

export function buildChamberProjectMemory(project: Project): ChamberProjectMemory {
  const meta = getChamberProjectMeta(project.id);
  return {
    projectId: project.id,
    name: project.name,
    desiredOutcome: meta?.desiredOutcome || project.goal,
    status: meta?.momentumState ?? "active",
    nextAction: project.nextAction,
    blockerCategory: meta?.blockerCategory,
    completedAchievement: meta?.completedAchievement,
    completedLesson: meta?.completedLesson,
    completedAt: meta?.completedAt,
    linkedWinId: meta?.linkedWinId,
    linkedEvidenceId: meta?.linkedEvidenceId,
  };
}

export function getChamberMemorySnapshot(): ChamberMemorySnapshot {
  return {
    projects: getProjects().map(buildChamberProjectMemory),
    recentMomentum: getMomentumEvents(24),
    patternObservations: readPatterns(),
    recentBlockers: readBlockers().slice(0, 12),
    preferences: readPreferences(),
  };
}

export function getTopChamberBlockerCategories(limit = 3): string[] {
  const counts = new Map<string, number>();
  for (const entry of readBlockers()) {
    counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category]) => category);
}

export function getStrongestChamberPattern(): ChamberPatternObservation | null {
  const patterns = readPatterns();
  if (patterns.length === 0) return null;
  return patterns.reduce((best, current) =>
    current.strength > best.strength ? current : best,
  );
}

/** Transparent summary — what momentum remembers to reduce friction. */
export function getChamberMemorySummaryForMember(): string[] {
  const snapshot = getChamberMemorySnapshot();
  const lines: string[] = [];

  const activeProjects = snapshot.projects.filter(
    (project) =>
      project.status !== "complete" && project.status !== "archived",
  );
  if (activeProjects.length > 0) {
    lines.push(
      `${activeProjects.length} active project${activeProjects.length === 1 ? "" : "s"} with next actions`,
    );
  }

  const completed = snapshot.projects.filter(
    (project) => project.status === "complete",
  );
  if (completed.length > 0) {
    lines.push(
      `${completed.length} completed project${completed.length === 1 ? "" : "s"} with lessons captured`,
    );
  }

  const strongest = getStrongestChamberPattern();
  if (strongest && strongest.strength >= 2) {
    lines.push(`You often move forward best with ${patternLabel(strongest.pattern)}`);
  }

  const topBlocker = getTopChamberBlockerCategories(1)[0];
  if (topBlocker) {
    lines.push(`Common friction: ${blockerLabel(topBlocker)}`);
  }

  if (snapshot.recentMomentum.length > 0) {
    lines.push("Recent movement and progress in your momentum history");
  }

  return lines;
}

function patternLabel(pattern: ChamberPatternKey): string {
  switch (pattern) {
    case "small-first-step":
      return "a very small first step";
    case "visual-planning":
      return "visual planning";
    case "deadlines":
      return "clear deadlines";
    case "encouragement":
      return "encouragement along the way";
    case "examples":
      return "concrete examples";
    case "low-energy-mode":
      return "smaller actions on low-energy days";
    default:
      return "approaches that reduce friction";
  }
}

function blockerLabel(category: string): string {
  return category.replace(/-/g, " ");
}

export function buildChamberMemoryGuidance(): string | null {
  const strongest = getStrongestChamberPattern();
  if (strongest?.pattern === "small-first-step" && strongest.strength >= 2) {
    return "I remember you often move forward best with a very small first step. Would that help here?";
  }
  if (strongest?.pattern === "low-energy-mode" && strongest.strength >= 2) {
    return "On lower-energy days, smaller steps have worked well for you. Want to start tiny?";
  }

  const completed = getChamberMemorySnapshot().projects.filter(
    (project) => project.status === "complete",
  );
  if (completed.length >= 1) {
    const recent = completed[0]!;
    if (recent.completedAchievement) {
      return `You have made real progress before — like when you ${recent.completedAchievement.toLowerCase()}.`;
    }
    return "You have successfully completed projects like this before.";
  }

  const topBlocker = getTopChamberBlockerCategories(1)[0];
  if (topBlocker === "unclear-next-step" || topBlocker === "clarity") {
    return "When things feel unclear, naming one honest next step usually helps.";
  }

  return null;
}

export type ChamberProjectCompletionCapture = {
  project: Project;
  winId: string;
  evidenceId: string;
};

/** Project → win → evidence → momentum history chain. */
export function captureChamberProjectCompletion(
  project: Project,
  achievement: string,
  lesson?: string,
): ChamberProjectCompletionCapture | null {
  const trimmedAchievement = achievement.trim();
  if (!trimmedAchievement) return null;

  const meta = getChamberProjectMeta(project.id);
  const now = new Date().toISOString();

  const win = createSavedGrowthWin({
    whatHappened: trimmedAchievement,
    ts: now,
    icon: "🚀",
    sourceId: project.id,
    attachments: [],
  });

  const evidence = createEvidenceEntry({
    category: "Moved Forward",
    whatHappened: trimmedAchievement,
    whatImproved: lesson?.trim() || project.goal || project.name,
    whatMovedForward: meta?.desiredOutcome || project.goal || project.name,
    whatProblemSolved: "",
    whoBenefited: "Me",
    whyItMattered: meta?.whyItMatters || "This project mattered to me.",
    whatThisProves: lesson?.trim()
      ? lesson.trim()
      : "I can finish meaningful work.",
    attachments: [],
    sourceWinId: win.id,
    originatedFromId: project.id,
    originatedFromKind: "project",
  });

  const nextMeta: ChamberProjectMeta = {
    projectId: project.id,
    momentumState: "complete",
    desiredOutcome: meta?.desiredOutcome,
    whyItMatters: meta?.whyItMatters,
    currentStateNote: meta?.currentStateNote,
    completedAchievement: trimmedAchievement,
    completedLesson: lesson?.trim() || "",
    completedAt: now,
    linkedWinId: win.id,
    linkedEvidenceId: evidence.id,
  };
  saveChamberProjectMeta(nextMeta);
  recordChamberPatternObservation("small-first-step", project.nextAction);
  recordChamberPatternObservation("encouragement", trimmedAchievement);

  return { project, winId: win.id, evidenceId: evidence.id };
}

export function recordChamberIntelligenceVisit(
  assessment: ChamberIntelligenceAssessment,
): void {
  if (assessment.lowEnergyMode) {
    recordChamberPatternObservation("low-energy-mode", assessment.state);
    saveChamberPreference("planning-style", "small steps on low-energy days");
  }

  if (assessment.state === "overwhelmed") {
    recordChamberBlockerOccurrence({ category: "overwhelm" });
  }

  if (assessment.state === "too-many-ideas") {
    recordChamberBlockerOccurrence({ category: "too-many-ideas" });
  }

  if (assessment.stuckBlocker) {
    recordChamberBlockerOccurrence({
      category: assessment.stuckBlocker,
      context: assessment.state,
    });
  }
}

export function recordChamberProjectBlockerMemory(
  projectId: string,
  blocker: ChamberProjectBlockerCategory,
): void {
  recordChamberBlockerOccurrence({ category: blocker, projectId });
  if (blocker === "low-energy") {
    recordChamberPatternObservation("low-energy-mode", projectId);
  }
  if (blocker === "unclear-next-step") {
    recordChamberPatternObservation("small-first-step", projectId);
  }
}

export function recordChamberProjectStartMemory(project: Project): void {
  if (project.nextAction.trim().length > 0 && project.nextAction.length <= 64) {
    recordChamberPatternObservation("small-first-step", project.nextAction);
  }
}

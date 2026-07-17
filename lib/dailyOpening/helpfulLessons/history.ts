import type { HelpfulLessonHistory } from "./types";

const STORAGE_KEY = "spark-helpful-lesson-history-v1";
const MAX_ENTRIES = 40;
/** Do not re-show a lesson within this window unless nothing else is available. */
export const HELPFUL_LESSON_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;

function readAll(): HelpfulLessonHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is HelpfulLessonHistory =>
        x &&
        typeof x.lessonId === "string" &&
        typeof x.shownAt === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(entries: HelpfulLessonHistory[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(-MAX_ENTRIES)),
    );
  } catch {
    /* ignore */
  }
}

export function loadHelpfulLessonHistory(): HelpfulLessonHistory[] {
  return readAll();
}

export function recordHelpfulLessonShown(lessonId: string): void {
  const next: HelpfulLessonHistory = {
    lessonId,
    shownAt: new Date().toISOString(),
    opened: false,
    dismissed: false,
  };
  writeAll([...readAll(), next]);
}

export function markHelpfulLessonOpened(lessonId: string): void {
  const all = readAll();
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i].lessonId === lessonId) {
      all[i] = { ...all[i], opened: true };
      writeAll(all);
      return;
    }
  }
}

export function markHelpfulLessonDismissed(lessonId: string): void {
  const all = readAll();
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i].lessonId === lessonId) {
      all[i] = { ...all[i], dismissed: true };
      writeAll(all);
      return;
    }
  }
}

export function recentlyShownLessonIds(
  now = Date.now(),
  cooldownMs = HELPFUL_LESSON_COOLDOWN_MS,
): Set<string> {
  const recent = new Set<string>();
  for (const entry of readAll()) {
    const at = Date.parse(entry.shownAt);
    if (!Number.isFinite(at)) continue;
    if (now - at < cooldownMs) recent.add(entry.lessonId);
  }
  return recent;
}

export function clearHelpfulLessonHistoryForTests(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

import { isLiveEstatePlace } from "@/lib/estate/liveEstatePlace";
import { getPrefs } from "@/lib/companionStore";
import { HELPFUL_LESSON_REGISTRY, getHelpfulLessonById } from "./registry";
import {
  recentlyShownLessonIds,
  recentlyDismissedLessonIds,
  recordHelpfulLessonShown,
} from "./history";
import {
  resolveHelpfulDiscoverySignals,
  type HelpfulDiscoverySignals,
} from "./discoverySignals";
import type { HelpfulLesson, HelpfulLessonOffer } from "./types";

function prefersTextOnly(): boolean {
  try {
    const prefs = getPrefs() as { preferTextOnly?: boolean; voiceEnabled?: boolean };
    if (prefs.preferTextOnly === true) return true;
    if (prefs.voiceEnabled === false) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function isHelpfulLessonEligible(lesson: HelpfulLesson): boolean {
  if (lesson.eligibility?.voiceOnly && prefersTextOnly()) return false;
  if (lesson.destinationId && lesson.eligibility?.requiresLivePlace !== false) {
    // Prefer live places when id matches estate places; section-like ids may still be ok.
    const placeId = lesson.destinationId;
    if (
      /^(clear-my-mind|plan-my-day|evidence-vault|peaceful-places|chamber|decision-compass|talk-it-out|journal|reminders|rhythms)/i.test(
        placeId,
      ) &&
      !isLiveEstatePlace(placeId) &&
      ![
        "plan-my-day",
        "adapt-my-day",
        "parking-lot",
        "park-it",
        "clear-my-mind",
        "reminders",
        "rhythms",
        "settings",
        "projects",
        "people-i-help",
        "my-business-estate",
        "boardroom",
        "chamber",
      ].includes(placeId)
    ) {
      return false;
    }
  }
  return true;
}

// --- Session-level recency ring -------------------------------------------
// In-memory so "Something else" varies within a session even when localStorage
// is unavailable (private mode / quota) and the persisted history reads empty.
let sessionRecentIds: string[] = [];
function pushSessionRecent(id: string): void {
  sessionRecentIds = [...sessionRecentIds.filter((x) => x !== id), id].slice(-12);
}
export function __resetHelpfulLessonSessionForTests(): void {
  sessionRecentIds = [];
}

// --- Completion / suppression ----------------------------------------------
/** A completed profile/setup area leaves the active pool. Never suppress on "unknown". */
function isCompleted(lesson: HelpfulLesson, signals: HelpfulDiscoverySignals): boolean {
  if (!lesson.completionArea) return false;
  return signals.completion[lesson.completionArea]?.status === "complete";
}

// --- Priority tiers (lower = more important) --------------------------------
const CORE_FEATURE_CATEGORIES = new Set([
  "capture",
  "planning",
  "decision",
  "work",
]);

function priorityTier(
  lesson: HelpfulLesson,
  signals: HelpfulDiscoverySignals,
): number {
  const dest = lesson.destinationId;
  // 1 — important incomplete profile/setup work, where reliable completion exists.
  if (lesson.completionArea) {
    const c = signals.completion[lesson.completionArea];
    if (c && (c.status === "empty" || c.status === "started")) return 1;
    // "unknown" (e.g. Settings) is never treated as incomplete → not tier 1.
  }
  // 2 — started but unfinished work.
  if (dest && signals.lastUnfinishedRoomId && dest === signals.lastUnfinishedRoomId) {
    return 2;
  }
  if (lesson.resumable) return 2;
  // 3 — relevant to the current activity.
  if (
    dest &&
    signals.currentActivityDestinationId &&
    dest === signals.currentActivityDestinationId
  ) {
    return 3;
  }
  // 4 — important core feature not yet explored.
  if (
    lesson.category &&
    CORE_FEATURE_CATEGORIES.has(lesson.category) &&
    dest &&
    (signals.visitCounts[dest] ?? 0) === 0
  ) {
    return 4;
  }
  // 5 — useful room not yet visited.
  if (dest && (signals.visitCounts[dest] ?? 0) === 0) return 5;
  // 6 — long-unused relevant feature (visited before, lower priority now).
  if (dest && (signals.visitCounts[dest] ?? 0) > 0) return 6;
  // 7 — Estate tip / everything else.
  return 7;
}

function recentCategories(): (string | undefined)[] {
  // Most-recent-first categories from the session ring (for category variety).
  return [...sessionRecentIds]
    .reverse()
    .slice(0, 2)
    .map((id) => getHelpfulLessonById(id)?.category);
}

function scoreLesson(
  lesson: HelpfulLesson,
  signals: HelpfulDiscoverySignals,
): number {
  let score = priorityTier(lesson, signals) * 1000;
  // Category variety — softly avoid repeating a category just shown.
  const recentCats = recentCategories();
  if (lesson.category && recentCats.includes(lesson.category)) score += 250;
  // Soft lifecycle boost (never surfaced).
  if (
    signals.lifecycleWindow !== "unknown" &&
    lesson.lifecycleWindows?.includes(signals.lifecycleWindow)
  ) {
    score -= 60;
  }
  return score;
}

// --- Eligible pool ----------------------------------------------------------
export function listEligibleHelpfulLessons(options?: {
  excludeIds?: Iterable<string>;
  signals?: HelpfulDiscoverySignals;
  /** Include items still in the recency/session windows (used as a relaxed fallback). */
  ignoreRecency?: boolean;
}): HelpfulLesson[] {
  const signals = options?.signals ?? resolveHelpfulDiscoverySignals();
  const exclude = new Set(options?.excludeIds ?? []);
  const recent = recentlyShownLessonIds();
  const dismissed = recentlyDismissedLessonIds();
  const session = new Set(sessionRecentIds);

  const base = HELPFUL_LESSON_REGISTRY.filter(
    (l) =>
      isHelpfulLessonEligible(l) &&
      !exclude.has(l.id) &&
      !isCompleted(l, signals) &&
      !dismissed.has(l.id),
  );

  if (options?.ignoreRecency) return base;

  const fresh = base.filter((l) => !recent.has(l.id) && !session.has(l.id));
  return fresh.length > 0 ? fresh : base;
}

function chooseFromPool(
  pool: HelpfulLesson[],
  signals: HelpfulDiscoverySignals,
): HelpfulLesson | null {
  if (pool.length === 0) return null;
  const scored = pool
    .map((lesson) => ({ lesson, score: scoreLesson(lesson, signals) }))
    .sort((a, b) => a.score - b.score);
  const best = scored[0]!.score;
  // Rotate among equally-best candidates so we never fixate on registry index 0.
  const top = scored.filter((s) => s.score === best).map((s) => s.lesson);
  const rotation = sessionRecentIds.length % top.length;
  return top[rotation]!;
}

/** Pick one lesson to offer; records shown history + session recency. */
export function offerNextHelpfulLesson(options?: {
  excludeIds?: Iterable<string>;
  currentActivityDestinationId?: string | null;
  signals?: HelpfulDiscoverySignals;
}): HelpfulLessonOffer | null {
  const signals =
    options?.signals ??
    resolveHelpfulDiscoverySignals({
      currentActivityDestinationId: options?.currentActivityDestinationId,
    });
  const pool = listEligibleHelpfulLessons({
    excludeIds: options?.excludeIds,
    signals,
  });
  const lesson = chooseFromPool(pool, signals);
  if (!lesson) return null;

  recordHelpfulLessonShown(lesson.id);
  pushSessionRecent(lesson.id);
  const framed = applyResumeFraming(lesson, signals);
  const remainingIds = pool.filter((l) => l.id !== lesson.id).map((l) => l.id);
  return { lesson: framed, remainingIds };
}

export function offerNextHelpfulLessonExcluding(
  excludeId: string,
  options?: { currentActivityDestinationId?: string | null; signals?: HelpfulDiscoverySignals },
): HelpfulLessonOffer | null {
  return offerNextHelpfulLesson({ ...options, excludeIds: [excludeId] });
}

export function resolveHelpfulLessonForId(id: string): HelpfulLesson | null {
  const lesson = getHelpfulLessonById(id);
  if (!lesson || !isHelpfulLessonEligible(lesson)) return null;
  return lesson;
}

// --- Resume framing ---------------------------------------------------------
/**
 * When a reliable completion signal says the area is started, present the lesson
 * as resumable ("Continue …") with a why-now that reflects real progress. Never
 * claims progress for "unknown" (e.g. Settings) or "empty" areas.
 */
function applyResumeFraming(
  lesson: HelpfulLesson,
  signals: HelpfulDiscoverySignals,
): HelpfulLesson {
  if (!lesson.completionArea) return lesson;
  const c = signals.completion[lesson.completionArea];
  if (!c || c.status !== "started") return lesson;

  const remaining = c.remaining;
  const whyNow =
    remaining != null && remaining > 0
      ? `You've already started this — about ${remaining} ${
          remaining === 1 ? "part" : "parts"
        } left, and continuing makes several other parts of the Estate more useful.`
      : "You've already started this, and continuing makes several other parts of the Estate more useful.";

  const baseLabel = lesson.primaryActionLabel || lesson.actionLabel || "Open";
  const primaryActionLabel = /^continue/i.test(baseLabel)
    ? baseLabel
    : `Continue ${lesson.title}`;

  return { ...lesson, resumable: true, whyNow, primaryActionLabel };
}

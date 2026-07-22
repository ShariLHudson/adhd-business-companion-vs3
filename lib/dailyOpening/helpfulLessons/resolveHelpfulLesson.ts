import { isLiveEstatePlace } from "@/lib/estate/liveEstatePlace";
import { getPrefs } from "@/lib/companionStore";
import { HELPFUL_LESSON_REGISTRY, getHelpfulLessonById } from "./registry";
import { recentlyShownLessonIds, recordHelpfulLessonShown } from "./history";
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

export function listEligibleHelpfulLessons(options?: {
  excludeIds?: Iterable<string>;
}): HelpfulLesson[] {
  const exclude = new Set(options?.excludeIds ?? []);
  const recent = recentlyShownLessonIds();
  const eligible = HELPFUL_LESSON_REGISTRY.filter(
    (l) => isHelpfulLessonEligible(l) && !exclude.has(l.id),
  );
  const fresh = eligible.filter((l) => !recent.has(l.id));
  return fresh.length > 0 ? [...fresh] : [...eligible];
}

/** Pick one lesson to offer; records shown history. */
export function offerNextHelpfulLesson(options?: {
  excludeIds?: Iterable<string>;
}): HelpfulLessonOffer | null {
  const pool = listEligibleHelpfulLessons(options);
  if (pool.length === 0) return null;
  const lesson = pool[0]!;
  recordHelpfulLessonShown(lesson.id);
  const remainingIds = pool.slice(1).map((l) => l.id);
  return { lesson, remainingIds };
}

export function offerNextHelpfulLessonExcluding(
  excludeId: string,
): HelpfulLessonOffer | null {
  return offerNextHelpfulLesson({ excludeIds: [excludeId] });
}

export function resolveHelpfulLessonForId(id: string): HelpfulLesson | null {
  const lesson = getHelpfulLessonById(id);
  if (!lesson || !isHelpfulLessonEligible(lesson)) return null;
  return lesson;
}

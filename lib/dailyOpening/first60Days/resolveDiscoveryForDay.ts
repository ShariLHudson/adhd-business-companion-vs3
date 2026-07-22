/**
 * Select today's optional discovery — guided (usefulness order) or adaptive (day 61+).
 */

import { todayStr } from "@/lib/companionStore";
import { getEstateMemory } from "@/lib/estateMemory/estateMemoryStore";
import { recentlyShownLessonIds } from "@/lib/dailyOpening/helpfulLessons/history";
import {
  FIRST_60_DISCOVERY_CATALOG,
  getFirst60DiscoveryById,
} from "./catalogs";
import { resolveWelcomeDayIndex } from "./dayIndex";
import {
  loadFirst60Progress,
  recordFirst60DiscoveryOffer,
} from "./progressStore";
import type {
  First60DiscoveryDefinition,
  ResolvedFirst60Discovery,
  WelcomeExperiencePhase,
} from "./types";

function visitCountForDiscovery(
  def: First60DiscoveryDefinition,
  visitCounts: Record<string, number>,
): number {
  const keys = def.visitRoomIds ?? [def.destinationId];
  let max = 0;
  for (const key of keys) {
    max = Math.max(max, visitCounts[key] ?? 0);
  }
  return max;
}

function isConsumed(
  def: First60DiscoveryDefinition,
  explored: Set<string>,
  skipped: Set<string>,
  recentLessons: Set<string>,
): boolean {
  if (explored.has(def.id)) return true;
  // Skipped recently — still allow later in adaptive phase, but not while guided
  // if they already skipped (avoid guilt loops in the first 60).
  if (skipped.has(def.id)) return true;
  if (recentLessons.has(def.id)) return true;
  return false;
}

function toResolved(
  def: First60DiscoveryDefinition,
  phase: WelcomeExperiencePhase,
): ResolvedFirst60Discovery {
  return {
    id: def.id,
    title: def.title,
    why: def.why,
    whyToday: def.whyToday,
    destinationId: def.destinationId,
    phase,
  };
}

/**
 * Guided: next usefulness-ranked discovery not yet explored/skipped.
 * Day index maps loosely to catalog progress (one new idea when eligible).
 */
function resolveGuidedDiscovery(
  dayIndex: number,
  explored: Set<string>,
  skipped: Set<string>,
  recentLessons: Set<string>,
): First60DiscoveryDefinition | null {
  const ordered = [...FIRST_60_DISCOVERY_CATALOG].sort(
    (a, b) => a.usefulnessRank - b.usefulnessRank,
  );
  const available = ordered.filter(
    (d) => !isConsumed(d, explored, skipped, recentLessons),
  );
  if (available.length === 0) return null;

  // Prefer the discovery whose usefulness rank aligns with progress through days,
  // but never re-offer consumed ones — fall forward to the next useful idea.
  const targetRank = Math.min(dayIndex, ordered.length);
  const preferred =
    available.find((d) => d.usefulnessRank >= targetRank) ?? available[0]!;
  return preferred;
}

/**
 * Adaptive (day 61+): unvisited / low-use first, then remaining catalog.
 * Avoid frequent places and recently shown helpful lessons.
 */
function resolveAdaptiveDiscovery(
  explored: Set<string>,
  skipped: Set<string>,
  recentLessons: Set<string>,
): First60DiscoveryDefinition | null {
  let visitCounts: Record<string, number> = {};
  try {
    visitCounts = getEstateMemory().roomVisitMemory?.visitCounts ?? {};
  } catch {
    visitCounts = {};
  }

  const scored = FIRST_60_DISCOVERY_CATALOG.map((def) => {
    const visits = visitCountForDiscovery(def, visitCounts);
    const exploredPenalty = explored.has(def.id) ? 100 : 0;
    const skippedPenalty = skipped.has(def.id) ? 40 : 0;
    const frequentPenalty = visits >= 3 ? 80 : visits >= 1 ? 25 : 0;
    const recentPenalty = recentLessons.has(def.id) ? 50 : 0;
    return {
      def,
      score:
        exploredPenalty +
        skippedPenalty +
        frequentPenalty +
        recentPenalty +
        def.usefulnessRank,
      visits,
    };
  })
    .filter((row) => row.visits < 3 && !explored.has(row.def.id))
    .sort((a, b) => a.score - b.score);

  if (scored.length > 0) return scored[0]!.def;

  // Soft fallback: anything not recently lesson-shown
  const fallback = FIRST_60_DISCOVERY_CATALOG.find(
    (d) => !recentLessons.has(d.id) && !explored.has(d.id),
  );
  return fallback ?? null;
}

export function resolveDiscoveryForWelcomeDay(input?: {
  now?: Date;
  dayKey?: string;
  persistOffer?: boolean;
  /** Test override — skip reading relationship clock. */
  dayIndexOverride?: number;
}): ResolvedFirst60Discovery | null {
  const now = input?.now ?? new Date();
  const dayKey = input?.dayKey ?? todayStr();
  const { dayIndex, phase } =
    input?.dayIndexOverride != null
      ? {
          dayIndex: input.dayIndexOverride,
          phase:
            input.dayIndexOverride <= 60
              ? ("guided" as const)
              : ("adaptive" as const),
        }
      : resolveWelcomeDayIndex(now);

  const progress = loadFirst60Progress();
  // Same calendar day — return the already offered discovery (stable UI).
  if (
    progress.lastDiscoveryOfferDay === dayKey &&
    progress.lastDiscoveryOfferId
  ) {
    const existing = getFirst60DiscoveryById(progress.lastDiscoveryOfferId);
    if (existing) return toResolved(existing, phase);
  }

  const explored = new Set(progress.exploredIds);
  const skipped = new Set(progress.skippedIds);
  const recentLessons = recentlyShownLessonIds();

  const def =
    phase === "guided"
      ? resolveGuidedDiscovery(dayIndex, explored, skipped, recentLessons)
      : resolveAdaptiveDiscovery(explored, skipped, recentLessons);

  if (!def) return null;

  if (input?.persistOffer !== false) {
    recordFirst60DiscoveryOffer(def.id, dayKey);
  }
  return toResolved(def, phase);
}

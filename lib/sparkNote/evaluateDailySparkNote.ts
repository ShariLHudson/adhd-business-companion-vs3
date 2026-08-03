import {
  DEFAULT_SPARK_NOTE_COOLDOWN_DAYS,
  SPARK_NOTE_CATALOG,
} from "./catalog";
import {
  isPersonalSparkId,
  rebuildPersonalSparkFromId,
  resolvePersonalSpark,
} from "./personalSparks";
import {
  dayKey,
  getRecentSparkNoteIds,
  getStoredDailySparkId,
  recordDailySparkSelection,
  sparkNoteOnCooldown,
} from "./persistence";
import {
  filterLibraryCandidatePool,
  shouldYieldCalendarSparkForVariety,
} from "./librarySelection";
import { pickAffinityWeightedFromPool } from "./preferenceLearning";
import { resolveFallbackSparkCard } from "./runtimeIntegration";
import { currentSparkSeason } from "./seasonalPersonality";
import {
  isCoreEligible,
  matchesCalculatedTier,
  matchesDateTier,
  matchesSeasonalTier,
} from "./scheduling/selectSchedule";
import type {
  EvaluateDailySparkNoteInput,
  EvaluateDailySparkNoteOutput,
  SparkNoteCatalogEntry,
  SparkNoteDailyCard,
} from "./types";

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function entryToCard(
  entry: SparkNoteCatalogEntry,
  source: SparkNoteDailyCard["source"],
): SparkNoteDailyCard {
  return {
    id: entry.id,
    category: entry.category,
    categoryLabel: entry.categoryLabel,
    sparkType: entry.sparkType ?? "story",
    title: entry.title,
    shortTitle: entry.shortTitle ?? entry.title,
    teaser: entry.teaser,
    whatHappened: entry.whatHappened,
    whyInteresting: entry.whyInteresting,
    whyItMatters: entry.whyItMatters,
    sparkApplication: entry.sparkApplication,
    imageSrc: entry.imageSrc,
    thumbnailSrc: entry.thumbnailSrc,
    thumbnailAlt: entry.thumbnailAlt,
    tags: entry.tags,
    source,
    expanded: entry.expanded,
  };
}

function pickFromPool(
  pool: SparkNoteCatalogEntry[],
  seed: string,
): SparkNoteCatalogEntry | null {
  if (pool.length === 0) return null;
  return pickAffinityWeightedFromPool(pool, seed);
}

/**
 * Resolve today's catalog Spark using the normalized selection tiers, in order:
 *   1. exact-date (legacy monthDay/months compat + new exact-date)
 *   2. calculated-date (new computed holidays)
 *   3. eligible seasonal (legacy seasons + new seasonal)
 *   4. eligible core (evergreen) with catalog-wide repeat protection + unseen
 *      preference
 *
 * Legacy cards flow through the exact same branches the pre-Phase-3 selector
 * used (see scheduling/selectSchedule.ts COMPATIBILITY CONTRACT), so their
 * selection outcomes are unchanged. `catalog` is injectable for tests only;
 * production always uses SPARK_NOTE_CATALOG.
 */
function resolveFromCatalog(
  now: Date,
  region: string,
  catalog: readonly SparkNoteCatalogEntry[] = SPARK_NOTE_CATALOG,
): SparkNoteDailyCard | null {
  const seed = `${dayKey(now)}:spark-note`;
  const memberRegion = region;
  const notCooled = (entry: SparkNoteCatalogEntry) =>
    !sparkNoteOnCooldown(
      entry.id,
      entry.cooldownDays ?? DEFAULT_SPARK_NOTE_COOLDOWN_DAYS,
      now,
    );
  const byPriority = (a: SparkNoteCatalogEntry, b: SparkNoteCatalogEntry) =>
    (b.priority ?? 0) - (a.priority ?? 0);

  // 1. exact-date (+ legacy monthDay/months, unchanged). Calendar delights are
  // welcome — but not when celebrations would dominate (legacy variety rule).
  const dateCandidates = catalog
    .filter((entry) => matchesDateTier(entry, now, memberRegion) && notCooled(entry))
    .sort(byPriority);
  if (
    dateCandidates.length > 0 &&
    !shouldYieldCalendarSparkForVariety(dateCandidates[0]!)
  ) {
    return entryToCard(dateCandidates[0]!, "date");
  }

  // 2. calculated-date (new computed holidays).
  const calculatedCandidates = catalog
    .filter(
      (entry) => matchesCalculatedTier(entry, now, memberRegion) && notCooled(entry),
    )
    .sort(byPriority);
  if (
    calculatedCandidates.length > 0 &&
    !shouldYieldCalendarSparkForVariety(calculatedCandidates[0]!)
  ) {
    return entryToCard(calculatedCandidates[0]!, "date");
  }

  // 3. eligible seasonal.
  const seasonalCandidates = catalog
    .filter(
      (entry) =>
        matchesSeasonalTier(entry, now, memberRegion) &&
        notCooled(entry) &&
        !shouldYieldCalendarSparkForVariety(entry),
    )
    .sort(byPriority);
  if (seasonalCandidates.length > 0) {
    const chosen = pickAffinityWeightedFromPool(
      seasonalCandidates,
      `${seed}:season:${currentSparkSeason(now)}`,
    );
    if (chosen) return entryToCard(chosen, "date");
  }

  // 4. eligible core — catalog-wide repeat protection + unseen preference.
  const recent = getRecentSparkNoteIds();
  let pool = catalog.filter(
    (entry) =>
      isCoreEligible(entry, memberRegion) &&
      !recent.includes(entry.id) &&
      notCooled(entry),
  );
  if (pool.length === 0) {
    pool = catalog.filter(
      (entry) => isCoreEligible(entry, memberRegion) && notCooled(entry),
    );
  }

  const filtered = filterLibraryCandidatePool(pool, now);
  const chosen = pickFromPool(filtered.length > 0 ? filtered : pool, seed);
  if (!chosen) return null;
  return entryToCard(chosen, "library");
}

/**
 * Test-only hook: run the tiered catalog resolution against an injected catalog
 * (fixtures), bypassing the daily pin. Never used in production.
 */
export function resolveDailySparkFromCatalogForTests(input: {
  now: Date;
  region?: string;
  catalog: readonly SparkNoteCatalogEntry[];
}): SparkNoteDailyCard | null {
  return resolveFromCatalog(input.now, input.region ?? "US", input.catalog);
}

/**
 * Resolve the full daily card for a catalog Spark id. Exported so surfaces like
 * My Spark Collection can reopen the exact full Spark Card from a saved id.
 * Read-only lookup — does not affect selection, pinning, or the daily record.
 */
export function findCatalogCardById(id: string): SparkNoteDailyCard | null {
  const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
  if (!entry) return null;
  const source: SparkNoteDailyCard["source"] =
    entry.monthDay || entry.months || entry.seasons?.length ? "date" : "library";
  return entryToCard(entry, source);
}

/**
 * Resolve the EXACT pinned daily Spark for `now` by its stored id, using the
 * canonical by-id resolvers (findCatalogCardById / rebuildPersonalSparkFromId).
 * Returns null when no pin exists yet or the pinned id can't be resolved — it
 * NEVER generates a new Spark, re-pins, or falls back to a sample card. Callers
 * that need to establish today's pin use resolveDailySparkCard instead.
 */
export function resolvePinnedDailySparkCard(
  input: EvaluateDailySparkNoteInput = {},
): SparkNoteDailyCard | null {
  const now = input.now ?? new Date();
  const storedId = getStoredDailySparkId(now);
  if (!storedId) return null;
  if (isPersonalSparkId(storedId)) {
    return rebuildPersonalSparkFromId(storedId, personalInput(input, now));
  }
  return findCatalogCardById(storedId);
}

function personalInput(input: EvaluateDailySparkNoteInput, now: Date) {
  return {
    now,
    firstName: input.firstName,
    birthday: input.birthday,
    personalDates: input.personalDates,
    memberSinceIso: input.memberSinceIso,
  };
}

/**
 * Select today's Spark Note — one card per day.
 *
 * Selection intelligence (see selectionIntelligence.ts):
 * 1. Personal meaningful moments today
 * 2. Personal upcoming events (within 7 days)
 * 3. Calendar / seasonal date-based sparks
 * 4–5. Affinity-weighted evergreen library with variety rules
 */
export function evaluateDailySparkNote(
  input: EvaluateDailySparkNoteInput = {},
): EvaluateDailySparkNoteOutput {
  const now = input.now ?? new Date();
  const region = input.region ?? "US";
  const personal = personalInput(input, now);

  if (!input.forceRefresh) {
    const storedId = getStoredDailySparkId(now);
    if (storedId) {
      if (isPersonalSparkId(storedId)) {
        const cached = rebuildPersonalSparkFromId(storedId, personal);
        if (cached) return { card: cached };
      } else {
        const cached = findCatalogCardById(storedId);
        if (cached) return { card: cached };
      }
    }
  }

  const personalCard = resolvePersonalSpark(personal);
  if (personalCard) {
    recordDailySparkSelection(personalCard.id, now, "personal");
    return { card: personalCard };
  }

  const card = resolveFromCatalog(now, region);
  if (!card) {
    const fallback = resolveFallbackSparkCard();
    recordDailySparkSelection(fallback.id, now, "library");
    return { card: fallback };
  }

  recordDailySparkSelection(card.id, now, card.source);
  return { card };
}

export function categoryEmoji(category: SparkNoteDailyCard["category"]): string {
  switch (category) {
    case "001": // Discovery
      return "🔭";
    case "002": // People & Stories
      return "⭐";
    case "003": // Creativity & Inspiration
      return "🎨";
    case "004": // Nature & Places
      return "🌿";
    case "005": // Curiosity
      return "🔎";
    case "006": // Words & Origins
      return "📖";
    case "007": // Strategy
      return "🧭";
    case "008": // Reflection
      return "🌅";
    case "009": // Adventure
      return "🗺️";
    case "010": // Business
      return "📈";
    case "011": // Innovation
      return "💡";
    case "012": // Wonder
      return "✨";
    default:
      return "🔥";
  }
}

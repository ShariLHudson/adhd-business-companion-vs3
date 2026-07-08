import type { RegionCode } from "@/lib/companionLanguage";
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
import { filterLibraryCandidatePool } from "./librarySelection";
import { pickAffinityWeightedFromPool } from "./preferenceLearning";
import { currentSparkSeason, matchesSeasonEntry } from "./seasonalPersonality";
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
  };
}

function matchesDateEntry(
  entry: SparkNoteCatalogEntry,
  now: Date,
  region: RegionCode,
): boolean {
  if (entry.regions && !entry.regions.includes(region)) return false;
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (entry.monthDay) {
    return entry.monthDay.month === month && entry.monthDay.day === day;
  }
  if (entry.months) {
    return entry.months.includes(month);
  }
  return false;
}

function matchesSeasonalEntry(
  entry: SparkNoteCatalogEntry,
  now: Date,
): boolean {
  if (entry.monthDay || entry.months) return false;
  return matchesSeasonEntry(entry, currentSparkSeason(now));
}

function pickFromPool(
  pool: SparkNoteCatalogEntry[],
  seed: string,
): SparkNoteCatalogEntry | null {
  if (pool.length === 0) return null;
  return pickAffinityWeightedFromPool(pool, seed);
}

function resolveFromCatalog(
  now: Date,
  region: RegionCode,
): SparkNoteDailyCard | null {
  const seed = `${dayKey(now)}:spark-note`;

  const dateCandidates = SPARK_NOTE_CATALOG.filter(
    (entry) =>
      matchesDateEntry(entry, now, region) &&
      !sparkNoteOnCooldown(
        entry.id,
        entry.cooldownDays ?? DEFAULT_SPARK_NOTE_COOLDOWN_DAYS,
        now,
      ),
  ).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  if (dateCandidates.length > 0) {
    return entryToCard(dateCandidates[0]!, "date");
  }

  const season = currentSparkSeason(now);
  const seasonalCandidates = SPARK_NOTE_CATALOG.filter(
    (entry) =>
      matchesSeasonalEntry(entry, now) &&
      !sparkNoteOnCooldown(
        entry.id,
        entry.cooldownDays ?? DEFAULT_SPARK_NOTE_COOLDOWN_DAYS,
        now,
      ),
  ).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  if (seasonalCandidates.length > 0) {
    const chosen = pickAffinityWeightedFromPool(
      seasonalCandidates,
      `${seed}:season:${season}`,
    );
    if (chosen) return entryToCard(chosen, "date");
  }

  const recent = getRecentSparkNoteIds();
  let pool = SPARK_NOTE_CATALOG.filter(
    (entry) =>
      !entry.monthDay &&
      !entry.months &&
      !entry.seasons?.length &&
      !recent.includes(entry.id) &&
      !sparkNoteOnCooldown(
        entry.id,
        entry.cooldownDays ?? DEFAULT_SPARK_NOTE_COOLDOWN_DAYS,
        now,
      ),
  );

  if (pool.length === 0) {
    pool = SPARK_NOTE_CATALOG.filter(
      (entry) =>
        !entry.monthDay &&
        !entry.months &&
        !entry.seasons?.length &&
        !sparkNoteOnCooldown(
          entry.id,
          entry.cooldownDays ?? DEFAULT_SPARK_NOTE_COOLDOWN_DAYS,
          now,
        ),
    );
  }

  const filtered = filterLibraryCandidatePool(pool, now);
  const chosen = pickFromPool(filtered.length > 0 ? filtered : pool, seed);
  if (!chosen) return null;
  return entryToCard(chosen, "library");
}

function findCatalogCardById(id: string): SparkNoteDailyCard | null {
  const entry = SPARK_NOTE_CATALOG.find((e) => e.id === id);
  if (!entry) return null;
  const source: SparkNoteDailyCard["source"] =
    entry.monthDay || entry.months || entry.seasons?.length ? "date" : "library";
  return entryToCard(entry, source);
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
 * Priority: personal > date-based > curated library rotation.
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
  if (!card) return { card: null };

  recordDailySparkSelection(card.id, now, card.source);
  return { card };
}

export function categoryEmoji(category: SparkNoteDailyCard["category"]): string {
  switch (category) {
    case "invention":
      return "💡";
    case "inventor":
    case "entrepreneur":
      return "⭐";
    case "business":
      return "📈";
    case "history":
      return "📜";
    case "holiday":
      return "🎉";
    case "fun_fact":
      return "✨";
    case "quote":
      return "💬";
    case "creativity":
      return "🎨";
    case "personal_growth":
      return "🌱";
    case "gratitude":
      return "💛";
    case "adhd_friendly":
      return "✦";
    case "personal":
      return "🎂";
    default:
      return "🔥";
  }
}

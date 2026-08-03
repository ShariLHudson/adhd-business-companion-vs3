import type { SparkNoteCatalogEntry, SparkNoteExpandedContent } from "../types";
import type { SparkAudience, SparkContentRecord, SparkDateRules, SparkTone } from "./types";

function buildExpandedFromRecord(
  record: SparkContentRecord,
): SparkNoteExpandedContent | undefined {
  const hasAny =
    Boolean(record.expanded_look_closer?.trim()) ||
    Boolean(record.expanded_deeper_story?.trim()) ||
    Boolean(record.expanded_what_happened_next?.trim()) ||
    Boolean(record.expanded_unexpected_connection?.trim()) ||
    Boolean(record.expanded_new_facts?.length) ||
    Boolean(record.expanded_try_this?.trim()) ||
    Boolean(record.expanded_gallery?.length) ||
    Boolean(record.expanded_timeline?.length) ||
    Boolean(record.expanded_sources?.length);
  if (!hasAny) return undefined;

  return {
    lookCloser: record.expanded_look_closer,
    deeperStory: record.expanded_deeper_story,
    whatHappenedNext: record.expanded_what_happened_next,
    unexpectedConnection: record.expanded_unexpected_connection,
    newFacts: record.expanded_new_facts,
    tryThis: record.expanded_try_this,
    gallery: record.expanded_gallery,
    timeline: record.expanded_timeline,
    sources: record.expanded_sources,
  };
}

function expandedToRecordFields(
  expanded: SparkNoteExpandedContent | undefined,
): Partial<SparkContentRecord> {
  if (!expanded) return {};
  return {
    expanded_look_closer: expanded.lookCloser,
    expanded_deeper_story: expanded.deeperStory,
    expanded_what_happened_next: expanded.whatHappenedNext,
    expanded_unexpected_connection: expanded.unexpectedConnection,
    expanded_new_facts: expanded.newFacts,
    expanded_try_this: expanded.tryThis,
    expanded_gallery: expanded.gallery,
    expanded_timeline: expanded.timeline,
    expanded_sources: expanded.sources,
  };
}

const DEFAULT_AUDIENCE: SparkAudience[] = ["Everyone"];
const DEFAULT_TONE: SparkTone = "curious";

function parseMonthDay(date: string): { month: number; day: number } | null {
  const match = /^(\d{2})-(\d{2})$/.exec(date.trim());
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { month, day };
}

export function catalogEntryToRecord(entry: SparkNoteCatalogEntry): SparkContentRecord {
  let date_rules: SparkDateRules = { type: "evergreen" };
  if (entry.monthDay) {
    const { month, day } = entry.monthDay;
    date_rules = {
      type: "specific_date",
      date: `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    };
  } else if (entry.seasons?.length === 1) {
    date_rules = { type: "season", value: entry.seasons[0]! };
  } else if (entry.months?.length) {
    date_rules = { type: "months", months: [...entry.months] };
  }

  const record: SparkContentRecord = {
    spark_id: entry.id,
    title: entry.title,
    category: entry.categoryLabel,
    audience: DEFAULT_AUDIENCE,
    image: entry.imageSrc ?? null,
    thumbnail: entry.thumbnailSrc ?? null,
    thumbnail_alt: entry.thumbnailAlt,
    short_teaser: entry.teaser,
    story: entry.whatHappened,
    why_interesting: entry.whyInteresting,
    impact: entry.whyItMatters,
    spark_application: entry.sparkApplication,
    tags: entry.tags ?? [],
    date_rules,
    tone: DEFAULT_TONE,
    status: "active",
    runtime_category: entry.category,
    category_label: entry.categoryLabel,
    spark_type: entry.sparkType,
    short_title: entry.shortTitle,
    priority: entry.priority,
    cooldown_days: entry.cooldownDays,
    regions: entry.regions,
    ...expandedToRecordFields(entry.expanded),
  };

  // New scheduling model — only added when present, so legacy records serialize
  // exactly as before (keeps the committed manifest a no-op diff).
  if (entry.displayRule) {
    record.display_rule = entry.displayRule;
    if (entry.dateRule) record.date_rule = entry.dateRule;
    if (entry.season) record.season = entry.season;
    if (typeof entry.month === "number") record.month = entry.month;
    if (typeof entry.day === "number") record.day = entry.day;
    if (entry.months?.length) record.months = [...entry.months];
    if (typeof entry.volume === "number") record.volume = entry.volume;
    if (entry.collection) record.collection = entry.collection;
    if (entry.region) record.region = entry.region;
  }

  return record;
}

export function recordToCatalogEntry(record: SparkContentRecord): SparkNoteCatalogEntry | null {
  if (record.status !== "active") return null;

  const category = record.runtime_category;
  if (!category) return null;

  const entry: SparkNoteCatalogEntry = {
    id: record.spark_id,
    category,
    categoryLabel: record.category_label ?? record.category,
    sparkType: record.spark_type,
    title: record.title,
    shortTitle: record.short_title,
    teaser: record.short_teaser,
    whatHappened: record.story,
    whyInteresting: record.why_interesting,
    whyItMatters: record.impact,
    sparkApplication: record.spark_application,
    imageSrc: record.image ?? undefined,
    thumbnailSrc: record.thumbnail ?? undefined,
    thumbnailAlt: record.thumbnail_alt,
    tags: record.tags,
    priority: record.priority,
    cooldownDays: record.cooldown_days,
    regions: record.regions,
  };

  const expanded = buildExpandedFromRecord(record);
  if (expanded) entry.expanded = expanded;

  const rules = record.date_rules;
  if (rules.type === "specific_date") {
    const monthDay = parseMonthDay(rules.date);
    if (monthDay) entry.monthDay = monthDay;
  } else if (rules.type === "season") {
    entry.seasons = [rules.value];
  } else if (rules.type === "months") {
    entry.months = [...rules.months];
  }

  // New scheduling model — authoritative when present (mirrors the entry shape).
  if (record.display_rule) {
    entry.displayRule = record.display_rule;
    if (record.date_rule) entry.dateRule = record.date_rule;
    if (record.season) entry.season = record.season;
    if (typeof record.month === "number") entry.month = record.month;
    if (typeof record.day === "number") entry.day = record.day;
    if (record.months?.length) entry.months = [...record.months];
    if (typeof record.volume === "number") entry.volume = record.volume;
    if (record.collection) entry.collection = record.collection;
    if (record.region) entry.region = record.region;
  }

  return entry;
}

export function recordsToCatalog(records: SparkContentRecord[]): SparkNoteCatalogEntry[] {
  return records
    .map(recordToCatalogEntry)
    .filter((entry): entry is SparkNoteCatalogEntry => entry != null);
}

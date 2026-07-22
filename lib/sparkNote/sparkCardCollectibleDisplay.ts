import type { SparkNoteCategory, SparkNoteDailyCard } from "./types";
import { SPARK_NOTE_CATALOG } from "./catalog";
import { resolveSparkCardArtAsset } from "./sparkCardArtRegistry";
import {
  diversityCategoryIcon,
  resolveSparkCardCategoryRibbon,
  resolveSparkCardDiversityCategory,
  SPARK_CARD_OUTCOME_FEELINGS,
  type SparkCardDiversityCategoryId,
} from "./sparkCardDiversity";

/** Simplified default-view section labels — treasure card, not article. */
export const SPARK_CARD_SECTION_STORY = "The Story" as const;
export const SPARK_CARD_SECTION_TODAYS_SPARK = "Today's Spark" as const;
export const SPARK_CARD_SECTION_SPARK_IN_ACTION = "Spark In Action" as const;
export const SPARK_CARD_SECTION_TELL_ME_MORE = "Tell Me More" as const;

/** @deprecated Prefer SPARK_CARD_SECTION_TODAYS_SPARK — kept for older references. */
export const SPARK_CARD_SECTION_WHY = SPARK_CARD_SECTION_TODAYS_SPARK;
/** @deprecated Prefer SPARK_CARD_SECTION_TELL_ME_MORE */
export const SPARK_CARD_SECTION_DISCOVER = SPARK_CARD_SECTION_TELL_ME_MORE;
/** @deprecated Prefer SPARK_CARD_SECTION_SPARK_IN_ACTION */
export const SPARK_CARD_SECTION_SPARK = SPARK_CARD_SECTION_SPARK_IN_ACTION;

const SPARK_CARD_MORE_TO_DISCOVER_BY_ID: Record<string, string> = {
  "SPARK-INV-001":
    "3M launched Post-it® Notes nationally in 1980 — years after the adhesive was first discovered in the lab.",
  "SPARK-INV-002":
    "Percy Spencer held more than 150 patents; the microwave oven grew from radar research during World War II.",
  "SPARK-INV-010":
    "Douglas Engelbart demonstrated the mouse publicly in 1968 — the famous \"Mother of All Demos.\"",
  "SPARK-INNOV-001":
    "Fleming's observation came in 1928; penicillin later transformed medicine worldwide.",
  "SPARK-QUOTE-008":
    "Oscar Wilde was one of Victorian literature's wittiest voices — celebrated for humor, style, and individuality.",
  "SPARK-QUOTE-004":
    "Einstein reshaped physics in 1905 with papers that changed how we understand space, time, and energy.",
  "SPARK-QUOTE-003":
    "Churchill led Britain through World War II and remains one of history's most quoted leaders.",
  "SPARK-BIZ-001":
    "Many iconic companies began as small experiments long before they looked like \"overnight\" successes.",
  "SPARK-HIST-001":
    "Small moments in history often ripple outward — changing science, culture, or daily life for generations.",
  "SPARK-FACT-001":
    "The best fun facts connect something surprising to a real story you can remember and share.",
};

const SPARK_CARD_MORE_TO_DISCOVER_BY_CATEGORY: Partial<
  Record<SparkNoteCategory, string>
> = {
  invention:
    "Many everyday tools began as side discoveries — noticed by someone willing to ask what else they could become.",
  inventor:
    "Inventors often combine patience, observation, and the courage to keep exploring after the first attempt fails.",
  entrepreneur:
    "Behind many ventures is a person who saw a problem differently — and stayed with it long enough to build a path.",
  business:
    "Business stories are rarely straight lines; they are collections of decisions, risks, and lessons learned in public.",
  history:
    "Dates and names are anchors — the interesting part is how a single choice or discovery changed what came next.",
  quote:
    "Behind many famous lines is a life story, a moment of pressure, or a philosophy that took years to form.",
  fun_fact:
    "The memorable facts are the ones tied to a place, a person, or a chain of events you did not expect.",
  creativity:
    "Creative breakthroughs often arrive after play, rest, or a change of scene — not only during forced effort.",
  personal_growth:
    "Growth sparks often connect a small daily choice to a larger identity you are still becoming.",
};

const DIVERSITY_TINY_ACTIONS: Record<SparkCardDiversityCategoryId, string> = {
  fun_celebrations: "Share one cheerful fact with someone today.",
  innovation: "Write down one idea you once set aside.",
  remarkable_people: "Thank someone who quietly made something better.",
  amazing_places: "Notice one beautiful detail in the place you are today.",
  nature: "Step outside for two minutes and notice one living thing.",
  history: "Tell someone one surprising thing from the past you just learned.",
  fun_facts: "Smile and share one surprising fact with a friend.",
  kindness: "Leave someone a short encouraging note.",
  curiosity: "Ask one curious question today — and wait for the answer.",
  inspiration: "Write one sentence about what this spark stirred in you.",
  books_ideas: "Jot down one idea worth keeping before the day ends.",
  creativity: "Make one tiny creative mark — a doodle, a line, a phrase.",
  science_technology: "Wonder out loud how one everyday tool actually works.",
};

/** Supplemental discovery copy — dates, context, lesser-known angles. */
export function resolveSparkCardMoreToDiscover(
  card: SparkNoteDailyCard,
): string | null {
  const explicit = card.whyInteresting?.trim();
  if (explicit) return explicit;
  const byId = SPARK_CARD_MORE_TO_DISCOVER_BY_ID[card.id];
  if (byId) return byId;
  return SPARK_CARD_MORE_TO_DISCOVER_BY_CATEGORY[card.category] ?? null;
}

/** One brief insight line — keepsake card, not an article. */
export function resolveSparkCardBriefInsight(
  card: SparkNoteDailyCard,
): string | null {
  const candidate =
    card.whyItMatters?.trim() ||
    card.sparkApplication?.trim() ||
    card.whyInteresting?.trim() ||
    null;
  return candidate;
}

/** Split story into short paragraphs (3–5 when possible). */
export function splitSparkCardStoryParagraphs(story: string): string[] {
  const trimmed = story.trim();
  if (!trimmed) return [];

  const byBlank = trimmed
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (byBlank.length >= 2) return byBlank.slice(0, 5);

  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 3) return [trimmed];

  const paragraphs: string[] = [];
  const chunkSize = Math.ceil(sentences.length / Math.min(5, Math.ceil(sentences.length / 2)));
  for (let i = 0; i < sentences.length; i += chunkSize) {
    paragraphs.push(sentences.slice(i, i + chunkSize).join(" "));
  }
  return paragraphs.slice(0, 5);
}

/**
 * Today's Spark — one meaningful takeaway (not a multi-panel lesson).
 */
export function resolveTodaysSpark(card: SparkNoteDailyCard): string {
  return (
    card.whyItMatters?.trim() ||
    card.teaser?.trim() ||
    "A small spark can change how you see the day."
  );
}

/**
 * Spark In Action — one tiny action under ~five minutes.
 * Reflection questions from the catalog become concrete micro-actions.
 */
export function resolveSparkInAction(card: SparkNoteDailyCard): string {
  const raw = card.sparkApplication?.trim() ?? "";
  if (raw && !raw.endsWith("?")) return raw;

  const diversity = resolveSparkCardDiversityCategory({
    category: card.category,
    categoryLabel: card.categoryLabel,
    tags: card.tags,
    title: card.title,
  });
  return DIVERSITY_TINY_ACTIONS[diversity];
}

export type SparkCardRelatedSpark = {
  id: string;
  title: string;
  categoryRibbon: string;
};

export type SparkCardTellMeMore = {
  facts: string[];
  reflectionPrompt: string | null;
  related: SparkCardRelatedSpark[];
};

export type SparkCardSimplifiedPresentation = {
  categoryRibbon: string;
  /** Small emblem for the category badge — visual redesign, additive. */
  categoryIcon: string;
  diversityCategory: SparkCardDiversityCategoryId;
  title: string;
  subtitle: string;
  storyParagraphs: string[];
  todaysSpark: string;
  sparkInAction: string;
  tellMeMore: SparkCardTellMeMore;
};

function resolveRelatedSparks(card: SparkNoteDailyCard): SparkCardRelatedSpark[] {
  const diversity = resolveSparkCardDiversityCategory({
    category: card.category,
    categoryLabel: card.categoryLabel,
    tags: card.tags,
    title: card.title,
  });
  const tagSet = new Set((card.tags ?? []).map((t) => t.toLowerCase()));

  return SPARK_NOTE_CATALOG.filter((entry) => entry.id !== card.id)
    .map((entry) => {
      const entryDiversity = resolveSparkCardDiversityCategory({
        category: entry.category,
        categoryLabel: entry.categoryLabel,
        tags: entry.tags,
        title: entry.title,
      });
      const sharedTags = (entry.tags ?? []).filter((t) =>
        tagSet.has(t.toLowerCase()),
      ).length;
      const score =
        (entryDiversity === diversity ? 3 : 0) +
        sharedTags +
        (entry.category === card.category ? 1 : 0);
      return { entry, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ entry }) => ({
      id: entry.id,
      title: entry.shortTitle ?? entry.title,
      categoryRibbon: resolveSparkCardCategoryRibbon({
        category: entry.category,
        categoryLabel: entry.categoryLabel,
        tags: entry.tags,
        title: entry.title,
      }),
    }));
}

export function resolveSparkCardTellMeMore(
  card: SparkNoteDailyCard,
): SparkCardTellMeMore {
  const facts: string[] = [];
  const more = resolveSparkCardMoreToDiscover(card);
  if (more) facts.push(more);
  if (
    card.whyInteresting?.trim() &&
    card.whyInteresting.trim() !== more?.trim()
  ) {
    facts.push(card.whyInteresting.trim());
  }

  const reflection =
    card.sparkApplication?.trim().endsWith("?")
      ? card.sparkApplication.trim()
      : null;

  return {
    facts,
    reflectionPrompt: reflection,
    related: resolveRelatedSparks(card),
  };
}

/** Default-view presentation — calm treasure card. */
export function resolveSparkCardSimplifiedPresentation(
  card: SparkNoteDailyCard,
): SparkCardSimplifiedPresentation {
  const diversityCategory = resolveSparkCardDiversityCategory({
    category: card.category,
    categoryLabel: card.categoryLabel,
    tags: card.tags,
    title: card.title,
  });

  return {
    categoryRibbon: resolveSparkCardCategoryRibbon({
      category: card.category,
      categoryLabel: card.categoryLabel,
      tags: card.tags,
      title: card.title,
    }),
    categoryIcon: diversityCategoryIcon(diversityCategory),
    diversityCategory,
    title: card.title,
    subtitle: card.teaser?.trim() || "A small idea waiting to brighten your day.",
    storyParagraphs: splitSparkCardStoryParagraphs(card.whatHappened),
    todaysSpark: resolveTodaysSpark(card),
    sparkInAction: resolveSparkInAction(card),
    tellMeMore: resolveSparkCardTellMeMore(card),
  };
}

/**
 * Stable, non-cryptographic string hash — deterministic footer selection
 * (same card always shows the same warm footer line).
 */
function stableStringHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Small warm footer / card-identity line — approved outcome-feeling copy,
 * chosen deterministically per card (never fabricated per render).
 */
export function resolveSparkCardFooterLine(card: SparkNoteDailyCard): string {
  const index = stableStringHash(card.id) % SPARK_CARD_OUTCOME_FEELINGS.length;
  return SPARK_CARD_OUTCOME_FEELINGS[index];
}

export type SparkCardHeroVisual =
  | { kind: "photo"; src: string; alt: string }
  | {
      kind: "themed";
      category: SparkNoteCategory;
      emblem: string;
      alt: string;
    };

/** Category emblem for collectible themed art when no photo ships. */
export const SPARK_CARD_CATEGORY_EMBLEM: Record<SparkNoteCategory, string> = {
  invention: "💡",
  inventor: "🧭",
  entrepreneur: "🚀",
  business: "📈",
  history: "📜",
  holiday: "✨",
  fun_fact: "🎲",
  quote: "💬",
  creativity: "🎨",
  personal_growth: "🌱",
  gratitude: "🙏",
  adhd_friendly: "⚡",
  personal: "🔥",
};

/**
 * Hero visual for expanded Spark Cards — always returns something displayable.
 * Prefers catalog image; falls back to category-themed collectible art.
 */
export function resolveSparkCardHeroVisual(
  card: SparkNoteDailyCard,
): SparkCardHeroVisual {
  const asset = resolveSparkCardArtAsset(card);
  if (asset.src) {
    return { kind: "photo", src: asset.src, alt: asset.alt };
  }
  return {
    kind: "themed",
    category: card.category,
    emblem: SPARK_CARD_CATEGORY_EMBLEM[card.category] ?? "✨",
    alt: asset.alt,
  };
}

/** Share / clipboard text for a simplified Spark Card. */
export function buildSparkCardShareText(card: SparkNoteDailyCard): string {
  const presentation = resolveSparkCardSimplifiedPresentation(card);
  return [
    presentation.title,
    presentation.subtitle,
    "",
    `Today's Spark: ${presentation.todaysSpark}`,
    `Spark In Action: ${presentation.sparkInAction}`,
  ].join("\n");
}

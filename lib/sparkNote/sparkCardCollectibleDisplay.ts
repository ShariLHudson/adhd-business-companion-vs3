import type {
  SparkNoteCategory,
  SparkNoteDailyCard,
  SparkNoteExpandedGalleryItem,
  SparkNoteGalleryIconKey,
} from "./types";
import {
  resolveSparkCardDiversityArtAsset,
  resolveSparkCardSpecificArtAsset,
  type SparkCardImageAspectRatio,
  type SparkCardImageFocalPoint,
} from "./sparkCardArtRegistry";
import {
  diversityCategoryLabel,
  resolveSparkCardCategoryRibbon,
  resolveSparkCardDiversityCategory,
  SPARK_CARD_OUTCOME_FEELINGS,
  type SparkCardDiversityCategoryId,
} from "./sparkCardDiversity";
import { generateSparkCardExpandedContent } from "./sparkCardTellMeMoreGenerator";

const GALLERY_ICON_KEYS: readonly SparkNoteGalleryIconKey[] = [
  "spark",
  "flame",
  "book",
  "compass",
  "seal",
  "lens",
  "leaf",
] as const;

const DIVERSITY_ESTATE_ICON: Record<
  SparkCardDiversityCategoryId,
  SparkNoteGalleryIconKey
> = {
  fun_celebrations: "spark",
  innovation: "flame",
  remarkable_people: "seal",
  amazing_places: "compass",
  nature: "leaf",
  history: "book",
  fun_facts: "lens",
  kindness: "spark",
  curiosity: "compass",
  inspiration: "flame",
  books_ideas: "book",
  creativity: "seal",
  science_technology: "lens",
};

/** Map legacy emoji / free-text emblems to estate icon keys. */
export function resolveSparkCardGalleryIcon(
  emblemOrIcon?: string | SparkNoteGalleryIconKey | null,
): SparkNoteGalleryIconKey {
  const raw = (emblemOrIcon ?? "").trim().toLowerCase();
  if ((GALLERY_ICON_KEYS as readonly string[]).includes(raw)) {
    return raw as SparkNoteGalleryIconKey;
  }
  if (/book|📖|📚|quill|🖋️/.test(raw)) return "book";
  if (/flame|🔥|bulb|💡|⚙️|🔧/.test(raw)) return "flame";
  if (/compass|🧭|map|🗺️|place/.test(raw)) return "compass";
  if (/lens|magnif|🔍|🔎|🔬|atom|⚛️/.test(raw)) return "lens";
  if (/leaf|🌿|🍃|nature|🌼|🐝/.test(raw)) return "leaf";
  if (/seal|🕰️|🗝️|🎓|📜/.test(raw)) return "seal";
  return "spark";
}

export function normalizeSparkCardGalleryItem(
  item: SparkNoteExpandedGalleryItem,
): SparkCardGalleryItem {
  const caption = item.caption.trim();
  return {
    icon: resolveSparkCardGalleryIcon(item.icon ?? item.emblem),
    caption,
    detail:
      item.detail?.trim() ||
      `${caption} — a small angle worth noticing without changing the whole story.`,
    imageSrc: item.imageSrc?.trim() || undefined,
    imageAlt: item.imageAlt?.trim() || undefined,
  };
}

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

export type SparkCardGalleryItem = {
  icon: SparkNoteGalleryIconKey;
  caption: string;
  detail: string;
  imageSrc?: string;
  imageAlt?: string;
};
export type SparkCardTimelineItem = { label: string; detail?: string };

/**
 * Which "new information" category a Tell Me More field satisfies — used to
 * verify the expanded card adds at least three genuinely new discoveries
 * (see prompt's New-Information Requirement).
 */
export type SparkCardNewDiscoveryCategory =
  | "new_fact"
  | "new_context"
  | "new_consequence"
  | "new_connection"
  | "new_practical_use"
  | "new_visual_detail"
  | "new_source";

export type SparkCardTellMeMoreVisualModule = "gallery" | "timeline" | "lookCloser";

export type SparkCardTellMeMore = {
  /** Genuinely new facts only — never a repeat of front copy. */
  facts: string[];
  reflectionPrompt: string | null;
  /** "Zoom in" detail not present anywhere on the front. */
  lookCloser: string | null;
  /** A second story beat — behind-the-scenes context, not a rephrase. */
  deeperStory: string | null;
  /** What happened after / because of the front's story. */
  whatHappenedNext: string | null;
  /** A surprising link between this Spark and today. */
  unexpectedConnection: string | null;
  /** One small, concrete thing to try — distinct from Spark In Action. */
  tryThis: string | null;
  /** Illustrated gallery chips — a visual module, not decoration only. */
  gallery: SparkCardGalleryItem[];
  /** Mini timeline — a visual module for sequence-driven Sparks. */
  timeline: SparkCardTimelineItem[];
  sources: string[];
  /** Which visual modules are present — first section shown must be visual. */
  visualModules: SparkCardTellMeMoreVisualModule[];
  /** New-information categories satisfied by this expanded content. */
  newDiscoveryCategories: SparkCardNewDiscoveryCategory[];
  /** True when >= 3 genuinely new discovery categories are present. */
  meetsNewInformationRequirement: boolean;
};

/** Normalize for a lightweight duplication check against front content. */
function normalizeForDuplicateCheck(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when `candidate` is the same as, or substantially contained within,
 * one of the front's texts — the duplication check the prompt requires
 * before treating expanded content as genuinely new.
 */
function isDuplicateOfFrontContent(
  candidate: string,
  normalizedFrontTexts: readonly string[],
): boolean {
  const norm = normalizeForDuplicateCheck(candidate);
  if (!norm) return true;
  return normalizedFrontTexts.some((front) => {
    if (!front) return false;
    if (front === norm) return true;
    if (norm.length > 12 && front.includes(norm)) return true;
    if (front.length > 12 && norm.includes(front)) return true;
    return false;
  });
}

function resolveFrontContentFingerprints(card: SparkNoteDailyCard): string[] {
  return [
    card.title,
    card.shortTitle,
    card.teaser,
    card.whatHappened,
    resolveTodaysSpark(card),
    resolveSparkInAction(card),
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map(normalizeForDuplicateCheck);
}

export type SparkCardSimplifiedPresentation = {
  categoryRibbon: string;
  diversityCategory: SparkCardDiversityCategoryId;
  title: string;
  subtitle: string;
  storyParagraphs: string[];
  todaysSpark: string;
  sparkInAction: string;
  tellMeMore: SparkCardTellMeMore;
};

/**
 * Tell Me More — the genuinely-new second layer.
 *
 * Merges hand-authored `card.expanded` (per-field priority) with the
 * category generator fallback, then runs a duplication check against every
 * front field so nothing repeats or lightly rephrases the front. See
 * docs/spark-card/SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_REPORT.md.
 */
export function resolveSparkCardTellMeMore(
  card: SparkNoteDailyCard,
): SparkCardTellMeMore {
  const frontFingerprints = resolveFrontContentFingerprints(card);
  const generated = generateSparkCardExpandedContent(card);
  const authored = card.expanded;

  function pickNewString(
    authoredValue?: string,
    generatedValue?: string,
  ): string | null {
    const candidate = authoredValue?.trim() || generatedValue?.trim() || "";
    if (!candidate) return null;
    return isDuplicateOfFrontContent(candidate, frontFingerprints)
      ? null
      : candidate;
  }

  const lookCloser = pickNewString(authored?.lookCloser, generated.lookCloser);
  const deeperStory = pickNewString(authored?.deeperStory, generated.deeperStory);
  const whatHappenedNext = pickNewString(
    authored?.whatHappenedNext,
    generated.whatHappenedNext,
  );
  const unexpectedConnection = pickNewString(
    authored?.unexpectedConnection,
    generated.unexpectedConnection,
  );
  const tryThis = pickNewString(authored?.tryThis, generated.tryThis);

  const legacyMoreToDiscover = resolveSparkCardMoreToDiscover(card);
  const candidateFacts = [
    ...(authored?.newFacts ?? []),
    ...(generated.newFacts ?? []),
    legacyMoreToDiscover,
    card.whyInteresting?.trim(),
  ].filter((value): value is string => Boolean(value && value.trim()));

  const seenFacts = new Set<string>();
  const facts: string[] = [];
  for (const fact of candidateFacts) {
    const norm = normalizeForDuplicateCheck(fact);
    if (!norm || seenFacts.has(norm)) continue;
    if (isDuplicateOfFrontContent(fact, frontFingerprints)) continue;
    seenFacts.add(norm);
    facts.push(fact.trim());
    if (facts.length >= 4) break; // keepsake card, not an essay
  }

  const rawGallery =
    authored?.gallery?.length ? authored.gallery : generated.gallery ?? [];
  const gallery = rawGallery.map(normalizeSparkCardGalleryItem);
  const timeline =
    authored?.timeline?.length ? authored.timeline : generated.timeline ?? [];
  const sources =
    authored?.sources?.length ? authored.sources : generated.sources ?? [];

  const reflection =
    card.sparkApplication?.trim().endsWith("?")
      ? card.sparkApplication.trim()
      : null;

  const visualModules: SparkCardTellMeMoreVisualModule[] = [];
  if (gallery.length > 0) visualModules.push("gallery");
  if (timeline.length > 0) visualModules.push("timeline");
  if (lookCloser) visualModules.push("lookCloser");

  const newDiscoveryCategories: SparkCardNewDiscoveryCategory[] = [];
  if (facts.length > 0) newDiscoveryCategories.push("new_fact");
  if (deeperStory) newDiscoveryCategories.push("new_context");
  if (whatHappenedNext) newDiscoveryCategories.push("new_consequence");
  if (unexpectedConnection) newDiscoveryCategories.push("new_connection");
  if (tryThis) newDiscoveryCategories.push("new_practical_use");
  if (gallery.length > 0 || timeline.length > 0 || lookCloser) {
    newDiscoveryCategories.push("new_visual_detail");
  }
  if (sources.length > 0) newDiscoveryCategories.push("new_source");

  return {
    facts,
    reflectionPrompt: reflection,
    lookCloser,
    deeperStory,
    whatHappenedNext,
    unexpectedConnection,
    tryThis,
    gallery,
    timeline,
    sources,
    visualModules,
    newDiscoveryCategories,
    meetsNewInformationRequirement: newDiscoveryCategories.length >= 3,
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
    diversityCategory,
    title: card.title,
    subtitle: card.teaser?.trim() || "A small idea waiting to brighten your day.",
    // Face of the card stays light — deeper reading lives in Tell Me More.
    storyParagraphs: splitSparkCardStoryParagraphs(card.whatHappened).slice(0, 2),
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
  | {
      kind: "photo";
      src: string;
      alt: string;
      aspectRatio: SparkCardImageAspectRatio;
      focalPoint: SparkCardImageFocalPoint;
      caption?: string;
      credit?: string;
    }
  | {
      kind: "themed";
      category: SparkNoteCategory;
      diversityCategory: SparkCardDiversityCategoryId;
      /** Estate icon key for the medallion — never emoji. */
      emblem: SparkNoteGalleryIconKey;
      /** Supporting estate icon keys — never emoji. */
      motifs: SparkNoteGalleryIconKey[];
      caption: string;
      alt: string;
      aspectRatio: SparkCardImageAspectRatio;
      focalPoint: SparkCardImageFocalPoint;
    };

/**
 * Hero visual for expanded Spark Cards — always returns something displayable.
 *
 * Real photography is now the default: a genuinely topic-specific photo
 * (explicit catalog image, or a matched person/object/topic) wins first;
 * otherwise every card falls through to a real, warm editorial/botanical/
 * archival photo for its diversity category (see
 * `SPARK_CARD_DIVERSITY_CATEGORY_ART`). The illustrated themed scene
 * (medallion emblem + supporting motifs) is kept only as the runtime
 * fallback the component shows if a photo genuinely fails to load — it is
 * never the primary hero anymore. See
 * docs/spark-card/SPARK_CARD_READABILITY_REAL_IMAGERY_INTERACTION_REPORT.md.
 */
export function resolveSparkCardHeroVisual(
  card: SparkNoteDailyCard,
): SparkCardHeroVisual {
  const specific = resolveSparkCardSpecificArtAsset(card);
  if (specific) {
    return {
      kind: "photo",
      src: specific.src,
      alt: specific.alt,
      aspectRatio: specific.aspectRatio ?? "landscape",
      focalPoint: specific.focalPoint ?? "center",
      caption: specific.caption,
      credit: specific.credit,
    };
  }

  const diversityCategory = resolveSparkCardDiversityCategory({
    category: card.category,
    categoryLabel: card.categoryLabel,
    tags: card.tags,
    title: card.title,
  });
  const diversityPhoto = resolveSparkCardDiversityArtAsset(diversityCategory);
  if (diversityPhoto) {
    return {
      kind: "photo",
      src: diversityPhoto.src,
      alt: diversityPhoto.alt,
      aspectRatio: diversityPhoto.aspectRatio ?? "landscape",
      focalPoint: diversityPhoto.focalPoint ?? "center",
      caption: diversityPhoto.caption,
      credit: diversityPhoto.credit,
    };
  }

  return resolveSparkCardThemedScene(card);
}

/**
 * Illustrated themed scene payload — medallion emblem + supporting motifs +
 * caption ribbon. Used as the default hero when no specific photo exists,
 * and as the graceful fallback if a specific photo fails to load at runtime.
 */
export function resolveSparkCardThemedScene(
  card: Pick<SparkNoteDailyCard, "id" | "category" | "categoryLabel" | "tags" | "title">,
): Extract<SparkCardHeroVisual, { kind: "themed" }> {
  const diversityCategory = resolveSparkCardDiversityCategory({
    category: card.category,
    categoryLabel: card.categoryLabel,
    tags: card.tags,
    title: card.title,
  });

  const emblem = DIVERSITY_ESTATE_ICON[diversityCategory] ?? "spark";
  const motifCycle: SparkNoteGalleryIconKey[] = [
    emblem,
    "seal",
    "compass",
    "leaf",
    "book",
    "lens",
    "flame",
  ];
  return {
    kind: "themed",
    category: card.category,
    diversityCategory,
    emblem,
    motifs: motifCycle.slice(0, 3),
    caption: diversityCategoryLabel(diversityCategory),
    alt: `Illustrated ${diversityCategoryLabel(diversityCategory)} discovery — ${card.title}`,
    aspectRatio: "landscape",
    focalPoint: "center",
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

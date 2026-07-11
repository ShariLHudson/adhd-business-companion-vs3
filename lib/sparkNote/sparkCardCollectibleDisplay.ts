import type { SparkNoteCategory, SparkNoteDailyCard } from "./types";
import { resolveSparkCardArtAsset } from "./sparkCardArtRegistry";

/** Expanded card section labels — collectible discovery voice. */
export const SPARK_CARD_SECTION_STORY = "The Story" as const;
export const SPARK_CARD_SECTION_WHY = "Why It Matters" as const;
export const SPARK_CARD_SECTION_DISCOVER = "More To Discover" as const;
export const SPARK_CARD_SECTION_SPARK = "Spark It" as const;

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
    card.sparkApplication?.trim() ||
    card.whyInteresting?.trim() ||
    card.whyItMatters?.trim() ||
    null;
  return candidate;
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

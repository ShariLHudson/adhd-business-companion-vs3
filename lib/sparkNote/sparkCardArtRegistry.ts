import type { SparkNoteCategory, SparkNoteDailyCard } from "./types";
import type { SparkCardDiversityCategoryId } from "./sparkCardDiversity";
import {
  normalizeSparkCardImageSrc,
  wikimediaCommonsDirectThumbUrl,
} from "./wikimediaCommonsUrl";

export type SparkCardImageAspectRatio =
  | "landscape"
  | "portrait"
  | "square"
  | "editorial";

export type SparkCardImageFocalPoint =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right";

/** Hero / Tell Me More image payload for Spark Cards. */
export type SparkCardArtAsset = {
  src: string;
  alt: string;
  aspectRatio?: SparkCardImageAspectRatio;
  focalPoint?: SparkCardImageFocalPoint;
  caption?: string;
  credit?: string;
};

/**
 * Build a stable Wikimedia Commons thumb URL from a file *title*.
 *
 * Uses a direct `upload.wikimedia.org` thumb path (MD5-sharded). Prefer this
 * over `Special:FilePath` redirects — those often leave a blank framed `<img>`
 * in live view while print preview still paints the redirected bitmap.
 * See docs/spark-card/SPARK_CARD_READABILITY_REAL_IMAGERY_INTERACTION_REPORT.md.
 */
export function wikimediaCommonsImage(
  title: string,
  alt: string,
  widthPx = 900,
  options?: Pick<
    SparkCardArtAsset,
    "aspectRatio" | "focalPoint" | "caption" | "credit"
  >,
): SparkCardArtAsset {
  return {
    // Direct upload.wikimedia.org thumb — avoids Special:FilePath redirect
    // blank-frames in live view (print often still paints the redirect).
    src: wikimediaCommonsDirectThumbUrl(title, widthPx),
    alt,
    aspectRatio: options?.aspectRatio ?? "landscape",
    focalPoint: options?.focalPoint ?? "center",
    caption: options?.caption,
    credit: options?.credit ?? "Wikimedia Commons",
  };
}

/** Topic / person / title patterns — checked before category defaults. */
const SPARK_CARD_TOPIC_ART: readonly {
  pattern: RegExp;
  asset: SparkCardArtAsset;
}[] = [
  {
    pattern: /oscar wilde|SPARK-QUOTE-008/i,
    asset: wikimediaCommonsImage("Oscar Wilde Sarony.jpg", "Oscar Wilde portrait"),
  },
  {
    pattern: /einstein|SPARK-QUOTE-004|SPARK-QUOTE-006/i,
    asset: wikimediaCommonsImage("Albert Einstein Head.jpg", "Albert Einstein portrait"),
  },
  {
    pattern: /steve jobs|SPARK-QUOTE-001|SPARK-QUOTE-002/i,
    asset: wikimediaCommonsImage(
      "Steve Jobs Headshot 2010-CROP (cropped 2).jpg",
      "Steve Jobs portrait",
    ),
  },
  {
    pattern: /churchill|SPARK-QUOTE-003/i,
    asset: wikimediaCommonsImage(
      "Sir Winston Churchill - 19086236948.jpg",
      "Winston Churchill portrait",
    ),
  },
  {
    pattern: /walt disney|SPARK-QUOTE-005/i,
    asset: wikimediaCommonsImage("Walt Disney 1946.JPG", "Walt Disney portrait"),
  },
  {
    pattern: /henry ford|SPARK-QUOTE-007/i,
    asset: wikimediaCommonsImage("Henry Ford 1919.jpg", "Henry Ford portrait"),
  },
  {
    pattern: /arthur ashe|SPARK-QTE-003/i,
    asset: wikimediaCommonsImage("Arthur Ashe (1975).jpg", "Arthur Ashe portrait"),
  },
  {
    pattern: /matisse|SPARK-QTE-004/i,
    asset: wikimediaCommonsImage(
      "Henri Matisse, 1913, portrait by Alvin Langdon Coburn.jpg",
      "Henri Matisse portrait",
    ),
  },
  {
    pattern: /post-it|SPARK-INV-001/i,
    asset: wikimediaCommonsImage("Post-it notes.jpg", "Colorful sticky notes"),
  },
  {
    pattern: /microwave|SPARK-INV-002/i,
    asset: wikimediaCommonsImage("Microwave oven.jpg", "Microwave oven"),
  },
  {
    pattern: /mouse|SPARK-INV-010/i,
    asset: wikimediaCommonsImage("Computer mouse logitech.jpg", "Computer mouse"),
  },
  {
    pattern: /velcro|SPARK-INV-003/i,
    asset: wikimediaCommonsImage("Close up of Velcro.jpg", "Velcro fastener close-up"),
  },
  {
    // Fixed: previous "Penicillin_production.jpg" hash path could not be
    // verified against Wikimedia — the Spencer microscope photo below is a
    // confirmed, currently-existing file with the same warm lab-discovery feel.
    pattern: /penicillin|SPARK-INNOV-001/i,
    asset: wikimediaCommonsImage("Spencer Microscope.jpg", "Antique brass laboratory microscope"),
  },
  {
    pattern: /super soaker|SPARK-INNOV-003/i,
    asset: wikimediaCommonsImage("Super Soaker CPS 2000.jpg", "Super Soaker water toy"),
  },
  {
    pattern: /summer'?s open door|SPARK-SEA-SUMMER/i,
    asset: wikimediaCommonsImage(
      "Arch door and portal in Walled Garden at Goodnestone Park Kent England.jpg",
      "An open garden doorway in warm light — adventure close to home",
      900,
      {
        aspectRatio: "editorial",
        focalPoint: "center",
        caption: "Adventure can be close to home.",
      },
    ),
  },
];

const SPARK_CARD_CATEGORY_ART: Record<SparkNoteCategory, SparkCardArtAsset> = {
  // Fixed: "Edison_and_light_bulb.jpg" does not exist on Commons under that
  // title (confirmed 404). "Edison bulb.jpg" is the real file — Edison's
  // first demonstration bulb at Menlo Park.
  invention: wikimediaCommonsImage("Edison bulb.jpg", "Thomas Edison's first demonstration light bulb"),
  inventor: wikimediaCommonsImage("Edison bulb.jpg", "Thomas Edison's first demonstration light bulb"),
  entrepreneur: wikimediaCommonsImage(
    "New York Stock Exchange Facade 2015.jpg",
    "Historic business district architecture",
  ),
  business: wikimediaCommonsImage(
    "Office desk with typewriter and telephone, ca. 1910.jpg",
    "Vintage office desk and telephone",
  ),
  // Fixed: the previous title was missing the parentheses/comma that are
  // part of the real file name, which made the hard-coded hash path 404.
  history: wikimediaCommonsImage(
    "Declaration of Independence (1819), by John Trumbull.jpg",
    "Historic painting of a pivotal moment",
  ),
  holiday: wikimediaCommonsImage("Christmas tree with presents.jpg", "Holiday tree with warm light"),
  fun_fact: wikimediaCommonsImage(
    "Magnifying glass on the page of a book.jpg",
    "Magnifying glass — curiosity and discovery",
  ),
  quote: wikimediaCommonsImage("Quill and ink.jpg", "Quill and ink — literary writing atmosphere"),
  creativity: wikimediaCommonsImage(
    "Monet - Impression, Sunrise.jpg",
    "Impressionist painting — creative atmosphere",
  ),
  personal_growth: wikimediaCommonsImage("Fjord in Norway.jpg", "Path toward open horizon"),
  gratitude: wikimediaCommonsImage("Sunrise over the sea.jpg", "Sunrise over calm water"),
  adhd_friendly: wikimediaCommonsImage(
    "Colorful sticky notes on wall.jpg",
    "Colorful notes and visual organization",
  ),
  personal: wikimediaCommonsImage("Journal and pen.jpg", "Open journal with pen"),
};

/**
 * Real, warm editorial/botanical/archival photography for every approved
 * diversity category (see sparkCardDiversity.ts) — used as the hero image
 * whenever a card has no bespoke topic-specific photo. This is what stops
 * the illustrated emblem+motifs scene from being the *default* hero: every
 * card now shows an actual photograph instead of a themed panel. Every
 * title below was checked against Wikimedia Commons during this pass — see
 * docs/spark-card/ for verification notes and known gaps.
 */
export const SPARK_CARD_DIVERSITY_CATEGORY_ART: Record<
  SparkCardDiversityCategoryId,
  SparkCardArtAsset
> = {
  fun_celebrations: wikimediaCommonsImage(
    "Happy birthday balloons Mexico.jpg",
    "Warm celebration atmosphere — a small, low-stakes reason to smile",
    900,
    { aspectRatio: "landscape", focalPoint: "center" },
  ),
  innovation: wikimediaCommonsImage(
    "Edison bulb.jpg",
    "An early lightbulb prototype — invention before polish",
  ),
  remarkable_people: wikimediaCommonsImage(
    "Mentor Graham Photograph Date Unknown From Abraham Lincoln Museum of Lincoln Memorial University, Harrogate, TN.jpg",
    "An archival portrait — a quiet figure behind a well-known story",
  ),
  amazing_places: wikimediaCommonsImage(
    "Fjord in Norway.jpg",
    "A fjord in Norway — a place worth a second look",
  ),
  nature: wikimediaCommonsImage(
    "The road in the autumn birch forest.jpg",
    "A quiet autumn forest path",
  ),
  history: wikimediaCommonsImage(
    "Declaration of Independence (1819), by John Trumbull.jpg",
    "A historic painting of a pivotal moment",
  ),
  fun_facts: wikimediaCommonsImage(
    "Magnifying glass on the page of a book.jpg",
    "A magnifying glass over an open page — curiosity in close-up",
  ),
  kindness: wikimediaCommonsImage(
    "A Helping Hand.jpg",
    "A small helping hand — kindness offered quietly",
  ),
  curiosity: wikimediaCommonsImage(
    "BLW Brass compass.jpg",
    "An antique brass compass — a tool for wondering and wayfinding",
  ),
  inspiration: wikimediaCommonsImage("Sunrise over the sea.jpg", "Sunrise over calm water"),
  books_ideas: wikimediaCommonsImage(
    "Book-rose-and-candle-on-teak.jpg",
    "An old book beside a candle — a quiet idea waiting to be read",
  ),
  creativity: wikimediaCommonsImage(
    "Monet - Impression, Sunrise.jpg",
    "Impression, Sunrise by Claude Monet — the painting that named a movement",
  ),
  science_technology: wikimediaCommonsImage(
    "Spencer Microscope.jpg",
    "An antique brass laboratory microscope",
  ),
};

/** Real photo for a diversity category — always returns a usable asset. */
export function resolveSparkCardDiversityArtAsset(
  id: SparkCardDiversityCategoryId,
): SparkCardArtAsset {
  return SPARK_CARD_DIVERSITY_CATEGORY_ART[id];
}

/**
 * Resolve an explicit or topic-specific photo match only — never the
 * generic per-category stock photo. Returns `null` when nothing genuinely
 * topic-specific exists, so the caller can fall through to the diversity
 * category's real photo (and, only if that photo fails at runtime, the
 * illustrated themed scene) — see
 * docs/spark-card/SPARK_CARD_READABILITY_REAL_IMAGERY_INTERACTION_REPORT.md.
 */
export function resolveSparkCardSpecificArtAsset(
  card: SparkNoteDailyCard,
): SparkCardArtAsset | null {
  const explicit = card.imageSrc?.trim() || card.thumbnailSrc?.trim();
  if (explicit) {
    return {
      src: normalizeSparkCardImageSrc(explicit),
      alt: card.thumbnailAlt?.trim() || `Artwork for ${card.title}`,
    };
  }

  const haystack = [
    card.id,
    card.title,
    card.shortTitle,
    card.categoryLabel,
    ...(card.tags ?? []),
  ].join(" ");

  for (const entry of SPARK_CARD_TOPIC_ART) {
    if (entry.pattern.test(haystack)) {
      return entry.asset;
    }
  }

  return null;
}

/**
 * Resolve a meaningful hero image for collectible Spark Cards.
 * Prefers catalog imageSrc, then topic match, then legacy category artwork.
 * @deprecated Prefer `resolveSparkCardSpecificArtAsset` +
 * `resolveSparkCardDiversityArtAsset` — kept for any legacy callers that
 * need a guaranteed real-photo fallback keyed by the old 13-category enum.
 */
export function resolveSparkCardArtAsset(
  card: SparkNoteDailyCard,
): SparkCardArtAsset {
  const specific = resolveSparkCardSpecificArtAsset(card);
  if (specific) return specific;

  return (
    SPARK_CARD_CATEGORY_ART[card.category] ?? {
      src: SPARK_CARD_CATEGORY_ART.quote.src,
      alt: `Themed artwork for ${card.categoryLabel}`,
    }
  );
}

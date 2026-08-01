/**
 * The 12 Spark Editions shown on the Personal Library shelves.
 *
 * Each edition has an official cover image (staged under
 * `/public/spark-card-images/`). These covers are for EDITION / collection
 * presentation only — future edition-browsing screens, collection navigation,
 * and edition headers / summaries. They carry "EDITION" branding and a tagline,
 * so they are deliberately NOT wired into the individual Spark Card hero-image
 * resolver (`lib/sparkNote/resolveSparkCardImage.ts`, unchanged). Individual card
 * hero photos are supplied separately.
 *
 * Numbers/titles/topics match the approved Personal Library artwork
 * (`/public/backgrounds/personal-library-background.png`).
 */

export type SparkEditionCover = {
  /** 1-based edition number as shown on the shelf. */
  number: number;
  /** Zero-padded shelf code, e.g. "004". */
  code: string;
  /** Edition title as shown in the Personal Library. */
  title: string;
  /** Topic slug — also the cover asset filename stem. */
  topic: string;
  /** Public path to the official edition cover asset. */
  imageSrc: string;
  /** Accessible description of the cover. */
  imageAlt: string;
};

function editionCover(
  number: number,
  title: string,
  topic: string,
): SparkEditionCover {
  const code = String(number).padStart(3, "0");
  return {
    number,
    code,
    title,
    topic,
    imageSrc: `/spark-card-images/${topic}.png`,
    imageAlt: `Spark Editions ${code} — ${title} cover`,
  };
}

export const SPARK_EDITION_COVERS: readonly SparkEditionCover[] = [
  editionCover(1, "Discovery", "discovery"),
  editionCover(2, "People & Stories", "people"),
  editionCover(3, "Creativity & Inspiration", "creativity"),
  editionCover(4, "Nature & Places", "nature"),
  editionCover(5, "Curiosity", "curiosity"),
  editionCover(6, "Words & Origins", "word"),
  editionCover(7, "Strategy", "strategy"),
  editionCover(8, "Reflection", "reflections"),
  editionCover(9, "Adventure", "adventure"),
  editionCover(10, "Business", "business"),
  editionCover(11, "Innovation", "innovations"),
  editionCover(12, "Wonder", "worlds"),
];

/** Look up an edition cover by its shelf number (1–12). */
export function sparkEditionByNumber(
  n: number,
): SparkEditionCover | undefined {
  return SPARK_EDITION_COVERS.find((edition) => edition.number === n);
}

/** Look up an edition cover by its topic slug (case-insensitive). */
export function sparkEditionByTopic(
  topic: string,
): SparkEditionCover | undefined {
  const key = topic.trim().toLowerCase();
  return SPARK_EDITION_COVERS.find((edition) => edition.topic === key);
}

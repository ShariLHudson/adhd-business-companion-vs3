/**
 * Canonical Spark Card image resolver — shared by live expanded card and print.
 * Do not duplicate field lookup in components.
 */

import {
  resolveSparkCardDiversityArtAsset,
  resolveSparkCardSpecificArtAsset,
  type SparkCardArtAsset,
  type SparkCardImageAspectRatio,
  type SparkCardImageFocalPoint,
} from "./sparkCardArtRegistry";
import { resolveSparkCardDiversityCategory } from "./sparkCardDiversity";
import type { SparkNoteCategory, SparkNoteDailyCard } from "./types";
import { normalizeSparkCardImageSrc } from "./wikimediaCommonsUrl";

export type SparkCardImageSourceType =
  | "explicit"
  | "topic"
  | "diversity"
  | "legacy_field"
  | "none";

export type ResolvedSparkCardImage = {
  src: string | null;
  alt: string;
  caption: string | null;
  aspectRatio: SparkCardImageAspectRatio;
  focalPoint: SparkCardImageFocalPoint;
  credit: string | null;
  sourceType: SparkCardImageSourceType;
  /** Field name that supplied the URL (for dev diagnostics). */
  sourceField: string | null;
  fallback: boolean;
};

/** Loose card-like input — supports catalog + library JSON + daily cards. */
export type SparkCardImageInput = {
  id?: string;
  title?: string;
  shortTitle?: string;
  category?: SparkNoteCategory | string;
  categoryLabel?: string;
  tags?: string[];
  imageSrc?: string | null;
  thumbnailSrc?: string | null;
  thumbnailAlt?: string | null;
  // Legacy / alternate shapes
  image?: string | null;
  image_url?: string | null;
  heroImage?: string | null;
  hero_image?: string | null;
  printImage?: string | null;
  fallbackImage?: string | null;
  media?: { url?: string | null } | null;
  imageAsset?: { assetUrl?: string | null; url?: string | null } | null;
  imageObj?: { assetUrl?: string | null; url?: string | null } | null;
};

type ExtractedExplicit = {
  src: string;
  field: string;
  alt?: string;
};

function firstNonEmpty(
  ...candidates: Array<{ value?: string | null; field: string }>
): { value: string; field: string } | null {
  for (const c of candidates) {
    const v = c.value?.trim();
    if (v) return { value: v, field: c.field };
  }
  return null;
}

/**
 * Pull the first usable explicit URL from any known legacy field name.
 */
export function extractSparkCardExplicitImage(
  card: SparkCardImageInput,
): ExtractedExplicit | null {
  const mediaUrl = card.media?.url;
  const assetUrl =
    card.imageAsset?.assetUrl ||
    card.imageAsset?.url ||
    card.imageObj?.assetUrl ||
    card.imageObj?.url;

  const hit = firstNonEmpty(
    { value: card.imageSrc, field: "imageSrc" },
    { value: card.thumbnailSrc, field: "thumbnailSrc" },
    { value: card.image, field: "image" },
    { value: card.image_url, field: "image_url" },
    { value: card.heroImage, field: "heroImage" },
    { value: card.hero_image, field: "hero_image" },
    { value: mediaUrl, field: "media.url" },
    { value: assetUrl, field: "image.assetUrl" },
    { value: card.printImage, field: "printImage" },
    { value: card.fallbackImage, field: "fallbackImage" },
  );
  if (!hit) return null;
  return {
    src: normalizeSparkCardImageSrc(hit.value),
    field: hit.field,
    alt: card.thumbnailAlt?.trim() || undefined,
  };
}

function asDailyCard(card: SparkCardImageInput): SparkNoteDailyCard {
  const explicit = extractSparkCardExplicitImage(card);
  return {
    id: card.id || "unknown",
    category: (card.category as SparkNoteCategory) || "personal_growth",
    categoryLabel: card.categoryLabel || "Spark",
    sparkType: "quick",
    title: card.title || "Spark",
    shortTitle: card.shortTitle || card.title || "Spark",
    teaser: "",
    whatHappened: "",
    whyItMatters: "",
    sparkApplication: "",
    imageSrc: explicit?.src,
    thumbnailSrc: undefined,
    thumbnailAlt: card.thumbnailAlt || undefined,
    tags: card.tags,
    source: "library",
  };
}

function logDevImageResolution(
  cardId: string,
  resolved: ResolvedSparkCardImage,
  loadError?: string,
): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }
  if (typeof console === "undefined" || !console.debug) return;
  console.debug("[spark-card-image]", {
    cardId,
    src: resolved.src,
    sourceField: resolved.sourceField,
    sourceType: resolved.sourceType,
    fallback: resolved.fallback,
    loadError: loadError || null,
  });
}

/**
 * Resolve the display image for a Spark Card — single source for live + print.
 */
export function resolveSparkCardImage(
  cardInput: SparkCardImageInput,
): ResolvedSparkCardImage {
  const card = asDailyCard(cardInput);
  const explicit = extractSparkCardExplicitImage(cardInput);

  // Prefer topic/specific resolution (includes explicit imageSrc on the daily shape).
  const withExplicit: SparkNoteDailyCard = {
    ...card,
    imageSrc: explicit?.src || card.imageSrc,
    thumbnailAlt: explicit?.alt || card.thumbnailAlt,
  };

  const specific = resolveSparkCardSpecificArtAsset(withExplicit);
  if (specific?.src?.trim()) {
    const src = normalizeSparkCardImageSrc(specific.src);
    const resolved: ResolvedSparkCardImage = {
      src,
      alt:
        specific.alt ||
        explicit?.alt ||
        `Artwork for ${withExplicit.title}`,
      caption: specific.caption?.trim() || null,
      aspectRatio: specific.aspectRatio ?? "landscape",
      focalPoint: specific.focalPoint ?? "center",
      credit: specific.credit?.trim() || null,
      sourceType: explicit ? "explicit" : "topic",
      sourceField: explicit?.field || "topic_registry",
      fallback: false,
    };
    logDevImageResolution(withExplicit.id, resolved);
    return resolved;
  }

  const diversityCategory = resolveSparkCardDiversityCategory({
    category: withExplicit.category,
    categoryLabel: withExplicit.categoryLabel,
    tags: withExplicit.tags,
    title: withExplicit.title,
  });
  const diversity: SparkCardArtAsset =
    resolveSparkCardDiversityArtAsset(diversityCategory);
  if (diversity?.src?.trim()) {
    const resolved: ResolvedSparkCardImage = {
      src: normalizeSparkCardImageSrc(diversity.src),
      alt: diversity.alt || `Artwork for ${withExplicit.title}`,
      caption: diversity.caption?.trim() || null,
      aspectRatio: diversity.aspectRatio ?? "landscape",
      focalPoint: diversity.focalPoint ?? "center",
      credit: diversity.credit?.trim() || null,
      sourceType: "diversity",
      sourceField: "diversity_registry",
      fallback: false,
    };
    logDevImageResolution(withExplicit.id, resolved);
    return resolved;
  }

  const empty: ResolvedSparkCardImage = {
    src: null,
    alt: `Themed artwork for ${withExplicit.title}`,
    caption: null,
    aspectRatio: "landscape",
    focalPoint: "center",
    credit: null,
    sourceType: "none",
    sourceField: null,
    fallback: true,
  };
  logDevImageResolution(withExplicit.id, empty);
  return empty;
}

/** Dev-only load failure log — never surface to members. */
export function logSparkCardImageLoadError(input: {
  cardId: string;
  src: string | null;
  sourceField: string | null;
  error?: string;
}): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }
  console.debug("[spark-card-image:load-error]", input);
}

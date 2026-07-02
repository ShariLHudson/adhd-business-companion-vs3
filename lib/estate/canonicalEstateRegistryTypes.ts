/**
 * Canonical Estate Registry™ — types aligned to
 * docs/estate/SPARK_ESTATE_CANONICAL_REGISTRY.md (Phase A authority).
 */

/** Markdown source — edit canon doc first, then sync runtime. */
export const CANONICAL_ESTATE_REGISTRY_DOC =
  "docs/estate/SPARK_ESTATE_CANONICAL_REGISTRY.md" as const;

export const CANONICAL_ESTATE_REGISTRY_VERSION = "1.0" as const;

export type CanonicalEstateCategory =
  | "living-place"
  | "destination"
  | "collection"
  | "transition-space";

export type CanonicalArrivalBehavior =
  | "threshold"
  | "ambient-crossfade"
  | "presence-only"
  | "object-invitation"
  | "pass-through";

export type CanonicalConversationStyle =
  | "open-presence"
  | "coaching"
  | "discovery-dialogue"
  | "quiet-capture"
  | "reflective-writing"
  | "creative-collaboration"
  | "research-companion"
  | "decision-facilitation"
  | "archive-browsing"
  | "calm-restoration"
  | "playful-reset"
  | "celebration-ritual"
  | "personal-continuity";

export type CanonicalEstateStatus =
  | "live"
  | "partial"
  | "planned"
  | "future"
  | "needs-asset";

export type CanonicalSuggestionProfile =
  | "quiet"
  | "stressed"
  | "overwhelmed"
  | "celebrate"
  | "learn"
  | "think"
  | "rest"
  | "curious"
  | "reflective"
  | "creative"
  | "uncertain"
  | "orient";

export type CanonicalEstatePlace = {
  /** Stable internal id — never member-visible */
  id: string;
  officialName: string;
  category: CanonicalEstateCategory;
  primaryFeeling: string;
  /** Canonical plate path; null when art TBD */
  backgroundImage: string | null;
  aliases: readonly string[];
  arrivalBehavior: CanonicalArrivalBehavior;
  conversationStyle: CanonicalConversationStyle;
  permanentObjects: readonly string[];
  seasonalObjects: readonly string[];
  interactiveObjects: readonly string[];
  relatedPlaces: readonly string[];
  status: CanonicalEstateStatus;
  /** Registry-only suggestion buckets — never invent places outside this map */
  suggestionProfiles?: readonly CanonicalSuggestionProfile[];
  /** From canon Future Expansion Notes — internal only */
  expansionNotes?: string;
};

export type CanonicalEstatePlaceId = CanonicalEstatePlace["id"];

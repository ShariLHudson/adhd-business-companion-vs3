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

/** How routing treats this place — room, subspace, object, experience, or presence-only. */
export type EstateRouteType =
  | "room"
  | "subspace"
  | "object"
  | "experience"
  | "presence-only";

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
  /** Routing classification — inferred from category when omitted. */
  routeType?: EstateRouteType;
  /** Parent room when this is a subspace, object, or nested experience. */
  parentPlaceId?: string;
  /** Member-facing purpose — why someone comes here. */
  purpose?: string;
  /** Named actions Spark may offer (open, show, sit, reflect…). */
  availableActions?: readonly string[];
  /** Scene view within parent (observatory day-inside, etc.). */
  sceneViewId?: string;
};

export type CanonicalEstatePlaceId = CanonicalEstatePlace["id"];

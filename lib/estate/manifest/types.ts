/**
 * Types for ESTATE_PLACE_MASTER_MANIFEST.json — runtime navigation source of truth.
 * @see docs/estate/ESTATE_PLACE_MASTER_MANIFEST_PROTOCOL.md
 */

export type EstateManifestPlaceRecord = {
  place_id: string;
  legacy_place_id: string;
  estate_room_id: string;
  official_name: string;
  display_name: string;
  category: string;
  parent_area: string;
  primary_image: string | null;
  image_variants: readonly string[];
  video: string | null;
  audio: string | null;
  aliases: readonly string[];
  intent_tags: readonly string[];
  related_places: readonly string[];
  do_not_route_to: readonly string[];
  navigable: boolean;
  status: string;
  route: string;
  merged_into_place_id: string | null;
  media_ownership?: string;
  missing_canonical_image?: string | null;
};

export type EstatePlaceMasterManifest = {
  manifest: string;
  version: string;
  protocol: string;
  generated_at: string;
  places: readonly EstateManifestPlaceRecord[];
  removed_places?: readonly EstateManifestPlaceRecord[];
  navigation_rules?: {
    never_guess_when_ambiguous?: boolean;
    never_route_by_visual_similarity?: boolean;
  };
};

export type EstateManifestPlaceMedia = {
  primaryImage: string | null;
  imageVariants: readonly string[];
  video: string | null;
  audio: string | null;
  backgroundUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
};

export type EstateManifestNavigationOption = {
  legacyPlaceId: string;
  placeId: string;
  officialName: string;
  displayName: string;
};

export type EstateManifestNavigationResult =
  | {
      kind: "navigate";
      legacyPlaceId: string;
      place: EstateManifestPlaceRecord;
      matchedBy: "alias" | "intent";
      matchedPhrase?: string;
    }
  | {
      kind: "suggest";
      options: readonly EstateManifestNavigationOption[];
      intro: string;
      reason: string;
    }
  | { kind: "none" };

export type EstateManifestAmbiguityGroup = {
  id: string;
  patterns: readonly RegExp[];
  intro: string;
  /** Manifest place_ids and/or legacy place ids */
  placeIds: readonly string[];
};

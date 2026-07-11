/**
 * Spark Estate Directory — unified location registry types.
 *
 * One entry per Estate space: identity (canon) + shell + media + connections.
 *
 * @see docs/estate/SPARK_ESTATE_CANONICAL_REGISTRY.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateMenuActionId } from "@/lib/estateMenu/menuConfig";
import type { EstateArrivalAmbienceProfile } from "../estateArrivalExperienceTypes";
import type {
  CanonicalArrivalBehavior,
  CanonicalConversationStyle,
  CanonicalEstateCategory,
  CanonicalEstatePlace,
  CanonicalEstateStatus,
  CanonicalSuggestionProfile,
} from "../canonicalEstateRegistryTypes";

export const ESTATE_DIRECTORY_VERSION = "1.0" as const;

/** UI shell mapping for an Estate location. */
export type EstateLocationShell = {
  section: AppSection | null;
  menuActionId?: EstateMenuActionId;
  /** True when the member can navigate here via goToPlace. */
  navigable: boolean;
};

/** Background and ambience for an Estate location. */
export type EstateLocationMedia = {
  backgroundUrl: string | null;
  backgroundFallbacks: readonly string[];
  ambience?: EstateArrivalAmbienceProfile;
};

/**
 * Master Estate Directory entry — everything the app needs to know about a space.
 * Built once from canonical place records + derived runtime maps.
 */
export type EstateDirectoryEntry = {
  id: string;
  officialName: string;
  category: CanonicalEstateCategory;
  primaryFeeling: string;
  aliases: readonly string[];
  arrivalBehavior: CanonicalArrivalBehavior;
  conversationStyle: CanonicalConversationStyle;
  permanentObjects: readonly string[];
  seasonalObjects: readonly string[];
  interactiveObjects: readonly string[];
  relatedPlaces: readonly string[];
  status: CanonicalEstateStatus;
  suggestionProfiles?: readonly CanonicalSuggestionProfile[];
  expansionNotes?: string;

  shell: EstateLocationShell;
  media: EstateLocationMedia;

  /**
   * Human-readable cues for when Spark might recommend this space.
   * Sourced from legacy room registry + suggestion profiles.
   */
  recommendWhen: readonly string[];

  /** Validated related place ids that exist in the directory. */
  connections: readonly string[];
};

export type EstateDirectoryStats = {
  total: number;
  navigable: number;
  withBackground: number;
  withAmbience: number;
  byCategory: Record<CanonicalEstateCategory, number>;
};

/** Narrow a directory entry back to canonical place shape when needed. */
export function toCanonicalEstatePlace(
  entry: EstateDirectoryEntry,
): CanonicalEstatePlace {
  return {
    id: entry.id,
    officialName: entry.officialName,
    category: entry.category,
    primaryFeeling: entry.primaryFeeling,
    backgroundImage: entry.media.backgroundUrl,
    aliases: entry.aliases,
    arrivalBehavior: entry.arrivalBehavior,
    conversationStyle: entry.conversationStyle,
    permanentObjects: entry.permanentObjects,
    seasonalObjects: entry.seasonalObjects,
    interactiveObjects: entry.interactiveObjects,
    relatedPlaces: entry.relatedPlaces,
    status: entry.status,
    suggestionProfiles: entry.suggestionProfiles,
    expansionNotes: entry.expansionNotes,
  };
}

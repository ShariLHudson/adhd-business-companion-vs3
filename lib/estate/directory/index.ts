/**
 * Spark Estate Directory™ — master location registry.
 *
 * Every background, room, and space: category, image, shell, recommendations,
 * and connections — built from canonical places, not hard-coded per screen.
 *
 * @example
 * ```ts
 * const greenhouse = getEstateDirectoryEntry("greenhouse");
 * goToPlace({ placeId: greenhouse.id });
 * ```
 */

export type {
  EstateDirectoryEntry,
  EstateDirectoryStats,
  EstateLocationMedia,
  EstateLocationShell,
} from "./types";
export { ESTATE_DIRECTORY_VERSION, toCanonicalEstatePlace } from "./types";

export {
  ESTATE_DIRECTORY_MENU_ACTION,
  ESTATE_DIRECTORY_PLACE_SECTION,
  resolveEstateLocationShell,
} from "./shell";

export { resolveEstateLocationMedia } from "./media";

export {
  ESTATE_DIRECTORY,
  estateDirectoryStats,
  getAllEstateDirectoryEntries,
  getEstateDirectoryConnections,
  getEstateDirectoryEntriesByCategory,
  getEstateDirectoryEntriesForProfile,
  getEstateDirectoryEntry,
  getNavigableEstateDirectoryEntries,
  requireEstateDirectoryEntry,
  validateEstateDirectoryIntegrity,
} from "./buildDirectory";

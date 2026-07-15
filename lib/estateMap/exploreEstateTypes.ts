/**
 * Explore Estate destination types — visual directory cards.
 */

export type EstateExploreCategory =
  | "entry"
  | "rooms"
  | "grounds"
  | "outbuildings"
  | "advisory"
  | "reflection"
  | "creative"
  | "work"
  | "other"
  | "peaceful";

export type EstateExploreDestinationType =
  | "route"
  | "overlay"
  | "room"
  | "external";

/** Directory card / destination media kind — never put `.mp4` in `imagePath`. */
export type EstateExploreMediaType = "image" | "video";

export type EstateExploreDestination = {
  id: string;
  name: string;
  aliases?: string[];
  category: EstateExploreCategory;
  /** Poster / still for directory cards (always an image URL). */
  imagePath: string;
  /** Room experience media — video destinations use experience video on open. */
  mediaType: EstateExploreMediaType;
  /** Exact public video path when `mediaType` is `"video"`. */
  videoPath?: string;
  description: string;
  destinationType: EstateExploreDestinationType;
  destinationId: string;
  isAvailable: boolean;
  unavailableMessage?: string;
  /** CSS object-position value */
  focalPosition?: string;
  /** True when the image file is known to exist under public/ */
  imageReady: boolean;
  /** Manifest / directory category label for search */
  purpose?: string;
};

export type EstateExploreCategoryGroup = {
  id: EstateExploreCategory;
  label: string;
  destinations: EstateExploreDestination[];
};

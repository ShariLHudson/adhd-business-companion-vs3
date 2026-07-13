/**
 * Explore Estate destination types — visual directory cards.
 */

export type EstateExploreCategory =
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

export type EstateExploreDestination = {
  id: string;
  name: string;
  aliases?: string[];
  category: EstateExploreCategory;
  imagePath: string;
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

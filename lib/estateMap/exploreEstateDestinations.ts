/**
 * Explore Estate visual destinations — built from the Place Master Manifest.
 * One card per official place; aliases never create duplicates.
 */

import {
  getManifestDocument,
  getPlaceMedia,
} from "@/lib/estate/manifest/estatePlaceMasterManifest";
import type { EstateManifestPlaceRecord } from "@/lib/estate/manifest/types";
import type {
  EstateExploreCategory,
  EstateExploreCategoryGroup,
  EstateExploreDestination,
} from "./exploreEstateTypes";

function listManifestPlaces(): EstateManifestPlaceRecord[] {
  return getManifestDocument().places;
}

/**
 * Never appear as Explore Estate cards and never resolve as Explore navigation.
 * Create / Clear My Mind stay excluded; Creative Studio & Art Studio are catalog rooms.
 */
export const EXPLORE_ESTATE_FORBIDDEN_IDS = [
  "content-generator",
  "create",
  "strategy-studio",
  "clear-my-mind",
  "brain-dump",
] as const;

/**
 * Hide from Explore catalog only (room identity preserved elsewhere).
 * These share a background plate with a kept card — showing both looks like
 * duplicate images in Estate Navigation / Explore Estate.
 */
const EXPLORE_CATALOG_EXCLUDED_IDS = new Set([
  // Removed from Explore Estate (member-facing list)
  "personal-library",
  "stairway-reading-nook",
  "main-staircase",
  "window-seat",
  "momentum-builder",
  "momentum-room",
  "lakeside-verandah",
  "balcony",
  "personal-deck",
  "the-swing-beneath-the-oak",
  "reflection-tree-main",
  "porch-swing",
  "observatory",
  "observatory-day-outside",
  "observatory-day-inside",
  "observatory-night-outside",
  // Same plate as Tea Room
  "coffee-house",
  // Same plate as Seat at Pond
  "peaceful-places",
  // Same plate as Greenhouse
  "garden-bench",
  // Same plate as Possibility House / Treehouse staircase
  "house-possibility-legacy-room",
  "house-possibility-window-nook",
  // Writing Room reuses Music Room plate — keep Music Room in Indoor Spaces
  "writing-room",
]);

/** Exact experience videos for Explore destinations (never used as card imagePath). */
export const EXPLORE_ESTATE_VIDEO_PATHS: Readonly<Record<string, string>> = {
  conservatory: "/Videos/aquarium-room-video.mp4",
  "butterfly-house": "/Videos/butterfly-house-video.mp4",
};

/** Prefer product language over raw manifest display names. */
const DISPLAY_NAME_OVERRIDES: Readonly<Record<string, string>> = {
  "spark-estate": "Spark Estate Entry",
  "house-possibility-outside": "Possibility House",
  "round-table": "Round Table Boardroom",
  "personal-library": "Reading Nook Under Stairway",
  portfolio: "Hall of Achievements",
  "estate-gardens": "Estate Garden",
  "the-swing-beneath-the-oak": "Tree Swing",
  "lakeside-hammock": "Lakeside Hammock",
  "seat-at-pond": "Seat at Pond",
  stables: "Stables",
  "personal-deck": "Personal Deck",
  "summer-terrace": "Swimming Pool",
  "observatory-day-outside": "Observatory Daytime",
  "observatory-day-inside": "Observatory Inside",
  conservatory: "Aquarium Room",
};

/** Route overrides when legacy_place_id differs from live navigation id. */
const DESTINATION_ID_OVERRIDES: Readonly<Record<string, string>> = {
  "momentum-institute": "chamber-of-momentum",
  "round-table": "boardroom",
  "project-room": "goals-projects",
};

/** Prefer a dedicated plate when the manifest primary is a borrowed asset. */
const IMAGE_PATH_OVERRIDES: Readonly<Record<string, string>> = {
  "round-table": "/backgrounds/round-table-boardroom-background.png",
  "destination-gallery": "/backgrounds/destination-gallery-background.png",
  "art-studio": "/backgrounds/art-studio-background.png",
  "project-room": "/backgrounds/project-room.png",
  portfolio: "/backgrounds/hall-of-achievements-room-background.png",
  "game-room": "/backgrounds/game-room-background.png",
  "gallery-of-firsts": "/backgrounds/gallery-background.png",
  "creative-studio": "/backgrounds/creative-studio-background.png",
  "cartographers-studio":
    "/backgrounds/cartoghraphers-studio-background.png",
  "woodland-path": "/backgrounds/woodland-pathway.png",
  "discovery-room": "/backgrounds/writing-room-2-background.png",
  "horizon-point": "/backgrounds/horizon-point-background.png",
  "grand-terrace": "/backgrounds/grand-terrace-background.png",
  "fireside-deck": "/backgrounds/fireside-deck-background.PNG",
  "estate-back-deck": "/backgrounds/estate-back-deck.png",
  breathe: "/backgrounds/breathing-exercise-background.png",
  "back-fireside-deck-rain":
    "/backgrounds/back-fireside-deck-rain-background.png",
  // Distinct from Spark Estate Entry (manifest reused estate entry photo)
  "estate-gardens": "/backgrounds/estate-garden-background.png",
  gardens: "/backgrounds/celebrations-garden-background.png",
  // Dedicated plate (manifest reused writing-room plate)
  "music-room": "/backgrounds/music-room-background.png",
};

/** Known missing public assets (do not invent replacements). */
const KNOWN_MISSING_IMAGE_FILES = new Set([
  "room-discovery-room-background.png",
]);

const CATEGORY_ORDER: EstateExploreCategory[] = [
  "entry",
  "rooms",
  "creative",
  "work",
  "advisory",
  "reflection",
  "peaceful",
  "grounds",
  "outbuildings",
  "other",
];

export const EXPLORE_CATEGORY_LABELS: Record<EstateExploreCategory, string> = {
  entry: "Estate Entry",
  rooms: "Indoor Spaces",
  work: "Work and Business",
  advisory: "Advisory and Decision Spaces",
  reflection: "Reflection and Progress",
  peaceful: "Peaceful Places",
  grounds: "Outside Spaces",
  outbuildings: "Outbuildings",
  creative: "Creative Spaces",
  other: "Other Places",
};

const ID_CATEGORY_OVERRIDES: Readonly<Record<string, EstateExploreCategory>> = {
  "spark-estate": "entry",
  "welcome-home": "entry",
  "round-table": "advisory",
  "momentum-institute": "advisory",
  "chamber-of-momentum": "advisory",
  "decision-compass": "advisory",
  "study-hall": "rooms",
  "personal-library": "rooms",
  "reading-nook": "rooms",
  "tea-room": "rooms",
  "music-room": "rooms",
  "celebration-room": "rooms",
  "art-studio": "rooms",
  "project-room": "rooms",
  portfolio: "reflection",
  "game-room": "rooms",
  "gallery-of-firsts": "rooms",
  "creative-studio": "rooms",
  "cartographers-studio": "rooms",
  "butterfly-house": "rooms",
  conservatory: "rooms",
  "discovery-room": "rooms",
  greenhouse: "grounds",
  "estate-gardens": "grounds",
  "the-swing-beneath-the-oak": "grounds",
  "woodland-path": "grounds",
  "apple-orchard": "grounds",
  "lakeside-hammock": "grounds",
  "summer-terrace": "grounds",
  "seat-at-pond": "grounds",
  stables: "grounds",
  gardens: "grounds",
  "personal-deck": "grounds",
  observatory: "grounds",
  "observatory-day-inside": "grounds",
  "observatory-day-outside": "grounds",
  "observatory-night-outside": "grounds",
  "horizon-point": "grounds",
  "grand-terrace": "grounds",
  "fireside-deck": "grounds",
  "estate-back-deck": "grounds",
  breathe: "grounds",
  "back-fireside-deck-rain": "grounds",
  "porch-swing": "grounds",
  balcony: "grounds",
  "lakeside-verandah": "grounds",
  "garden-bench": "grounds",
  "house-possibility-outside": "outbuildings",
  "house-possibility-discovery-chest": "outbuildings",
  "house-possibility-reflection-desk": "outbuildings",
  "house-possibility-legacy-room": "outbuildings",
  "house-possibility-window-nook": "outbuildings",
  "house-possibility-staircase": "outbuildings",
  "house-possibility-studio": "outbuildings",
  "peaceful-places": "peaceful",
  journal: "reflection",
  "evidence-vault": "reflection",
  "writing-room": "creative",
  "momentum-builder": "work",
  "momentum-room": "work",
  "destination-gallery": "work",
};

function isForbidden(id: string): boolean {
  return (EXPLORE_ESTATE_FORBIDDEN_IDS as readonly string[]).includes(id);
}

function isCatalogExcluded(id: string): boolean {
  return EXPLORE_CATALOG_EXCLUDED_IDS.has(id);
}

function mapManifestCategory(
  place: EstateManifestPlaceRecord,
): EstateExploreCategory {
  if (ID_CATEGORY_OVERRIDES[place.legacy_place_id]) {
    return ID_CATEGORY_OVERRIDES[place.legacy_place_id];
  }
  const parent = (place.parent_area ?? "").toLowerCase();
  if (parent.includes("possibility")) return "outbuildings";
  if (parent.includes("grounds")) return "grounds";

  switch (place.category) {
    case "Welcome":
      return place.legacy_place_id === "spark-estate" ||
        place.legacy_place_id === "welcome-home"
        ? "entry"
        : "rooms";
    case "Living":
    case "Reading":
    case "Learning":
    case "Play":
      return "rooms";
    case "Planning":
    case "Profile":
      return "work";
    case "Creation":
    case "Creative":
      return "rooms";
    case "Reflection":
    case "Archive":
      return "reflection";
    case "Restoration":
    case "Focus":
      return "peaceful";
    case "Nature":
      return "grounds";
    case "Research":
    case "Discovery":
      return "outbuildings";
    case "Destination":
    default:
      return "other";
  }
}

function resolveImagePath(place: EstateManifestPlaceRecord): {
  imagePath: string;
  imageReady: boolean;
} {
  const override = IMAGE_PATH_OVERRIDES[place.legacy_place_id];
  if (override) {
    return { imagePath: override, imageReady: true };
  }

  const media = getPlaceMedia(place.legacy_place_id);
  const imagePath = media.backgroundUrl ?? "";
  const primary = place.primary_image ?? "";
  const imageReady = Boolean(
    imagePath && primary && !KNOWN_MISSING_IMAGE_FILES.has(primary),
  );
  return { imagePath: imagePath || "", imageReady };
}

function resolveVideoPath(placeId: string): string | undefined {
  const override = EXPLORE_ESTATE_VIDEO_PATHS[placeId];
  if (override) return override;
  const media = getPlaceMedia(placeId);
  return media.videoUrl ?? undefined;
}

function focalFor(place: EstateManifestPlaceRecord): string {
  const id = place.legacy_place_id;
  if (id.includes("observatory") && id.includes("outside")) {
    return "center top";
  }
  if (id === "welcome-home" || id === "spark-estate") return "center";
  if (id.includes("deck") || id.includes("terrace") || id.includes("pool")) {
    return "center bottom";
  }
  if (id === "reading-nook" || id.includes("window")) return "center top";
  return "center";
}

function descriptionFor(place: EstateManifestPlaceRecord): string {
  const feeling =
    place.intent_tags?.[0] != null
      ? `A place for ${place.intent_tags[0].replace(/-/g, " ")}.`
      : null;
  if (place.parent_area && place.parent_area !== place.category) {
    return feeling ?? `${place.parent_area} — ${place.display_name}.`;
  }
  return feeling ?? `${place.display_name} on Spark Estate.`;
}

function buildFromManifestPlace(
  place: EstateManifestPlaceRecord,
): EstateExploreDestination | null {
  if (!place.navigable) return null;
  if (isForbidden(place.legacy_place_id)) return null;
  if (isCatalogExcluded(place.legacy_place_id)) return null;

  const { imagePath, imageReady } = resolveImagePath(place);
  const destinationId =
    DESTINATION_ID_OVERRIDES[place.legacy_place_id] ?? place.legacy_place_id;
  if (isForbidden(destinationId)) return null;

  const name =
    DISPLAY_NAME_OVERRIDES[place.legacy_place_id] ??
    place.display_name ??
    place.official_name;

  const aliases = [
    ...new Set(
      [place.official_name, place.display_name, ...(place.aliases ?? [])]
        .map((a) => a.trim())
        .filter((a) => a && a.toLowerCase() !== name.toLowerCase()),
    ),
  ];

  const videoPath = resolveVideoPath(place.legacy_place_id);
  const mediaType = videoPath ? ("video" as const) : ("image" as const);

  return {
    id: place.legacy_place_id,
    name,
    aliases,
    category: mapManifestCategory(place),
    imagePath,
    mediaType,
    videoPath,
    description: descriptionFor(place),
    destinationType: "room",
    destinationId,
    isAvailable: true,
    unavailableMessage: imageReady
      ? undefined
      : "Image being prepared",
    focalPosition: focalFor(place),
    imageReady,
    purpose: place.category,
  };
}

function supplementalDestination(
  dest: Omit<EstateExploreDestination, "mediaType" | "videoPath"> &
    Partial<Pick<EstateExploreDestination, "mediaType" | "videoPath">>,
): EstateExploreDestination {
  return {
    mediaType: "image",
    ...dest,
  };
}

/** Extra approved destinations with assets that are not navigable in the manifest. */
function buildSupplementalDestinations(): EstateExploreDestination[] {
  return [
    supplementalDestination({
      id: "destination-gallery",
      name: "Destination Gallery",
      aliases: ["destination gallery", "the destination gallery"],
      category: "work",
      imagePath: "/backgrounds/destination-gallery-background.png",
      description: "Choose where a prepared piece should go next.",
      destinationType: "room",
      destinationId: "destination-gallery",
      isAvailable: true,
      focalPosition: "center",
      imageReady: true,
      purpose: "Destination",
    }),
    supplementalDestination({
      id: "founder-office",
      name: "Founder Office",
      aliases: [
        "founder office",
        "executive office",
        "my business estate",
        "business estate",
      ],
      category: "work",
      imagePath: "/backgrounds/founder-office-background.png",
      description: "Your business headquarters inside Spark Estate.",
      destinationType: "overlay",
      destinationId: "my-business-estate",
      isAvailable: true,
      focalPosition: "center",
      imageReady: true,
      purpose: "Profile",
    }),
    supplementalDestination({
      id: "project-room",
      name: "Project Room",
      aliases: ["project room", "the project room", "goals and projects"],
      category: "rooms",
      imagePath: "/backgrounds/project-room.png",
      description: "A calm indoor space for the work you are building.",
      destinationType: "room",
      destinationId: "goals-projects",
      isAvailable: true,
      focalPosition: "center",
      imageReady: true,
      purpose: "Planning",
    }),
    supplementalDestination({
      id: "cartographers-studio",
      name: "Cartographer's Studio",
      aliases: [
        "cartographers studio",
        "cartographer's studio",
        "cartographer studio",
        "visual focus",
      ],
      category: "rooms",
      imagePath: "/backgrounds/cartoghraphers-studio-background.png",
      description: "Map ideas and connections in a quiet studio.",
      destinationType: "room",
      destinationId: "cartographers-studio",
      isAvailable: true,
      focalPosition: "center",
      imageReady: true,
      purpose: "Creation",
    }),
    supplementalDestination({
      id: "horizon-point",
      name: "Horizon Point",
      aliases: ["horizon point", "the horizon point"],
      category: "grounds",
      imagePath: "/backgrounds/horizon-point-background.png",
      description: "An outdoor overlook for quiet perspective.",
      destinationType: "room",
      destinationId: "horizon-point",
      isAvailable: true,
      focalPosition: "center",
      imageReady: true,
      purpose: "Nature",
    }),
    supplementalDestination({
      id: "estate-back-deck",
      name: "Estate Back Deck",
      aliases: ["estate back deck", "the estate back deck", "back deck"],
      category: "grounds",
      imagePath: "/backgrounds/estate-back-deck.png",
      description: "An outdoor deck behind the Estate house.",
      destinationType: "room",
      destinationId: "estate-back-deck",
      isAvailable: true,
      focalPosition: "center bottom",
      imageReady: true,
      purpose: "Restoration",
    }),
    supplementalDestination({
      id: "breathe",
      name: "Breathe",
      aliases: ["breathe", "breathing", "breathing exercise"],
      category: "grounds",
      imagePath: "/backgrounds/breathing-exercise-background.png",
      description: "A gentle outdoor space to slow down and breathe.",
      destinationType: "room",
      destinationId: "breathe",
      isAvailable: true,
      focalPosition: "center",
      imageReady: true,
      purpose: "Restoration",
    }),
    supplementalDestination({
      id: "back-fireside-deck-rain",
      name: "Back Fireside Deck Rain",
      aliases: [
        "back fireside deck rain",
        "rainy fireside deck",
        "fireside deck in the rain",
      ],
      category: "grounds",
      imagePath: "/backgrounds/back-fireside-deck-rain-background.png",
      description: "A fireside deck under soft rain.",
      destinationType: "room",
      destinationId: "back-fireside-deck-rain",
      isAvailable: true,
      focalPosition: "center bottom",
      imageReady: true,
      purpose: "Restoration",
    }),
  ];
}

function categoryRank(category: EstateExploreCategory): number {
  const idx = CATEGORY_ORDER.indexOf(category);
  return idx === -1 ? CATEGORY_ORDER.length : idx;
}

function compareExploreDestinationNames(
  a: EstateExploreDestination,
  b: EstateExploreDestination,
): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

/** Category groups stay; cards within each group are A–Z by display name. */
function sortExploreDestinations(
  destinations: EstateExploreDestination[],
): EstateExploreDestination[] {
  return [...destinations].sort((a, b) => {
    const catDiff = categoryRank(a.category) - categoryRank(b.category);
    if (catDiff !== 0) return catDiff;
    return compareExploreDestinationNames(a, b);
  });
}

let cached: EstateExploreDestination[] | null = null;

export function getExploreEstateDestinations(): EstateExploreDestination[] {
  if (cached) return cached;

  const fromManifest = listManifestPlaces()
    .map(buildFromManifestPlace)
    .filter((d): d is EstateExploreDestination => Boolean(d));

  const seen = new Set(fromManifest.map((d) => d.id));
  const supplemental = buildSupplementalDestinations().filter((d) => {
    if (seen.has(d.id)) return false;
    if (fromManifest.some((m) => m.destinationId === d.destinationId)) {
      return false;
    }
    return true;
  });

  cached = sortExploreDestinations([...fromManifest, ...supplemental]);
  return cached;
}

export function getExploreEstateCategoryGroups(
  destinations: EstateExploreDestination[] = getExploreEstateDestinations(),
): EstateExploreCategoryGroup[] {
  const byCategory = new Map<EstateExploreCategory, EstateExploreDestination[]>();
  for (const dest of destinations) {
    const list = byCategory.get(dest.category) ?? [];
    list.push(dest);
    byCategory.set(dest.category, list);
  }

  return CATEGORY_ORDER.filter((id) => (byCategory.get(id)?.length ?? 0) > 0).map(
    (id) => ({
      id,
      label: EXPLORE_CATEGORY_LABELS[id],
      destinations: [...(byCategory.get(id) ?? [])].sort(
        compareExploreDestinationNames,
      ),
    }),
  );
}

/** Member-facing Explore buckets — fewer first decisions than 47 place names. */
export type ExploreMemberBucketId =
  | "calm-restore"
  | "explore-discover"
  | "work-reflect";

export const EXPLORE_MEMBER_BUCKET_LABELS: Record<ExploreMemberBucketId, string> =
  {
    "calm-restore": "Calm and Restore",
    "explore-discover": "Explore and Discover",
    "work-reflect": "Work and Reflect",
  };

const MEMBER_BUCKET_ORDER: ExploreMemberBucketId[] = [
  "calm-restore",
  "explore-discover",
  "work-reflect",
];

function memberBucketForCategory(
  category: EstateExploreCategory,
): ExploreMemberBucketId {
  if (
    category === "peaceful" ||
    category === "reflection" ||
    category === "grounds"
  ) {
    return "calm-restore";
  }
  if (
    category === "work" ||
    category === "advisory" ||
    category === "creative" ||
    category === "rooms"
  ) {
    return "work-reflect";
  }
  return "explore-discover";
}

export type ExploreMemberBucketGroup = {
  id: ExploreMemberBucketId;
  label: string;
  destinations: EstateExploreDestination[];
};

export function getExploreMemberBucketGroups(
  destinations: EstateExploreDestination[] = getExploreEstateDestinations(),
): ExploreMemberBucketGroup[] {
  const byBucket = new Map<ExploreMemberBucketId, EstateExploreDestination[]>();
  for (const dest of destinations) {
    const bucket = memberBucketForCategory(dest.category);
    const list = byBucket.get(bucket) ?? [];
    list.push(dest);
    byBucket.set(bucket, list);
  }
  return MEMBER_BUCKET_ORDER.filter(
    (id) => (byBucket.get(id)?.length ?? 0) > 0,
  ).map((id) => ({
    id,
    label: EXPLORE_MEMBER_BUCKET_LABELS[id],
    destinations: [...(byBucket.get(id) ?? [])].sort(
      compareExploreDestinationNames,
    ),
  }));
}

/** Small featured set for first paint — Browse All Places reveals the rest. */
export function getExploreFeaturedDestinations(
  destinations: EstateExploreDestination[] = getExploreEstateDestinations(),
  perBucket = 3,
): EstateExploreDestination[] {
  const featured: EstateExploreDestination[] = [];
  const seen = new Set<string>();
  for (const group of getExploreMemberBucketGroups(destinations)) {
    for (const dest of group.destinations.slice(0, perBucket)) {
      if (seen.has(dest.id)) continue;
      seen.add(dest.id);
      featured.push(dest);
    }
  }
  return featured;
}

export function searchExploreEstateDestinations(
  query: string,
  destinations: EstateExploreDestination[] = getExploreEstateDestinations(),
): EstateExploreDestination[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return destinations;

  return destinations.filter((dest) => {
    if (dest.name.toLowerCase().includes(q)) return true;
    if (dest.description.toLowerCase().includes(q)) return true;
    if (dest.purpose?.toLowerCase().includes(q)) return true;
    if (dest.category.toLowerCase().includes(q)) return true;
    if (dest.aliases?.some((alias) => alias.toLowerCase().includes(q))) {
      return true;
    }
    return false;
  });
}

export function getExploreEstateDestinationById(
  id: string,
): EstateExploreDestination | undefined {
  return getExploreEstateDestinations().find(
    (d) => d.id === id || d.destinationId === id,
  );
}

/** Test helper — clear memoization. */
export function resetExploreEstateDestinationsCache(): void {
  cached = null;
}

/** Member-facing names that must appear exactly once in Explore Estate. */
export const EXPLORE_ESTATE_REQUIRED_NAMES = [
  "Spark Estate Entry",
  "Welcome Home",
  "Study Hall",
  "Reading Nook Window",
  "Tea Room",
  "Music Room",
  "Celebration Hall",
  "Art Studio",
  "Project Room",
  "Hall of Achievements",
  "Game Room",
  "Gallery",
  "Creative Studio",
  "Cartographer's Studio",
  "Aquarium Room",
  "Butterfly House",
  "Discovery Room",
  "Greenhouse",
  "Estate Garden",
  "Woodland Path",
  "Apple Orchard",
  "Lakeside Hammock",
  "Swimming Pool",
  "Seat at Pond",
  "Stables",
  "Celebration Garden",
  "Horizon Point",
  "Grand Terrace",
  "Fireside Deck",
  "Estate Back Deck",
  "Breathe",
  "Back Fireside Deck Rain",
] as const;

/** Background / poster paths that Explore Estate must resolve for listed rooms. */
export const EXPLORE_ESTATE_REQUIRED_BACKGROUNDS: Readonly<
  Record<string, string>
> = {
  "art-studio": "/backgrounds/art-studio-background.png",
  "project-room": "/backgrounds/project-room.png",
  portfolio: "/backgrounds/hall-of-achievements-room-background.png",
  "game-room": "/backgrounds/game-room-background.png",
  "gallery-of-firsts": "/backgrounds/gallery-background.png",
  "creative-studio": "/backgrounds/creative-studio-background.png",
  "cartographers-studio":
    "/backgrounds/cartoghraphers-studio-background.png",
  "estate-gardens": "/backgrounds/estate-garden-background.png",
  gardens: "/backgrounds/celebrations-garden-background.png",
  "music-room": "/backgrounds/music-room-background.png",
  "woodland-path": "/backgrounds/woodland-pathway.png",
  "discovery-room": "/backgrounds/writing-room-2-background.png",
  "horizon-point": "/backgrounds/horizon-point-background.png",
  "grand-terrace": "/backgrounds/grand-terrace-background.png",
  "fireside-deck": "/backgrounds/fireside-deck-background.PNG",
  "estate-back-deck": "/backgrounds/estate-back-deck.png",
  breathe: "/backgrounds/breathing-exercise-background.png",
  "back-fireside-deck-rain":
    "/backgrounds/back-fireside-deck-rain-background.png",
};

/** Experience video paths that Explore Estate video destinations must resolve. */
export const EXPLORE_ESTATE_REQUIRED_VIDEOS: Readonly<Record<string, string>> = {
  conservatory: "/Videos/aquarium-room-video.mp4",
  "butterfly-house": "/Videos/butterfly-house-video.mp4",
};

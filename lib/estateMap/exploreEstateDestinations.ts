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

/** Never appear as Explore Estate cards. */
export const EXPLORE_ESTATE_FORBIDDEN_IDS = [
  "creative-studio",
  "content-generator",
  "create",
  "art-studio",
  "strategy-studio",
  "clear-my-mind",
  "brain-dump",
] as const;

/** Prefer product language over raw manifest display names. */
const DISPLAY_NAME_OVERRIDES: Readonly<Record<string, string>> = {
  "house-possibility-outside": "Possibility House",
  "round-table": "Round Table Boardroom",
  "fireside-deck": "Back Deck",
  "personal-deck": "Private Deck",
  "summer-terrace": "Swimming Pool",
  conservatory: "Aquarium Room",
  "butterfly-house": "Butterfly Conservatory",
};

/** Route overrides when legacy_place_id differs from live navigation id. */
const DESTINATION_ID_OVERRIDES: Readonly<Record<string, string>> = {
  "momentum-institute": "chamber-of-momentum",
  "round-table": "boardroom",
};

/** Prefer a dedicated plate when the manifest primary is a borrowed asset. */
const IMAGE_PATH_OVERRIDES: Readonly<Record<string, string>> = {
  "round-table": "/backgrounds/round-table-boardroom-background.png",
  "destination-gallery": "/backgrounds/destination-gallery-background.png",
};

/** Known missing public assets (do not invent replacements). */
const KNOWN_MISSING_IMAGE_FILES = new Set([
  "room-discovery-room-background.png",
  "destination-gallery.png",
]);

const CATEGORY_ORDER: EstateExploreCategory[] = [
  "rooms",
  "work",
  "advisory",
  "reflection",
  "peaceful",
  "grounds",
  "outbuildings",
  "creative",
  "other",
];

export const EXPLORE_CATEGORY_LABELS: Record<EstateExploreCategory, string> = {
  rooms: "Rooms",
  work: "Work and Business",
  advisory: "Advisory and Decision Spaces",
  reflection: "Reflection and Progress",
  peaceful: "Peaceful Places",
  grounds: "Grounds and Outdoor Spaces",
  outbuildings: "Outbuildings",
  creative: "Creative Spaces",
  other: "Other Places",
};

const ID_CATEGORY_OVERRIDES: Readonly<Record<string, EstateExploreCategory>> = {
  "round-table": "advisory",
  "momentum-institute": "advisory",
  "chamber-of-momentum": "advisory",
  "decision-compass": "advisory",
  stables: "outbuildings",
  greenhouse: "outbuildings",
  observatory: "outbuildings",
  "observatory-day-inside": "outbuildings",
  "observatory-day-outside": "outbuildings",
  "observatory-night-outside": "outbuildings",
  "house-possibility-outside": "outbuildings",
  "house-possibility-discovery-chest": "outbuildings",
  "house-possibility-reflection-desk": "outbuildings",
  "house-possibility-legacy-room": "outbuildings",
  "house-possibility-window-nook": "outbuildings",
  "house-possibility-staircase": "outbuildings",
  "house-possibility-studio": "outbuildings",
  "garden-bench": "grounds",
  "peaceful-places": "peaceful",
  "seat-at-pond": "peaceful",
  "music-room": "peaceful",
  "fireside-deck": "peaceful",
  "personal-deck": "peaceful",
  "grand-terrace": "peaceful",
  "summer-terrace": "peaceful",
  "lakeside-hammock": "peaceful",
  "lakeside-verandah": "peaceful",
  "porch-swing": "peaceful",
  balcony: "peaceful",
  journal: "reflection",
  "evidence-vault": "reflection",
  portfolio: "reflection",
  "celebration-room": "reflection",
  gardens: "reflection",
  "apple-orchard": "grounds",
  "estate-gardens": "grounds",
  "woodland-path": "grounds",
  "the-swing-beneath-the-oak": "grounds",
  "reflection-tree-main": "grounds",
  "spark-estate": "grounds",
  "writing-room": "creative",
  "momentum-builder": "work",
  "momentum-room": "work",
  "study-hall": "work",
  "destination-gallery": "work",
};

function isForbidden(id: string): boolean {
  return (EXPLORE_ESTATE_FORBIDDEN_IDS as readonly string[]).includes(id);
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
    case "Living":
    case "Reading":
    case "Learning":
      return "rooms";
    case "Planning":
    case "Profile":
      return "work";
    case "Creation":
    case "Creative":
      return "creative";
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
    case "Play":
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

  return {
    id: place.legacy_place_id,
    name,
    aliases,
    category: mapManifestCategory(place),
    imagePath,
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

/** Extra approved destinations with assets that are not navigable in the manifest. */
function buildSupplementalDestinations(): EstateExploreDestination[] {
  const extras: EstateExploreDestination[] = [
    {
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
    },
    {
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
    },
  ];
  return extras;
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

  cached = [...fromManifest, ...supplemental].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
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
      destinations: byCategory.get(id) ?? [],
    }),
  );
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

import type { KinseyPose, WildlifeSpecies } from "@/lib/livingLifeEngine/types";
import type {
  RoomObject,
  RoomObjectPlacement,
} from "@/lib/companionEnvironmentIntelligence/types";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";

export type EverydayLifeZone =
  | "living_room"
  | "kitchen"
  | "creative_studio"
  | "garden"
  | "planning_table"
  | "reading_nook"
  | "porch";

export type EverydayMoment = {
  id: string;
  zone: EverydayLifeZone;
  /** Design reference — never shown to guest. */
  detail: string;
  cause: string;
  objects?: RoomObject[];
  kinsey?: KinseyPose;
  wildlife?: WildlifeSpecies;
  seasons?: WelcomeSeason[];
  times?: WelcomeTimeOfDay[];
  /** Loved, not staged — basket not put away, etc. */
  imperfect?: boolean;
};

function obj(
  kind: RoomObject["kind"],
  placement: RoomObjectPlacement,
  label?: string,
): RoomObject {
  return label ? { kind, placement, label } : { kind, placement };
}

/**
 * Ordinary moments — discovered over months, never announced.
 * @see docs/companion-homestead/SHARIS_EVERYDAY_LIFE.md
 */
export const EVERYDAY_LIFE_CATALOG: readonly EverydayMoment[] = [
  // Living room
  {
    id: "lr-crochet-chair",
    zone: "living_room",
    detail: "Crochet project draped over chair arm",
    cause: "quiet-afternoon-craft",
    objects: [obj("blanket", "floor", "crochet on chair")],
    imperfect: true,
  },
  {
    id: "lr-second-mug",
    zone: "living_room",
    detail: "Second mug suggests someone stopped by earlier",
    cause: "morning-visit-trace",
    objects: [obj("coffee", "table"), obj("tea-set", "table")],
    times: ["morning", "afternoon"],
  },
  {
    id: "lr-blanket-unfolded",
    zone: "living_room",
    detail: "Blanket not quite folded",
    cause: "lived-in-comfort",
    objects: [obj("blanket", "floor")],
    imperfect: true,
  },
  {
    id: "lr-window-open",
    zone: "living_room",
    detail: "Window open — breeze",
    cause: "mild-day-air",
    seasons: ["spring", "summer"],
    times: ["morning", "afternoon"],
  },
  {
    id: "lr-puzzle-side",
    zone: "living_room",
    detail: "Half-finished puzzle on side table",
    cause: "evening-puzzle-pause",
    objects: [obj("notebook", "table", "puzzle pieces")],
    imperfect: true,
    times: ["evening", "night"],
  },
  {
    id: "lr-mystery-novel",
    zone: "living_room",
    detail: "Mystery novel with bookmark",
    cause: "reading-in-progress",
    objects: [obj("book", "table", "mystery — ch. 12")],
  },
  {
    id: "lr-bird-guide",
    zone: "living_room",
    detail: "Bird guide on windowsill",
    cause: "feeder-watching-season",
    objects: [obj("book", "window", "bird guide")],
    seasons: ["spring", "summer", "autumn"],
  },
  // Kitchen
  {
    id: "kit-coffee-nook",
    zone: "kitchen",
    detail: "Coffee mug half full in breakfast nook",
    cause: "morning-coffee-pause",
    objects: [obj("coffee", "table")],
    times: ["morning", "afternoon"],
  },
  {
    id: "kit-banana-bread",
    zone: "kitchen",
    detail: "Banana bread cooled — kitchen still cozy",
    cause: "baking-earlier",
    objects: [obj("fruit", "table", "banana bread")],
    times: ["morning", "afternoon"],
  },
  {
    id: "kit-herbs-watered",
    zone: "kitchen",
    detail: "Herb wall freshly watered",
    cause: "herb-wall-morning",
    objects: [obj("tulips", "window", "kitchen herbs")],
    times: ["morning"],
    seasons: ["spring", "summer"],
  },
  {
    id: "kit-mug-table",
    zone: "kitchen",
    detail: "Mug still on table from earlier",
    cause: "unfinished-coffee",
    objects: [obj("coffee", "table")],
    imperfect: true,
  },
  {
    id: "kit-sticky-basket",
    zone: "kitchen",
    detail: "Basket not yet put away",
    cause: "real-kitchen-morning",
    objects: [obj("keepsake", "floor", "bread basket")],
    imperfect: true,
    times: ["morning"],
  },
  // Planning table
  {
    id: "plan-journal-open",
    zone: "planning_table",
    detail: "Journal open on Planning Table",
    cause: "planning-paused",
    objects: [obj("journal", "table")],
  },
  {
    id: "plan-sticky-notes",
    zone: "planning_table",
    detail: "Notebook with sticky notes sticking out",
    cause: "ideas-in-progress",
    objects: [obj("notebook", "table", "sticky notes")],
    imperfect: true,
  },
  {
    id: "plan-pen-caps",
    zone: "planning_table",
    detail: "Pens left uncapped from quick notes",
    cause: "interrupted-planning",
    objects: [obj("notebook", "table", "quick notes")],
    imperfect: true,
  },
  // Creative studio
  {
    id: "studio-fabric-folded",
    zone: "creative_studio",
    detail: "Fabric folded on table — project mid-stream",
    cause: "fabric-project",
    objects: [obj("notebook", "table", "fabric")],
    imperfect: true,
  },
  {
    id: "studio-beads-sorted",
    zone: "creative_studio",
    detail: "Beads sorted in trays",
    cause: "jewelry-afternoon",
    objects: [obj("keepsake", "table", "bead trays")],
  },
  {
    id: "studio-pencils-out",
    zone: "creative_studio",
    detail: "Colored pencils left out",
    cause: "coloring-break",
    objects: [obj("notebook", "table", "colored pencils")],
    imperfect: true,
  },
  {
    id: "studio-card-half",
    zone: "creative_studio",
    detail: "Card half completed",
    cause: "card-making-pause",
    objects: [obj("postcard", "table", "half-finished card")],
    imperfect: true,
  },
  {
    id: "studio-journal-cover",
    zone: "creative_studio",
    detail: "Journal cover drying",
    cause: "craft-drying",
    objects: [obj("journal", "table", "drying cover")],
    imperfect: true,
  },
  {
    id: "studio-ideas-notebook",
    zone: "creative_studio",
    detail: "Notebook of ideas left open",
    cause: "creative-brainstorm",
    objects: [obj("notebook", "table", "ideas")],
  },
  // Reading nook
  {
    id: "nook-library-book",
    zone: "reading_nook",
    detail: "Library book with bookmark halfway",
    cause: "reading-nook-pause",
    objects: [obj("book", "table", "library book")],
  },
  {
    id: "nook-reading-glasses",
    zone: "reading_nook",
    detail: "Book open with reading glasses on top",
    cause: "interrupted-reading",
    objects: [obj("book", "table", "with glasses")],
  },
  {
    id: "nook-tea-cold",
    zone: "reading_nook",
    detail: "Tea cup beside reading chair",
    cause: "reading-with-tea",
    objects: [obj("tea-set", "table")],
    times: ["afternoon", "evening"],
  },
  // Garden / porch
  {
    id: "garden-gloves-door",
    zone: "garden",
    detail: "Gardening gloves near back door",
    cause: "just-from-garden",
    objects: [obj("keepsake", "floor", "garden gloves")],
    seasons: ["spring", "summer", "autumn"],
  },
  {
    id: "garden-flowers-picked",
    zone: "garden",
    detail: "Fresh flowers picked from garden",
    cause: "morning-garden-walk",
    objects: [obj("flowers", "table")],
    seasons: ["spring", "summer"],
    times: ["morning", "afternoon"],
  },
  {
    id: "garden-tomatoes-summer",
    zone: "garden",
    detail: "Tomatoes on counter from garden",
    cause: "summer-harvest",
    objects: [obj("fruit", "table", "tomatoes")],
    seasons: ["summer"],
  },
  {
    id: "garden-pumpkins-autumn",
    zone: "garden",
    detail: "Pumpkins from garden",
    cause: "autumn-harvest",
    objects: [obj("pumpkins", "window")],
    seasons: ["autumn"],
  },
  {
    id: "porch-rocking-afternoon",
    zone: "porch",
    detail: "Porch rocker recently used",
    cause: "afternoon-porch-sit",
    objects: [obj("blanket", "floor", "porch throw")],
    times: ["afternoon", "evening"],
    seasons: ["spring", "summer", "autumn"],
  },
  // Kinsey & wildlife (environmental, not announced)
  {
    id: "kinsey-sunny-nap",
    zone: "living_room",
    detail: "Kinsey asleep in sunny spot",
    cause: "kinsey-afternoon-nap",
    kinsey: "sleeping-beside-chair",
    times: ["afternoon"],
  },
  {
    id: "wild-hummingbird-pause",
    zone: "porch",
    detail: "Hummingbird pauses at feeder",
    cause: "feeder-visit",
    wildlife: "hummingbird",
    seasons: ["summer"],
    times: ["morning", "afternoon"],
  },
  {
    id: "wild-cardinal-feeder",
    zone: "garden",
    detail: "Cardinal at feeder",
    cause: "winter-feeder",
    wildlife: "cardinal",
    seasons: ["winter", "autumn"],
  },
  {
    id: "wild-goldfinch-summer",
    zone: "garden",
    detail: "Goldfinches at feeder",
    cause: "summer-feeder",
    wildlife: "goldfinch",
    seasons: ["summer"],
  },
  // Craft week sitting (ADHD authenticity)
  {
    id: "lr-craft-week",
    zone: "living_room",
    detail: "Craft project sitting for a week",
    cause: "project-paused-not-failed",
    objects: [obj("blanket", "floor", "crochet basket")],
    imperfect: true,
  },
  {
    id: "studio-week-project",
    zone: "creative_studio",
    detail: "Project untouched for days — still loved",
    cause: "creative-hiatus",
    objects: [obj("notebook", "table", "paused project")],
    imperfect: true,
  },
  {
    id: "lr-aquarium-new-coral",
    zone: "living_room",
    detail: "Aquarium has something new to notice",
    cause: "aquarium-tended-recently",
    objects: [obj("keepsake", "table", "reef tank")],
  },
  {
    id: "kit-cozy-evening",
    zone: "kitchen",
    detail: "Kitchen lamp warm — evening stillness",
    cause: "evening-kitchen-quiet",
    times: ["evening", "night"],
  },
  {
    id: "lr-kinsey-chair",
    zone: "living_room",
    detail: "Kinsey claimed the favorite chair",
    cause: "kinsey-chair",
    kinsey: "curled-fireplace",
  },
  {
    id: "nook-week-book",
    zone: "reading_nook",
    detail: "Different mystery on the table",
    cause: "new-library-pickup",
    objects: [obj("book", "table", "new mystery")],
  },
  {
    id: "plan-coffee-ring",
    zone: "planning_table",
    detail: "Coffee ring on planning table — lived in",
    cause: "real-planning-session",
    objects: [obj("coffee", "table"), obj("journal", "table")],
    imperfect: true,
    times: ["morning"],
  },
];

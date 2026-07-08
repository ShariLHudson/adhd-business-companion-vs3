import fs from "fs";
import path from "path";

const rooms = [
  { id: "000", placeId: "welcome-home", name: "Welcome Home™", parent: "Main House", type: "Welcome", route: "welcome-room", img: "038", file: "welcome-home-background.png", status: "Live" },
  { id: "001", placeId: "spark-estate", name: "Spark Estate™", parent: "Grounds", type: "Welcome", route: "home", img: "025", file: "spark-estate-photo-background.png", status: "Live" },
  { id: "002", placeId: "my-estate", name: "My Estate™", parent: "Profile", type: "Profile", route: null, img: "025", file: "spark-estate-photo-background.png", borrow: true, status: "Live" },
  { id: "003", placeId: "conservatory", name: "Aquarium Room™", parent: "Nature Spaces", type: "Living", route: "home", img: "001", file: "aquarium-room-background.png", vid: "001", video: "aquarium-room-video.mp4", status: "Live" },
  { id: "004", semanticId: "ESTATE-ROOM-Butterfly-House", placeId: "butterfly-house", name: "Butterfly House™", parent: "Nature Spaces", type: "Focus", route: "focus", img: "002", file: "butterfly-house-background.png", vid: "002", video: "butterfly-house-video.mp4", status: "Live" },
  { id: "005", semanticId: "ESTATE-ROOM-Sunroom", placeId: "sunroom", name: "Sunroom™", parent: "Main House", type: "Welcome", route: "welcome-room", img: "027", file: "sunroom-background.png", status: "Live" },
  { id: "006", placeId: "clear-my-mind", name: "Clear My Mind™", parent: "Main House", type: "Destination", route: "brain-dump", img: "027", file: "sunroom-background.png", borrow: true, status: "Live" },
  { id: "007", placeId: "tea-room", name: "Tea Room™", parent: "Main House", type: "Restoration", route: "focus-audio", img: "028", file: "tea-room-background.webp", status: "Draft" },
  { id: "008", placeId: "coffee-house", name: "Coffee House™", parent: "Main House", type: "Restoration", route: "focus-audio", img: "028", file: "tea-room-background.webp", borrow: true, missing: "estate-room-coffee-house-main.png", status: "Draft" },
  { id: "009", semanticId: "ESTATE-ROOM-Greenhouse", placeId: "greenhouse", name: "Greenhouse™", parent: "Nature Spaces", type: "Living", route: "growth-greenhouse", img: "008", file: "greenhouse-background.png", status: "Live" },
  { id: "010", semanticId: "ESTATE-ROOM-Apple-Orchard", placeId: "apple-orchard", name: "Apple Orchard™", parent: "Nature Spaces", type: "Nature", route: "home", file: "space-reflection-tree-swing-background.png", missing: "estate-room-apple-orchard-main.png", status: "Live" },
  { id: "011", placeId: "gardens", name: "Celebration Garden™", parent: "Grounds", type: "Nature", route: "home", file: "space-reflection-tree-swing-background.png", missing: "space-celebration-garden-background.png", status: "Live" },
  { id: "012", semanticId: "ESTATE-ROOM-Estate-Gardens", placeId: "estate-gardens", name: "Estate Gardens™", parent: "Grounds", type: "Nature", route: "home", file: "spark-estate-photo-background.png", missing: "place-estate-gardens-background.png", status: "Live" },
  { id: "013", placeId: "garden-bench", name: "Garden Bench™", parent: "Grounds", type: "Nature", route: "home", img: "008", file: "greenhouse-background.png", borrow: true, status: "Draft" },
  { id: "014", placeId: "estate-kitchen", name: "Estate Kitchen™", parent: "Main House", type: "Living", route: "home", img: "010", file: "kitchen-background.png", status: "Live" },
  { id: "015", placeId: "dining-room", name: "Dining Room™", parent: "Main House", type: "Living", route: "home", img: "017", file: "room-dining-room-background.png", status: "Live" },
  { id: "016", placeId: "grand-terrace", name: "Grand Terrace™", parent: "Grounds", type: "Restoration", route: "home", img: "007", file: "grand-terrace-background.png", status: "Live" },
  { id: "017", placeId: "lakeside-hammock", name: "Lakeside Hammock™", parent: "Grounds", type: "Restoration", route: "home", img: "035", file: "water-lakeside-hammock-background.png", status: "Live" },
  { id: "018", placeId: "lakeside-verandah", name: "Lakeside Verandah™", parent: "Grounds", type: "Restoration", route: "home", img: "007", file: "grand-terrace-background.png", borrow: true, status: "Draft" },
  { id: "019", placeId: "fireside-deck", name: "Fireside Deck™", parent: "Grounds", type: "Restoration", route: "home", img: "004", file: "fireside-deck-background.PNG", status: "Live" },
  { id: "020", placeId: "back-deck", name: "Back Deck™", parent: "Grounds", type: "Restoration", route: "home", img: "004", file: "fireside-deck-background.PNG", borrow: true, status: "Removed", removed: true, mergedInto: "fireside-deck" },
  { id: "021", placeId: "porch-swing", name: "Porch Swing™", parent: "Grounds", type: "Restoration", route: "home", img: "004", file: "fireside-deck-background.PNG", borrow: true, status: "Draft" },
  { id: "022", placeId: "the-swing-beneath-the-oak", name: "The Swing Beneath the Oak™", parent: "Grounds", type: "Nature", route: "home", img: "023", file: "space-reflection-tree-swing-background.png", status: "Draft" },
  { id: "023", placeId: "reading-nook", name: "Reading Nook™", parent: "Reading Spaces", type: "Reflection", route: "home", img: "015", file: "reading-nook-window background.png", status: "Live" },
  { id: "024", placeId: "stairway-reading-nook", name: "Stairway Reading Nook™", parent: "Reading Spaces", type: "Reflection", route: "home", img: "014", file: "reading-nook-under-stairway-background.png", status: "Live" },
  { id: "025", placeId: "personal-library", name: "Personal Library™", parent: "Reading Spaces", type: "Reading", route: "growth-library", img: null, file: null, missing: "estate-room-personal-library.png", borrowImg: "014", borrowFile: "reading-nook-under-stairway-background.png", status: "Live" },
  { id: "026", placeId: "window-seat", name: "Window Seat™", parent: "Reading Spaces", type: "Reflection", route: "home", img: "015", file: "reading-nook-window background.png", status: "Draft" },
  { id: "027", placeId: "library", name: "The Library™", parent: "Reading Spaces", type: "Learning", route: "growth-library", img: "019", file: "room-library-estate-background.png", status: "Live" },
  { id: "028", placeId: "momentum-institute", name: "Momentum Institute™", parent: "Institute", type: "Learning", route: "momentum-institute", img: "024", file: "spark-chamber-of-momentum-background.png", status: "Live" },
  { id: "029", placeId: "discovery-room", name: "Discovery Room™", parent: "Main House", type: "Research", route: "home", img: "018", file: "room-discovery-room-background.png", status: "Live" },
  { id: "030", placeId: "creative-studio", name: "Creative Studio™", parent: "Possibility House", type: "Creation", route: "content-generator", img: "003", file: "creative-studio-background.png", status: "Live" },
  { id: "031", placeId: "observatory", name: "Observatory™", parent: "Research", type: "Research", route: "grow-observatory", img: "012", file: "observatory-daytime-outside-background.png", altImages: ["011", "013"], status: "Live" },
  { id: "032", placeId: "study-hall", name: "Study Hall™", parent: "Institute", type: "Learning", route: "momentum-institute", img: "026", file: "study-hall-background.png", status: "Live" },
  { id: "033", placeId: "round-table", name: "Round Table™", parent: "Planning", type: "Planning", route: "projects", img: "017", file: "room-dining-room-background.png", borrow: true, status: "Draft" },
  { id: "034", placeId: "art-studio", name: "Art Studio™", parent: "Creation", type: "Creation", route: "content-generator", img: "003", file: "creative-studio-background.png", borrow: true, status: "Draft" },
  { id: "035", placeId: "gallery-of-firsts", name: "Hall of Accomplishments™", parent: "Archive", type: "Archive", route: "growth-portfolio", img: "006", file: "gallery-background.png", status: "Live" },
  { id: "036", placeId: "evidence-vault", name: "Evidence Vault™", parent: "Archive", type: "Archive", route: "evidence-bank", img: "009", file: "hall-of-achievements-room-background.png", status: "Draft" },
  { id: "037", placeId: "portfolio", name: "Portfolio™", parent: "Archive", type: "Archive", route: "growth-portfolio", img: "009", file: "hall-of-achievements-room-background.png", borrow: true, status: "Live" },
  { id: "038", placeId: "celebration-room", name: "Celebration Hall™", parent: "Archive", type: "Archive", route: "growth-reports", img: "016", file: "room-celebration-hall-background.png", status: "Live" },
  { id: "039", placeId: "goals-projects", name: "Goals & Projects™", parent: "Planning", type: "Planning", route: "projects", img: "017", file: "room-dining-room-background.png", borrow: true, status: "Live" },
  { id: "040", placeId: "game-room", name: "Game Room™", parent: "Play", type: "Play", route: "quick-recharge", img: "024", file: "spark-chamber-of-momentum-background.png", borrow: true, status: "Live" },
  { id: "041", placeId: "momentum-room", name: "Momentum Room™", parent: "Institute", type: "Planning", route: "momentum-institute", img: "024", file: "spark-chamber-of-momentum-background.png", borrow: true, status: "Draft" },
  { id: "042", placeId: "stables", name: "The Stables™", parent: "Grounds", type: "Reflection", route: "stables", img: "025", file: "spark-estate-photo-background.png", borrow: true, missing: "estate-room-stables-main.png", status: "Live" },
  { id: "043", placeId: "momentum-builder", name: "Momentum Builder™", parent: "Planning", type: "Planning", route: "momentum-builder", img: "026", file: "study-hall-background.png", borrow: true, status: "Draft" },
  { id: "044", placeId: "house-possibility-outside", name: "Treehouse™", parent: "Possibility House", type: "Discovery", route: "home", img: "031", file: "treehouse-possibility-house-outside-background.png", status: "Live" },
  { id: "045", placeId: "house-possibility-reflection-desk", name: "Reflection Desk", parent: "Possibility House", type: "Reflection", route: "home", img: "032", file: "treehouse-possibility-reflection-desk-background.png", status: "Draft" },
  { id: "046", placeId: "house-possibility-staircase", name: "Possibility Staircase", parent: "Possibility House", type: "Reflection", route: "home", img: "033", file: "treehouse-possibility-staircase-window-reading-nook-background.png", status: "Draft" },
  { id: "047", placeId: "house-possibility-window-nook", name: "Possibility Window Nook", parent: "Possibility House", type: "Reflection", route: "home", img: "033", file: "treehouse-possibility-staircase-window-reading-nook-background.png", borrow: true, status: "Draft" },
  { id: "048", placeId: "house-possibility-studio", name: "Possibility Studio", parent: "Possibility House", type: "Creation", route: "home", img: "034", file: "treehouse-possibility-studio.png", status: "Draft" },
  { id: "049", placeId: "house-possibility-discovery-chest", name: "Discovery Chest", parent: "Possibility House", type: "Archive", route: "home", img: "030", file: "treehouse-possibility-discovery-chest-background.png", status: "Draft" },
  { id: "050", placeId: "house-possibility-legacy-room", name: "Legacy Room", parent: "Possibility House", type: "Archive", route: "home", img: "031", file: "treehouse-possibility-house-outside-background.png", borrow: true, status: "Draft" },
  { id: "051", placeId: "main-staircase", name: "Main Staircase™", parent: "Main House", type: "Reflection", route: "home", img: "014", file: "reading-nook-under-stairway-background.png", borrow: true, status: "Draft" },
  { id: "052", placeId: "balcony", name: "Private Balcony™", parent: "Main House", type: "Restoration", route: "home", img: "007", file: "grand-terrace-background.png", borrow: true, status: "Draft" },
  { id: "053", placeId: "woodland-path", name: "Woodland Path™", parent: "Grounds", type: "Nature", route: "home", img: "023", file: "space-reflection-tree-swing-background.png", borrow: true, status: "Draft" },
  { id: "054", placeId: "growth-profile", name: "Growth Profile™", parent: "Profile", type: "Profile", route: null, img: "008", file: "greenhouse-background.png", borrow: true, status: "Live" },
  { id: "055", placeId: "reflection-tree-main", name: "Reflection Tree", parent: "Grounds", type: "Nature", route: "home", img: "023", file: "space-reflection-tree-swing-background.png", borrow: true, status: "Draft" },
  { id: "056", placeId: "seat-at-pond", name: "Seat at Pond / Dock™", parent: "Grounds", type: "Restoration", route: "home", img: "036", file: "water-seat-at-pond-background.png", status: "Live" },
  { id: "057", placeId: "reflection-pond", name: "Reflection Pond™", parent: "Grounds", type: "Nature", route: "home", img: "036", file: "water-seat-at-pond-background.png", borrow: true, status: "Removed", removed: true, mergedInto: "seat-at-pond" },
  { id: "058", placeId: "peaceful-places", name: "Peaceful Places™", parent: "Restoration", type: "Restoration", route: "focus-audio", img: "036", file: "water-seat-at-pond-background.png", borrow: true, status: "Draft" },
  { id: "059", placeId: "summer-terrace", name: "Summer Terrace™", parent: "Grounds", type: "Restoration", route: "home", img: "037", file: "water-swimming-pool-private-background.png", status: "Live" },
  { id: "060", placeId: "journal", name: "Journal Gazebo™", parent: "Grounds", type: "Reflection", route: "growth-journal", img: "039", file: "welcome-to-the-journal-gazebo.png", status: "Live" },
  { id: "061", placeId: "decision-compass", name: "Decision Compass™", parent: "Planning", type: "Planning", route: "decision-compass", img: "040", file: "writing-room-background.png", status: "Live" },
  { id: "062", placeId: "music-room", name: "Music Room™", parent: "Audio", type: "Restoration", route: "focus-audio", img: "040", file: "writing-room-background.png", borrow: true, missing: "estate-room-music-room-main.png", status: "Live" },
];

const avoidConfusionWith = {
  conservatory: ["Sunroom", "Greenhouse", "Ocean Conservatory"],
  sunroom: ["Sunroom", "Greenhouse"],
  "butterfly-house": ["Butterfly House", "Greenhouse"],
  greenhouse: ["Estate Gardens", "Apple Orchard", "Celebration Garden"],
  "estate-gardens": ["Greenhouse"],
  "apple-orchard": ["Greenhouse"],
  gardens: ["Celebration Sounds", "Greenhouse"],
  "fireside-deck": ["Personal Deck", "Back Deck"],
};

const aliasMap = {
  "personal-library": ["personal library", "the personal library", "my library", "private library", "reading room"],
  sunroom: ["sun room", "sunny room", "glass room", "morning room"],
  "butterfly-house": ["butterfly house", "butterfly conservatory", "butterfly garden"],
  conservatory: ["aquarium", "the aquarium", "aquarium room", "the aquarium room", "ocean conservatory", "the ocean conservatory", "ocean aquarium", "the ocean aquarium"],
  library: ["library", "the library", "estate library", "the estate library", "achievement library"],
  "stairway-reading-nook": [
    "stairway reading nook",
    "the stairway reading nook",
    "reading nook under the stairs",
    "nook under the stairs",
    "under the stairs",
  ],
  "reading-nook": ["reading nook", "the reading nook", "arched window nook", "window reading nook"],
  "seat-at-pond": [
    "reflection pond",
    "pond seat",
    "quiet pond",
    "pond dock",
    "peaceful water",
    "seat at the pond",
    "seat at pond",
    "pond",
    "the pond",
  ],
  "fireside-deck": ["back deck", "the back deck"],
  "estate-gardens": ["estate gardens", "the estate gardens", "estate garden", "the estate garden"],
  gardens: ["celebration garden", "the celebration garden"],
  "apple-orchard": ["apple orchard", "the apple orchard", "orchard", "the orchard"],
  "house-possibility-outside": ["treehouse", "the treehouse", "possibility house", "the possibility house"],
};

const disallowed = {
  "butterfly-house": ["sunroom", "sun room", "sunny room", "glass room", "morning room", "garden room", "conservatory", "the conservatory", "aquarium", "ocean conservatory"],
  conservatory: ["butterfly house", "butterfly conservatory", "butterfly garden", "sunroom", "sun room", "sunny room", "glass room", "morning room"],
  sunroom: ["butterfly house", "butterfly conservatory", "butterfly garden", "aquarium", "ocean conservatory", "conservatory"],
  "personal-library": ["estate library", "the library", "the estate library"],
  library: ["personal library", "my library", "private library"],
  "stairway-reading-nook": ["window seat", "reading nook by the window", "personal library"],
  "reading-nook": [
    "stairway reading nook",
    "reading nook under the stairs",
    "nook under the stairs",
    "under the stairs",
    "personal library",
    "estate library",
  ],
  greenhouse: ["estate gardens", "apple orchard", "celebration garden", "orchard"],
  "estate-gardens": ["greenhouse", "celebration garden", "apple orchard"],
  "apple-orchard": ["greenhouse", "estate gardens", "celebration garden"],
  gardens: ["greenhouse", "estate gardens", "celebration sounds", "celebration room"],
  "fireside-deck": ["personal deck", "back deck"],
};

const primaryOwners = {
  "001": "003",
  "002": "004",
  "003": "030",
  "004": "019",
  "006": "035",
  "007": "016",
  "008": "009",
  "009": "036",
  "010": "014",
  "014": "024",
  "015": "023",
  "017": "015",
  "018": "029",
  "019": "027",
  "023": "022",
  "024": "028",
  "025": "001",
  "026": "032",
  "027": "005",
  "028": "007",
  "030": "049",
  "031": "044",
  "033": "046",
  "036": "056",
  "037": "059",
  "039": "060",
  "040": "061",
};

const roomRegistryId = (r) => r.semanticId ?? `ESTATE-ROOM-${r.id}`;

const roomByNumericId = Object.fromEntries(rooms.map((r) => [r.id, r]));

const fileByImg = Object.fromEntries(
  rooms.filter((r) => r.img).map((r) => [r.img, r.file]),
);
fileByImg["005"] = "founder-office-background.png";
fileByImg["011"] = "observatory-daytime-inside.png";
fileByImg["013"] = "observatory-night-outside-background.png";
fileByImg["020"] = "shari-office-autumn-background.png";
fileByImg["021"] = "shari-office-background.png";
fileByImg["022"] = "shari-office-Christmas-background.png";
fileByImg["029"] = "treehouse-possibility-collage.png";
fileByImg["032"] = "treehouse-possibility-reflection-desk-background.png";

const mediaAssets = [];
for (let n = 1; n <= 40; n++) {
  const id = String(n).padStart(3, "0");
  const filename = fileByImg[id];
  if (!filename) continue;
  const role =
    id === "011" || id === "013"
      ? "alternate_view"
      : id === "029"
        ? "decorative_unused"
        : "main_room_image";
  mediaAssets.push({
    image_id: `ESTATE-IMG-${id}`,
    filename,
    primary_owner: primaryOwners[id]
      ? roomRegistryId(roomByNumericId[primaryOwners[id]])
      : null,
    asset_role: role,
    estate_navigable: !["005", "020", "021", "022", "029"].includes(id),
  });
}

mediaAssets.push(
  {
    video_id: "ESTATE-VID-001",
    filename: "aquarium-room-video.mp4",
    primary_owner: "ESTATE-ROOM-003",
    poster_image_id: "ESTATE-IMG-001",
    asset_role: "room_experience_video",
  },
  {
    video_id: "ESTATE-VID-002",
    filename: "butterfly-house-video.mp4",
    primary_owner: roomRegistryId(roomByNumericId["004"]),
    poster_image_id: "ESTATE-IMG-002",
    asset_role: "room_experience_video",
  },
);

const related = {
  "personal-library": ["ESTATE-ROOM-027", "ESTATE-ROOM-023", "ESTATE-ROOM-024"],
  "butterfly-house": ["ESTATE-ROOM-003", "ESTATE-ROOM-Sunroom"],
  conservatory: [roomRegistryId(roomByNumericId["004"]), "ESTATE-ROOM-009"],
  library: ["ESTATE-ROOM-025", "ESTATE-ROOM-023"],
  "stairway-reading-nook": ["ESTATE-ROOM-025", "ESTATE-ROOM-023", "ESTATE-ROOM-027"],
  "reading-nook": ["ESTATE-ROOM-024", "ESTATE-ROOM-026"],
};

const registryRooms = rooms.map((r) => {
  const entry = {
    room_id: roomRegistryId(r),
    ...(r.semanticId ? { legacy_numeric_room_id: `ESTATE-ROOM-${r.id}` } : {}),
    place_id: r.placeId,
    official_name: r.name,
    parent_area: r.parent,
    room_type: r.type,
    status: r.status,
    route: r.route ? `/companion?section=${r.route}` : null,
    image_asset_id: r.img ? `ESTATE-IMG-${r.img}` : null,
    image_file: r.file,
    image_file_canonical: r.missing || (r.file ? `estate-room-${r.placeId}-main.png` : null),
    video_file: r.video || null,
    video_asset_id: r.vid ? `ESTATE-VID-${r.vid}` : null,
    media_ownership: r.borrow
      ? "borrowed_pending_dedicated_asset"
      : r.missing
        ? "missing_dedicated_asset"
        : "owned",
    aliases: aliasMap[r.placeId] || [r.placeId.replace(/-/g, " ")],
    disallowed_aliases: disallowed[r.placeId] || [],
    ...(avoidConfusionWith[r.placeId]
      ? { avoid_confusion_with: avoidConfusionWith[r.placeId] }
      : {}),
    ...(r.removed
      ? {
          navigable: false,
          merged_into_place_id: r.mergedInto,
        }
      : {}),
    related_rooms: related[r.placeId] || [],
  };
  if (r.borrowImg) {
    entry.borrowed_image_asset_id = `ESTATE-IMG-${r.borrowImg}`;
    entry.borrowed_image_file = r.borrowFile;
  }
  if (r.altImages) {
    entry.alternate_image_asset_ids = r.altImages.map((x) => `ESTATE-IMG-${x}`);
  }
  return entry;
});

const doc = {
  registry: "estate-room-registry",
  version: "1.0.0",
  description:
    "Authoritative Spark Estate room, image, and video registry. Registry assignment is authoritative — never assign media by visual similarity.",
  id_schemes: {
    room: "ESTATE-ROOM-###",
    image: "ESTATE-IMG-###",
    video: "ESTATE-VID-###",
  },
  media_ownership_rules: {
    one_primary_owner_per_asset: true,
    never_assign_by_visual_similarity: true,
    registry_is_authoritative: true,
    video_attaches_to_room_not_separate_destination: true,
    do_not_substitute_image_when_video_available: true,
    only_approved_video_filenames: [
      "aquarium-room-video.mp4",
      "butterfly-house-video.mp4",
    ],
    examples: [
      {
        asset: "butterfly-house-video.mp4",
        video_id: "ESTATE-VID-002",
        primary_owner: "ESTATE-ROOM-Butterfly-House",
        avoid_confusion_with: ["Butterfly House", "Greenhouse"],
        allowed_navigation_names: [
          "butterfly house",
          "butterfly conservatory",
          "butterfly garden",
        ],
        not_allowed_without_clarification: [
          "sunroom",
          "garden room",
          "conservatory",
          "aquarium",
          "ocean conservatory",
        ],
      },
      {
        asset: "aquarium-room-video.mp4",
        video_id: "ESTATE-VID-001",
        primary_owner: "ESTATE-ROOM-003",
        avoid_confusion_with: ["Sunroom", "Greenhouse", "Ocean Conservatory"],
        allowed_navigation_names: [
          "aquarium",
          "aquarium room",
          "ocean conservatory",
          "ocean aquarium",
        ],
        not_allowed_without_clarification: [
          "butterfly house",
          "butterfly conservatory",
          "greenhouse",
        ],
      },
    ],
  },
  media_assets: mediaAssets,
  rooms: registryRooms,
};

const out = path.join("docs", "estate", "ESTATE_ROOM_REGISTRY.json");
fs.writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`Wrote ${out} (${registryRooms.length} rooms, ${mediaAssets.length} media assets)`);

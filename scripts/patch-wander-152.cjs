/**
 * One-shot patch for 152 Wander room name/route fixes.
 * Docs-only mission for names/routes — edits ESTATE_PLACE_MASTER_MANIFEST.json.
 */
const fs = require("fs");
const path = require("path");

const manifestPath = path.join(
  __dirname,
  "..",
  "docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json",
);
const doc = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function byLegacy(id) {
  return doc.places.find((p) => p.legacy_place_id === id);
}

function patch(id, updates) {
  const place = byLegacy(id);
  if (!place) {
    console.warn("MISSING place", id);
    return;
  }
  Object.assign(place, updates);
  console.log("patched", id, Object.keys(updates).join(", "));
}

// 2. Gallery — not Hall of Accomplishments
patch("gallery-of-firsts", {
  official_name: "Gallery™",
  display_name: "Gallery",
  aliases: [
    "gallery",
    "the gallery",
    "gallery of firsts",
    "the gallery of firsts",
  ],
  do_not_route_to: [
    "hall of accomplishments",
    "portfolio",
    "celebration hall",
  ],
});

// 4. Decision Compass — remove from Wander (tool, not room window)
patch("decision-compass", {
  navigable: false,
  status: "Draft",
  aliases: ["decision compass", "the decision compass"],
  do_not_route_to: ["writing room", "the writing room"],
});

// 5. Apple Orchard — remove orphan from Wander
patch("apple-orchard", {
  navigable: false,
  status: "Draft",
});

// 8. Celebration Garden — keep Live; fix missing image → swing-background.png
patch("gardens", {
  primary_image: "swing-background.png",
  media_ownership: "borrowed_pending_dedicated_asset",
  status: "Live",
  navigable: true,
});

// 11. Estate Library
patch("library", {
  official_name: "Estate Library™",
  display_name: "Estate Library",
});

// 12. Personal Deck — do not use back/fireside deck asset; keep terrace until dedicated asset
patch("personal-deck", {
  primary_image: "grand-terrace-background.png",
  do_not_route_to: ["fireside deck", "back deck", "the back deck"],
  media_ownership: "borrowed_pending_dedicated_asset",
  missing_canonical_image: "estate-room-personal-deck-main.png",
});

// 13. Hall of Accomplishments — Wander slot was wrongly labeled Portfolio
patch("portfolio", {
  official_name: "Hall of Accomplishments™",
  display_name: "Hall of Accomplishments",
  primary_image: "hall-of-achievements-room-background.png",
  aliases: [
    "hall of accomplishments",
    "the hall of accomplishments",
    "hall of achievements",
    "accomplishments hall",
  ],
  do_not_route_to: ["gallery", "celebration hall", "evidence vault", "portfolio"],
  // Keep growth-portfolio section for now; member-facing Wander name is Hall.
});

// Observatory variants as distinct Wander spaces (same shell section, distinct views)
const obsVariants = [
  {
    place_id: "OBS-DAY-INSIDE",
    legacy_place_id: "observatory-day-inside",
    official_name: "Observatory — Daytime Inside™",
    display_name: "Observatory — Daytime Inside",
    primary_image: "observatory-daytime-inside.png",
  },
  {
    place_id: "OBS-DAY-OUTSIDE",
    legacy_place_id: "observatory-day-outside",
    official_name: "Observatory — Daytime Outside™",
    display_name: "Observatory — Daytime Outside",
    primary_image: "observatory-daytime-outside-background.png",
  },
  {
    place_id: "OBS-NIGHT-OUTSIDE",
    legacy_place_id: "observatory-night-outside",
    official_name: "Observatory — Night Outside™",
    display_name: "Observatory — Night Outside",
    primary_image: "observatory-night-outside-background.png",
  },
];
for (const v of obsVariants) {
  if (!byLegacy(v.legacy_place_id)) {
    doc.places.push({
      place_id: v.place_id,
      legacy_place_id: v.legacy_place_id,
      estate_room_id: null,
      official_name: v.official_name,
      display_name: v.display_name,
      category: "Research",
      parent_area: "Research",
      primary_image: v.primary_image,
      image_variants: [],
      video: null,
      audio: null,
      aliases: [v.display_name.toLowerCase()],
      intent_tags: ["observatory"],
      related_places: ["OBS-MAIN"],
      do_not_route_to: [],
      navigable: true,
      status: "Live",
      route: "/companion?section=grow-observatory",
      merged_into_place_id: null,
      media_ownership: "owned",
      missing_canonical_image: null,
    });
    console.log("added", v.legacy_place_id);
  }
}

// 16. Sunroom — ensure not Butterfly House
patch("sunroom", {
  official_name: "Sunroom™",
  display_name: "Sunroom",
  do_not_route_to: ["butterfly house", "aquarium room", "conservatory"],
});

// 19. Swimming Pool — not Summer Terrace
patch("summer-terrace", {
  official_name: "Swimming Pool™",
  display_name: "Swimming Pool",
  aliases: [
    "swimming pool",
    "the swimming pool",
    "the pool",
    "pool",
    "summer terrace",
    "the summer terrace",
  ],
  do_not_route_to: ["lakeside hammock", "grand terrace"],
});

// 23. Butterfly House — ensure Live + video
patch("butterfly-house", {
  status: "Live",
  navigable: true,
  video: "butterfly-house-video.mp4",
  display_name: "Butterfly House",
  official_name: "Butterfly House™",
});

// 27. Reading Nook Window
patch("reading-nook", {
  official_name: "Reading Nook Window™",
  display_name: "Reading Nook Window",
  aliases: [
    "reading nook",
    "the reading nook",
    "reading nook window",
    "the reading nook window",
    "nook window",
  ],
});

// 28. Celebration Hall — already celebration-room; ensure name
patch("celebration-room", {
  official_name: "Celebration Hall™",
  display_name: "Celebration Hall",
});

// 31. Swing (porch-swing)
patch("porch-swing", {
  official_name: "Swing™",
  display_name: "Swing",
  primary_image: "swing-background.png",
  status: "Live",
  navigable: true,
  aliases: [
    "swing",
    "the swing",
    "porch swing",
    "the porch swing",
    "swing on the porch",
  ],
  media_ownership: "owned",
});

// 32. Tea Room
patch("tea-room", {
  status: "Live",
  navigable: true,
});

// Treehouse sub-rooms → Live
const treehouseLive = [
  "house-possibility-discovery-chest",
  "house-possibility-reflection-desk",
  "house-possibility-staircase",
  "house-possibility-studio",
  "house-possibility-window-nook",
];
for (const id of treehouseLive) {
  patch(id, { status: "Live", navigable: true });
}

// Treehouse display names per prompt
patch("house-possibility-discovery-chest", {
  official_name: "Treehouse Discovery Chest™",
  display_name: "Treehouse Discovery Chest",
  aliases: [
    "treehouse discovery chest",
    "discovery chest",
    "house possibility discovery chest",
  ],
});
patch("house-possibility-reflection-desk", {
  official_name: "Treehouse Reflection Desk™",
  display_name: "Treehouse Reflection Desk",
  aliases: [
    "treehouse reflection desk",
    "reflection desk",
    "house possibility reflection desk",
  ],
});
patch("house-possibility-staircase", {
  official_name: "Treehouse Staircase / Reading Nook™",
  display_name: "Treehouse Staircase / Reading Nook",
  aliases: [
    "treehouse staircase",
    "treehouse reading nook",
    "possibility staircase",
    "house possibility staircase",
  ],
});
patch("house-possibility-studio", {
  official_name: "Treehouse Possibility Studio™",
  display_name: "Treehouse Possibility Studio",
  aliases: [
    "treehouse possibility studio",
    "possibility studio",
    "house possibility studio",
  ],
});
patch("house-possibility-outside", {
  official_name: "Treehouse™",
  display_name: "Treehouse",
});

// 37. Water / Lakeside Hammock
patch("lakeside-hammock", {
  official_name: "Water / Lakeside Hammock™",
  display_name: "Water / Lakeside Hammock",
  status: "Live",
  navigable: true,
});

// 38. Writing Room — new place if missing
if (!byLegacy("writing-room")) {
  doc.places.push({
    place_id: "WRITING-ROOM",
    legacy_place_id: "writing-room",
    estate_room_id: null,
    official_name: "Writing Room™",
    display_name: "Writing Room",
    category: "Creative",
    parent_area: "Creative Spaces",
    primary_image: "writing-room-background.png",
    image_variants: [],
    video: null,
    audio: null,
    aliases: ["writing room", "the writing room"],
    intent_tags: ["writing", "draft", "quiet"],
    related_places: [],
    do_not_route_to: ["decision compass"],
    navigable: true,
    status: "Live",
    route: "/companion?section=home",
    merged_into_place_id: null,
    media_ownership: "owned",
    missing_canonical_image: null,
  });
  console.log("added writing-room");
} else {
  patch("writing-room", {
    status: "Live",
    navigable: true,
    primary_image: "writing-room-background.png",
    display_name: "Writing Room",
    official_name: "Writing Room™",
  });
}

// Observatory scene labels stay via scene views; ensure Live
patch("observatory", {
  status: "Live",
  navigable: true,
  display_name: "Observatory",
});

// Discovery Room + Study Hall already Live — ensure
patch("discovery-room", { status: "Live", navigable: true });
patch("study-hall", { status: "Live", navigable: true });

// Exclude profile rooms with null routes from Wander
patch("growth-profile", { navigable: false });
const myEstate = byLegacy("my-estate");
if (myEstate) {
  patch("my-estate", { navigable: false });
}

// Fix gardens missing swing plate references elsewhere
for (const p of doc.places) {
  if (p.primary_image === "space-reflection-tree-swing-background.png") {
    p.primary_image = "swing-background.png";
    console.log("retargeted missing swing plate →", p.legacy_place_id);
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(doc, null, 2) + "\n");
console.log("Wrote", manifestPath);

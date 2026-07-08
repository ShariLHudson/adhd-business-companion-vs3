/**
 * Generates ESTATE_PLACE_MASTER_MANIFEST + audit reports per
 * docs/estate/ESTATE_PLACE_MASTER_MANIFEST_PROTOCOL.md
 */
import fs from "fs";
import path from "path";

const ROOT = path.join("docs", "estate");
const REGISTRY_PATH = path.join(ROOT, "ESTATE_ROOM_REGISTRY.json");
const ALIAS_CATALOG_PATH = path.join(
  "lib",
  "estate",
  "estateRoomAliasCatalog.ts",
);
const MEDIA_PATH = path.join("lib", "estate", "estatePlaceMedia.ts");

/** Readable permanent Place IDs — stable even if names/assets change. */
const MANIFEST_PLACE_IDS = {
  "welcome-home": "WELCOME-HOME",
  "spark-estate": "ESTATE-SPARK",
  "my-estate": "ESTATE-MY",
  conservatory: "AQUA-MAIN",
  "butterfly-house": "BUTTERFLY-HOUSE",
  sunroom: "SUNROOM-MAIN",
  "clear-my-mind": "CLEAR-MIND",
  "tea-room": "TEA-MAIN",
  "coffee-house": "COFFEE-MAIN",
  greenhouse: "GREENHOUSE-MAIN",
  "apple-orchard": "ORCHARD-APPLE",
  gardens: "GARDEN-CELEBRATION",
  "estate-gardens": "GARDEN-ESTATE",
  "garden-bench": "GARDEN-BENCH",
  "estate-kitchen": "KITCHEN-MAIN",
  "dining-room": "DINING-MAIN",
  "grand-terrace": "TERRACE-GRAND",
  "lakeside-hammock": "LAKE-HAMMOCK",
  "lakeside-verandah": "LAKE-VERANDAH",
  "fireside-deck": "DECK-FIRESIDE",
  "back-deck": "DECK-BACK",
  "personal-deck": "DECK-PERSONAL",
  "porch-swing": "PORCH-SWING",
  "the-swing-beneath-the-oak": "SWING-OAK",
  "reading-nook": "NOOK-READING",
  "stairway-reading-nook": "NOOK-STAIR",
  "personal-library": "LIBRARY-PERSONAL",
  "window-seat": "NOOK-WINDOW",
  library: "LIBRARY-ESTATE",
  "momentum-institute": "INSTITUTE-MOMENTUM",
  "discovery-room": "DISCOVERY-MAIN",
  "creative-studio": "STUDIO-CREATIVE",
  observatory: "OBS-MAIN",
  "study-hall": "STUDY-HALL",
  "round-table": "ROUND-TABLE",
  "art-studio": "STUDIO-ART",
  "gallery-of-firsts": "GALLERY-FIRSTS",
  "evidence-vault": "VAULT-EVIDENCE",
  portfolio: "PORTFOLIO-MAIN",
  "celebration-room": "HALL-CELEBRATION",
  "goals-projects": "GOALS-PROJECTS",
  "game-room": "GAME-MAIN",
  "momentum-room": "ROOM-MOMENTUM",
  stables: "STABLES-MAIN",
  "momentum-builder": "MOMENTUM-BUILDER",
  "house-possibility-outside": "TREEHOUSE-OUTSIDE",
  "house-possibility-reflection-desk": "TREEHOUSE-DESK",
  "house-possibility-staircase": "TREEHOUSE-STAIR",
  "house-possibility-window-nook": "TREEHOUSE-NOOK",
  "house-possibility-studio": "TREEHOUSE-STUDIO",
  "house-possibility-discovery-chest": "TREEHOUSE-CHEST",
  "house-possibility-legacy-room": "TREEHOUSE-LEGACY",
  "main-staircase": "STAIR-MAIN",
  balcony: "BALCONY-PRIVATE",
  "woodland-path": "PATH-WOODLAND",
  "growth-profile": "PROFILE-GROWTH",
  "reflection-tree-main": "TREE-REFLECTION",
  "seat-at-pond": "POND-SEAT",
  "reflection-pond": "POND-REFLECTION",
  "peaceful-places": "PEACEFUL-MAIN",
  "summer-terrace": "TERRACE-SUMMER",
  journal: "GAZEBO-JOURNAL",
  "decision-compass": "COMPASS-DECISION",
  "music-room": "MUSIC-MAIN",
};

const EXTRA_NAVIGABLE_PLACES = {
  "personal-deck": {
    official_name: "Personal Deck™",
    display_name: "Personal Deck",
    category: "Restoration",
    parent_area: "Grounds",
    primary_image: "grand-terrace-background.png",
    video: null,
    status: "Live",
    route: "/companion?section=home",
    navigable: true,
    do_not_route_to: ["Fireside Deck", "Back Deck"],
    avoid_confusion_with: ["Fireside Deck"],
    merged_into_place_id: null,
    estate_room_id: null,
    missing_canonical_image: "private-balcony-sunset-background.PNG",
  },
};

const PROTOCOL_INTENT_TAGS = {
  "AQUA-MAIN": ["aquarium", "fish", "underwater", "quiet", "ocean"],
  "BUTTERFLY-HOUSE": ["butterflies", "focus", "butterfly", "garden"],
  "SUNROOM-MAIN": ["daylight", "glass", "morning", "welcome"],
  "GREENHOUSE-MAIN": ["plants", "growth", "greenhouse"],
  "GARDEN-ESTATE": ["grounds", "paths", "outdoor", "estate gardens"],
  "GARDEN-CELEBRATION": ["celebration", "wins", "milestones", "garden"],
  "ORCHARD-APPLE": ["orchard", "apples", "possibility", "fresh air"],
  "POND-SEAT": ["water", "pond", "dock", "quiet", "reflection"],
  "DECK-FIRESIDE": ["fire", "deck", "evening", "warmth"],
  "DECK-PERSONAL": ["private", "balcony", "deck", "evening"],
  "NOOK-STAIR": ["reading", "stairs", "quiet"],
  "NOOK-WINDOW": ["window", "reading", "light"],
  "NOOK-READING": ["reading", "nook", "quiet"],
  "LIBRARY-PERSONAL": ["personal", "library", "private reading"],
  "LIBRARY-ESTATE": ["library", "learning", "books"],
  "OBS-MAIN": ["stars", "observatory", "research", "sky"],
};

function stripTm(name) {
  return name.replace(/™/g, "").trim();
}

function parseAliasCatalog(tsSource) {
  const byRoomId = {};
  const blockRe =
    /roomId:\s*"([^"]+)"[\s\S]*?officialName:\s*"([^"]+)"[\s\S]*?aliases:\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = blockRe.exec(tsSource)) !== null) {
    const roomId = m[1];
    const officialName = m[2];
    const aliasBody = m[3];
    const aliases = [...aliasBody.matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    byRoomId[roomId] = { officialName, aliases };
  }
  return byRoomId;
}

function parseMediaBackgrounds(tsSource) {
  const map = {};
  const lineRe = /^\s+"?([a-z0-9-]+)"?:\s*estateBackgroundPath\("([^"]+)"\)/gm;
  let m;
  while ((m = lineRe.exec(tsSource)) !== null) {
    map[m[1]] = m[2];
  }
  return map;
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function manifestPlaceId(placeId) {
  return MANIFEST_PLACE_IDS[placeId] ?? placeId.toUpperCase().replace(/-/g, "_");
}

function buildPlaceEntry(room, aliasCatalog, mediaBg, registryByPlace, allRegistryRooms) {
  const placeId = room.place_id;
  const manifestId = manifestPlaceId(placeId);
  const catalog = aliasCatalog[placeId];
  const reg = registryByPlace.get(placeId) ?? room;

  const primaryImage =
    reg.image_file ??
    mediaBg[placeId] ??
    EXTRA_NAVIGABLE_PLACES[placeId]?.primary_image ??
    null;

  const variants = [];
  if (reg.alternate_image_asset_ids?.length) {
    for (const imgId of reg.alternate_image_asset_ids) {
      variants.push({ image_asset_id: imgId, role: "alternate_view" });
    }
  }

  return {
    place_id: manifestId,
    legacy_place_id: placeId,
    estate_room_id: reg.room_id ?? null,
    official_name: reg.official_name ?? catalog?.officialName ?? placeId,
    display_name: stripTm(reg.official_name ?? catalog?.officialName ?? placeId),
    category: reg.room_type ?? "Unknown",
    parent_area: reg.parent_area ?? null,
    primary_image: primaryImage,
    image_variants: variants,
    video: reg.video_file ?? null,
    audio: null,
    aliases: [
      ...new Set([
        ...(reg.aliases ?? []),
        ...(catalog?.aliases ?? []),
        placeId.replace(/-/g, " "),
      ]),
    ],
    intent_tags: PROTOCOL_INTENT_TAGS[manifestId] ?? [],
    related_places: (reg.related_rooms ?? [])
      .map((rid) => {
        const match = allRegistryRooms.find((r) => r.room_id === rid);
        if (match) return manifestPlaceId(match.place_id);
        return null;
      })
      .filter(Boolean),
    do_not_route_to: reg.disallowed_aliases?.length
      ? reg.disallowed_aliases
      : (reg.avoid_confusion_with ?? []),
    navigable: reg.navigable !== false && reg.status !== "Removed",
    status: reg.status ?? "Draft",
    route: reg.route ?? null,
    merged_into_place_id: reg.merged_into_place_id
      ? manifestPlaceId(reg.merged_into_place_id)
      : null,
    media_ownership: reg.media_ownership ?? null,
    missing_canonical_image: reg.image_file_canonical?.startsWith("estate-room-")
      ? reg.image_file_canonical
      : null,
  };
}

function generateReports(manifest) {
  const places = manifest.places;
  const removed = manifest.removed_places;
  const live = places.filter((p) => p.navigable && p.status === "Live");

  const imageRows = places.map((p) => ({
    place_id: p.place_id,
    legacy: p.legacy_place_id,
    official: p.official_name,
    primary_image: p.primary_image ?? "—",
    video: p.video ?? "—",
    ownership: p.media_ownership ?? "—",
  }));

  const duplicates = [
    {
      removed: "POND-REFLECTION",
      merged_into: "POND-SEAT",
      reason: "Same experience as Seat at Pond / Dock",
    },
    {
      removed: "DECK-BACK",
      merged_into: "DECK-FIRESIDE",
      reason: "Back Deck is not a separate room",
    },
    {
      removed: "Reading Nook — under stairs phrases",
      merged_into: "NOOK-STAIR",
      reason: "Stairway Reading Nook owns under-stairs aliases",
    },
    {
      removed: "Butterfly Conservatory (as room)",
      merged_into: "BUTTERFLY-HOUSE",
      reason: "Alias only — butterfly video belongs to Butterfly House",
    },
  ];

  const conflicts = places
    .filter((p) => p.do_not_route_to?.length)
    .map((p) => ({
      place_id: p.place_id,
      official_name: p.official_name,
      do_not_route_to: p.do_not_route_to,
    }));

  const missing = places.filter(
    (p) =>
      p.missing_canonical_image ||
      p.media_ownership === "missing_dedicated_asset" ||
      p.media_ownership === "borrowed_pending_dedicated_asset",
  );

  const aliasReport = live.map((p) => ({
    place_id: p.place_id,
    official_name: p.official_name,
    alias_count: p.aliases.length,
    aliases: p.aliases,
  }));

  return {
    imageMapping: `# Estate Place / Image Mapping Report

Generated from \`ESTATE_PLACE_MASTER_MANIFEST\`.

| Place ID | Legacy \`placeId\` | Official Name | Primary Image | Video | Ownership |
|----------|------------------|---------------|---------------|-------|-----------|
${imageRows
  .map(
    (r) =>
      `| ${r.place_id} | \`${r.legacy}\` | ${r.official} | \`${r.primary_image}\` | ${r.video} | ${r.ownership} |`,
  )
  .join("\n")}

## Rules applied

- Images belong to **places**, not filenames.
- Only approved videos: \`aquarium-room-video.mp4\`, \`butterfly-house-video.mp4\`.
- Never assign by visual similarity.
`,

    duplicates: `# Estate Duplicate Place Report

Places removed or merged per identity corrections.

| Removed | Merged Into | Reason |
|---------|-------------|--------|
${duplicates.map((d) => `| ${d.removed} | ${d.merged_into} | ${d.reason} |`).join("\n")}

## Registry status

${removed
  .map(
    (p) =>
      `- **${p.place_id}** (\`${p.legacy_place_id}\`) → merged into **${p.merged_into_place_id}**`,
  )
  .join("\n")}
`,

    aliases: `# Estate Alias Mapping Report

${aliasReport.length} navigable Live places with alias coverage.

${aliasReport
  .map(
    (a) => `## ${a.place_id} — ${a.official_name}

${a.aliases.map((x) => `- ${x}`).join("\n")}
`,
  )
  .join("\n")}
`,

    navigationConflicts: `# Estate Navigation Conflict Report

\`do_not_route_to\` / disambiguation rules per place.

${conflicts
  .map(
    (c) => `## ${c.place_id} — ${c.official_name}

Do not route to: ${c.do_not_route_to.join(", ")}
`,
  )
  .join("\n")}

## Global rule

Room navigation must never open: app features, settings pages, audio categories, similar rooms, or temporary image substitutes.

**Celebration Garden** (\`GARDEN-CELEBRATION\`) ≠ **Celebration Sounds** (audio settings).
`,

    missingAssets: `# Estate Missing Asset Report

Places needing dedicated artwork or canonical files.

| Place ID | Legacy | Issue | Canonical target |
|----------|--------|-------|------------------|
${missing
  .map(
    (p) =>
      `| ${p.place_id} | \`${p.legacy_place_id}\` | ${p.media_ownership ?? "borrowed/missing"} | \`${p.missing_canonical_image ?? "—"}\` |`,
  )
  .join("\n")}

## Priority commissions

1. **ORCHARD-APPLE** — dedicated orchard plate (not Greenhouse)
2. **LIBRARY-PERSONAL** — \`estate-room-personal-library.png\`
3. **STABLES-MAIN** — \`estate-room-stables-main.png\`
4. **MUSIC-MAIN** — \`estate-room-music-room-main.png\`
5. **COFFEE-MAIN** — \`estate-room-coffee-house-main.png\`
`,
  };
}

function main() {
  const registry = loadJson(REGISTRY_PATH);
  const aliasCatalog = parseAliasCatalog(fs.readFileSync(ALIAS_CATALOG_PATH, "utf8"));
  const mediaBg = parseMediaBackgrounds(fs.readFileSync(MEDIA_PATH, "utf8"));

  const registryByPlace = new Map(
    registry.rooms.map((r) => [r.place_id, r]),
  );

  const places = [];
  const removedPlaces = [];

  for (const room of registry.rooms) {
    const entry = buildPlaceEntry(
      room,
      aliasCatalog,
      mediaBg,
      registryByPlace,
      registry.rooms,
    );
    if (room.status === "Removed" || entry.merged_into_place_id) {
      removedPlaces.push(entry);
    } else {
      places.push(entry);
    }
  }

  for (const [placeId, extra] of Object.entries(EXTRA_NAVIGABLE_PLACES)) {
    if (places.some((p) => p.legacy_place_id === placeId)) continue;
    const catalog = aliasCatalog[placeId];
    places.push({
      place_id: manifestPlaceId(placeId),
      legacy_place_id: placeId,
      estate_room_id: extra.estate_room_id,
      official_name: extra.official_name,
      display_name: extra.display_name,
      category: extra.category,
      parent_area: extra.parent_area,
      primary_image: extra.primary_image,
      image_variants: [],
      video: extra.video,
      audio: null,
      aliases: catalog?.aliases ?? [placeId.replace(/-/g, " ")],
      intent_tags: PROTOCOL_INTENT_TAGS[manifestPlaceId(placeId)] ?? [],
      related_places: [],
      do_not_route_to: extra.do_not_route_to ?? [],
      navigable: extra.navigable,
      status: extra.status,
      route: extra.route,
      merged_into_place_id: null,
      media_ownership: "owned",
      missing_canonical_image: extra.missing_canonical_image ?? null,
    });
  }

  places.sort((a, b) => a.place_id.localeCompare(b.place_id));

  const manifest = {
    manifest: "estate-place-master-manifest",
    version: "1.0.0",
    protocol: "ESTATE_PLACE_MASTER_MANIFEST_PROTOCOL",
    generated_at: new Date().toISOString().slice(0, 10),
    principle: "PLACE → VARIANTS / VIEWS → ASSETS",
    description:
      "Single source of truth for Spark Estate physical destinations. A filename is not a room.",
    id_scheme: {
      manifest_place_id: "Readable permanent IDs (e.g. AQUA-MAIN, BUTTERFLY-HOUSE)",
      legacy_place_id: "kebab-case code placeId",
      estate_room_id: "ESTATE-ROOM-### or ESTATE-ROOM-Semantic-Name",
    },
    approved_videos_only: registry.media_ownership_rules.only_approved_video_filenames,
    navigation_rules: {
      never_guess_when_ambiguous: true,
      never_route_to_app_feature: true,
      never_route_to_settings: true,
      never_route_to_audio_category: true,
      never_route_by_visual_similarity: true,
    },
    places,
    removed_places: removedPlaces,
  };

  const reports = generateReports(manifest);

  fs.writeFileSync(
    path.join(ROOT, "ESTATE_PLACE_MASTER_MANIFEST.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(ROOT, "ESTATE_PLACE_IMAGE_MAPPING_REPORT.md"),
    reports.imageMapping,
  );
  fs.writeFileSync(
    path.join(ROOT, "ESTATE_PLACE_DUPLICATE_REPORT.md"),
    reports.duplicates,
  );
  fs.writeFileSync(
    path.join(ROOT, "ESTATE_PLACE_ALIAS_MAPPING_REPORT.md"),
    reports.aliases,
  );
  fs.writeFileSync(
    path.join(ROOT, "ESTATE_PLACE_NAVIGATION_CONFLICT_REPORT.md"),
    reports.navigationConflicts,
  );
  fs.writeFileSync(
    path.join(ROOT, "ESTATE_PLACE_MISSING_ASSET_REPORT.md"),
    reports.missingAssets,
  );

  console.log(
    `Wrote ESTATE_PLACE_MASTER_MANIFEST (${places.length} places, ${removedPlaces.length} removed) + 5 reports`,
  );
}

main();

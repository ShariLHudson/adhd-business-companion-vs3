/**
 * One-way sync: canonical place backgrounds → estate-assets.json + estate-locations.json
 * File names are source of truth — never rename assets in this script.
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mediaPath = path.join(root, "lib/estate/estatePlaceMedia.ts");
const placesPath = path.join(root, "lib/estate/canonicalEstatePlaces.ts");
const outAssets = path.join(root, "docs/estate-knowledge-base/estate-assets.json");
const outLocations = path.join(
  root,
  "docs/estate-knowledge-base/estate-locations.json",
);

const media = readFileSync(mediaPath, "utf8");
const places = readFileSync(placesPath, "utf8");

const blockMatch = media.match(
  /export const CANONICAL_PLACE_BACKGROUNDS[^=]*=\s*\{([\s\S]*?)\n\};/,
);
if (!blockMatch) throw new Error("CANONICAL_PLACE_BACKGROUNDS block not found");

const placeToAsset = new Map();
const pairRegex =
  /(?:"([^"]+)"|([a-zA-Z][\w-]*))\s*:\s*estateBackgroundPath\(\s*(?:"([^"]+)"|'([^']+)')/g;
let match;
while ((match = pairRegex.exec(blockMatch[1])) !== null) {
  const placeId = match[1] ?? match[2];
  const fileName = match[3] ?? match[4];
  if (!placeToAsset.has(placeId)) placeToAsset.set(placeId, fileName);
}

const officialNames = new Map();
const placeMeta = new Map();
const placeRegex =
  /\{\s*id:\s*"([^"]+)"[\s\S]*?officialName:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"[\s\S]*?primaryFeeling:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"/g;
while ((match = placeRegex.exec(places)) !== null) {
  const [, id, officialName, category, primaryFeeling, status] = match;
  officialNames.set(id, officialName);
  placeMeta.set(id, { category, primaryFeeling, status });
}

function mapStatus(canonStatus) {
  if (canonStatus === "live") return "Live";
  if (canonStatus === "partial") return "Draft";
  if (canonStatus === "needs-asset") return "Draft";
  if (canonStatus === "hidden") return "Hidden";
  return "Draft";
}

const assetToPlaces = new Map();
for (const [placeId, fileName] of placeToAsset) {
  const list = assetToPlaces.get(fileName) ?? [];
  list.push(placeId);
  assetToPlaces.set(fileName, list);
}

const assets = [...assetToPlaces.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([assetFileName, placeIds]) => {
    const primaryPlaceId = placeIds[0];
    const meta = placeMeta.get(primaryPlaceId);
    const assetType = assetFileName.endsWith(".webp") ? "image" : "image";
    return {
      assetFileName,
      assetType,
      officialDisplayName: officialNames.get(primaryPlaceId) ?? primaryPlaceId,
      status: mapStatus(meta?.status ?? "Draft"),
      description: meta?.primaryFeeling ?? "",
      locationType: meta?.category ?? "living-place",
      primaryPlaceId,
      sharedByPlaceIds: placeIds,
      relatedExperienceGroups: [],
      lastUpdated: "2026-07-06",
    };
  });

const locations = [...placeToAsset.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([locationId, primaryAssetFileName]) => {
    const meta = placeMeta.get(locationId);
    return {
      locationId,
      primaryAssetFileName,
      officialDisplayName:
        officialNames.get(locationId) ?? locationId.replace(/-/g, " "),
      canonicalPlaceId: locationId,
      status: mapStatus(meta?.status ?? "Draft"),
      description: meta?.primaryFeeling ?? "",
      locationType: meta?.category ?? "living-place",
      memberFacingHint: meta?.primaryFeeling ?? "",
      relatedExperienceGroups: [],
      route: null,
      lastUpdated: "2026-07-06",
    };
  });

writeFileSync(
  outAssets,
  JSON.stringify(
    {
      registry: "estate-assets",
      version: "1.0.0",
      description:
        "Visual asset directory — assetFileName matches public/backgrounds/ exactly. Intelligence layer builds on top; never rename files here.",
      rules: {
        fileNameIsSourceOfTruth: true,
        doNotRenameAssets: true,
        doNotInventRoomNames: true,
      },
      itemSchema: {
        assetFileName: "string — exact filename under public/backgrounds/",
        assetType: "image | video",
        officialDisplayName: "string — member-facing name from canon",
        status: "Live | Draft | Future | Hidden | Retired",
        description: "string",
        locationType: "string",
        primaryPlaceId: "string — canonical place id",
        sharedByPlaceIds: "string[] — places sharing this plate",
        relatedExperienceGroups: "string[]",
        lastUpdated: "ISO date",
      },
      assets,
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(
  outLocations,
  JSON.stringify(
    {
      registry: "estate-locations",
      version: "1.0.0",
      description:
        "Estate locations keyed by canonical place id. Every location begins with the actual asset file name.",
      rules: {
        locationIdMatchesCanonicalPlaceId: true,
        primaryAssetFileNameMatchesDisk: true,
      },
      itemSchema: {
        locationId: "string",
        primaryAssetFileName: "string",
        officialDisplayName: "string",
        canonicalPlaceId: "string",
        status: "Live | Draft | Future | Hidden | Retired",
        description: "string",
        locationType: "string",
        memberFacingHint: "string — short option line for intent resolution",
        relatedExperienceGroups: "string[]",
        route: "string | null",
        lastUpdated: "ISO date",
      },
      locations,
    },
    null,
    2,
  ) + "\n",
);

console.log(`Wrote ${assets.length} assets, ${locations.length} locations`);

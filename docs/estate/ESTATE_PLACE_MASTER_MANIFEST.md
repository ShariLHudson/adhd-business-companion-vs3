# Estate Place Master Manifest

**Status:** Live  
**Protocol:** [ESTATE_PLACE_MASTER_MANIFEST_PROTOCOL.md](./ESTATE_PLACE_MASTER_MANIFEST_PROTOCOL.md)

## Single source of truth

| Deliverable | File |
|-------------|------|
| **Master manifest** | [ESTATE_PLACE_MASTER_MANIFEST.json](./ESTATE_PLACE_MASTER_MANIFEST.json) |
| Place / image mapping | [ESTATE_PLACE_IMAGE_MAPPING_REPORT.md](./ESTATE_PLACE_IMAGE_MAPPING_REPORT.md) |
| Duplicate places | [ESTATE_PLACE_DUPLICATE_REPORT.md](./ESTATE_PLACE_DUPLICATE_REPORT.md) |
| Alias mapping | [ESTATE_PLACE_ALIAS_MAPPING_REPORT.md](./ESTATE_PLACE_ALIAS_MAPPING_REPORT.md) |
| Navigation conflicts | [ESTATE_PLACE_NAVIGATION_CONFLICT_REPORT.md](./ESTATE_PLACE_NAVIGATION_CONFLICT_REPORT.md) |
| Missing assets | [ESTATE_PLACE_MISSING_ASSET_REPORT.md](./ESTATE_PLACE_MISSING_ASSET_REPORT.md) |

## ID layers

```
PLACE (manifest)     →  AQUA-MAIN, BUTTERFLY-HOUSE, NOOK-STAIR …
legacy placeId       →  conservatory, butterfly-house, stairway-reading-nook …
ESTATE-ROOM id       →  ESTATE-ROOM-003, ESTATE-ROOM-Butterfly-House …
```

Manifest Place IDs are **stable** when display names or image filenames change.

## Regenerate

```bash
node scripts/generate-estate-room-registry.mjs
node scripts/generate-estate-place-master-manifest.mjs
```

## Core principle

**PLACE → VARIANTS / VIEWS → ASSETS**

A filename is not a room. An image is not a room. A video is not a room.

## Related registries

- [ESTATE_ROOM_REGISTRY.json](./ESTATE_ROOM_REGISTRY.json) — numeric/semantic room registry
- [ESTATE_ID_REGISTRY.md](./ESTATE_ID_REGISTRY.md) — IMG / VID / ROOM id index
- [ESTATE_VIDEO_ASSET_REGISTRY.md](./ESTATE_VIDEO_ASSET_REGISTRY.md) — approved videos only

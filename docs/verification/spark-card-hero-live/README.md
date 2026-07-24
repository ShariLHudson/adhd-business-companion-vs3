# Spark Card live hero image — restore evidence

## Root cause

Live `SparkCardArt` gated visibility on `photoLoaded` (`showPhoto = hasPhotoCandidate && photoLoaded`) and kept the `<img>` at `opacity: 0` until `onLoad`.

Cached Wikimedia thumbs often **skip** `onLoad` after remount. Result:

- Live modal: invisible photo + themed/blank-feeling frame  
- Print/PDF: same DOM `<img>` still paints (print path does not depend on the load flag the same way)

## Fixture — Summer’s Open Door

| Field | Value |
|-------|--------|
| Card ID | `SPARK-SEA-SUMMER` |
| Title | Summer's Open Door |
| Image source | topic registry → Wikimedia Commons garden door |
| Caption | Adventure can be close to home. |
| Resolver | `lib/sparkNote/resolveSparkCardImage.ts` |
| Live | `components/companion/SparkNoteExpanded.tsx` → `SparkCardArt` |
| Print | same component via `window.print()` |

Resolved URL (see `summer-resolve.json`):

`https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Arch_door_and_portal_in_Walled_Garden_at_Goodnestone_Park_Kent_England.jpg/960px-Arch_door_and_portal_in_Walled_Garden_at_Goodnestone_Park_Kent_England.jpg`

## Fix

- Show resolved photo immediately (no opacity gate / load gate)
- Illustrated scene only after `onError`
- Shared `resolveSparkCardImage` returns `hasImage` + `fallbackState`
- Print CSS forces visible hero image

## Tests

`components/companion/SparkNoteExpanded.image.test.tsx`  
`lib/sparkNote/resolveSparkCardImage.test.ts`

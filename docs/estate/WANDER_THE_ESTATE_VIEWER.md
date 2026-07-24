# Wander the Estate — Image Viewer

**Runtime:** `components/estateMap/WanderEstateImageViewer.tsx` · `EstateMapFullScreen.tsx`  
**Registry:** `lib/estateMap/wanderEstateImageRegistry.ts`  
**View state:** `lib/estateMap/wanderEstateViewerState.ts`

## Purpose

When a member selects a photograph from Wander the Estate (Explore Estate directory), that image becomes the primary experience — not a room hop with the gallery still visible behind it.

## Canonical image registry

Built from Explore Estate destinations (`getExploreEstateDestinations`):

| Field | Meaning |
|-------|---------|
| id | Explore card id |
| destinationId | Navigable place id |
| title | Member-facing name |
| imageSrc | Still / poster path |
| alt | Meaningful description |
| description | Short place line |
| order | Approved Explore order |
| enabled | Available + image ready |
| mediaType | image \| video (future) |
| objectFit | `contain` by default |

Previous / Next walk `getWanderEstateTourImages()` only (enabled entries). Sequences are never hard-coded in the component.

## Gallery → viewer

`WanderEstateViewMode`:

- `gallery` — directory only
- `image_viewer` — focused viewer only

Never mount both simultaneously.

## Previous / Next

- Preserve registry order
- Disable Previous on the first image
- Disable Next on the last image
- Do **not** wrap silently
- Update title, description, and alt with the image
- Prefetch adjacent sources when practical

## Back to Estate / Escape

**Back to Estate** closes the viewer and returns to the Wander gallery (not Welcome Home).

**Return to Welcome Home** remains a separate gallery toolbar action.

Escape performs the same action as Back to Estate:

- close viewer
- restore gallery scroll position when practical
- restore focus to the opening card
- do not call `history.back()`
- do not log out or clear Estate session

## Chat and view-state

While the viewer is open:

- gallery is unmounted
- companion chat stays under the modal layer and is not focusable inside the viewer
- conversation / destination state is preserved
- no independent chat toggle is introduced

## Image loading

- Paint immediately when cached — **no** `opacity: 0` waiting for `onLoad`
- Calm fallback on error (“This view is resting for a moment.”)
- No broken-image icons

## Accessibility

- `role="dialog"` + `aria-modal`
- Title announced via `aria-labelledby`
- Focus moves into the viewer; trap Tab within controls
- Escape closes; focus returns to the opening card
- Previous / Next include destination names in accessible labels
- Meaningful alt text; reduced-motion respected

## Browser certification

1. Open Wander the Estate  
2. Select a middle image  
3. Confirm large clear image; gallery/chat not over it  
4. Previous / Next / arrows  
5. Escape and Back to Estate return to gallery with focus  
6. First/last disable rules  
7. Cached reload still paints immediately  
8. Desktop / tablet / mobile controls reachable  

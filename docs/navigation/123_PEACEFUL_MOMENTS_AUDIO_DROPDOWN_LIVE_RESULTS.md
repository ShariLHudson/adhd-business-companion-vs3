# Live Results — Peaceful Moments Audio Dropdown (122–124)

**Status:** `unit_verified` · authenticated preview rows **Pending**  
**Do not deploy production** until authenticated live checklist passes.

**Preview:** https://adhd-business-companion-vs3-i575ihev1-shari-hudsons-projects.vercel.app  
**Commit:** `87910acd`

## Owners

| Concern | Owner |
|---------|--------|
| Destination / route | Welcome Home `peaceful-places` → section `focus-audio` via `openPeacefulPlacesCore` |
| Background | `PEACEFUL_PLACES_PATHWAY_BG` → `/backgrounds/woodland-pathway.png` |
| Audio registry | `PEACEFUL_PLACES_MUSIC_TRACKS` (`experienceSoundscapesMenu` / folder manifest) |
| Selected track + dropdown | `PeacefulMomentsRoom` local state |
| Playback | in-room `<audio controls>` (one track; switching stops prior) |
| Dropdown scroll | `max-h-64 overflow-y-auto` listbox |
| Mount | `FocusAudioPanel` → `PeacefulMomentsRoom` only |

## Removed from this entry path

Garden destination cards, pathway signposts, place sessions, walk animations, My Places workspace, and automatic category choosers are no longer mounted from `FocusAudioPanel`. Soundscapes remains a separate overlay.

## Automated tests

- `lib/peacefulPlaces/peacefulMomentsAudioDropdown.test.ts`
- Welcome Home / room invitation label updates

## Authenticated preview (123)

Pending — run `docs/navigation/123_PEACEFUL_MOMENTS_AUDIO_DROPDOWN_LIVE_CHECKLIST.md` on preview after deploy.

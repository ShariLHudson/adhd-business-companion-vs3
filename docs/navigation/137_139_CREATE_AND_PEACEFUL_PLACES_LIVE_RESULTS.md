# 137–139 — Create Scroll + Peaceful Places (Live Results)

**Status:** `unit_verified` · authenticated preview **Pending**  
**Do not deploy production** until `138_CREATE_AND_PEACEFUL_PLACES_LIVE_CHECKLIST.md` passes.

**Preview:** https://adhd-business-companion-vs3-49esabnlx-shari-hudsons-projects.vercel.app  
**Commits:** `1b91b947`

## Root causes

| Issue | Root cause |
|-------|------------|
| Create clipped / hard to scroll / lower items “dead” | Full-bleed host kept Tailwind `min-h-[100dvh]`, so height was indefinite. `.plan-my-day-morning-room__scroll` never engaged; parent `overflow: hidden` clipped lower Start/Browse/Continue content. Not pointer-events overlays. |
| Peaceful Places too complex / unsafe audio | Simple room already mounted, but used native `<audio controls>` only; not registered with `stopAllAudio`; leave path did not call global stop. |

## What shipped

- Restored viewport-bounded host CSS under `.companion-plan-my-day-active` (Create, Plan My Day, Strategy, Reminders, etc.)
- Peaceful Moments: Choose Music dropdown + Play / Pause / Stop / Sound Off / Volume
- Opt-in only — select does not play; `registerEstateMediaStopper` + `stopAllAudio` on leave
- Woodland pathway background unchanged (`public/backgrounds/woodland-pathway.png`)

## Owners

| Concern | Owner |
|---------|--------|
| Create scroll owner | `.plan-my-day-morning-room__scroll` via `CreateEstateRoomShell` |
| Create host height | `.companion-plan-my-day-active .clear-my-mind-standalone-*` in `companion.css` |
| Create routing | `openCreateEstateCore` / `startFreshCreateFromEstate` in `CompanionPageClient` |
| Peaceful Places | `PeacefulMomentsRoom` via `FocusAudioPanel` |
| Dropdown | `PEACEFUL_PLACES_MUSIC_TRACKS` + room dropdown UI |
| Audio / `stopAllAudio` | `lib/estate/stopAllAudio.ts` |

## Automated tests

- `lib/createEstate/createScrollContract.test.ts`
- `lib/peacefulPlaces/peacefulMomentsAudioDropdown.test.ts`

# Live Results — Create Scroll and Global Sound (133–135)

**Status:** `unit_verified` · authenticated preview rows **Pending**  
**Do not deploy production** until authenticated live checklist passes.

**Preview:** https://adhd-business-companion-vs3-1cv2v05yh-shari-hudsons-projects.vercel.app  
**Commit:** `2e877ff5`

## Root causes

| Issue | Root cause |
|-------|------------|
| Create does not scroll | `.plan-my-day-morning-room__scroll` used `min-height: 100dvh` without a flex-bounded height, so `overflow-y: auto` never engaged; parent `overflow: hidden` clipped content |
| Controls “unclickable” | Lower entrance controls were clipped / unreachable (not `pointer-events: none` overlays) |

## Owners after fix

| Concern | Owner |
|---------|--------|
| Create scroll | `.plan-my-day-morning-room__scroll` (flex-bounded) via `CreateEstateRoomShell` |
| Pointer events / backdrop | Cinematic / motion layers remain `pointer-events: none`; workspace uses `data-morning-room-workspace` |
| Overlay / outside dismiss | `handleMorningRoomOutsideClick` |
| Global audio / opt-in | `lib/estate/estateAudioSettings.ts` (`autoplayAllowed: false`) |
| Mute / volume | `EstateAudioSettings` + Experience Controls volume |
| `stopAllAudio` | `lib/estate/stopAllAudio.ts` |
| Preference persistence | `spark:estate:audio-settings:v2` |

## What shipped

- Flex-bounded morning-room scroll CSS restored
- Create / Strategy Library share the same scroll owner
- Create + playbook get morning-room chrome class
- Autoplay disabled by default; place entry does not start ambience
- Focus Audio / YouTube embeds do not autoplay
- Peaceful Place session sound defaults off
- Estate experience video muted
- Stop All Sound in Experience Controls + Estate Audio Settings

## Authenticated preview (134)

Pending — run `docs/navigation/134_CREATE_SCROLL_AND_SOUND_LIVE_CHECKLIST.md` on preview after deploy.

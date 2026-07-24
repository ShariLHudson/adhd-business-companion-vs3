# Estate Sounds Architecture

Canonical audio home for Spark Estate intentional sound.

**Runtime transport:** `lib/estate/estateSoundsTransport.ts`  
**Layer 2 overlay:** `lib/estate/estateSoundscapeOverlay.ts` via `lib/estate/estateAudioService.ts`  
**Global controller:** `components/companion/estate/GlobalSoundControl.tsx`  
**Layered mixer:** `lib/layeredAudio/` · `LayeredAudioMixerPanel`

## Catalog separation

| Surface | Scope | Catalog |
|---------|--------|---------|
| **Peaceful Moments** | Songs, guided audio, reflective listening, musical/spoken experiences | `PEACEFUL_PLACES_MUSIC_TRACKS` (`/audio/peaceful-places/`) |
| **Soundscapes** | Ambient environment loops (rain, fireplace, birds, etc.) | `EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS` (`/audio/Soundscapes/`) |
| **Current Mix** | Layered Voice + Environment + Music mixer | `lib/layeredAudio` |

Do **not** list ambient soundscapes inside Peaceful Moments.  
Do **not** describe soundscapes as songs.

### Peaceful Moments

- Room: `components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx`
- Dropdown of music tracks only
- Syncs active playback only when the active overlay id is a music track

### Soundscapes

- Overlay: `components/companion/estate/SoundscapeSelectionOverlay.tsx`
- Separate Estate Sounds browse entry and Welcome Home Audio destination
- Copy: “Choose an environment sound to shape the atmosphere around you.”

## Estate Sounds menu structure

```
Estate Sounds
├── Browse
│   ├── Peaceful Moments
│   ├── Soundscapes
│   └── Current Mix
├── Sounds On / Paused / Off status
└── Pause · Resume · Turn On · Turn Off
```

One `GlobalSoundControl` mount in `EstateTopRightChrome` — never a second master controller.

## Play / Pause / Resume / Stop

### Item states (Peaceful Moments song or active Soundscape)

| State | Controls |
|-------|----------|
| Stopped / idle | **Play** or **Use This Sound** |
| Playing | **Pause** · **Stop** |
| Paused | **Resume** · **Stop** |

Do not use Play as a hidden toggle between play and stop.

### Item-level Stop

`stopActiveEstateSoundscapeItem()`:

- Ends the Layer 2 overlay track immediately
- Resets `currentTime` to the beginning (via `stopEstateSoundscapeOverlay`)
- Clears active-playing / paused indicators for that item
- Updates Estate Sounds transport snapshot
- Does **not** silence the Estate session
- Does **not** clear an unrelated layered mix
- Does **not** leave the item marked paused

### Global Turn Off

`turnOffEstateSounds()`:

- Silences the entire Estate Sounds session (`Sounds Off`)
- Stops Layer 2 overlay and pauses layered mix
- Distinct label from item **Stop**

## Canonical transport ownership

All Peaceful Moments and Soundscapes controls call into:

- `playSoundscapeTrack` / `resumeSoundscapeOverlay`
- `pauseEstateSounds` / `resumeEstateSounds`
- `stopActiveEstateSoundscapeItem`
- `noteEstateSoundsStarted`
- `turnOffEstateSounds` / `turnOnEstateSounds`

Do **not** create:

- A separate Peaceful Moments player
- A separate Soundscapes player
- Duplicate stop or volume state

## Accessibility

- Visible text on every control (no icon-only Play/Stop)
- Keyboard focusable buttons and listbox options
- `aria-label` names include the track title where helpful
- `aria-live` / `data-playback-state` expose Playing · Paused · Stopped
- Large touch targets (min ~2.75rem)

## Tests

| Suite | Focus |
|-------|--------|
| `lib/peacefulPlaces/peacefulMomentsAudioDropdown.test.ts` | Songs-only catalog, control states, Stop wiring, Soundscapes separation |
| `lib/estate/globalSoundControl.test.ts` | Single controller, browse entries, no second player |
| `lib/estate/estateSoundsTransport.test.ts` | Item Stop vs Turn Off, Paused when selected but silent |

## Browser certification

1. Open Peaceful Moments — only songs / guided audio  
2. Play → Pause + Stop visible  
3. Pause → Resume + Stop visible  
4. Stop → track returns to beginning, shows Play, not Paused  
5. Open Soundscapes — rain, fireplace, birds, etc.  
6. Use This Sound → Estate Sounds shows Sounds On  
7. Stop soundscape → no duplicate audio  
8. Confirm one global Estate Sounds controller  

## Related

- [Layered Audio Experience](./LAYERED_AUDIO_EXPERIENCE.md)
- Soundscape inventory docs under `docs/estate/recognition/library/`

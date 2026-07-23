# Layered Audio Experience

Spark Estate layered listening: members build a calm mix without managing a studio console.

## Mix rules

| Layer | Maximum active | Selection behavior |
|-------|----------------|--------------------|
| **Voice** | 1 | Selecting another Voice replaces the current Voice. Spoken experiences never overlap. |
| **Environment** | 0–3 soundscapes | Selecting adds to the mix. Duplicates are ignored. A fourth choice is blocked (never silent replace). |
| **Background Music** | 1 | Selecting another Music track replaces the current Music. |

Valid example:

- Voice: Peaceful Morning Reflection  
- Environment: Gentle Rain + Morning Birds + Fireplace  
- Music: Soft Piano  

**Maximum simultaneous sources:** 5 (1 Voice + 3 Environment + 1 Music).

## Environment mix state

Active environment entries are modeled as `activeEnvironmentTracks: EnvironmentLayerTrack[]` (not a single `activeAmbientTrack`).

Each entry includes:

- stable track ID, title, source  
- selected volume (member preference)  
- effective playback volume (derived)  
- playing / paused  
- loop setting  
- load / error state  
- optional position  

`HTMLAudioElement` instances are **never** stored in React state. Playback handles live in the shared engine (`lib/layeredAudio/engine.ts`) via a playback port.

## Volumes

### Independent Environment volumes

Each soundscape has its own selected volume (e.g. Rain 60%, Birds 25%, Fireplace 35%).

### Environment Master Volume

Optional overall Environment control scales the entire mix without overwriting individual preferences.

### Effective volume

```
effective = selectedVolume × environmentMasterVolume × duckingMultiplier
```

Music:

```
effective = selectedVolume × musicDuckingMultiplier
```

Ducking must not mutate selected preferences.

## Voice ducking

When Voice plays (or higher-priority spoken media is active):

1. Duck Music  
2. Gently duck the combined Environment mix  
3. Preserve relative balance among active Environment tracks  

When Voice pauses, stops, or ends: restore prior effective balance; leave Environment tracks playing if they were playing before.

Constants: `VOICE_DUCK_MUSIC`, `VOICE_DUCK_ENVIRONMENT` in `lib/layeredAudio/constants.ts`.

## Three-sound limit & duplicates

- Soft limit message: *You can combine up to three environment sounds. Remove one before adding another.*  
- Do not auto-remove the oldest track.  
- Duplicate IDs are rejected without adding a second instance.

## Media priority

1. Shari live voice or user-triggered spoken video  
2. Active Voice track  
3. Music  
4. Environment mix  

Higher-priority speech: prevent competing Voice playback; duck Music + Environment; keep Environment selections and relative volumes.

## Presets

Presets may include up to three Environment track IDs plus optional Music and Voice. They must reference catalog IDs. Unavailable tracks are skipped; the rest of the preset still applies.

After a preset, adding/removing/changing Environment marks the mix **Customized** without resetting Voice or Music.

## Catalog

Environment tracks include: stable ID, title, category (Weather, Water, Nature, Cozy Spaces, Community Spaces, Noise Colors), source, default volume, loop, compatibility tags, sensory intensity, recommended pairings (suggestions only — unusual combinations are allowed).

## Performance

- Lazy load: create playback handles only when a track is added  
- Do not decode the full catalog at startup  
- Stop and release removed tracks  
- Avoid storing playback clocks in React (use pub/sub snapshots)  
- Module singleton survives Estate route changes; remounts must not create duplicate Audio  
- No autoplay after page refresh  
- If a device cannot support the full mix, fail the failing layer gracefully — do not stop every layer

## Accessibility

- Large readable titles  
- Clear included-vs-active text (Playing / Paused), not color alone  
- Controls at least 48px high where practical  
- Keyboard-focusable buttons with visible focus  
- Descriptive labels (Add, Pause, Remove, volume)

## UI entry

Header sound menu → **Environment Sounds** opens `LayeredAudioMixerPanel`.  
`LayeredAudioHost` in companion layout registers Stop All Sound cleanup.

## Runtime

| Concern | Path |
|---------|------|
| Engine | `lib/layeredAudio/engine.ts` |
| Session singleton | `lib/layeredAudio/session.ts` |
| Catalog / presets | `lib/layeredAudio/catalog.ts`, `presets.ts` |
| Mixer UI | `components/companion/layeredAudio/LayeredAudioMixerPanel.tsx` |

## Graceful failure

- Missing Voice/Music file: calm error; Environment continues  
- Play rejected by browser: message asks the member to try again  
- Fourth Environment: status message; mix unchanged  

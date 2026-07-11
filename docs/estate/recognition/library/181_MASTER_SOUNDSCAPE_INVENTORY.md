# 181_MASTER_SOUNDSCAPE_INVENTORY

# Spark Estate™
## Master Soundscape Inventory

**Version:** 1  
**Status:** Architecture + inventory  
**Date:** 2026-07-09  
**Series:** Soundscapes™ / Audio assets (181)

**Related:**
- [163 Soundscapes™ Architecture](./163_SOUNDSCAPES_ARCHITECTURE.md)
- [162 Scenes™ Architecture](./162_SCENES_ARCHITECTURE.md)
- Runtime inventory — `lib/soundscapes/masterSoundscapeInventory.ts`
- Audio path constants — `lib/soundscapes/audioAssets.ts`
- Product note — [`docs/estate/soundscapes.md`](../../soundscapes.md)

---

## Purpose

Master inventory for Spark Estate™ audio assets. Audio is reusable globally unless marked as a signature sound for a specific Scene.

## Rules

- Audio is optional.
- Silence is always available.
- Signature sounds are recommended, never required.
- Files keep original filenames; members see display names.
- Spark may learn favorites and recently played combinations over time.

## Current Inventory

| ID      | Display Name                      | Category             | Original Filename                                                             | Length   | Loop   | Signature Scene / Suggested Use                | Notes                                   |
|:--------|:----------------------------------|:---------------------|:------------------------------------------------------------------------------|:---------|:-------|:-----------------------------------------------|:----------------------------------------|
| AUD-001 | Gentle Rain on Tin Roof™          | Nature Soundscape    | RAINMetl-Gentle_rain_on_a_tin-Elevenlabs.mp3                                  | 0:30     | Yes    | Bedroom Window™ / Any Scene                    | Reusable rain ambience                  |
| AUD-002 | Gentle Rain™                      | Signature Soundscape | bedroom-window-ambience.mp3                                                   | 2:30     | Yes    | Bedroom Window™                                | Signature sound; also reusable anywhere |
| AUD-003 | Movement Studio™                  | Spark Music™         | bright-studio-ambience.mp3                                                    | 2:39     | Yes    | Bright Studio™                                 | Songer instrumental                     |
| AUD-004 | Coffee Shop Chatter™              | Ambience             | coffee-shop-chatter-audio.mp3                                                 | 0:30     | Yes    | Coffee House™                                  | Coffee shop background noise            |
| AUD-005 | Morning Whisper™                  | Spark Music™         | east-terrace-morning-whisper.mp3                                              | 4:18     | Yes    | East Terrace™                                  | Songer instrumental                     |
| AUD-006 | Fireplace at Night™               | Signature Soundscape | evening-hearth-ambience.mp3                                                   | 2:28     | Yes    | Evening Hearth™ / Fireside Deck™               | Signature sound; also reusable anywhere |
| AUD-007 | Evening Reflections™              | Spark Music™         | evening-reflections-private-swimming-pool.mp3                                 | 2:18     | Yes    | Swimming Pool™                                 | Reflective instrumental                 |
| AUD-008 | A Minute of Peace™                | Nature Soundscape    | freesound_community-a-minute-of-peace-19842.mp3                               | 1:08     | Yes    | Any Scene                                      | Peaceful nature ambience                |
| AUD-009 | Aquarium Ambience™                | Signature Soundscape | freesound_community-indoor-fish-tank-without-bubble-strips-ambiance-33541.mp3 | 0:31     | Yes    | Aquarium Room™                                 | Signature sound; also reusable anywhere |
| AUD-010 | Water Fountain™                   | Nature Soundscape    | freesound_community-mustique-water-fountain-27721.mp3                         | 1:01     | Yes    | Garden / Terrace / Any Scene                   | Reusable water ambience                 |
| AUD-011 | Greenhouse Birds™                 | Signature Soundscape | greenhouse-birds-ambience.mp3                                                 | 0:56     | Yes    | Greenhouse™                                    | Signature sound; also reusable anywhere |
| AUD-012 | Java Serenade™                    | Spark Music™         | java-seranade-coffee-house.mp3                                                | 2:49     | Yes    | Bright Studio™ / Coffee House™ / Writing Room™ | Uplifting instrumental                  |
| AUD-013 | Morning Momentum™                 | Spark Music™         | music-loft-ambience.mp3                                                       | 3:05     | Yes    | Music Room™ / Bright Studio™                   | Uplifting instrumental                  |
| AUD-014 | Early Summer Birds™               | Nature Soundscape    | nils_vega-birds-singing-in-early-summer-359446.mp3                            | 1:06     | Yes    | Any outdoor Scene                              | Reusable birds ambience                 |
| AUD-015 | Pulse of Momentum™                | Spark Music™         | pulse-of-momentum-energy-exercise-room.mp3                                    | 2:26     | Yes    | Momentum / Exercise Room™                      | Energetic instrumental                  |
| AUD-016 | Reflections of Triumph — Garden™  | Spark Music™         | reflections-of-triumph-celebration-garden.mp3                                 | 1:45     | Yes    | Celebration Garden™                            | Celebratory reflective instrumental     |
| AUD-017 | Reflections of Triumph — Gallery™ | Spark Music™         | reflections-of-triumph-gallery.mp3                                            | 1:32     | Yes    | Gallery™ / Hall of Accomplishments™            | Celebratory reflective instrumental     |

## Recommended Audio Menu

### Recommended for This Scene
Shown only when a Scene has a signature sound.

### Spark Music™
Original instrumental music and branded Spark Estate™ tracks.

### Nature
Birds, rain, water, outdoor ambience.

### Ambience
Coffee house, fireplace, aquarium, environmental background sounds.

### Favorites / Recently Played
Personalized per member.

### Silence
Always available.

---

## Runtime Implications

| Concern | Guidance |
|---------|----------|
| IDs | Stable `AUD-###` identifiers for menus, favorites, and learning |
| Display | Members see display names; disk keeps original filenames |
| Pairing | Reusable globally; signature Scene is suggestion only (#163) |
| Silence | Always offered in the audio menu |
| Catalog | Playback registry remains `lib/soundscapes/`; this inventory is the master asset list |

## Implementation Notes

| Layer | Location |
|-------|----------|
| This inventory | `docs/estate/recognition/library/181_MASTER_SOUNDSCAPE_INVENTORY.md` |
| Runtime mirror | `lib/soundscapes/masterSoundscapeInventory.ts` |
| Path constants | `lib/soundscapes/audioAssets.ts` |
| Architecture | [163 Soundscapes Architecture](./163_SOUNDSCAPES_ARCHITECTURE.md) |

**Status:** Inventory ingested from Downloads. Runtime resolves plates under `public/audio/Soundscapes/` and `public/audio/peaceful-places/` via `lib/soundscapes/audioAssets.ts` and `masterSoundscapeInventory.ts`.

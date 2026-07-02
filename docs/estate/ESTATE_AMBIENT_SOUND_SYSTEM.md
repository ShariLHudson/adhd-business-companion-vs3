# Estate Ambient Sound System™

| Field | Value |
|-------|-------|
| **Status** | **Authoritative** architecture — hospitality layer |
| **Runtime** | `lib/estate/estatePlaceMedia.ts` · `estatePlaceAmbientSound.ts` · `estatePlaceAmbienceIntent.ts` · `estateRoomAmbience.ts` |
| **Assets** | `public/audio/` · `lib/soundscapes/audioAssets.ts` |
| **Related** | [Spec 111 — Hospitality](../SPARK_HOSPITALITY_FRAMEWORK.md) · [Estate Light Flicker](../../.cursor/rules/estate-light-flicker.mdc) · [The Friend We All Deserve™](../THE_FRIEND_WE_ALL_DESERVE.md) |

---

## Principle

**Ambience is part of the hospitality experience — not background audio.**

Every Estate place should eventually have its own **unique ambient identity** that reflects its **emotional purpose**. The member should feel like they are returning to a **real place**, not replaying the same sound loop.

Ambience must **never become repetitive or distracting**.

---

## Architecture hierarchy

```
Place identity (visual + emotional purpose)
    ↓
Canonical ambience intent (layers — what belongs in this place)
    ↓
Primary loop(s) on disk (V1: one file per place)
    ↓
Future: track pool + gentle per-visit variation
```

**Code:** `EstateArrivalAmbienceProfile` in `estateArrivalExperienceTypes.ts`

| Field | V1 | Future |
|-------|-----|--------|
| `src` | Primary loop | Default when pool has one track |
| `volume` | Member-adjustable via estate audio settings | Same |
| `character` | Hospitality intent summary | QA + mixing guide |
| `layers` | Target sonic layers (intent) | May map to separate stems |
| `trackPool` | Single entry mirroring `src` | Weighted random per visit |

**Picker:** `pickAmbienceTrackForVisit()` — V1 returns primary; future uses visit seed for gentle randomization.

---

## Canonical place intents (target mix)

Documented in `ESTATE_PLACE_AMBIENCE_INTENT` (`estatePlaceAmbienceIntent.ts`).

### Welcome Home

- Soft breeze
- Distant birds
- Porch ambience

### Journal Gazebo (`journal`)

- Gentle water
- Birds
- Breeze
- Occasional page turn *(very subtle)*

### Apple Orchard (`apple-orchard`)

- Orchard ambience
- Leaves moving
- Bees *(very subtle)*
- Distant birds
- Soft wind

### Greenhouse (`greenhouse`)

- Glasshouse atmosphere
- Light water trickle
- Occasional gardening sounds *(very subtle)*

### Reading Nook (`reading-nook`)

- Fireplace or gentle room ambience
- Quiet page turns
- Clock very faint *(optional)*

### Celebration Garden (`gardens`, `celebration-room`)

- Water fountain
- Butterflies *(visual)*
- Light birds

### Achievement Library (`library`)

- Quiet library ambience
- Fireplace
- Soft room tone

### Boardroom (`goals-projects`)

- Silence
- HVAC room tone
- Very subtle executive office ambience

*Never busy or motivational — room tone only.*

---

## V1 vs future

### V1 (current)

- One loop file per place where assets exist
- Intent **layers** document emotional purpose even when mixed into a single MP3
- Crossfade between places (`estateRoomAmbience.ts`) — never overlap place identities
- Respects reduced motion, member ambience toggle, estate silence

### Future

- **Multiple tracks per place** in `trackPool`
- **Gentle randomization** per visit (not shuffle-player randomness)
- Optional layered stems (water + birds + breeze) mixed at low level
- Seasonal variants (see Journal Gazebo seasonal backgrounds)
- Visit memory — avoid repeating the same track twice in a row when pool allows

**Design test:** Would a member notice the place feels alive — without noticing the audio engine?

---

## Adding a new place

1. Add `placeId` to `ESTATE_PLACE_AMBIENCE_INTENT` with layers + emotional purpose
2. Add audio file(s) under `public/audio/` (room-named preferred)
3. Register constant in `lib/soundscapes/audioAssets.ts`
4. Map in `CANONICAL_PLACE_AMBIENCE` (`estatePlaceMedia.ts`)
5. If Layer-1 override needed, add to `ESTATE_PLACE_AMBIENT_SOUND` (`estatePlaceAmbientSound.ts`)
6. Verify distinct identity from neighboring places in acceptance tests

---

## Forbidden

- One generic loop for all outdoor places
- Autoplay at intrusive volume
- Motivational or productivity-bed music as place identity
- Strobe-synced or arcade sound design
- Loops that draw attention to themselves (Spec 103 — calm estate feel)

---

## Acceptance sequence (regression)

Reading Nook → Journal Gazebo → Greenhouse must resolve **three distinct** ambient identities. See `ESTATE_AMBIENT_ACCEPTANCE_SEQUENCE` and `estatePlaceAmbientSound.test.ts`.

---

*Estate Ambient Sound System™ — hospitality you hear before you think about it.*

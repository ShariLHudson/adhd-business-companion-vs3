# Seasonal Estate Guide™

| Field | Value |
|-------|-------|
| **Series** | Spark Estate Documentation · **09 of 10** |
| **Status** | Design authority — implement after cleanup phases |
| **Parent** | [08 — UI Philosophy](./08%20-%20UI%20Philosophy.md) |
| **Next** | [10 — Future Expansion Ideas](./10%20-%20Future%20Expansion%20Ideas.md) |

---

## Principle

The estate is **alive** — not a static JPEG. Seasons, time of day, and weather shift mood without becoming a game or a notification system.

Members feel: *“This place keeps going even when I’m away.”*

---

## What changes (subtle)

| Dimension | Expression |
|-----------|------------|
| **Season** | Color grade, foliage, orchard, garden plantings, hearth use |
| **Time of day** | Window light, lantern vs daylight, porch swing shadows |
| **Weather** | Rain on glass, mist on pond, snow on balcony rails — optional ambience |
| **Holidays** | Quiet celebration accents — never gamified events |

**Never:** push alerts (“Spring event started!”), streaks, or collectibles.

---

## Room affinities (examples)

| Season / moment | Natural places |
|-----------------|----------------|
| Early spring | Greenhouse, orchard buds, garden paths |
| Summer | Back deck, dock, porch swing, apple orchard |
| Autumn | Orchard harvest, reading nook, tea room |
| Winter | Hearth rooms, conservatory, coffee house |
| Evening | Lantern flicker, music room, stables calm |
| Morning | Sunroom, welcome home light, greenhouse birds |

Season suggests — **never forces** — a place. Conversation still wins.

---

## Light & motion

All warm light follows **Estate Light Flicker™**:

- Lanterns, candles, fireplaces — soft flicker  
- `prefers-reduced-motion: reduce` → animations off  
- No strobe, no arcade pulse  

**File:** `app/companion/estate-light-flicker.css`

---

## Audio seasons

| Ambience | When |
|----------|------|
| Greenhouse birds | Spring/summer greenhouse visits |
| Hearth crackle | Winter evening destinations |
| Pond / woodland | Peaceful Places, dock |
| Silence | Valid — default in many rooms |

Autoplay never shocks. Member control always available — icon-only.

---

## Loading & empty states

Use **seasonal scene** — dimmed, softened — never blank white panel.

“Not ready” rooms: same estate, gentler grade — not an error screen.

---

## Implementation order

1. Complete [Cleanup Roadmap](../ESTATE_CLEANUP_ROADMAP.md) — one scene per `roomId`  
2. Asset variants per season (or shader grade if one master photo)  
3. Quiet time-of-day on Welcome Home + Living paths  
4. Orchard/garden seasonal art swaps  
5. Optional member preference: “Always summer on the porch” (Memory Center — permission)

---

## Do not

- Reskin the entire app per holiday with new UI chrome  
- Replace conversation with seasonal tutorials  
- Count days visited or “season completion”  
- Block rooms by season without narrative reason  

---

## Shari and seasons

At most one natural line — never weather reports as filler.

- “Orchard’s starting to wake up.”  
- “Good night to sit by the pond.”  

Not: “Happy first day of fall! Here are five activities.”

---

## Related

- Visual standards: `docs/estate/ESTATE_IMAGE_BIBLE.md` (when present)  
- Light: `.cursor/rules/estate-light-flicker.mdc`

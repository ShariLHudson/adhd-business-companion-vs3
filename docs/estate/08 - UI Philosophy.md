# UI Philosophy™

| Field | Value |
|-------|-------|
| **Series** | Spark Estate Documentation · **08 of 10** |
| **Status** | Permanent — supersedes feature-first UI |
| **Extended** | [SPARK_ESTATE_UI_PHILOSOPHY.md](../SPARK_ESTATE_UI_PHILOSOPHY.md) (full release gates) |
| **Parent** | [01 — Constitution](./01%20-%20Spark%20Estate%20Constitution.md) |
| **Next** | [09 — Seasonal Estate Guide](./09%20-%20Seasonal%20Estate%20Guide.md) |

---

## One sentence

> Every screen is a photograph of a luxury estate; conversation floats on the glass; objects in the room are real; software stays invisible.

---

## The Photograph Test™

> Could this frame hang on a wall — and still feel like somewhere you would want to live?

No → redesign before code.

---

## Three layers (only three)

| Layer | Content | Default |
|-------|---------|---------|
| **1 — Scene** | Full-bleed image/video, light, ambience | Always |
| **2 — Float** | Frosted conversation panel, centered | When talking |
| **3 — Object** | Book, folio, drawer, map, latch | Destinations only |

Scene ≥ **70%** perceived visual weight. Nothing above the photograph except float or object.

---

## Non-negotiables

1. **Estate image is always the hero** — no white gutters, no dashboard canvas  
2. **Chat floats over the scene** — no split chat + tools column  
3. **Guidebook is a physical object** — pages, cover, close ([04 — Objects](./04%20-%20Estate%20Objects.md))  
4. **No dashboards** — no KPI tiles, feeds, overview grids  
5. **No software panels** — no sidebars, top bars, placeholder workspaces on arrival  
6. **No unnecessary buttons** — Necessity Test per control  
7. **No room labels** — place known from photo; diegetic art text only  
8. **No instructional overlays** — no tours, coach marks, emoji feature grids  

---

## Material language

| Quality | Direction |
|---------|-----------|
| Glass | Warm frosted cream — not cold gray |
| Type | Large, readable on glass |
| Shadow | Soft — object on wood, not Material elevation |
| Color | Warm neutrals, brass, ink from the photograph |
| Motion | Gentle flicker, page turn, slow parallax |
| Density | Air. Silence is luxury. |

**Canonical CSS:** `app/companion/estate-light-flicker.css` — lanterns, candles, fireplaces.

---

## Category → UI

| Category | UI |
|----------|-----|
| Conversation | Scene + float |
| Living | Scene (+ optional minimal float) |
| Destination | Scene + recessive float + one object system |

---

## Allowed (sparingly)

- Mic / send / one primary action  
- Folded map (corner)  
- Recessive ambience mute  
- Shari lines in chat — not banners  

---

## Forbidden (quick)

Split workspace · room title chrome · invitation panel on arrival · `GrowPlaceholderPanel` as home · white `#fff` workspace · persistent top bar · data tables as hero · onboarding carousel over scene  

---

## Release gate (8 yeses)

1. Photograph still hero?  
2. Chat floating, scene visible?  
3. Zero dashboards / panels?  
4. Zero labels / instructional overlays?  
5. Every button necessary?  
6. Objects physical where used?  
7. Photograph Test?  
8. Shari test?  

**Any no → not shippable.**

---

## Engineering convergence

- One scene compositor per `roomId`  
- One float shell (`workspaceFloatingCardShellClass` / Spec 109)  
- Object registry optional per Destination  
- Route = place — not `AppSection` matrix  

---

## Precedence

When [Estate Room Template](../ESTATE_ROOM_TEMPLATE.md) conflicts (hero plaques, invitation grids, persistent names), **this document wins**.

# Discovery Key™ — Visual Asset & Interaction Reference

**Official visual reference for the Discovery Key object**

| | |
|---|---|
| **Status** | Binding — canonical asset; no alternate key designs |
| **Canonical asset** | `/public/images/discovery-key.png` |
| **Public URL** | `/images/discovery-key.png` |
| **Behavior** | [DiscoveryKey-Behavior.md](./DiscoveryKey-Behavior.md) |
| **Constitution** | [DiscoveryKey-Constitution.md](./DiscoveryKey-Constitution.md) |

---

## Official asset

This image is the **only approved** Discovery Key™ visual for Spark Estate.

| Property | Value |
|----------|-------|
| **File** | `discovery-key.png` |
| **Repository path** | `companion-app/public/images/discovery-key.png` |
| **Reuse rule** | One asset everywhere — do not recreate variants |

The image represents the **physical Discovery Key** that exists throughout Spark Estate — not a digital icon, badge, or menu glyph.

---

## Visual identity

The Discovery Key™ must maintain these characteristics:

| Element | Description |
|---------|-------------|
| **Key body** | Antique brass skeleton key — ornate bow, classic bit |
| **Key tag** | Dark elegant tag with clipped corners |
| **Lettering** | Gold embossed **DISCOVERY KEY** (Discovery Key™) |
| **Emblem** | Small Estate spark / flame mark above the lettering |
| **Tassel** | Neutral elegant cream tassel on braided cord |
| **Feeling** | Vintage heirloom — warm, premium, timeless |
| **Mood** | Object discovered inside a beautiful estate |

### Must feel like

- A treasured possession left on a desk or shelf
- Warm metal and soft light
- Quiet invitation — not software chrome

### Must not feel like

- A notification bell or app icon
- Cartoon key art or game loot
- Flat UI sticker with no depth
- A different key design per room

---

## Usage in Estate environments

The key appears **naturally within** Estate room scenes.

### Approved contexts (examples)

- Resting on a desk
- Sitting beside books
- Hanging from a hook
- Placed on a table
- Sitting near a fireplace
- Resting on a windowsill
- Other locations defined in [Room Placement Library](../room-placement-library.json)

### Scene integration

| Rule | Requirement |
|------|-------------|
| **Lighting** | Match room image warm light and shadow direction |
| **Perspective** | Scale and angle believable for the surface |
| **Integration** | Must not look pasted onto the scene |
| **Layer** | Diegetic object in scene — not floating UI |

Placement coordinates and per-room notes live in `room-placement-library.json` when populated.

---

## Interaction behavior (visual)

When the member clicks the Discovery Key™:

| Step | Visual |
|------|--------|
| **1** | Key becomes **slightly highlighted** (subtle — not a bright flash) |
| **2** | Key **gently rotates or turns** — as though unlocking something |
| **3** | **Subtle warm golden glow** around the key (estate-light quality) |
| **4** | **Discovery Note** opening animation begins |

### Animation qualities

- Elegant
- Calm
- Magical but realistic
- Like discovering a hidden note in an old estate

### Avoid

- Cartoon effects
- Bright flashes
- Excessive sparkle
- Game-like bounce or shake
- Loud notification behavior
- Red badges or counters

Aligns with [DiscoveryKey-Behavior.md](./DiscoveryKey-Behavior.md) and `app/companion/estate-light-flicker.css` — gentle warm light only; respect `prefers-reduced-motion`.

---

## Placement rules

The Discovery Key™ is an **environmental object**.

| It is | It is not |
|-------|-----------|
| A discovery affordance in-scene | A menu button |
| Temporary when a discovery is available | A floating UI icon |
| One key estate-wide | A permanent navigation element |

- Appears **only** when a Discovery is available
- **Only one** Discovery Key visible at a time
- Disappears when the discovery is completed

---

## Relationship: key → Discovery Note

```
Member notices key
    → Member clicks key
    → Key unlocks (highlight · rotate · warm glow)
    → Discovery Note appears
    → Member explores discovery
    → Key disappears until next discovery
```

The key **unlocks** the note. The note is the content; the key is the object.

Discovery Note UI is specified separately. This document governs the **key object** only.

---

## Development notes

### Asset handling

```text
Do NOT create alternate key PNGs, SVG icons, or per-room key art.
Always use: /images/discovery-key.png
```

### Implementation checklist (when UI ships)

- [ ] Single canonical asset path in code constants
- [ ] Scene compositing: light, shadow, scale per placement library
- [ ] Click: highlight → rotate → glow → note (see Behavior doc)
- [ ] No second key variant in CSS or components
- [ ] `aria-label` describes discovery invitation — not "notification"
- [ ] One key visible globally

### Registry cross-reference

| System | Field / doc |
|--------|-------------|
| Room Placement Library | `placementType: "discovery-key"` · `sceneImage` |
| Discovery Library | `targetId` links to Live registry items |
| Estate Intelligence | [README.md](../README.md) |

---

## Document map

| Layer | Document |
|-------|----------|
| **Why** | [DiscoveryKey-Constitution.md](./DiscoveryKey-Constitution.md) |
| **Behavior** | [DiscoveryKey-Behavior.md](./DiscoveryKey-Behavior.md) |
| **Visual & asset** | **This document** |
| **Data** | [discovery-rules.md](../discovery-rules.md) · registries |

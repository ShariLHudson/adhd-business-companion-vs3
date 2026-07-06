# Discovery Key™ — Behavior & Interaction Rules

**Complete behavioral specification — documentation before UI**

| | |
|---|---|
| **Status** | Foundational — behavior spec; no UI implementation yet |
| **Constitution** | [DiscoveryKey-Constitution.md](./DiscoveryKey-Constitution.md) |
| **Data** | [discovery-rules.md](../discovery-rules.md) · [discovery-library.json](../discovery-library.json) · [room-placement-library.json](../room-placement-library.json) |
| **Parent** | [Estate Intelligence System](../README.md) |

---

## Purpose

The Discovery Key™ should feel like a **natural part of Spark Estate**.

It should never behave like a notification icon. It should feel as though Spark quietly left something meaningful for the member to discover.

**Emotional target:** *"I wonder what Spark left for me today."*

---

## Only one key

Only **one** Discovery Key may exist at any given time.

| Rule | Meaning |
|------|---------|
| **One key globally** | Never display multiple keys across the Estate |
| **One active discovery** | One Discovery Note cycle at a time |
| **Completion clears** | When a discovery is completed, the key disappears until the next discovery is scheduled |

---

## Key placement

The key appears **naturally inside the current Estate room** — never floating on top of the interface.

It should look like it **belongs in the room**.

### Approved placement surfaces (examples)

Bookshelf · desk · fireplace · windowsill · table · bench · railing · flower pot · shelf

Exact coordinates and scene alignment come from the **[Room Placement Library](../room-placement-library.json)** — not ad hoc UI positioning.

### Placement principles

| Principle | Rule |
|-----------|------|
| **Diegetic** | The key exists in the scene, not on a chrome layer |
| **Contextual** | Placement should feel believable for that room |
| **Stable** | While the member remains in that room, the key does not drift or reposition |

---

## Initial placement

When a new Discovery becomes available:

1. Select a **room** appropriate to the discovery (from Estate Intelligence registries)
2. Choose **one approved placement location** within that room (from Room Placement Library)
3. Place the key there
4. **Leave it there** — it does not move while the member is in that room

---

## Visibility — first appearance

When first placed:

| Never | Always |
|-------|--------|
| Flashing | Calm presence |
| Animation on arrival | Natural existence in the scene |
| Sound | Silence |

The key simply **exists** naturally within the room.

---

## Gentle visibility (unnoticed visits)

If the member has entered that room **several times** without noticing the key, a **very subtle** visual cue may appear.

### Allowed cues

- Soft warm glow
- Gentle halo
- Tiny glint across the brass

Effects must be **elegant and barely noticeable**.

### Never use

- Flashing
- Bouncing
- Shaking
- Loud effects
- Red badges
- Notification counters
- Pulsing app-style alerts

Aligns with [Estate Light Flicker](../../estate/) principles — warm, gentle, never arcade.

---

## Relocation rule

The key remains where it is **unless there is a meaningful reason to move it**.

### Acceptable relocation reasons

| Reason | Intent |
|--------|--------|
| Member has not visited that room for several days | Discovery may never be found where it waits |
| Member repeatedly uses another room | Meet the member where they already are |
| Original room is unlikely to be discovered | Thoughtful redistribution — not random |

### When relocating

1. Choose another **appropriate room** (registry-backed, Live status)
2. Choose another **approved placement location** in that room
3. Relocation must feel **thoughtful** — never random or punitive

### Never relocate because

- Member ignored the key once
- Member closed a note without acting
- System impatience or engagement metrics

---

## Clicking the key

When the member clicks the key:

| Step | Behavior |
|------|----------|
| **1** | The key gently rotates — as though unlocking something |
| **2** | A soft golden light appears |
| **3** | A Discovery Note unfolds |
| **4** | The member reads the note |
| **5** | The member may: **follow the recommendation** · **save for later** · **close** |
| **6** | When the note closes: the key **disappears**; the current discovery is **completed**; the next discovery appears **later**, in **another room** |

### Motion and sound

- Rotation and light: **soft, brief, premium** — not cartoon or game-like
- No required sound; if any, whisper-quiet and optional
- Respect `prefers-reduced-motion: reduce`

---

## Discovery Note

The Discovery Note must **not** feel like software.

It should feel like a **beautiful note intentionally left** for the member.

| Property | Rule |
|----------|------|
| **Tone** | Warm, calm, optional — see Constitution |
| **Food for Thought** | Optional; never a required text field |
| **Personal observations** | Positive only; see Constitution guardrails |
| **UI design** | Specified separately — this document governs **behavior** only |

Content comes from [discovery-library.json](../discovery-library.json) referencing **Live** registry items.

---

## Navigation

If the Discovery Note recommends a room, feature, tool, setting, audio, or activity:

1. Include a **primary action button**
2. Use clear labels — e.g. **Take Me There** · **Show Me How** · **Open This Room** · **Try It Now** · **Save for Later**
3. Clicking the primary action **immediately navigates** to the destination
4. Member must **not** search for something the Key just mentioned

Resolve destinations from [estate-routes.json](../estate-routes.json) and related registries.

---

## Ignoring the key

Members are **never pressured**.

| If member ignores the key | System behavior |
|---------------------------|-----------------|
| Leave it where it is | No interruption |
| Do not nag | No repeated reminders in conversation |
| Do not shame | No "you missed something" copy |
| Relocate only later | And only per [Relocation rule](#relocation-rule) |

Staying is valid. Ignoring is valid.

---

## Completion and rotation

| Event | Result |
|-------|--------|
| Member completes note (any exit path that closes it) | Key disappears; discovery marked complete |
| Member saves for later | Key may disappear; saved discovery retrievable without re-placing key in scene (implementation detail — must not feel like homework) |
| Next discovery | Scheduled for a **later** visit, in a **different room** — not immediate spam |

Only **one** key visible at a time across the entire Estate.

---

## Emotional goal

The member should think:

> *"I wonder what Spark left for me today."*

The Discovery Key should always feel:

- Calm
- Elegant
- Welcoming
- Optional
- Encouraging

It must **never** feel:

- Urgent
- Demanding
- Distracting
- Judgmental
- Like a notification system

---

## Relationship to Constitution and Estate Intelligence

| Layer | Document |
|-------|----------|
| **Why and what** | [DiscoveryKey-Constitution.md](./DiscoveryKey-Constitution.md) |
| **How it reads data** | [discovery-rules.md](../discovery-rules.md) |
| **How it behaves** | **This document** |
| **What exists in the Estate** | [Estate Intelligence registries](../README.md) |

Constitution wins on experience conflicts. Estate Intelligence wins on what may be claimed as **Live**.

---

## Future compatibility

Design behavior so future versions can incorporate **without changing this model**:

| Future capability | Fits because |
|-------------------|--------------|
| **Personalization** | Same one-key, one-note cycle; content varies |
| **Seasonal discoveries** | Registry + library entries; placement from library |
| **Positive personal observations** | Note content only; guardrails in Constitution |
| **Smarter recommendations** | Selection logic behind the scenes; member still sees one calm key |

Do not add parallel key types, badge systems, or multi-key UI in future versions.

---

## Implementation gate (when UI is built)

Before any Discovery Key UI ships, verify:

- [ ] Only one key visible estate-wide
- [ ] Placement from Room Placement Library — diegetic in scene
- [ ] No flash, bounce, badge, or counter on first appearance
- [ ] Gentle visibility cues only after repeated unnoticed visits
- [ ] Click sequence: rotate → soft light → note → optional action → key gone on close
- [ ] Primary navigation button when destination is named
- [ ] Ignore path: no nagging; relocation only per rules
- [ ] All targets **Live** in Estate Intelligence registries
- [ ] Passes Discovery Key Constitution and Spark Estate Test

**No UI in this phase.** Behavior is documented; implementation follows.

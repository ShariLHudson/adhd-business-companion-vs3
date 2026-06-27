# Companion Homestead Screen Composition Guide
## How Every Room Becomes a Screen

**Version:** 1.0  
**Status:** Design authority — Phase 1 (no production UI implementation)  
**Audience:** Designers, engineers, AI builders, art direction

**Bridges:**

```
Room Look Books  →  Screen Composition Guide  →  Production UI
```

**Prerequisites (approved):**

- [`docs/room-lookbooks/`](../room-lookbooks/) — emotional and environmental design per room
- [`COMPANION_HOMESTEAD_MANIFESTO.md`](../COMPANION_HOMESTEAD_MANIFESTO.md)
- [`VISUAL_DESIGN_BIBLE.md`](./VISUAL_DESIGN_BIBLE.md)
- [`lib/companionUniverse/companionLayoutSystem.ts`](../../lib/companionUniverse/companionLayoutSystem.ts) — immersion profiles
- [`lib/companionObjects/companionObjectRegistry.ts`](../../lib/companionObjects/companionObjectRegistry.ts)

**This is NOT:** CSS · React · a component library · permission to ship room UI yet

**This IS:** visual architecture — the law for how every homestead room occupies a screen

---

## The One Recognition Test

A guest moves from the Living Room to the Window Seat to the Creative Studio.

They must immediately feel:

> **"I'm in the same home."**

Not: *"I'm on another page."*

Same handwriting in materials, light, card behavior, and navigation chrome. Different personality. Same homestead.

---

## Document Hierarchy

| Order | Document | Role |
|-------|----------|------|
| 1 | Manifesto + Constitutions | Why |
| 2 | Visual Design Bible | House DNA |
| 3 | Room Look Books | Room soul |
| 4 | **Screen Composition Guide** (this document) | How rooms become screens |
| 5 | [`FIRST_PRODUCTION_EXPERIENCE.md`](./FIRST_PRODUCTION_EXPERIENCE.md) | First 30–60s arrival journey |
| 6 | [`LIVING_LIFE_ENGINE.md`](./LIVING_LIFE_ENGINE.md) | Living place — natural change over time |
| 7 | Companion Layout System + Scene Integrity Engine | Implementation contracts |
| 8 | Production UI | Pixels |

No page ships until it passes this guide **and** its room look book.

---

# Part I — Universal Screen Anatomy

Every Companion Homestead screen is a **stack of seven layers**, bottom to top. Layers are conceptual — not necessarily separate DOM nodes — but every implementation must account for all seven.

```
┌─────────────────────────────────────────────────────────┐
│  7. Interaction Layer    chat · input · voice · scroll  │
│  6. Object Layer         Companion Objects             │
│  5. UI Layer             cards · buttons · workspace     │
│  4. Companion Layer     Shari presence                  │
│  3. Atmosphere Layer     light · weather · season · audio│
│  2. Living Layer         motion (one hero max)          │
│  1. Background Layer     photograph · focal point       │
├─────────────────────────────────────────────────────────┤
│  Persistent UI (outside stack) — House Map + Toolbelt   │
└─────────────────────────────────────────────────────────┘
```

**Persistent UI** is not a layer inside the room — it frames every room without becoming the room. Navigation stays stable; the content canvas becomes the place.

---

## 1. Background Layer

**What it is:** The room photograph — Iowa honest, warm homestead realism, never stock cosplay.

**Responsibilities:**

| Decision | Rule |
|----------|------|
| **How much is visible?** | Governed by **Room Immersion Profile** — environment share percent per place (see Part III). Living Room may approach full viewport; work rooms reserve 65–90% for working layer. |
| **Focal point** | The room's **Signature Feature** from its look book — fireplace, Iowa view, reef, planning desk, active project table. Photography composed so the hero sits in the **upper or upper-center band** unless the look book specifies otherwise. |
| **Negative space for UI** | **Safe composition zones** — declarative regions where copy, cards, and chat may float without covering the hero. Negative space is **designed**, not leftover. Scene Integrity Engine assigns zones per image ID. |
| **Avoiding clutter** | Foreground object cap (max five ranked objects). No decorative props that compete with signature feature. No beige placeholder blocks — hide asset until ready. |

**Object position:** `object-position` equivalent concept — anchor focal point per scene (e.g., fireplace center-left, view center-right). Never center-crop the hero under a opaque card.

**Never:** Full-bleed photo with no planned UI zones. Random stock crops. Competing focal points (fireplace + six props + logo).

---

## 2. Living Layer

**What it is:** Natural motion in the scene — life, not UI animation.

**Allowed motion sources (from look books):**

- Curtains · fire · fish (reef) · tree branches · steam · rain on glass · snow outside · dust in sunbeam · candle flicker

**Rules:**

| Rule | Detail |
|------|--------|
| **One hero motion** | Maximum one motion element may carry emotional weight (fire flicker, reef current, rain on glass). Everything else **subtle or static**. |
| **Amplitude** | Slow cycles — seconds to minutes, not milliseconds. No bounce, no pulse, no attention-grabbing loops. |
| **Reduced motion** | Respect `prefers-reduced-motion` — hero motion off or replaced with still frame. |
| **Integrity** | No butterflies in winter. No harsh sun in rain. No snow indoors. Scene Integrity Library enforces combinations. |

**Never:** Particle systems, confetti, parallax carnival, animated emoji, multiple competing loops.

---

## 3. Atmosphere Layer

**What it is:** Lighting, time of day, weather, season, window behavior, ambient audio.

**Source of truth:** **Scene Integrity Engine** only — never hand-picked per screen in production code.

| Input | Output |
|-------|--------|
| Season | Foliage, snow, light color temperature, object variants |
| Time of day | Sun angle, lamp state, fire likelihood |
| Weather | Rain on glass, cloud fill, audio bed |
| Life event (hospitality) | Prepared objects — lamp on, mug out — not UI reskins |

**Window behavior:** Open crack in summer evening; frost frame in winter; rain streaks when weather = rain. Consistent with look book lighting table.

**Audio:** Optional ambient bed from look book sound table — fireplace crackle, reef filter hum, rain — **low in mix**, duckable, off by default if user prefers silence.

**Never:** Manual atmosphere overrides per route. Impossible combinations (blizzard + golden hour picnic). Seasonal "event" banners.

---

## 4. Companion Layer

**What it is:** Shari's presence — still photograph, placement, gaze — governed by each room look book.

| Presence mode | Visual treatment |
|---------------|------------------|
| **Present (Host)** | Portrait visible — lower third or sidebar; gaze toward guest or warm neutral |
| **Nearby** | Smaller portrait or implied presence (empty chair, mug steam); voice in chat |
| **Occasionally present** | Portrait on invoke only; prepared evidence in scene |
| **Intentionally absent** | No portrait; room and copy carry relationship |

**Pose vocabulary:**

- **Standing** — rare; arrival, celebration threshold
- **Sitting** — Living Room, Creative Studio partner work
- **Not in frame** — Window Seat, deep focus rooms — voice only in Interaction Layer

**Gaze:**

- Toward user — welcome, partnership
- Toward window/view — Window Seat listener mode; not required elsewhere

**Never:** Animated AI Shari · lip-sync avatar · portrait covering signature feature · multiple Shari instances · guilt face on absence

**Kinsey:** Only when look book allows — never on object layer as icon; physical dog in scene or absent.

---

## 5. UI Layer

**What it is:** Software floating **above** the room — legible, warm, subordinate to place.

The room remains part of the experience. Cards are **paper on the table**, not walls erected in front of the fireplace.

### Universal UI Language

| Property | Specification |
|----------|---------------|
| **Card surface** | Warm cream / warm white — `~88–94%` opacity equivalent; not pure `#FFFFFF` slabs |
| **Card transparency** | Enough to hint room behind edge — **never fully opaque** on large panels |
| **Blur** | Light backdrop blur on card edges only if needed for legibility — **subtle** (conceptual: small radius), not frosted glass over entire photo |
| **Rounded corners** | Generous — `~12–16px` at card scale; softer than corporate SaaS |
| **Shadow** | Single soft warm shadow — low spread, low opacity; **no** heavy Material elevation stacks |
| **Border** | Optional 1px room-tinted border (wheat, sage, barn-red at low saturation) |
| **Spacing** | Table-scale padding — minimum touch target 44px; vertical rhythm relaxed |
| **Typography** | Legible sans for UI; conversational line length; no 8pt gray guilt text |
| **Room visibility** | After UI settles, **≥15%** of environment still recognizable at top or edges on work rooms; **≥50%** on arrival |

### Gradient overlay

When copy sits on photography: **warm gradient scrim** — bottom-up or side fade — never raw text on busy texture. Scrim color pulls from room palette (cream, wheat, soft clay).

### Working layer dominance

Work rooms: UI workspace occupies **center-lower viewport** — cream surface mimicking real table/desk, not glass morphism on photo.

**Never:** Giant opaque panels covering hero · dashboard grid as default · neon buttons · cold gray SaaS chrome · full-width white sheets

---

## 6. Object Layer

**What it is:** **Companion Objects** from registry — recognition, not decoration.

| Display mode | When |
|--------------|------|
| **Mini-scene placeholder** | Navigation cards, feature pickers — CSS homestead scene until PNG art lands |
| **Icon square** | Sidebar, top bar, inline labels — small, consistent size scale |
| **Label + object** | Always — object supports text; **never replaces** text label |
| **Button** | Object may prefix a button — not be the only affordance |

**Size scale (conceptual):** xs · sm · md · lg · card — one scale system app-wide.

**Rules:**

- One object per feature identity — registry ID required
- No emoji as substitute
- No clip art
- Max **one** object hero per card (the feature object — not object + emoji + badge)
- Objects do not animate independently except registry-approved subtle life (e.g., candle flicker on breathing object)

**Never:** Decorative object scatter · object grids without labels · competing icons per card

---

## 7. Interaction Layer

**What it is:** Chat, buttons, scroll, voice input — calm affordances.

| Element | Rule |
|---------|------|
| **Chat** | Lower third or sidebar chip on arrival; expands on intent — never blocks signature feature on first paint |
| **Input** | Single primary field visible when needed; voice as optional secondary |
| **Buttons** | One primary per viewport region; secondary actions text or soft outline |
| **Scroll** | Vertical, predictable; no horizontal card carousels as default |
| **Toolbars** | No crowded icon bars — House Map + Toolbelt persist; room does not add a third toolbar |
| **Voice** | Mic appears in context — not pulsing center stage |

**Never:** Six equal CTAs · floating action button explosion · modal stacks · notification badges on arrival

---

# Part II — Cross-Room Systems

## Eye Path

Intended visual journey per screen — **one path**, no fighting for attention.

**Universal pattern (work rooms):**

```
Signature feature (hero band)
        ↓
Room title / one-line promise (optional)
        ↓
Primary workspace or card
        ↓
Secondary content (if any)
        ↓
Chat / input (when active)
        ↓
Environment edge (breathing room)
```

**Rules:**

- Eyes hit **hero first** — then **one** primary task
- Chat does not compete with hero on cold open unless Living Room arrival
- No sidebar + center grid + bottom banner all shouting

### Phase 1 Eye Paths (approved rooms)

| Room | Eye Path |
|------|-----------|
| **Living Room** | Fireplace → Shari greeting → invite line → single continue action → chat entry → fireplace ember (return to calm) |
| **Planning Table** | Handcrafted desk / planner → today's date context → three priorities max → plan items → nearby Shari chip → window edge |
| **Window Seat** | Iowa view / rain → capture field → thought cards (minimal) → whisper chat → view again |
| **Reading Nook** | Reef glow → reading lamp → open content / strategy card → shelf edge → optional chat |
| **Creative Studio** | Active project table → draft surface → one artifact focus → partner Shari chip → golden window edge |

---

## Room Density

UI density must match emotional promise. Classification drives max cards, motion, and decisions.

| Class | Meaning | Max primary cards visible | Max simultaneous decisions | Hero motion |
|-------|---------|---------------------------|----------------------------|-------------|
| **Very Calm** | Arrival, relief, regulate | 1 | 1 | 1 (fire or rain) |
| **Calm** | Capture, reflect, read | 2 | 2 | 1 |
| **Balanced** | Plan, strategize | 3 | 3 | 0–1 |
| **Active** | Create, draft, build | 3–4 | 3 | 0–1 |
| **Creative** | Making, permission, mess | 3 | 2 (type + save) | 0–1 (light, not chaos) |

### Phase 1 room assignments

| Room | Room Density | Immersion profile | Environment share |
|------|---------------|-------------------|-------------------|
| Living Room | **Very Calm** | `full-arrival` | ~95% |
| Window Seat | **Calm** | `environmental-header` | ~35% |
| Planning Table | **Balanced** | `warm-workspace` | ~25% |
| Reading Nook | **Calm** | `warm-workspace` | ~25% |
| Creative Studio | **Creative** | `creative-studio` | ~30% |

Density caps are **hard** — overflow goes behind progressive disclosure, not tighter grids.

---

## ADHD Rules (Screen-Level)

Global constraints on every homestead screen:

| Dimension | Maximum |
|-----------|---------|
| **Visible primary decisions** | 3 (1 on Very Calm) |
| **Simultaneous cards** | Per Room Density table |
| **Hero motion elements** | 1 |
| **Competing accent colors** | 2 (room tint + one action accent) |
| **Animated UI elements** | 0 on load; 1 on user action if needed |
| **Auto-open panels** | 0 — consent required |
| **Notification surfaces on arrival** | 0 |

**Executive function:** One next thing visible. **Working memory:** State on screen, not in hidden tabs. **Overwhelm:** Progressive disclosure. **Decision fatigue:** Defaults chosen; "not today" always available. **Attention:** Hero anchors gaze. **Emotional regulation:** Warm surfaces before red urgency.

Aligns with Companion Behavior Audit — no feature mall, no premature routing.

---

## Never Do (Composition)

| Violation | Why |
|-----------|-----|
| Cover beautiful photography with giant opaque panels | Destroys "same home" — becomes SaaS |
| Floating UI everywhere | No place to rest eyes |
| Dashboard grids as room entry | Feature mall |
| Cards competing with signature feature | Software beats place |
| Software first, room second | Breaks homestead promise |
| Hide navigation to force immersion | Guest must always find exit |
| Glass over entire photograph | Legibility without destroying warmth — use scrim + cream workspace |
| Multiple heroes (fire + reef + Shari + banner) | Cognitive overload |
| Streak badges, guilt copy, red overdue | Trust violation |
| Emoji feature identity | Object Language breach |

---

# Part III — Phase 1 Room Composition Sheets

Each sheet summarizes how the seven layers apply. Full emotional detail remains in the room look book.

---

## Living Room (`living-room`)

| Layer | Specification |
|-------|---------------|
| **Background** | Wide interior; fireplace **center-left** hero; negative space **right and lower third** for greeting scrim |
| **Living** | **Hero:** fire flicker when lit; curtain drift secondary |
| **Atmosphere** | Engine-driven; lamp pools evening; snow/rain on windows per weather |
| **Companion** | **Present — Host**; portrait lower third; gaze welcome |
| **UI** | Minimal cards at arrival; single invite button; cream scrim not full card grid |
| **Objects** | `messages` when chat emphasized; dice cup only if play invited |
| **Interaction** | Chat primary after greeting; no workspace dominant |

**Eye Path:** Fireplace → greeting → invite → chat → fireplace  
**Density:** Very Calm

---

## Planning Table (`planning-table`)

| Layer | Specification |
|-------|---------------|
| **Background** | Desk surface in **upper 25%**; planner open at center of hero band |
| **Living** | Sun slide across wood (subtle); no hero motion required |
| **Atmosphere** | Morning-biased; clear light; engine only |
| **Companion** | **Nearby**; small chip, not portrait blocking planner |
| **UI** | **Working layer dominant**; cream planner surface; max 3 priority rows visible |
| **Objects** | `plan-my-day`, `calendar` — icon + label on nav; planner object on hero |
| **Interaction** | Tap to edit; drag optional; calm scroll |

**Eye Path:** Desk → date → priorities → items → Shari chip  
**Density:** Balanced

---

## Window Seat (`window-seat`)

| Layer | Specification |
|-------|---------------|
| **Background** | **Iowa view** fills hero band; rain streaks when weather = rain; blanket edge **lower left** |
| **Living** | **Hero:** rain on glass OR cloud shadow; branch motion subtle |
| **Atmosphere** | Gray-bright cloudy native; rain audio optional |
| **Companion** | **Nearby quiet**; no portrait default; whisper chat |
| **UI** | Capture surface dominant; gradient **required** on text over glass |
| **Objects** | `clear-my-mind` journal icon on capture affordance |
| **Interaction** | Type-first; minimal buttons |

**Eye Path:** View → capture → cards → whisper chat → view  
**Density:** Calm

---

## Reading Nook (`reading-nook`)

| Layer | Specification |
|-------|---------------|
| **Background** | **Reef aquarium** left or center hero; lamp pool **right**; shelves peripheral |
| **Living** | **Hero:** reef fish slow orbit; lamp still |
| **Atmosphere** | Evening-biased; reef + lamp define light |
| **Companion** | **Occasionally present**; on invoke |
| **UI** | Reading/strategy cards on cream; single column |
| **Objects** | `reading`, `strategies` — card deck metaphor |
| **Interaction** | Slow browse; open one card |

**Eye Path:** Reef → lamp → content card → shelf → chat optional  
**Density:** Calm

---

## Creative Studio (`creative-studio`)

| Layer | Specification |
|-------|---------------|
| **Background** | **Active project table** hero; golden hour when engine allows; tools peripheral |
| **Living** | Curtain or branch optional; **no** hero motion required |
| **Atmosphere** | Golden hour priority; creative warmth |
| **Companion** | **Present — Partner**; beside not on table |
| **UI** | Draft surface dominant; catalog behind explicit "choose type" |
| **Objects** | `create`, `email-generator`, `momentum-creative-spark` per context |
| **Interaction** | Continue draft; save clear; no publish guilt |

**Eye Path:** Project table → draft → artifact → Shari partner → window edge  
**Density:** Creative

---

# Part IV — Implementation Contract (Reference Only)

When production UI begins, these code-adjacent systems **must** consume this guide — not reinterpret it.

| System | Role |
|--------|------|
| **Companion Layout System** | `ROOM_IMMERSION_BY_PLACE`, layer ownership |
| **Scene Integrity Engine** | Atmosphere + living layer combinations |
| **Scene Integrity Library** | Declarative never-rules |
| **Safe Composition Registry** | Background focal point + UI safe zones per image |
| **Companion Object Registry** | Object layer identities |
| **Room Look Books** | Companion presence + signature feature authority |

**Production sequence:**

1. Approve this Screen Composition Guide
2. Redesign existing pages using seven-layer stack + density caps
3. Implement room photography with safe zones
4. Wire atmosphere through Scene Integrity Engine only
5. Validate against One Recognition Test + Behavior Audit

---

# Part V — Approval Gate

Before any production room UI ships:

- [ ] Screen Composition Guide approved
- [ ] All five Phase 1 room composition sheets validated against look books
- [ ] Eye Path walkthrough signed off (design review)
- [ ] Room Density caps encoded in layout system
- [ ] Scene Integrity rules cover Phase 1 weather/season matrix
- [ ] Object layer uses registry only — no emoji
- [ ] ADHD maximums verified in design critique
- [ ] One Recognition Test passed (Living Room → Window Seat → Creative Studio navigation)

**After approval:** Every existing app page should be redesigned using this composition system **before** additional rooms are implemented.

---

## Final Principle

> The photograph is the room.  
> The UI is paper on the table.  
> Shari is the host, not the header bar.  
> The guest should leave better — not overwhelmed by software that forgot it was a home.

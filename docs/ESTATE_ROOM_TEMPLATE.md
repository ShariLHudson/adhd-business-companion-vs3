# Estate Room Template™

| Field | Value |
|-------|-------|
| **Title** | Estate Room Template™ |
| **Version** | 1.0 |
| **Status** | Foundational UX — next major Estate project |
| **Parent** | [T-017 Estate Rooms Framework](./ESTATE_ROOMS_FRAMEWORK.md) |
| **Related** | [Spec 103](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) · [Spec 108](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md) · [Spec 109](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md) · [Spec 111](./SPARK_HOSPITALITY_FRAMEWORK.md) · [Arrival Before Activity](./estate/ARRIVAL_BEFORE_ACTIVITY.md) |

---

## The problem

Cursor (and traditional software) builds **pages**: headers, empty tables, “No data found.”

Spark Estate™ must build **rooms**: places you enter, breathe in, and belong to — even when they are mostly empty on first visit.

The same anti-pattern appears today in:

- Evidence Vault™
- Journal™
- Portfolio™
- Growth Profile™
- My Institute Cabinet™
- Seeds Planted™

Each inherited a workspace panel first. The **place** came second.

**This template reverses that order.**

---

## Core principle

> **Arrival before activity. Atmosphere before interface. Story before data.**

Members never “open a feature.” They **enter a room**. The room welcomes them. Shari orients them. Then — only if they choose — the room’s capability appears.

---

## Five layers (every room inherits)

### 1. Hero Area

Quiet identity on the full-bleed scene — not a dashboard header.

| Element | Purpose |
|---------|---------|
| **Room name** | Official trademark name (e.g. Evidence Vault™) |
| **Subtitle** | Short motto — emotional, not functional |
| **Purpose** | One line: why this place exists |

**Visual:** subtle brass plaque or frosted caption over the photograph — never a white app bar.

**Code:** `resolveEstateRoomTemplate(roomId).hero` from registry + catalog.

---

### 2. Welcome (Shari)

Shari **welcomes** — she does not instruct.

| Do | Don't |
|----|-------|
| “I'm glad you're here.” | “Click Add Win to get started.” |
| “One day this room will tell the story of your journey.” | “No evidence found.” |
| Warm orientation to the *feeling* of the place | Feature tour or numbered steps |

**First visit:** welcome copy may acknowledge emptiness as possibility, not absence.

**Code:** `EstateRoomTemplate.welcome.shariLine` in `lib/estate/estateRoomTemplate/catalog.ts`.

---

### 3. Invitation Panel

**Lead:** “While you're here…”

**3–5 suggestions** — concierge choices, not a task list. Max 5 primaries ([T-003](./UNIVERSAL_EXPERIENCE_STANDARDS.md)).

Universal closers (optional): Just chat · Visit another room · I'm happy just being here.

**Nothing is required.** Member may stay in the atmosphere indefinitely.

**Code:** `estateRoomInvitationCatalog.ts` + `EstateRoomInvitationPanel`.

---

### 4. Room Feature (deferred)

Journal, Evidence drawers, Portfolio grid, Knowledge Cards, etc. appear **only after** the member chooses an invitation — or explicitly asks in conversation.

The feature inherits the room’s visual language (walnut shelving, brass plaques, garden paths — not generic cards on gray).

**Rule:** If the member has not chosen, the feature UI is **not visible**.

---

### 5. Empty State (magical, not technical)

| Never | Always |
|-------|--------|
| “No data found” | “This room is waiting to tell your story.” |
| “0 items” | Warm illustration of what *will* live here |
| Blank white panel | Scene + spotlight on where the first treasure will go |

**Evidence Vault™ reference (first visit):**

> One day this room will tell the story of your journey. Every lesson you apply, every obstacle you overcome, every person you help — it all belongs here.

**Code:** `EstateRoomTemplate.emptyState` — shown inside the feature layer when count is zero, never as the arrival screen.

---

## Visual system

| Layer | Treatment |
|-------|-----------|
| **Scene** | Full-viewport photograph, `object-fit: cover` — edge to edge, no letterbox framing |
| **Chrome** | ← Home (upper-left) · Profile (upper-right) · Room sound (below profile) |
| **Conversation** | Bottom-anchored frosted glass ([Spec 109](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md)) |
| **Hero plaque** | Optional; fades after invitation or first message |
| **Light** | [Estate Light Flicker](../.cursor/rules/estate-light-flicker.mdc) on lanterns, candles, fireplaces |

---

## Reference implementation: Evidence Vault™

**Feeling:** Beautiful archive — warm walnut shelving, brass plaques, framed thank-you notes, certificates, photographs, little trophies, handwritten notes, newspaper clippings. A spotlight on the newest achievement.

**Arrival sequence:**

1. Full-bleed vault photograph
2. Hero: Evidence Vault™ · *Proof for harder days* · Purpose from registry
3. Shari welcome (first visit, mostly empty vault is intentional)
4. Invitations: Review Recent Wins · Add Something I'm Proud Of · Remember Kind Words · Build My Confidence · Tell Shari About Something Good
5. Feature (only on choice): archive shelves — empty state uses magical copy, not “No wins”

---

## Reference implementation: Greenhouse™

**Feeling:** Warm glass, seedlings, unhurried light. **Kinsey asleep in the scene is intentional** — do not crop, replace, or remove. It subconsciously signals: *this is a safe place.*

**Motto:** *Every thriving business began as a tiny seed of an idea.*

**Arrival sequence:**

1. Full-bleed greenhouse photograph (Kinsey preserved in frame)
2. Hero: Greenhouse™ · motto · *This is where possibilities begin.*
3. Shari welcome — some ideas become businesses, books, products; some need more time; nothing is rushed
4. Invitations: Plant a New Idea · Nurture an Existing Idea · Visit Seeds Planted™ · Explore Possibilities with Shari · Just Enjoy the Greenhouse · Visit Another Room
5. Feature (only on choice): idea planting / nurture flows — never a project dashboard on arrival

### Greenhouse idea lifecycle

More memorable than Idea → Project → Completed:

| Stage | Meaning |
|-------|---------|
| 🌱 Seed | Tiny seed of an idea |
| 🌿 Sprout | Starting to take shape |
| 🌼 Growing | Notes, tags, sketches |
| 🌳 Flourishing | Ideas becoming products |
| 🍎 Harvested | Ready to leave the greenhouse |
| 📁 Portfolio™ | Creative work preserved |
| 🏆 Evidence Vault™ | Proof for harder days |

**Room evolution (V2+):** The greenhouse **visually reflects** the entrepreneurial journey — mostly empty with a few seedlings (new member) → little plants and labels (six months) → overflowing harvest (years). Same room, growing with the member.

**Code:** `lib/greenhouse/ideaLifecycleTypes.ts`

---

## Rooms on the migration path

| Room | Current pain | Template priority |
|------|--------------|-------------------|
| Evidence Vault™ | Data panel first | **P0 — reference** |
| Journal™ | Gazebo panel | P0 |
| Portfolio™ | Grid workspace | P1 |
| Growth Profile™ | Profile dashboard | P1 |
| My Institute Cabinet™ | File browser | P1 |
| Seeds Planted™ | Spark Card list | P1 |
| Greenhouse™ | Projects panel first | **P0 — reference (ideas)** |
| Coffee House™ · Music Room™ | focus-audio shell | P1 |

---

## Implementation map

| Concern | Location |
|---------|----------|
| Template types | `lib/estate/estateRoomTemplate/types.ts` |
| Welcome + empty copy | `lib/estate/estateRoomTemplate/catalog.ts` |
| Resolver | `lib/estate/estateRoomTemplate/resolveEstateRoomTemplate.ts` |
| Hero + welcome UI | `components/companion/estate/EstateRoomTemplateArrival.tsx` |
| Overlay shell | `EstateChatNavigationOverlay` → `EstateRoomVisitChrome` |
| Invitations | `estateRoomInvitationCatalog.ts` |
| Direct navigation | `directEstateVisit.ts` · `EstateChatNavigationOverlay` |
| Backgrounds | `estateRoomAssets.ts` |
| Feature deferral | `CompanionPageClient.tsx` — hide panels when `showDirectEstateOverlay` |

---

## Design gates (before any room ships)

1. **Shari test** — Could Shari say the welcome out loud across a table?
2. **Page test** — Does this look like software or a place?
3. **First visit test** — Is an empty room still beautiful?
4. **Arrival test** — Can the member stay in atmosphere without touching a feature?
5. **Cohesion test** — Same five layers, unique personality?

---

## What we are not building

- New conversation architecture (Specs 105–119 frozen)
- Per-room one-off page layouts
- Dashboards, sidebars, or “getting started” wizards
- Surveillance empty states (“You haven't added anything yet")

---

## Success

Members say:

- “I walked into the Evidence Vault.”
- “It felt empty but hopeful — not broken.”
- “Every room feels like the same Estate, not different apps.”

The Estate feels **cohesive** because every room shares one template and expresses its own soul.

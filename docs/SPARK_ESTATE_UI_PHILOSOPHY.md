# Spark Estate UI Philosophy™

| Field | Value |
|-------|-------|
| **Title** | Spark Estate UI Philosophy™ |
| **Version** | 1.0 |
| **Status** | Permanent — subordinate to [ESTATE_ARCHITECTURAL_AUTHORITY](./estate/ESTATE_ARCHITECTURAL_AUTHORITY.md) |
| **Precedence:** When this document conflicts with the **Constitution**, **Living in Spark Estate**, or **Spark Estate Bible**, **those authorities win.**

---

## The one sentence

> Every screen is a photograph of a luxury estate; conversation floats on the glass; objects in the room are real; software stays invisible.

---

## The Photograph Test™

Before shipping any Estate screen, ask:

> **Could this frame hang on a wall — and still feel like somewhere you would want to live?**

If the answer is no because of chrome, labels, grids, or “app furniture,” redesign before writing code.

Members are not using software. They are **inside a place**. The interface is weather on the window — present, useful, never the subject.

---

## Three layers (and only three)

Every Estate view is composed of at most these layers. Nothing may sit above the photograph except what belongs in a real room.

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — THE SCENE (hero, full bleed, edge to edge)       │
│  photograph · video loop · parallax · light · ambience      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2 — THE FLOAT (conversation, when needed)            │
│  frosted glass panel · centered · calm typography           │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3 — THE OBJECT (only when the place demands it)      │
│  book on table · drawer pull · folded map · brass latch     │
└─────────────────────────────────────────────────────────────┘
```

| Layer | What it is | What it is not |
|-------|------------|----------------|
| **Scene** | The estate image — always the hero | A background behind a dashboard |
| **Float** | Shari + member conversation | A sidebar, split view, or workspace shell |
| **Object** | Physical affordance in the photograph | A software panel, card grid, or data table |

**Default:** Scene + Float. Layer 3 appears only in **Destination Rooms** where the room’s job cannot be done in conversation alone — and even then, objects never outrank the scene.

---

## Non-negotiables

These are not preferences. They are release gates.

### 1. The Estate image is always the hero

- Full-bleed scene: minimum **70%** of perceived visual weight on every viewport.
- No white app canvas, no gray workspace gutter, no permanent column stealing the photograph.
- Video loops and stills are treated as **cinematography**, not “wallpaper behind UI.”
- Loading, error, and empty states use **the scene** (dimmed, softened, seasonal) — never a blank panel.

### 2. Chat floats over the scene

- One frosted conversation surface — centered, warm glass, generous type ([Spec 109](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md)).
- Room visible at the edges. The member always knows **where they are** from the photograph, not from a label.
- No split-screen chat + feature column. No chat tucked under a header bar.
- Input stays reachable; choices stay in-conversation — not in a separate “options panel.”

### 3. Guidebook is a physical object

The Guidebook is **not** a help center, settings tree, or documentation sidebar.

| Treat as | Never as |
|----------|----------|
| Leather-bound book on a desk or in hands | `/help` route with left nav |
| Pages that turn | Accordion FAQ |
| Chapters you browse with thumb and eye | Search-first knowledge base |
| Something you **pick up** when lost | Something that opens over the whole app |

**Visual:** book cover, spine, page texture, margin, occasional ribbon bookmark.  
**Motion:** page turn, close book — return to the scene.  
**Copy:** written for someone sitting in a chair — not for someone filing a support ticket.

### 4. No dashboards

Forbidden forever:

- Metric tiles, KPI rows, “overview” grids
- “Recent activity” feeds as the primary view
- Multi-column layouts competing for attention
- Home screens that look like SaaS landing pages
- Status bars, progress rings, streak counters, gamification

If data matters, it lives **inside a Destination Room** as something you would **keep in a drawer** — not on a wall of widgets.

### 5. No software panels

Forbidden:

- Persistent sidebars (navigation, tools, properties)
- Top application bars with section titles and icon rows
- Bottom toolbars with six equal actions
- Modal “workspaces” that replace the scene
- Slide-over drawers that feel like IDE panels
- `ProfilePanel`, `GrowPlaceholderPanel`, invitation catalogs as default arrival

**Allowed substitute:** one physical object layer (open book, open portfolio folio, vault door ajar) that **reads as furniture in the photograph**.

### 6. No unnecessary buttons

Every control must pass the **Necessity Test**:

> Would this button exist if this were a real room and you were standing in it?

| Allow | Reject |
|-------|--------|
| Close the book | “Back to dashboard” |
| Fold the map | “Switch workspace” |
| Mic, send, one primary when action is clear | Rows of equal ghost buttons |
| Ambience mute (icon only, recessive) | “Browse · Continue · Search” launchers |

**Rule of one:** one primary action per moment. Everything else is conversation or hidden until needed.

### 7. No room labels

Members know the place from **the image**, memory, and Shari — not from typography stamped on the glass.

Forbidden:

- `Reading Nook™` headers on the frosted panel
- Breadcrumbs: `Estate > Growth > Library`
- Subtitles that explain what the room is for on every visit
- Brass plaques with trademark names as default chrome (arrival copy may live **in chat once**, not as persistent UI)

**Exception:** text **in the photograph** (sign on barn, spine of book) — diegetic only, designed as part of the art asset.

### 8. No instructional overlays

Forbidden:

- “Welcome to…” tour cards
- “Here’s what you can do” bullet overlays
- Coach marks, hotspots, pulsing hints
- Empty-state lectures (“Click + to add your first win”)
- Feature grids with emoji rows on arrival

Orientation happens in **conversation** — one human line from Shari when needed — or by **looking around**. Never a product tour.

---

## Place categories → UI posture

Aligns with Master Room Philosophy (places, not features).

| Category | Scene weight | Float | Objects |
|----------|--------------|-------|---------|
| **Conversation Places** | Maximum | Yes — often the only UI | None |
| **Living Estate** | Maximum | Optional, minimal | None — transit only |
| **Destination Rooms** | High | Yes, recessive when object work begins | One room-specific object system |

**Conversation Places** (Reading Nook, Greenhouse, Dock, etc.): Scene + Float. Full stop.

**Destination Rooms** (Institute, Celebration, Evidence Vault, Portfolio, Guidebook): Scene stays visible; interaction mimics **opening something in the room** — not launching a module.

---

## Material language

Luxury estate, not luxury app.

| Quality | Direction |
|---------|-----------|
| **Glass** | Warm frosted cream, soft blur, hand-polished edge — not cold iOS gray |
| **Type** | Large, readable, parchment-on-glass contrast — never thin gray on white |
| **Shadow** | Soft, directional — object resting on wood, not Material elevation 8 |
| **Color** | Warm neutrals, brass accents, ink — pulled from the photograph |
| **Density** | Air. Silence is a design element. |
| **Motion** | Gentle — lantern flicker, page turn, slow parallax ([Estate Light Flicker](../.cursor/rules/estate-light-flicker.mdc)) |
| **Sound** | Ambient, optional, never autoplay shock |

**Simplicity is luxury.** Fewer controls read as more expensive.

---

## Physical objects (Layer 3 rules)

When a Destination Room needs more than chat:

1. **One object system per room** — vault latches, portfolio folio, institute card drawer, celebration shelf, guidebook pages.
2. Objects **sit in the scene’s perspective** — not centered modal cards floating in void.
3. Opening an object **dims the float**; closing it **returns to conversation** — scene never unmounts.
4. Lists look like **collections on a surface** — not tables with column headers.
5. Empty states sound like **an unfinished room**, not a database: “Nothing on the shelf yet” — in Shari’s voice, in chat — not “No records found.”

---

## Map, menu, and wayfinding

Wayfinding is **estate-native**:

| Element | Treatment |
|---------|-----------|
| **Estate map** | Folded paper in corner — opens, pauses chat, closes back to scene |
| **Global menu** | Rare, recessive — destinations only, not a feature catalog |
| **Navigation** | Conversation first; explicit place name → go ([Environment Integration](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md)) |

Never: hamburger → 40-item tree. Never: tab bar across the bottom of every screen.

---

## Mobile

Same philosophy, tighter frame:

- Scene remains hero — crop art intentionally, don’t replace with solid color.
- Float becomes single column, fixed input, large type.
- No conversion to “mobile dashboard.”
- Physical objects may go full-screen **as the object** (book pages) — still not a generic app sheet.

---

## Forbidden patterns (quick reference)

| Pattern | Why it fails |
|---------|----------------|
| Split view: chat \| tools | Software, not estate |
| Room title in app chrome | Labels replace looking |
| Invitation panel on arrival | Instructional overlay |
| `activeSection` → placeholder panel | Feature routing, not place |
| White `#fff` workspace background | Breaks photograph illusion |
| Sidebar navigation | Dashboard habit |
| “Workspace” / “Module” / “Section” copy | Breaks Relationship Constitution |
| Persistent top bar with user menu + notifications | Office software |
| Data tables as hero | Spreadsheet, not home |
| Onboarding carousel over scene | Tutorial, not arrival |

---

## Allowed patterns (quick reference)

| Pattern | When |
|---------|------|
| Full-bleed scene + frosted chat | Default everywhere |
| Recessed mic / send / one choice | Conversation |
| Folded map | Orientation, optional |
| Book, folio, drawer, shelf UI | Destination Rooms only |
| Diegetic text in artwork | Never as dynamic chrome |
| Ambient audio toggle | Icon-only, corner |
| Shari line in chat | Arrival, orientation — not a banner |

---

## Shari and UI

Shari orients in **words**, not **widgets**.

- No UI copy that sounds like software (“Save successful”, “Workspace loaded”).
- No reflection homework in placeholders (“What would you like to think about?”).
- Arrival: at most **one** short line in the float — then silence is fine.

The float is for **two people talking** — not for the app talking to the member.

---

## Engineering constraints

Future implementation must converge toward:

1. **One scene compositor** — image/video/parallax/light per `roomId`.
2. **One float shell** — `workspaceFloatingCardShellClass()` / Spec 109 surface.
3. **Object registry** — optional per-room Layer 3; category-gated.
4. **No parallel layout systems** — retire split `WorkspaceLayout` vs estate overlay duplication.
5. **Route = place** — `roomId` + category, not `AppSection` matrix of panels.

---

## Release gate (every Estate UI change)

All must be **yes**:

1. Is the photograph still the hero?
2. Is chat (if shown) floating — scene visible around it?
3. Are there zero dashboards, sidebars, or software panels?
4. Are there zero persistent room labels or instructional overlays?
5. Does every button pass the Necessity Test?
6. If Guidebook (or similar): does it feel like a physical object?
7. Does it pass the Photograph Test?
8. Does it pass the Shari test ([Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md))?

**Any no → not shippable.**

---

## Final principle

Spark Estate UI does not compete with the estate. It **defers** to it.

The member should forget there is an interface — and remember there is a **place**, and someone with them in it.

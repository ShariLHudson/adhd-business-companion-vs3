# Estate Space Completion Standard™

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Status** | **Binding quality standard** — architecture and completion gate |
| **Reference implementation** | **The Ocean Conservatory™** (`conservatory` / `ocean-conservatory`) |
| **Authorities** | [Constitution](./01%20-%20Spark%20Estate%20Constitution.md) · [Living in Spark Estate](./Living%20in%20Spark%20Estate.md) · [Spark Estate Bible](./Spark%20Estate%20Bible.md) · [Master World Bible](./SPARK_ESTATE_MASTER_WORLD_BIBLE.md) |

---

## Purpose

Every Estate space should feel **complete**.

A room is **not** complete because it has an image.

A room is complete only when it has:

- a **purpose**
- a **story**
- **emotional meaning**
- **Estate history**
- a **secret**
- **activities**
- **knowledge**
- **navigation**
- **intelligence**
- **conversation support**

Every room should feel like discovering a real place inside a living Estate — not opening a feature, module, or empty background.

> **Final principle:** The Estate should feel like a real place. Every room should have enough depth that a member can discover something meaningful every time they visit.

---

## Reference implementation — Ocean Conservatory™

**Canonical place ID:** `conservatory`  
**Guide spread ID:** `ocean-conservatory`  
**Source files:**

| Layer | Path |
|-------|------|
| Guide spread (gold) | `data/estateGuideSpreads/oceanConservatory.ts` |
| Background | `public/backgrounds/the-ocean-conservatory-background.png` |
| Media map | `lib/estate/estatePlaceMedia.ts` → `conservatory` |
| Canon | `lib/estate/canonicalEstatePlaces.ts` |
| Knowledge groups | `lib/estateKnowledge/semanticGroups.ts` (`water`, `reading`, `think`) |
| Tests | `data/estateGuideSpreads.test.ts` |

All future Estate spaces should **meet or exceed** this depth.

---

## The Estate Space Checklist

Every Estate location must pass **all ten sections** before it is considered **Complete**.

### 1. Canon

| Requirement | Verify |
|-------------|--------|
| Official room name | `officialName` in `canonicalEstatePlaces.ts` |
| Tagline / primary feeling | `purpose`, `primaryFeeling`, `tagline` where applicable |
| Canonical place ID | Stable `id` in `canonicalEstateRegistry.ts` |
| Aliases | `aliases[]` — natural language, legacy names, member phrases |
| Timeline consistency | No contradiction with [Master World Bible](./SPARK_ESTATE_MASTER_WORLD_BIBLE.md) timeline |
| Master World Bible consistency | Purpose, lore, expansion era documented |
| Estate Constitution consistency | Living / Destination / Transitional type correct; no software language |

### 2. Visuals

| Requirement | Verify |
|-------------|--------|
| Background image | File in `public/backgrounds/`; registered in `estatePlaceMedia.ts` |
| Supporting images | Secondary plates, seasonal variants if applicable |
| Seasonal compatibility | Documented in Seasonal Guide or marked N/A with reason |
| Correct media registration | `CANONICAL_PLACE_BACKGROUNDS`, fallbacks, `ESTATE_ROOM_BG` alias |
| Responsive image support | Full-bleed scene works on mobile + desktop (Photograph Test) |

### 3. Guidebook

Every room guide spread must include these **editorial blocks** (Ocean Conservatory block types):

| Block | Type constant | Required |
|-------|---------------|----------|
| Welcome | `openingLine` + `story` or equivalent welcome narrative | ✓ |
| Why You Might Visit | `why-this-room-exists` | ✓ |
| Estate Story | `estate-history` | ✓ |
| Estate Secret | `estate-secret` | ✓ |
| Spark Reflection | `reflection` (with attribution when Spark speaks) | ✓ |
| Experience Notes | `did-you-know` or curated experience block | ✓ |
| Suggested Activities | bullets in `why-this-room-exists`, `did-you-know`, or dedicated list | ✓ |

**Legacy block mixes** (`estate-journals`, `tradition`, `look-closely`, etc.) may remain for character — but **do not substitute** for the seven required sections above.

Guide data lives in `data/estateGuideSpreads.ts` or `data/estateGuideSpreads/{room}.ts`.  
Preview: `/estate-guide/{spreadId}`.

Aligns with Master World Bible **Law 6** and guide order in [SPARK_ESTATE_MASTER_WORLD_BIBLE.md § Guide structure](./SPARK_ESTATE_MASTER_WORLD_BIBLE.md).

### 4. Estate Knowledge

The [Estate Knowledge Registry](../ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md) (`lib/estateKnowledge/`) must know:

| Field | Source |
|-------|--------|
| Purpose | Canon + guide + Estate Brain |
| History | Guide `estate-history` excerpt or summary |
| Category | `category:` group |
| Aliases | Compiled synonyms |
| Nearby places | `relatedPlaces[]` |
| Related places | Semantic + canon relationships |
| Semantic groups | `water`, `reading`, `treehouse`, `think`, `listening`, etc. |

Run: `runEstateKnowledgeAudit()` · `formatEstateKnowledgeAuditReport()`.

### 5. Estate Intelligence

Spark must understand (via Estate Brain + judgment layer — not hard-coded one-offs):

| Capability | Required |
|------------|----------|
| When to **recommend** this room | Triggers, `suggestionProfiles`, emotional/work fit |
| When **NOT** to recommend it | Anti-triggers, overload, wrong intent |
| Emotional situations | Overwhelm, grief, celebration, fatigue, etc. |
| Work situations | Create, decide, plan, execute, teach |
| Reflection situations | Journal, pond, conservatory calm, treehouse wonder |
| Recovery situations | Resilience paths per [T-007](../ENTREPRENEURIAL_RESILIENCE.md) |

See [ESTATE_INTELLIGENCE_ARCHITECTURE.md](./ESTATE_INTELLIGENCE_ARCHITECTURE.md).

### 6. Conversation Support

Spark must answer **from registry + guide + brain** — never from isolated FAQ strings:

- "What is this room?"
- "Why would I visit?"
- "Tell me the story."
- "Do you have somewhere near water?"
- "What rooms are good for reading?"
- "What rooms help me think?"
- "What rooms help me relax?"

**Law 4 — Spark always knows the Estate** ([Master World Bible](./SPARK_ESTATE_MASTER_WORLD_BIBLE.md)).

Pipeline: `lib/estateKnowledge/` → `lib/sparkKnowledge/estateGuide.ts` → conversation (no hard-coded room lists).

### 7. Navigation

| Requirement | Verify |
|-------------|--------|
| Appears in searches | Alias resolution via `matchCanonicalPlaceInText` |
| Appears in recommendations | Estate Brain + semantic groups + wander eligibility |
| Appears in Estate Registry | `canonicalEstateRegistry.ts` |
| Supports aliases | Guide spread aliases + knowledge synonyms |
| Supports natural language | "butterfly conservatory" → `conservatory`, etc. |
| Supports category discovery | `getPlacesByGroup("water")`, etc. |

### 8. Features

**If applicable** — mark N/A when the room is atmosphere-only:

| Feature | Examples |
|---------|----------|
| Music / ambience | `estatePlaceMedia.ts` audio profile |
| Videos | Destination experiences |
| Meditations / focus audio | Peaceful Places, Conservatory |
| Activities | `availableActions`, Brain `suggestedActivities` |
| Discovery Keys | Estate objects per Bible Ch 10–17 |
| Spark Cards | Ecosystem connection |
| Journey moments | Treehouse arc, arrival intelligence |

### 9. Testing

Every room must verify:

| Test | Command / file |
|------|----------------|
| Guide placement & order | `data/estateGuideSpreads.test.ts` |
| Image exists | Audit + manual `/estate-guide/{id}` |
| Registry entry | `estateKnowledgeRegistry.test.ts` |
| Media registration | `runEstateKnowledgeAudit()` — no `brokenReasons` |
| Aliases resolve | `getPlaceByAlias()` tests |
| Conversation discovery | `sparkKnowledge.test.ts` / CT estate turns |
| Recommendation eligibility | Brain triggers documented |
| Navigation | `resolveEstatePlace` / mount registry |
| Broken link check | Knowledge audit `brokenReasons` |

### 10. Completion

A room is **COMPLETE** only when **every checklist item above passes**.

Until then: **Partial** (shipped with gaps) or **Missing** (canon only / placeholder).

---

## Estate Space Completion Score

Score each dimension:

| Symbol | Meaning |
|--------|---------|
| ✓ | Complete — meets standard |
| ◐ | Partial — exists but gaps |
| ✗ | Missing |
| — | N/A (e.g. Features for atmosphere-only rooms) |

**Formula:** `(✓ × 1.0 + ◐ × 0.5) ÷ applicable dimensions × 100`

**Dimensions (9):** Canon · Visual · Guide · Knowledge · Intelligence · Conversation · Navigation · Features · Testing

### Example — Ocean Conservatory™ (reference)

```
Canon ............ ✓
Visual ........... ✓
Guide ............ ✓
Knowledge ........ ✓
Intelligence ..... ◐   (Brain leisure space; full judgment layer pending)
Conversation ..... ◐   (Registry wired; chat still consolidating Law 4)
Navigation ....... ◐   (Aliases + wander; status/planned drift in registry)
Features ......... ◐   (Ambience yes; no dedicated focus playlist yet)
Testing .......... ✓
─────────────────────
Completion ........ 89%   ← Reference — system-wide Law 4 work raises all rooms
```

---

## Developer checklist template

Copy this block for **every new or restored room**:

```markdown
# Estate Space Completion — {Official Name}

| Field | Value |
|-------|-------|
| Canonical place ID | |
| Guide spread ID | |
| Owner / sprint | |
| Target completion | |

## 1. Canon
- [ ] Official name + ™ usage per Bible
- [ ] Tagline / primary feeling
- [ ] Place ID registered in `canonicalEstateRegistry.ts`
- [ ] Aliases (min 3 natural phrases)
- [ ] Timeline entry in Master World Bible (if new)
- [ ] Constitution place type (Living / Destination / Transitional)
- [ ] Spark Estate Test (Ch 23) — 10 yeses

## 2. Visuals
- [ ] Background PNG/WebP in `public/backgrounds/`
- [ ] `estatePlaceMedia.ts` primary + fallbacks
- [ ] `ESTATE_ROOM_BG` key if used by guide
- [ ] Photograph Test (desktop + mobile)
- [ ] Seasonal notes (or N/A documented)

## 3. Guidebook
- [ ] Spread file: `data/estateGuideSpreads/{id}.ts`
- [ ] Welcome (`openingLine` + story)
- [ ] `why-this-room-exists`
- [ ] `estate-history`
- [ ] `estate-secret`
- [ ] `reflection`
- [ ] Experience notes / `did-you-know`
- [ ] Suggested activities listed
- [ ] Preview `/estate-guide/{spreadId}`
- [ ] `estateGuideSpreads.test.ts` updated

## 4. Estate Knowledge
- [ ] Purpose + history in compiled registry
- [ ] Semantic groups (water / reading / treehouse / think / …)
- [ ] `relatedPlaces` in canon
- [ ] Synonyms resolve via `getPlaceByAlias()`
- [ ] `runEstateKnowledgeAudit()` — zero broken reasons

## 5. Estate Intelligence
- [ ] Recommend when: ___
- [ ] Do NOT recommend when: ___
- [ ] Emotional triggers documented
- [ ] Work / reflection / recovery fit documented
- [ ] Estate Brain entry (or experience link)

## 6. Conversation Support
- [ ] "What is this room?" — from registry, not hard-coded
- [ ] "Why visit?" — from guide purpose
- [ ] "Tell me the story" — from guide history
- [ ] Category questions (water / reading / relax / think)
- [ ] `sparkKnowledge.test.ts` turn added

## 7. Navigation
- [ ] `resolveEstatePlace` / mount registry
- [ ] Wander / recommendation eligibility reviewed
- [ ] Natural language aliases tested

## 8. Features (N/A if none)
- [ ] Ambience audio
- [ ] Music / video / meditation
- [ ] In-room activities
- [ ] Discovery Key / Spark Card / journey hook

## 9. Testing
- [ ] Guide order test
- [ ] Image exists
- [ ] Registry audit clean
- [ ] Alias + conversation tests
- [ ] Manual member walkthrough

## 10. Completion score

| Canon | Visual | Guide | Knowledge | Intelligence | Conversation | Navigation | Features | Testing | **%** |
|-------|--------|-------|-----------|--------------|--------------|------------|----------|---------|-------|
| | | | | | | | | | |

**Status:** Missing / Partial / Complete
**Signed off:** ___
```

---

## Audit report — current Estate spaces

**Audit date:** 2026-07-05  
**Registry size:** 75 canonical places (`canonicalEstateRegistry.ts`)  
**Guide spreads:** 46 (+ 8 Treehouse chapters + Ocean Conservatory module)  
**Known system gap:** [ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md](../ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md) — chat does not yet read full registry (Law 4 in progress). Scores below reflect **room asset completeness**; Conversation/Intelligence are **Partial** for most rooms until Law 4 ships.

### Legend

| Status | Meaning |
|--------|---------|
| **Complete** | ≥ 90% — all required layers; minor polish only |
| **Partial** | 50–89% — member-visible gaps |
| **Missing** | < 50% — canon stub, asset, or guide absent |

### Priority rooms (member-named)

| Room | Canon | Visual | Guide | Knowledge | Intel | Convo | Nav | Feat | Test | **Score** | **Status** |
|------|:-----:|:------:|:-----:|:---------:|:-----:|:-----:|:---:|:----:|:----:|:---------:|:----------:|
| **Ocean Conservatory™** | ✓ | ✓ | ✓ | ✓ | ◐ | ◐ | ◐ | ◐ | ✓ | **89%** | **Complete** (reference) |
| **Welcome Home™** | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | ✓ | ◐ | ✓ | **78%** | Partial |
| **Coffee House™** | ✓ | ✓ | ◐ | ✓ | ✓ | ◐ | ✓ | ✓ | ✓ | **83%** | Partial |
| **The Library™** | ✓ | ✓ | ✗ | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | **61%** | Partial |
| **Greenhouse™** | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | ✓ | ◐ | ✓ | **72%** | Partial |
| **Round Table™** | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | ✓ | ◐ | ◐ | **67%** | Partial |
| **Working Conference Room** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ | **0%** | **Missing** |
| **Reflection Pond™** | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | ✓ | ◐ | ◐ | **67%** | Partial |
| **Writing Gazebo** (`writing-gazebo`) | ✓ | ✓ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | **61%** | Partial |
| **Butterfly Conservatory** (alias) | ✓ | ✓ | ✓ | ✓ | ◐ | ◐ | ✓ | — | ✓ | **83%** | Complete (via Ocean) |
| **Reading Nooks** (guide aggregate) | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | ✓ | — | ✓ | **67%** | Partial |
| **Listening Rooms** (lore) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ | **0%** | **Missing** |
| **Clear My Mind™** | ✓ | ✓ | ◐ | ✓ | ✓ | ◐ | ✓ | ✓ | ✓ | **78%** | Partial |
| **Observatory™** | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | ✓ | ◐ | ◐ | **67%** | Partial |
| **Discovery Room™** | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | ✓ | ◐ | ✓ | **72%** | Partial |
| **Momentum Institute™** | ✓ | ◐ | ✗ | ✓ | ✓ | ◐ | ✓ | ✓ | ◐ | **56%** | Partial |
| **Decision Compass™** | ✓ | ✓ | ✗ | ✓ | ✓ | ◐ | ✓ | ✓ | ✓ | **67%** | Partial |
| **Create** (`creative-studio`) | ✓ | ✓ | ✗ | ✓ | ✓ | ◐ | ✓ | ✓ | ◐ | **61%** | Partial |
| **Music Room™** | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | ✓ | ✓ | ◐ | **72%** | Partial |
| **Stables™** | ✓ | ✓ | ◐ | ✓ | ◐ | ◐ | ◐ | ◐ | ◐ | **61%** | Partial |

### Treehouse Possibility House (section)

| Chapter | Guide | Knowledge | Score | Status |
|---------|:-----:|:---------:|:-----:|:------:|
| Outside (`house-possibility-outside`) | ✓ | ◐ | **78%** | Partial |
| Staircase | ◐ | ◐ | **67%** | Partial |
| Studio | ◐ | ◐ | **67%** | Partial |
| Reflection Desk | ◐ | ◐ | **67%** | Partial |
| Observatory | ◐ | ◐ | **67%** | Partial |
| Cabinet of Chapters | ◐ | ◐ | **67%** | Partial |
| Discovery Chest | ◐ | ◐ | **67%** | Partial |
| Legacy Room | ◐ | ◐ | **72%** | Partial |

Treehouse **guide arc** is strong (gold blocks on opening chapter). **Knowledge** treats sub-places as a group — individual sub-place Brain entries still thin.

### Registry summary (75 places)

| Bucket | Count | Typical status |
|--------|------:|----------------|
| Guide spread + rich story | ~38 | Partial — legacy block mixes |
| Guide spread + gold blocks (Ocean standard) | 1 (+ Treehouse opening) | Complete / Partial |
| Canon + media, no guide | ~25 | Missing / Partial |
| Lore-only (Conference Room, Listening Rooms) | 2+ | Missing |
| `needs-asset` / `planned` / `future` | 37 | Missing member-facing completion |

---

## Missing content by room

### Missing entirely (build from scratch)

| Room | What's missing |
|------|----------------|
| **Working Conference Room** | Canon place ID, background, guide spread, registry entry, Brain triggers, mount, tests — referenced in Master World Bible timeline only |
| **Listening Rooms** | Same — lore in First Expansion; no canonical place or guide |
| **~25 canonical places** | No guide spread (e.g. `tea-room`, `journal`, `porch-swing`, `window-seat`, subplaces) |

### Partial — guide upgrade needed (legacy → Ocean standard)

| Room | Gap |
|------|-----|
| **Welcome Home** | Legacy blocks (`estate-journals`, `front-entrance`); add `why-this-room-exists`, normalize `estate-history` / `estate-secret` |
| **Coffee House** | Rich content but missing `why-this-room-exists`, `estate-history` block types; upgrade without losing voice |
| **Greenhouse** | Has `estate-history`; missing `why-this-room-exists`, `estate-secret` gold blocks |
| **Library** | No dedicated `library` spread — only aggregate `reading-nooks` / `personal-library` |
| **Round Table** | Legacy editorial mix; needs gold block pass |
| **Reflection Pond** | Legacy mix; verify secret + why-visit blocks |
| **Most guide spreads (~30)** | Pre-Ocean editorial templates — schedule gold-block migration |

### Partial — system-wide (affects all rooms)

| Gap | Impact |
|-----|--------|
| **Law 4 conversation** | Chat uses 8-of-12 Brain spaces + hard-coded menus — not full registry |
| **Estate Intelligence judgment** | Recommend / do-not-recommend matrix incomplete per room |
| **Wander menu vs live status** | Can offer `planned` places — navigation inconsistency |
| **Two "live" definitions** | `status === "live"` (9) vs `isLiveEstatePlace()` (~44) |

### Complete or near-complete

| Room | Notes |
|------|-------|
| **Ocean Conservatory™** | Reference — maintain as bar |
| **Butterfly Conservatory** | Alias → Ocean spread — do not rebuild separately |

---

## Recommended implementation order

### Phase 0 — System foundations (unblocks every room)

1. **Law 4 — Estate Knowledge → conversation** — single read path; retire hard-coded room lists ([ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md](../ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md))
2. **Unify live / walkable / wander rules** — one definition of member-facing availability
3. **`runEstateKnowledgeAudit()` in CI** — fail on new `brokenReasons`

### Phase 1 — Gold guide migration (high-traffic Living places)

1. **Coffee House™** — upgrade to Ocean block structure; keep existing voice
2. **Welcome Home™** — same
3. **The Library™** — new dedicated spread (not only reading-nooks aggregate)
4. **Greenhouse™** — add missing gold blocks
5. **Clear My Mind™** / **Reflection Pond™** — restoration spaces

### Phase 2 — Missing canon rooms (Master World Bible promises)

1. **Working Conference Room** — full stack (canon → image → guide → brain → create routing)
2. **Listening Rooms** — define canonical ID(s), visuals, guide, semantic group `listening`

### Phase 3 — Destination & work spaces

1. **Round Table™**, **Strategy Studio**, **Study Hall**, **Momentum Room**
2. **Create** (`creative-studio`) — guide spread (creation already has product surface)
3. **Decision Compass™**, **Momentum Institute™** — guide + knowledge alignment

### Phase 4 — Treehouse wing (knowledge depth)

1. Per-subplace Knowledge Registry entries (not only group `treehouse`)
2. Gold-block pass on each chapter where legacy types remain
3. Journey footer + conversation continuity (already tested in guide tests)

### Phase 5 — Long tail (`needs-asset` / `planned`)

Rolling completion by **member journey priority** — not alphabetical. Use developer checklist per room.

---

## Release gate

Before marking any room **Complete**:

1. Completion score ≥ **90%**
2. Ocean Conservatory block checklist satisfied
3. `runEstateKnowledgeAudit()` — no broken reasons for this place ID
4. `npx vitest run data/estateGuideSpreads.test.ts`
5. Manual `/estate-guide/{spreadId}` Photograph Test
6. Shari test on guide copy + one conversational discovery turn
7. Spark Estate Test (Bible Ch 23) — room-specific yeses documented

---

## Related documents

| Document | Role |
|----------|------|
| [ESTATE_GUIDEBOOK_EDITORIAL.md](./ESTATE_GUIDEBOOK_EDITORIAL.md) | Block types and spread mechanics |
| [ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md](../ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md) | Law 4 gap analysis |
| [ESTATE_INTELLIGENCE_ARCHITECTURE.md](./ESTATE_INTELLIGENCE_ARCHITECTURE.md) | Recommendation architecture |
| [SPARK_ESTATE_MASTER_WORLD_BIBLE.md](./SPARK_ESTATE_MASTER_WORLD_BIBLE.md) | Laws 4–7, timeline, guide order |
| [ESTATE_ARCHITECTURAL_AUTHORITY.md](./ESTATE_ARCHITECTURAL_AUTHORITY.md) | Authority stack |

---

*Ocean Conservatory is the reference. Every room earns completeness — not by adding an image, but by becoming a place worth returning to.*

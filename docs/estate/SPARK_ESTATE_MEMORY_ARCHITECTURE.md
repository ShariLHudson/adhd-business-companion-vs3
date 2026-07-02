# Spark Estate Memory Architecture™

| Field | Value |
|-------|-------|
| **Phase** | G — Memory architecture (documentation only) |
| **Status** | **Official Estate memory authority** — implementation subordinate |
| **Scope** | What the Estate remembers, how it ages, how Shari recalls — not UI, not code |
| **Authorities** | [Constitution](./01%20-%20Spark%20Estate%20Constitution.md) · [Living in Spark Estate](./Living%20in%20Spark%20Estate.md) · [Spark Estate Bible](./Spark%20Estate%20Bible.md) · [Canonical Registry](./SPARK_ESTATE_CANONICAL_REGISTRY.md) · [Phase D Shell](./PHASE_D_UNIFIED_ESTATE_SHELL.md) · [Phase F Companion Engine](./PHASE_F_SHARI_COMPANION_ENGINE.md) |
| **OS alignment** | [Spec 112 — Companion Memory](../SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md) (trust wins) · [Spec 117 — Business Brain](../SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md) (structure) · [008 Memory Engine](../spark-intelligence-foundation/08-memory-engine.md) |
| **Date** | 2026-06-30 |

---

## Memory philosophy

Spark Estate does **not** remember information.

Spark Estate remembers **stories**.

| Principle | Meaning |
|-----------|---------|
| **Stories, not data** | Memory is narrative — chapters, volumes, cards, moments — never rows in a database the member must manage |
| **Care, not collection** | Remember to reduce effort and increase feeling understood — never to profile, score, or surveil |
| **Permission, not assumption** | Durable memory requires consent; session chatter does not become legacy without intent |
| **Warmth, not manipulation** | Favorite places and patterns create hospitality — never nudges, guilt, or “you haven't visited…” |
| **Quiet growth** | Books gain pages; collections deepen — never points, streaks, or completion meters |
| **Natural recall** | Shari speaks as a companion who was there — never as software that “noticed” behavior |
| **Member owns truth** | Spark proposes; the member confirms what becomes permanent |

**Core question (every persist):**

> Will remembering this genuinely help this person feel understood, encouraged, and supported — without feeling watched?

If no → do not remember.

**Member should think:**

> I'm glad I didn't have to explain that again.

**Member should never think:**

> How did it know that? · Is it tracking me? · Did it save that without asking?

**Relationship to Phase F:** Memory exists only to support the companion relationship — never to impress intelligence.

---

## Architecture position

```text
┌─────────────────────────────────────────────────────────────┐
│  Spark Estate Memory Architecture™ (this document)         │
│  — stories, books, places, traditions, Estate objects      │
└───────────────────────────┬─────────────────────────────────┘
                            │ member-facing meaning
┌───────────────────────────▼─────────────────────────────────┐
│  Spec 112 — Trust, permission, Memory Center, hospitality    │
└───────────────────────────┬─────────────────────────────────┘
                            │ persist gate wins on conflict
┌───────────────────────────▼─────────────────────────────────┐
│  Spec 117 — Brain structure, LIG, lifecycle, retrieval     │
└───────────────────────────┬─────────────────────────────────┘
                            │ runtime
┌───────────────────────────▼─────────────────────────────────┐
│  Memory Engine · Business Brain · Context Strategy (MVC)    │
└─────────────────────────────────────────────────────────────┘
```

**Estate Memory™** (place visits, favorite rooms, seasonal atmosphere) complements **Business Brain™** (business knowledge) and **Companion Memory™** (relationship style). One member — one relationship — multiple **story containers**, not duplicate silos.

---

## Memory levels

| Level | Name | Duration | What it holds | Member visibility |
|-------|------|----------|---------------|-------------------|
| **L0** | **Temporary Memory** | Current turn / draft | Parsing, clarification, wrong guesses | Invisible — discarded if wrong |
| **L1** | **Session Memory** | This visit / today | Mood-of-the-moment, “I'm overwhelmed today,” in-progress thread | Fades unless saved |
| **L2** | **Working Memory** | Active until complete | Open project, draft decision, half-written card, current conversation arc | Visible in workspace; archives when done |
| **L3** | **Long-Term Memory** | Months–years (permission) | Business facts, preferences, lessons, relationships, favorite places | Memory Center; natural recall |
| **L4** | **Legacy Memory** | Permanent collections | Completed book volumes, archived accomplishments, portfolio folios, vault entries | Library shelves, Cabinet, Vault |
| **L5** | **Estate Memory** | Property-wide, slow | Traditions, seasonal décor logic, object placement, shared Estate lore | Felt in atmosphere — never explained |

### Level rules

| Level | Becomes durable when | Default fate |
|-------|----------------------|--------------|
| L0 | Never | Discard immediately |
| L1 | Member says “remember this” or saves artifact | Expire at session end |
| L2 | Member completes, files, or explicitly saves | Archive or promote to L3/L4 |
| L3 | Trust gate + permission + reinforcement | Version; may retire |
| L4 | Ritual completion (volume bound, vault sealed) | Move to Library / shelf — immutable story |
| L5 | Founder canon + seasonal calendar | Read-only for members |

**Conversation continuity (Phase C):** Changing `goToPlace` never clears L0–L2 for the active thread. Only explicit **Start New Conversation** / **Start New Day** begins a fresh session arc.

---

## Memory categories

Each category maps to **canonical places**, **Estate objects**, and **Brain record kinds**. Implementation uses intelligence-ready lineage — not duplicate copies.

### 1. Conversations

| Field | Value |
|-------|-------|
| **What** | Dialogue arcs the member chooses to continue — not raw logs |
| **Level** | L1 session · L2 working · L3 summary (permission) |
| **Home** | Companion thread · optional saved moments in Memory Center |
| **Not** | Full surveillance transcript; arguments; throwaway venting |

**Story unit:** “What we were working on” — headline + last meaningful decision.

---

### 2. Knowledge Cards™

| Field | Value |
|-------|-------|
| **What** | Institute discoveries filed as cards — ideas that sparked growth |
| **Level** | L2 while exploring · L4 when filed to Cabinet |
| **Home** | Momentum Institute™ · My Institute Cabinet™ (`institute-cabinet`) |
| **Object** | Knowledge Cards™ (Bible §4) |
| **Grows when** | Member completes a meaningful institute conversation and chooses to keep the card |

**Story unit:** Card title + one sentence why it mattered + link to conversation lineage.

---

### 3. Momentum Institute™

| Field | Value |
|-------|-------|
| **What** | Earned capability — drawers opened, cards kept, themes revisited |
| **Level** | L2–L4 |
| **Home** | `momentum-institute` destination · `institute-cabinet` collection |
| **Not** | Grades · progress bars · “modules completed” |

**Story unit:** “What you kept from the institute” — never a transcript of school.

---

### 4. My Accomplishments™

| Field | Value |
|-------|-------|
| **What** | Honored wins — personal and business — written as chapters |
| **Level** | L4 Legacy |
| **Home** | Accomplishments Book™ (`accomplishments-shelf`) · Celebration Room™ rituals |
| **Object** | Accomplishments Book™ · The Bell (permission) |
| **Grows when** | Member marks a moment worth keeping; Shari asks permission to add a page |

**Story unit:** Dated chapter with member's words — not metrics.

---

### 5. Evidence Vault™

| Field | Value |
|-------|-------|
| **What** | Impact archive — proof lives changed, lessons applied, obstacles overcome |
| **Level** | L4 Legacy |
| **Home** | `evidence-vault` destination |
| **Object** | Vault latch & archive (Bible §4) |
| **Tone** | Quiet proof — never bragging dashboard |

**Story unit:** Impact story with optional artifact link — “what changed because of you.”

---

### 6. Journal™

| Field | Value |
|-------|-------|
| **What** | Member reflections — thoughts they chose to write |
| **Level** | L2–L4 |
| **Home** | `journal` destination · Gazebo / growth journal scenes |
| **Book** | Journal volumes over time |

**Story unit:** Entry with date + optional mood — never inferred mood without consent.

---

### 7. Creative Projects

| Field | Value |
|-------|-------|
| **What** | Work in flight — campaigns, launches, drafts, builds |
| **Level** | L2 working · L3 when named project |
| **Home** | Creative Studio™ · Greenhouse (`greenhouse`) · Goals & Projects |
| **Lineage** | `originatedFromId` — thought → project → asset |

**Story unit:** Project name + intent + last meaningful step.

---

### 8. Portfolio™

| Field | Value |
|-------|-------|
| **What** | Finished creative work worth showing |
| **Level** | L4 |
| **Home** | `portfolio` collection |
| **Object** | Portfolio folio |

**Story unit:** Piece + context + optional link to accomplishment chapter.

---

### 9. Favorite Places

| Field | Value |
|-------|-------|
| **What** | Rooms the member naturally returns to for thinking, rest, celebration |
| **Level** | L3 preference |
| **Home** | Estate Memory™ · canonical `placeId` |
| **Examples** | `reading-nook` · `greenhouse` · `coffee-house` · `back-deck` · `observatory` |
| **Use** | Warmth only — “You often find clarity in the greenhouse” — never guilt |

**Story unit:** Place + optional reason member shared — not visit frequency scores.

---

### 10. Estate Preferences

| Field | Value |
|-------|-------|
| **What** | How the member likes the Estate to feel |
| **Level** | L3 |
| **Examples** | Favorite drink (mug) · quiet vs talkative visits · voice on/off · reduced motion |
| **Home** | Memory Center — Preferences |

**Story unit:** Preference statement member confirmed.

---

### 11. Seasonal Memories

| Field | Value |
|-------|-------|
| **What** | Atmosphere-linked moments — holidays, first snow, spring greenhouse |
| **Level** | L5 Estate + optional L3 personal note |
| **Home** | Seasonal objects on canonical places (Bible · Registry) |
| **Not** | Forced seasonal push notifications |

**Story unit:** “Last winter you liked the quiet in the sunroom” — only if member shared it.

---

### 12. Important Dates

| Field | Value |
|-------|-------|
| **What** | Birthdays · business anniversaries · launch dates member wants honored |
| **Level** | L3 (permission) |
| **Home** | Memory Center · quiet celebration triggers |
| **Not** | Surveillance of calendar without consent |

---

### 13. Milestones

| Field | Value |
|-------|-------|
| **What** | Business and personal turning points |
| **Level** | L3–L4 |
| **Examples** | First client · first hire · book finished · pivot |
| **Home** | Accomplishments · Vault · Portfolio |

---

### 14. Goals

| Field | Value |
|-------|-------|
| **What** | Direction member declared — not Spark-assigned targets |
| **Level** | L2–L3 |
| **Home** | `goals-projects` · Momentum Builder when active |
| **Retire** | When superseded or member abandons without shame |

---

### 15. Wins — *retired as standalone category (P0)*

**P0 canon:** “Wins” is not a separate memory category or destination. Route by intent:

| Intent | Home |
|--------|------|
| Honor / celebrate a moment | **Celebration Room™** (`celebration-room`) |
| Chapter in their story | **Accomplishments Book™** (`accomplishments-shelf`) |
| Proof / impact / people helped | **Evidence Vault™** (`evidence-vault`) |

**Never:** Streak counters · daily win requirements · weekly win stats as Estate vocabulary.

---

### 16. Acts of Kindness

| Field | Value |
|-------|-------|
| **What** | Times the member helped someone — client, friend, stranger |
| **Level** | L4 |
| **Home** | Evidence Vault · Accomplishments · Letters |
| **Tone** | Honor impact on others — not virtue signaling |

---

### 17. Lessons Learned

| Field | Value |
|-------|-------|
| **What** | Insights earned through experience — not generic quotes |
| **Level** | L3–L4 |
| **Home** | Knowledge Cards · Journal · Library volumes |
| **Recall** | “This reminds me of something we discovered together.” |

---

### 18. Ideas Worth Revisiting

| Field | Value |
|-------|-------|
| **What** | Thoughts parked for later — not forgotten tasks |
| **Level** | L2 |
| **Home** | Seeds Planted™ · Greenhouse · Library ribbon markers |
| **Language** | “Something you wanted to come back to” — not backlog shame |

---

## Memory lifecycles

Every memory object moves through **estate-native** states — aligned with Brain lifecycle (Observed → Retired) but spoken as story.

```text
  Moment → Candidate → Offered → Kept → Living → Bound → Shelved → Retired
```

| Stage | Meaning | Shari may |
|-------|---------|-----------|
| **Moment** | Happened in conversation | Reflect only |
| **Candidate** | Might matter — single signal | Not assert as fact |
| **Offered** | “Should I remember this?” | Ask permission |
| **Kept** | Member said yes | Recall naturally when relevant |
| **Living** | Actively referenced in projects | Connect quietly |
| **Bound** | Volume/chapter sealed | Celebrate gently |
| **Shelved** | In Library/Cabinet/Vault | Retrieve on ask |
| **Retired** | Superseded or member deleted | Never surface unprompted |

### Lifecycle by category (summary)

| Category | Typical path |
|----------|--------------|
| Conversation arc | Moment → (optional) Offered summary → Kept |
| Knowledge Card | Living (institute) → Kept → Cabinet shelf |
| Accomplishment | Offered page → Bound volume → Library |
| Journal entry | Kept → Journal volume |
| Project | Living → Archived → Portfolio or retired |
| Favorite place | Observed returns → Offered preference → Kept |
| Lesson | Candidate → Card or Journal → Shelved |

**Duplicate rule:** Same story strengthens one record — versions chain; never parallel copies (Spec 117).

---

## Books

Books are **how legacy memory feels** in the Estate. They grow by **meaning**, not by quotas.

### Canonical books

| Book | Collection / place | What grows | New volume when |
|------|-------------------|------------|-----------------|
| **My Accomplishments Book™** | `accomplishments-shelf` · Celebration Room™ | Chapters — accomplishments, milestones, quiet pride | Member completes a “book era” (e.g. Year I) — ritual, not algorithm |
| **Knowledge Collection™** | Institute Cabinet · Library | Filed Knowledge Cards + themes | New collection when member groups a season of learning |
| **Impact Collection™** | Evidence Vault | Impact stories, helped people | New folio when vault chapter feels complete |
| **Journal™** | `journal` | Reflection entries | New volume by time or member request — never forced |
| **Portfolio™** | `portfolio` | Finished creative work | New folio when body of work shifts (rebrand, new venture) |
| **Estate Guide™** | Portable object | Estate lore member discovers | Grows with Estate releases — not member XP |

### How a page is added

1. Meaningful moment in conversation (Phase F — celebration laws).  
2. Shari offers: “Want this in your accomplishments book?” — **permission**.  
3. Member confirms → page written in their words.  
4. Brain stores lineage → same chapter, not duplicate notification card.

### When a volume completes

| Signal | Ritual (quiet) |
|--------|----------------|
| Member says “this chapter of my business is done” | Bind volume · place on Library shelf |
| Season / year boundary (member opt-in) | Optional gentle note — never auto |
| Institute collection “feels full” | Member names it · moves to Library ribbon |

**Completed volumes** live in **The Library™** (`library`) — readable, honorable, static. Active volumes stay in their **working home** (Cabinet, Vault, desk).

**Never:** progress % toward next volume · “Complete your book” · gamified badges.

---

## Collections

Collections expand when **experiences compound** — not when points accrue.

| Collection | Canonical id | Expands when |
|------------|--------------|--------------|
| **My Institute Cabinet™** | `institute-cabinet` | Cards filed from institute |
| **Accomplishments shelf** | `accomplishments-shelf` | Volumes bound |
| **Seeds Planted™** | `seeds-planted` | Ideas captured in Greenhouse |
| **Goals & Projects** | `goals-projects` | Active work named |
| **Portfolio** | `portfolio` | Work finished |
| **Growth Profile** | `growth-profile` | Timeline moments member keeps |

**Rules:**

- No points · no streaks · no “collection 80% complete”  
- Member may reorganize in Memory Center — Spark proposes clusters quietly  
- Empty collection is fine — absence without shame  

---

## Favorite places

**Canonical source:** `canonicalEstateRegistry` place ids.

| Signal | Storage | Use |
|--------|---------|-----|
| Member names love for a place | L3 preference | “Want me to remember this as a thinking spot?” |
| Repeated **chosen** returns (not tracking alone) | Candidate only | Never assert until confirmed |
| Member asks to go somewhere often | Kept favorite | Suggest when relevant — max one place |

**Approved recall:**

- “You used to like the reading nook when things felt loud.”  
- “The greenhouse might be good for this — you've said so before.”  

**Forbidden:**

- “You haven't visited the orchard in 12 days.”  
- “Members who visit the institute weekly grow faster.”  

**Estate warmth:** Season + favorite place may inform atmosphere (fireplace, open window) — invisible, never announced.

---

## Recall rules (Shari · Phase F)

Shari **never shows off** memory.

| Rule | Practice |
|------|----------|
| **R1 Relevance** | Recall only when it helps the current moment |
| **R2 Tentative** | Observed/Candidate → “I might be wrong…” |
| **R3 One thread** | One memory per turn — not a dossier |
| **R4 Permission language** | “I saved this because I thought it mattered.” |
| **R5 No database speak** | Never “My records show…” / “According to stored data…” |
| **R6 Offer retrieval** | “Want to see it?” — not auto-open |
| **R7 Forget honor** | Member deletes → gone without guilt |

### Approved recall phrases

- “I remember something that might help.”  
- “You've actually done this before.”  
- “This reminds me of something we discovered together.”  
- “Last time you said…”  
- “There's a card in your cabinet about this.”  

### Forbidden recall

- “I noticed you always…”  
- “Based on your activity pattern…”  
- “You haven't logged…”  
- Unprompted recitation of embarrassing or private moments  

---

## Privacy rules

| # | Rule |
|---|------|
| P1 | **Permission before permanent** — “Should I remember this?” |
| P2 | **Session ≠ legacy** — bad day ≠ permanent trait |
| P3 | **Member can edit, delete, export** — Memory Center ownership |
| P4 | **No health/politics/religion/family** unless member requests (Spec 112) |
| P5 | **No mood surveillance** — don't store “seemed anxious” as fact |
| P6 | **No sharing** — memory never leaves member's Estate without explicit export |
| P7 | **Quiet failures** — if can't save, say honestly — never silent loss |
| P8 | **Children's data / third parties** — only what member chooses to record |

---

## Estate growth rules

How the **property** feels lived-in over years — L5 Estate Memory.

| Rule | Meaning |
|------|---------|
| EG1 | **Books on shelves increase** — visual Library richness — not member level |
| EG2 | **Seasonal objects** follow calendar — subtle, skippable |
| EG3 | **Traditions repeat** — Bell · volume binding · first snow — same ritual language |
| EG4 | **New canonical places** arrive with registry — memory hooks ready, empty shelves OK |
| EG5 | **Nothing decays as punishment** — no “your estate is dusty” |
| EG6 | **Wiser, not larger** — retire noise; don't hoard candidates (Spec 117) |

---

## Search philosophy

Members search by **meaning**, not filenames.

| Member says | Estate understands |
|-------------|-------------------|
| “Show me that Knowledge Card about delegation.” | Institute Cabinet · card title + concept |
| “Open my accomplishments from last summer.” | Accomplishments volume · date range |
| “Find the story about helping that client.” | Vault or accomplishments · impact narrative |
| “Take me back to that lesson.” | Card or journal · lesson learned |
| “What were we working on?” | Working conversation arc |

**Principles:**

- Shari parses intent — no search box required (search box optional later)  
- Retrieval = `goToPlace` + open object — conversation continues  
- Rank: recency × relevance × member confirmation × lifecycle  
- Observed/Candidate never returned as fact  

**Forbidden:** “0 results found” · “No files match” · filter syntax exposed to member  

---

## Celebration triggers (anniversaries)

Celebration is **quiet and elegant** — never banners or confetti (Phase F · Bible §6).

| Trigger | Condition | Shari posture | Estate object |
|---------|-----------|---------------|---------------|
| **First visit** | First meaningful session | Warm welcome home — not tour | Sunroom / Welcome Home |
| **One month** | 30 days member opt-in milestone | One line max — optional | Letter (permission) |
| **One year** | Estate anniversary | “A year here.” — quiet | Library ribbon optional |
| **Business anniversary** | Member-provided date | Acknowledge impact | Accomplishments page offer |
| **Birthday** | Member-provided date | Gentle — never surprise party UI | Mug · quiet note |
| **First client** | Member marks milestone | Honor in Vault or Book | Volume chapter |
| **Book completion** | Volume bound ritual | “It's on the shelf.” | Library placement |
| **Major milestone** | Member-defined | Bell permission · Celebration Room™ | Bell · chalkboard note |

**Rules:**

- Member can disable anniversary reminders  
- Never combine celebration with upsell  
- Never “Congratulations! Achievement unlocked!”  

---

## What should be remembered (summary)

| Remember (with permission) | Why |
|----------------------------|-----|
| Favorite room · drink · thinking place | Hospitality |
| Preferred conversation style | Reduce friction |
| Knowledge Cards kept | Continuity of growth |
| Important accomplishments · milestones | Legacy |
| Meaningful stories · people helped | Identity & impact |
| Creative work · books written | Portfolio & Library |
| Business & personal milestones | Decision quality |
| Things to revisit | Reduce re-thinking |
| Favorite quotes & lessons **they chose** | Wisdom, not scraping |
| Named goals & active projects | Working memory |

---

## What should not be remembered

| Do not remember | Why |
|-----------------|-----|
| Temporary frustrations · venting | Not identity |
| Throwaway comments · sarcasm | Misleading recall |
| Unfinished thoughts (unless saved) | Session noise |
| Private moments member wouldn't expect saved | Trust violation |
| Duplicate memories | Confusion |
| Unimportant trivia · single typos | Noise |
| Inferred emotions · ADHD labels | Ethical boundary |
| Navigation clicks · time-on-page | Surveillance |
| Failed attempts without member meaning | Shame |
| Others' private data | Consent |

**When uncertain → don't remember → ask later if it keeps coming up.**

---

## Memory examples

### Example 1 — Favorite place (warmth)

**Context:** Member twice chooses Greenhouse when stuck.  
**System:** Candidate favorite place — not Kept.  
**Shari (later):** “Want me to remember the greenhouse as a thinking spot for you?”  
**Member:** Yes.  
**Kept:** `greenhouse` + “clarity without pressure.”

---

### Example 2 — Knowledge Card

**Context:** Institute conversation on delegation.  
**Shari:** “This might be worth keeping — want it in your cabinet?”  
**Member:** Yes.  
**L4:** Card filed · lineage to conversation id.

---

### Example 3 — Accomplishment chapter

**Context:** Member shares first workshop sold out.  
**Shari:** “That's worth a page in your accomplishments book — only if you want.”  
**Member:** Yes.  
**Ritual:** Quiet Celebration Room™ optional · page bound · not popup.

---

### Example 4 — What not to save

**Member:** “I'm so stupid today I can't do anything.”  
**Shari:** Empathy — no save.  
**System:** Session only · never L3 trait.

---

### Example 5 — Natural search

**Member:** “Find the story about the client who cried when she read my letter.”  
**Shari:** “I think that's in your vault — want to open it together?”  
**System:** Retrieve impact story · `goToPlace("evidence-vault")` · open narrative.

---

### Example 6 — Anniversary (quiet)

**Trigger:** Business anniversary (member date).  
**Shari:** “A year since you opened the doors. I'm glad you're still here.”  
**No:** Banner · badge · email blast.

---

### Example 7 — Lesson revisited

**Member:** Struggling with pricing again.  
**Shari:** “This reminds me of something we discovered together — you had a card about value over hours. Want to look?”  
**Not:** “You failed pricing 3 times.”

---

### Example 8 — Volume completes

**Member:** “I think Volume I of my business story is done.”  
**Shari:** “Then we'll bind it and put it on the library shelf — whenever you're ready.”  
**L4:** Volume I shelved · new blank volume offered without pressure.

---

## Implementation note (future — not Phase G)

When code begins:

1. Map categories → `IntelligenceReadyHooks` + Memory Center sections.  
2. All persist paths pass **Spec 112 trust gate** before **Spec 117** lifecycle.  
3. Estate place visits → Estate Memory™ (separate from Brain facts).  
4. Books = Business Assets + lineage — not separate databases.  
5. Recall via Context Strategy MVC — never load entire Brain.  
6. Phase F voice for all surfaced memory.  

**Registry:** `lib/intelligence/INTELLIGENCE_REGISTRY.md` updated per object type.

---

## Success test

A member should **never** feel that Spark is collecting information.

They should feel that Spark is **thoughtfully preserving the chapters of their life** so they never lose the moments that mattered most.

**Shari test:** Does this memory make the member feel **more understood** — or **more watched**?

If watched → do not implement.

---

## Related documents

- [PHASE_F_SHARI_COMPANION_ENGINE.md](./PHASE_F_SHARI_COMPANION_ENGINE.md)
- [SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md)
- [Spec 112 — Companion Memory](../SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md)
- [Spec 117 — Business Brain Memory](../SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md)
- [Bible §4 — Estate Objects](./bible/Section%2004%20-%20Estate%20Objects.md)
- [Bible §6 — Estate Traditions](./bible/Section%2006%20-%20Estate%20Traditions.md)
- [06 — Shari Personality Guide](./06%20-%20Shari%20Personality%20Guide.md)

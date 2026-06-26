# Companion Homestead™ Master Design Review
## Challenge Everything Before We Build

**Version:** 1.0  
**Status:** Canonical stress test — read before next production build  
**Authority:** Peer to all design docs; **does not override** Constitution — it challenges everything else  
**Companion:** [`COMPANION_HOMESTEAD_MANIFESTO.md`](./COMPANION_HOMESTEAD_MANIFESTO.md) — the distilled two-page law for builders

**Method:** Read the full vision as one system — Constitution, Shari, Trust, Decision Intelligence, Year in the Homestead, Blueprint, Journey Bible, Intelligence Registry, code libraries — and ask what breaks at scale, what to cut, what's missing, and what contradicts.

**North star preserved:** ADHD entrepreneurs leave every visit **a little better** than when they arrived.

---

# Part 1 — Does It Actually Work?

*Scenario: one million daily users. Forget inspiration. Follow physics.*

## What breaks

| Failure mode | Why |
|--------------|-----|
| **The 20-room metaphor as navigation** | Twenty places × seasonal variants × signature objects × Look Book art specs = a theme park nobody can orient in. ADHD users need **one clear landing**, not a floor plan exam. |
| **24+ Companion Universe libraries** | `libraryCatalog.ts` lists place, scene, motion, sound, lighting, seasonal, discovery, delight, traditions, memory, hospitality-profile, and more — **before** one room ships as a photograph. Systems will fight; engineers will wire the easiest library, not the right judgment. |
| **20+ intelligence engines** | Intelligence Registry™ plans Narrative, Pattern, Recovery, Founder, Opportunity, Growth, etc. Each engine wants signals, surfaces, and "enrichment." That is the opposite of **one voice, one next thing**. |
| **Memory at scale** | "Known not monitored" requires perfect recall discipline. One wrong *"Last January you…"* to the wrong person, one leaked pattern, one conflation — trust dies in public. |
| **Art production** | Reef aquarium, Iowa seasons, Kinsey, horse, hummingbirds, fireflies, 1,700-line Look Book — **cannot** be authored per user per day. Quality drops → uncanny valley → "cheap Sims house." |
| **Hospitality preparation** | "Tea for one, coffee for another" × 1M guests × daily visits = a personalization engine that **will** feel like CRM unless ruthlessly capped. |
| **Doc–code drift** | Philosophy docs are mature; production is partial (emoji migration, `needs-artwork` everywhere). Users experience **the app**, not the docs. Gap reads as broken promise. |

## What becomes repetitive

- **Daily Discovery™** + **Delight Library™** + **220 Tiny Moments™** — if implemented as rotation logic, users learn the pattern in week two. *"Oh, the cardinal again."*
- **Seasonal traditions** triggered as events — first hummingbird, first fire, first tomato — become **calendar notifications wearing a flannel shirt**.
- **Greeting libraries** — even good copy fatigues when arrival is daily. Year-three magic dies when line three repeats.
- **NGMTM sticky notes** — charming once; wallpaper at scale unless rare and earned.

## What becomes distracting

- **Motion library** (birds, chimes, reef) competing with **conversation first**.
- **Atmospheric layers** (lighting + sound + scene + seasonal) on mobile — sensory richness becomes **load time + visual noise**.
- **Honest Home™ clutter** — three notebooks, baskets, half-projects — beautiful in a still photograph; chaotic if every object renders live.
- **Business ecosystem surfaces** (Projects, Create, Founder, Decision Compass) bleeding into homestead arrival — **two products in one doorway**.

## What becomes difficult to maintain

- **Three site documents** (Blueprint, Master Plan, Look Book) plus Year doc — same fact in four places will diverge.
- **Scene Integrity Engine™** — every new object needs combinatorial rules (no snow on sunflowers). Maintenance grows exponentially with content.
- **Trust stage × relationship phase × needs × decision ladder** — four progression systems; no single source of truth for "what can Shari say today?"
- **Per-room 12-section Look Book specs** before first shipped photograph — design debt accrues interest daily.

## What becomes too expensive

- Custom photography/art per room × 4 seasons × object variants.
- LLM turn evaluation running Decision Ladder + Needs + Trust + 20 engines per message.
- Content ops for traditions, greetings, stories, humor, books — **a studio**, not a startup feature team.
- QA matrix: flooded user × Day 1 trust × January × mobile × low bandwidth × returning after absence.

## What becomes emotionally exhausting

- **Too much warmth** — performed hospitality when user wanted silence.
- **Transformation template** on every flow — pressure to *leave different* when they needed to *stay okay*.
- **Life-event responses** if mistimed — celebrating when grieving, pushing rest when ready to work.
- **Implicit daily journey** (11 phases) — subtle guilt: *"I never made it to Outlook Point."*

## What becomes invisible

- **Tiny moments** — exactly as designed — unless **curated density** is near zero. At high frequency, everything becomes background; nothing lands.
- **Residents** (Kinsey, cardinal, reef fish) — first month: magic. Month six: screensaver.
- **Shari's voice** — if buried under UI, users experience **panels**, not a person.
- **The porch exhale** — if login, dashboard, and menu sit between user and swing.

**Verdict:** The **philosophy scales**. The **current surface area does not**. At 1M DAU the vision survives only if we ship **depth in five rooms**, not **breadth in twenty libraries**.

---

# Part 2 — What Should We Remove?

*Wonderful ideas that should be cut, frozen, or demoted to lore — not production requirements.*

| Cut or freeze | Why |
|---------------|-----|
| **Future Wings™ as navigable space** | Aspiration belongs in Blueprint Part XI — not in v1 navigation. Empty wings feel abandoned. |
| **Adventure Room™ as daily room** | Overlaps Creative Studio + restoration. Keep for travel-dream **moments**, not a permanent door. |
| **Discovery / Delight as push systems** | Contradicts Decision Intelligence restraint. Delight must be **ambient or absent**, never scheduled. |
| **220 Tiny Moments as a build checklist** | Keep as **art direction cap** (~3 visible per visit max). Not a backlog of 220 tickets. |
| **Daily Companion Cycle 11-phase journey as UX expectation** | Design for **one phase per visit**, not a virtuous full day. |
| **Duplicate site docs** | **Master Plan** should become an index into Blueprint, not a parallel canon. |
| **Momentum XP language in user paths** | Journey Bible says no gamification; Intelligence Registry lists momentum events. Hide or rename — never streaks, points, or leaderboards. |
| **Founder / Decision / Opportunity intelligence in guest-facing arrival** | Internal founder tools ≠ homestead guest experience. Hard boundary. |
| **Seasonal Library as feature announcements** | Seasons change **light and palette**, not product tours. |
| **Per-room humor / story / book libraries shipping before conversation quality** | Voice beats decoration. |
| **Director's Studio in any user build** | Stay dev-only (`?demo=1`). Non-negotiable. |
| **Navigable outdoor micro-rooms** (meadow, pond as equals to kitchen) | Fold into Garden / Path / Deck — **one outdoor grammar**, not six doors. |
| **Relationship phase UI exposure** | Phases are **engineering gates**, not badges the user sees. |

## The simplification rule

> **Year five should have fewer visible controls than month one.**

If a feature adds a choice without reducing total choices elsewhere, cut it.

---

# Part 3 — What Is Missing?

*Not features. Foundations that will hurt in two years if unddesigned now.*

| Foundation | Gap |
|------------|-----|
| **Room tier system** | Which 5–7 rooms are **daily**, which are **seasonal/earned**, which are **lore-only**. Blueprint lists 20; code lists 20; users need **three**. |
| **Single progression source** | Trust Architecture (emotional) vs Relationship Phase Constitution (technical) — need one **Trust Gate API**: `canSay`, `canRemember`, `canOffer`, `canMove`. |
| **Memory consent & deletion charter** | What is stored, for how long, how user reviews/edits/forgets — **before** memory ships wide. Trust doc says principles; law needs mechanics. |
| **Anti-surveillance copy lint** | Automated blocklist: *"I've noticed you always…"*, streak language, absence guilt, pattern openers — CI for Shari's voice. |
| **Art pipeline contract** | One photograph standard, one room at a time, seasonal deferral rules, `needs-artwork` → shipped criteria. Without it, Look Book is fiction. |
| **Simplification curve spec** | How UI **removes** itself as trust grows (fewer prompts, fewer cards, same porch). |
| **Crisis & clinical boundary** | Crying, grief, shame covered; self-harm, abuse, clinical depression — **when Shari stops** and points to humans. Liability and care. |
| **Offline / async belonging** | "Part of my life" without daily opens — porch light when they return, no decay punishment. |
| **Performance budget** | Max weight per arrival scene on 4G phone — reef + audio + motion cannot all load for Tuesday at 2 PM. |
| **Doc–code truth matrix** | Living table: which canonical claims are **shipped**, **stubbed**, **aspirational**. Prevents team arguing from different realities. |
| **Ecosystem seam** | Explicit rule for when user is in **Homestead** (relationship) vs **Workshop tools** (projects, create) — one door between them, not leakage. |
| **The Manifesto** | [`COMPANION_HOMESTEAD_MANIFESTO.md`](./COMPANION_HOMESTEAD_MANIFESTO.md) — every builder reads first. |

---

# Part 4 — Contradictions

*Tensions needing a **governing principle** — not a meeting.*

| Tension | Document A | Document B | Governing principle needed |
|---------|------------|------------|----------------------------|
| **Hospitality vs privacy** | Hospitality: *"She remembered me"* | Trust: *"Never monitored"* | **Invited memory only** — recall must be user-planted or user-confirmed; never inferred patterns as openers. |
| **Atmosphere vs distraction** | Blueprint: rich sensory world | ADHD Filter: reduce overwhelm | **One hero per scene** — motion, sound, and object density hard-capped; atmosphere serves capacity band. |
| **Discovery vs predictability** | Discovery Library: daily surprises | Year doc: traditions unnoticed | **No scheduled surprise** — change is environmental (season, light), not pop-up content. |
| **Creativity vs cognitive load** | Creative Studio: color, permission | UX Constitution: three choices | **Creativity is opt-in depth** — never on arrival path for flooded users. |
| **Memory vs surveillance** | Memory Library: home remembers | Trust Architecture: anti-pattern | **Memory displays user words back**, not model conclusions about user. |
| **Productivity vs restoration** | Ecosystem: projects, plan my day | Decision Intelligence: relief first | **Tuesday at 2 PM rule** — well-being wins; tools behind consent after ladder rung 6. |
| **20 rooms vs orientation** | Blueprint: complete homestead | Companion Constitution: ≤3 choices | **Rooms are felt, not listed** — navigation is need-based routing, not floor plan. |
| **Conversation first vs environmental product** | Constitution: chat default | Blueprint: Disney lands | **Porch → conversation → room** — environment frames; chat decides. |
| **Honest clutter vs calm** | Honest Home: lived-in objects | Journey Bible: calmer departure | **Clutter is static art**, not interactive inventory. |
| **Intelligence compounding vs invisibility** | Intelligence Registry: enrich forever | Experience of Shari: one voice | **Engines write hooks, never UI** — user sees Shari, not scores. |
| **One next thing vs ecosystem breadth** | Decision Intelligence: one door | Product: many workspaces | **Homestead offers one invitation** — ecosystem reachable, never stacked on turn one. |
| **Trust depth vs UI sameness** | Year 3: unspoken protocols | Day 1: same porch | **Same home, fewer words** — intimacy is restraint, not redesign. |
| **Photograph realism vs shipping** | Visual Bible: Iowa photograph | Code: emoji migration incomplete | **Ship fewer rooms at full fidelity** — one real porch beats twenty illustrated cards. |
| **Phase registry vs emotional trust** | Relationship Phase Constitution | Trust Architecture stages | **Trust doc governs copy; phase doc governs code flags** — explicit mapping table. |
| **"Better not finished" vs founder metrics** | Trust: no grading | Founder Intelligence: analytics | **Founder sees aggregates; guest never feels measured.** |

**Meta-contradiction:** We wrote **life** (Year doc) and registered **machinery** (30 libraries, 20 engines). The governing principle:

> **Machinery must be invisible enough that life can be felt.**

---

# Part 5 — The Greatest Risk

## Why it would fail

Not because the vision is wrong — because **execution collapses into a productivity app with farmhouse wallpaper**.

## What users quietly stop loving

- The **exhale** — if arrival becomes dashboard, notifications, and "here's what you missed."
- **Shari** — if voice fragments across modules, cards, and system messages.
- **Being known** — if memory slips once into surveillance tone.
- **The home** — if art quality drops or seasons feel like asset swaps.
- **Restraint** — if every visit suggests a tool, tradition, or discovery.

## Where we become "just another app"

| Drift signal | App behavior |
|--------------|--------------|
| Streaks, badges, checklists | Habit tracker |
| 20-room picker | Feature mall |
| "I've noticed you…" | Surveillance CRM |
| Seasonal launch events | Marketing calendar |
| Auto-open workspaces | Workflow engine (Constitution forbids — but pressure will return) |
| Daily tips / discoveries | Content feed |
| Transformation guilt | Wellness app |

**The quiet death:** Users still **subscribe** but only use **one utility panel** — Clear My Mind or Plan My Day — and ignore the homestead. The relationship never compounds.

---

# Part 6 — The Greatest Opportunity

**Not AI. Not features. The experience.**

## Double down on

1. **The arrival exhale** — porch, swing, lamp already on, zero agenda. If we nail **thirty seconds of relief**, everything else is optional.
2. **Judgment over automation** — Decision Ladder as **product behavior**, not doc poetry: flooded → window, not planner. This is unreplicable by generic chatbots.
3. **Trust through restraint** — saying no, one sentence, silence, no streaks. **Anti-engagement** as competitive moat.
4. **ADHD-native hospitality** — Tuesday at 2 PM, six-week return without guilt, one next right thing. Built from lived experience, not persona marketing.
5. **Iowa homestead as emotional container** — not metaphor only — **photograph, sound, slowness** that generic SaaS cannot copy without the years of design already invested.

## What to stop chasing

- More rooms before one room is perfect  
- More intelligence engines before turn quality is stable  
- More tiny moments before arrival is sacred  
- More ecosystem features before relationship is felt  

**Moat sentence:** *"The only product that feels like a person prepared a place for you — and doesn't ask you to perform."*

---

# Part 7 — The Five Non-Negotiables

*Permanent constitutional laws. If everything else changed, these survive.*

## 1. Leave better than you arrived

Every visit, every turn, every room — emotional outcome first. Not finished. Not optimized. **Better.** If we cannot articulate how they leave lighter, clearer, calmer, or more themselves — we do not ship.

## 2. Relationship before tools

Conversation first. Consent before action. Tools support the relationship — never replace it. No auto-open. No silent routing. No workspace traps.

## 3. One voice, one next thing

One Shari. One primary action per turn. One invitation, not a menu. Silence is valid. Restraint is intelligence.

## 4. Hospitality, not customization

Shari's home. Guest's welcome. The architecture does not rebuild per user. Preparation is subtle — mug, lamp, blanket — never *"we customized your experience."*

## 5. Trust is earned, never assumed

Known when invited. Never monitored. No streaks. No absence guilt. No pattern openers. Memory serves dignity. Repair when wrong.

---

*These five are expanded in [`COMPANION_HOMESTEAD_MANIFESTO.md`](./COMPANION_HOMESTEAD_MANIFESTO.md).*

---

# Part 8 — Pointer

The two-page **Product Manifesto** — the single document every developer, designer, writer, and model reads first — lives here:

**[`docs/COMPANION_HOMESTEAD_MANIFESTO.md`](./COMPANION_HOMESTEAD_MANIFESTO.md)**

---

# Governance

| Before building | Read |
|-----------------|------|
| Any feature | Manifesto → Constitution → Manifesto checklist |
| Any copy | Trust Architecture + Anti-surveillance principles |
| Any room/atmosphere | Blueprint tier + ADHD Filter + **one hero** rule |
| Any intelligence | Decision Intelligence ladder — engine must be invisible |
| Any memory | Trust gate + consent charter |

**Ship gate (this review):**

1. Does it reduce total cognitive load?  
2. Does it work on an ordinary Tuesday — not only launch day?  
3. Can 1M users experience it without content fatigue?  
4. Does it deepen **exhale** or add **machinery**?  
5. If cut, would the homestead still feel like Shari's?  

If machinery — **cut or hide**.

---

*Master Design Review v1.0 — Refine. Simplify. Protect. Build less, mean more.*

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:spark-intelligence-blueprint -->
# SPARK™ Intelligence Blueprint™ — Executive Intelligence OS (BINDING)

**Full document:** `docs/architecture/SPARK_INTELLIGENCE_BLUEPRINT.md`

Spark is an Intelligence Operating System™ — not an application. **One Brain:** Founder, Companion, PostCraft, and Team Hub consume shared intelligence; never duplicate engines per screen.

| Layer | Home | Owns |
|-------|------|------|
| **SPARK™** | `lib/spark/` | Observe, score, connect, prioritize, patterns, knowledge graph |
| **FLAME™** | `lib/founder/flame/` | Founder learning & mentoring |
| **FIRE™** | (future) | Executive briefings & reports |
| **Experience** | product UI | Conversation, rooms, surfaces |

Before any feature: reduce friction? reusable? right layer? no duplicate logic? five-year test? Conflict with blueprint → preserve blueprint, change implementation.

**Rule:** `.cursor/rules/spark-intelligence-blueprint.mdc`
<!-- END:spark-intelligence-blueprint -->

<!-- BEGIN:estate-architectural-authority -->
# Spark Estate™ — Architectural Authority (BINDING)

**These three documents define Spark Estate. They are not reference material.**

| Document | Path |
|----------|------|
| Constitution | `docs/estate/01 - Spark Estate Constitution.md` |
| Experience Guide | `docs/estate/Living in Spark Estate.md` |
| Bible (canon) | `docs/estate/Spark Estate Bible.md` |

**Manifest:** `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md`

If legacy code or older docs conflict → **change implementation**, not the canon. Bible Ch 23 (Spark Estate Test) is a release gate. No dashboards, feature menus, or software language (Bible Ch 8–9).

**Navigation Golden Rule (BINDING):** The user should never need to know where a feature lives. Spark knows the Estate. The member shares what they want to accomplish. Spark guides them to the most appropriate space, offers alternatives when more than one fits, and naturally suggests the next best place when it adds value. Implementation: `lib/estateExperiences/navigationPhilosophy.ts` · routing: `lib/estateExperiences/resolveEstateNavigation.ts`. When adding capability, ask *what they are trying to accomplish* — not *which menu should this go under*.

**Estate Registry (BINDING):** `docs/estate/ESTATE_REGISTRY.md` — every feature appears exactly once (Experience → Space → Tool). Legacy audit: `lib/estateExperiences/legacyWorkspaceMap.ts`. **Migration freeze:** do not add new member-facing features until every legacy workspace, menu, route, prompt, and launcher is mapped or removed per the registry.

**Estate Brain (BINDING):** `docs/estate/ESTATE_BRAIN.md` — Spark's internal knowledge of every experience, space, capability, trigger, and relationship. Runtime: `lib/estateBrain/`. Chat, routing, menus, and suggestions read from here — not independent hard-coded rules.

**Estate Intelligence Architecture (BINDING):** `docs/estate/ESTATE_INTELLIGENCE_ARCHITECTURE.md` — capability-first routing (Intent → Capability → Expert → Experience → Tool). **Intent-First Navigation:** `docs/estate/INTENT_FIRST_ESTATE_NAVIGATION.md` — goals not rooms; `intentCategories.ts`, `environmentRegistry.ts`, `routeIntentFirstNavigation.ts`. **Coaching Before Navigation:** `docs/estate/ESTATE_COACHING_ARCHITECTURE.md` — coach first, navigate last; `estateCoaching.ts`, `estateCoachingRegistry.ts`. **Discovery Mode:** `docs/estate/ESTATE_DISCOVERY_MODE.md` — understand goal/obstacle/outcome before routing; `discoveryMode.ts`. Registries: `capabilityRegistry.ts`, `expertRegistry.ts`, `routeEstateIntelligence.ts`.

**Restoration:** `docs/estate/ARCHITECTURAL_RESTORATION.md` · **Cleanup:** `docs/ESTATE_CLEANUP_ROADMAP.md`

**Simplicity & Cognitive Load (128 — BINDING):** `docs/constitution/128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md` — every release must reduce cognitive effort; never expose architecture; simplicity / cognitive load / ADHD experience certification required. Cursor rule: `.cursor/rules/simplicity-cognitive-load-constitution.mdc`.
<!-- END:estate-architectural-authority -->

<!-- BEGIN:companion-dna -->
# The Friend We All Deserve™ — Spark Companion DNA (BINDING)

**Read this before conversation logic, prompts, and how Spark speaks.**

| Document | Path |
|----------|------|
| **The Friend We All Deserve™** | `docs/THE_FRIEND_WE_ALL_DESERVE.md` |
| Redirect (legacy names) | `docs/SPARK_COMPANION_CONSTITUTION.md` · `docs/THE_HEART_OF_SPARK.md` |

**Estate governs places. Spark governs friendship.** Sibling to the Estate Constitution.

**One Question Rule:** *Would this feel natural between lifelong friends on a porch?* If no → rewrite.

Spark never judges, lectures, overwhelms, impresses, rushes to fix, or sounds like software. Sometimes presence is the whole response.
<!-- END:companion-dna -->

<!-- BEGIN:companion-architecture -->
# One Companion — not separate workspaces

**Looks incredibly simple. Works incredibly hard.** Users see ~10% of what the app does.

- **One Companion**: user has a need → companion understands context → opens the right workspace → conversation continues. Navigation is secondary.
- **One shared brain**: every interaction feeds shared intelligence (conversation, memory, pattern, emotional, business, project, decision, learning, context, automation). Do not build isolated page-level intelligence.
- **Companion-led navigation**: open the right tool automatically when appropriate (overwhelmed → Clear My Mind, stuck on priorities → Plan My Day, etc.). Avoid telling users where to go.
- **Calm-home entry**: `lib/companionLedContinue.ts` — "Continue Where I Left Off" resumes the last meaningful activity, not the last page visited.
- **Arrival Intelligence**: `lib/arrivalIntelligence/` — Home consumes `evaluateArrivalIntelligence()` for greeting, placeholder, and presence. Never hard-code home logic in components.

Before adding a feature, ask: Does this make the companion smarter? Reduce cognitive load, clicks, and decisions? Connect to the shared intelligence layer?
<!-- END:companion-architecture -->

<!-- BEGIN:reverse-engineering-first -->
# Reverse Engineering First

**Permanent rule** (see also `.cursor/rules/reverse-engineering-first.mdc`). Design the complete ten-year system before implementing Version 1.

Never build features one request at a time. For every workspace: purpose → five-year vision → user journey → companion journey → intelligence journey → narrative journey → data architecture → ecosystem connections → version plan → **then** code.

Core principles: Intelligence Paradox (simple surface, deep backend), Companion Covenant (trust not impress), Agency Principle (user independence), Ethical Foundation (observe, wonder, ask — never conclude for the user), **Relationship Constitution** (`docs/RELATIONSHIP_CONSTITUTION.md` — how people feel is the product; every word passes the Shari test).

**Clear My Mind / My Thoughts**: Clear My Mind captures continuously (never a completion workflow). My Thoughts organizes. Capture and organize are separate experiences — always available, never forced.

**Clear My Mind companion standard**: `lib/clearMyMind/COMPANION_PRINCIPLES.md` — deepen trust without adding UI complexity. Post-Share voice is companion relief, not confirmation. Relief Intelligence (`lib/reliefIntelligence.ts`) stays invisible.

**My Thoughts visual architecture**: Collections are primary navigation (Companion Boxes, not folders). Each collection has a distinct color identity. Thought cards show title, preview, and connections. Future views (Connection, Growth, Mind Landscape) are typed but not built in V1 — design data for five years of LIG growth.
<!-- END:reverse-engineering-first -->

<!-- BEGIN:intelligence-ready-architecture -->
# Intelligence-Ready Architecture

**Permanent global rule** (see also `.cursor/rules/intelligence-ready-architecture.mdc`). Every object is built once and enriched for years.

- **Visible features are temporary; intelligence architecture is permanent.** Design for the companion we want in ten years, not today's UI.
- **Relationships over content** — store lineage (`originatedFromId`, `originatedFromKind`), LIG edges (`connectionIds`), per-engine enrichments (`intelligenceMeta`). Never duplicate when an object evolves.
- **Hooks today, engines tomorrow** — optional fields in V1; future engines consume without migrations or user re-entry.
- **Invisible evolution** — users never "train AI"; intelligence compounds quietly (Intelligence Paradox).
- **Intelligence Registry** — internal blueprint at `lib/intelligence/INTELLIGENCE_REGISTRY.md`. Update when adding object types or engines.
- **Shared types** — `lib/intelligence/intelligenceReadyTypes.ts` (`IntelligenceReadyHooks`, sprint questions).

Before every sprint: What is this object? What might it become? Which engines benefit? What metadata exists now unused? Will this support unimagined features?
<!-- END:intelligence-ready-architecture -->

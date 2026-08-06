# Spark Estate™ Reasoning & Experience Standards — Alignment Review

| Field | Value |
|-------|-------|
| **Status** | Alignment review only — no implementation, no redesign |
| **Date** | 2026-08-06 |
| **Mode** | Observation / understanding |
| **Authority** | Estate Constitution · Living in Spark Estate · Spark Estate Bible · frozen Specs 105–131 win on conflict |

---

## Scope of files studied

Future Estate reasoning and experience standards (protocol + intelligence library), read against existing runtime and frozen conversation architecture:

| Source | Role |
|--------|------|
| Phase 11 — Universal Creation Journey & Shari Experience | Universal journey; Build-Type content only at Build |
| Phase 12 — Universal Completion & Output | After-create journey; certainty of next step |
| Phase 14 — Intelligence Routing Map | One companion; route by need/state/context |
| Phase 17 — Conversation Engine & Shari Voice | Connect → Clarify → Guide → Create → Review → Continue |
| Phase 21 — System Governance & Quality Standards | One ecosystem; no duplicate intelligence |
| Phase 26 — AI Prompt & Intelligence Layer | Layered intelligence; member sees one Spark |
| Phase 33 — Expert Team & Chamber Member Collaboration | Experts behind the companion; not separate personalities |
| Chamber Member `XXX-006` Reasoning Frameworks | Domain reasoning processes + ownership boundaries |
| Chamber Library Standard / MEMBER_INDEX | Required member file shape; AI & Technology as expansion reference |
| SPARK-159 Companion Experience Standards | Listen · understand · remember · personalize · reduce overwhelm |
| Spec 103 / T-003 Universal Experience Standards | Existing frozen ecosystem experience canon (cross-check) |
| MJ-002 … MJ-007 Member Journey validations | Foundational ADHD founder situations — validate experience, not new features |
| Member Journey Library `00`, `03`–`08` | Library README, prioritization, template, validation guide, capability matrix, experience validation, Design Constitution |
| Member Journey Library Standard (Draft 1) | Confirms library is validation-only — not a runtime/feature layer; names MJ-001 as Gold Standard |
| MJ-001 My Workshop Ideas Are Everywhere | Gold Standard journey — organize before produce; reference quality for all later MJs |
| Build Type Catalog & Behavior Standard v1 | **Canonical split:** shared engine vs Build-Type knowledge only |
| Build Type specs v1 | Workshop · Marketing Plan · Offer · Proposal · Client Onboarding (plus catalog stubs for SOP · Checklist · Email) |
| *(not uploaded)* Library `01` · `02` | Named in library README; Spec 103 / Library Standard stand in |

Runtime mirrors already present for many phases under `lib/estate/sparkEstate*.ts` and `lib/universalCreation/` — treated as **partial encoding**, not as proof of full companion-path wiring.

Member Journey layer status: `docs/MEMBER_JOURNEY_ARCHITECTURE.md` is **binding architecture, implementation deferred**; `lib/memberJourney/` is proposed / not present. MJ-002…007 are validation scenarios — they exercise reusable conversation/EF systems, not a separate product surface.

**Authority note:** Library Design Constitution (`08`) and Experience Validation (`07`) align with — and must **not replace** — Estate Constitution, Relationship Constitution, Spec 103, Specs 105–131, or Observation Mode. On conflict, those frozen authorities win.

---

## 1. Behaviors these files require from Spark

### Relationship & voice

- Feel like one trusted companion walking beside the member — not software, consultant, form, or room-specific personalities.
- Warmth, encouragement, practical next-step clarity, patience; ADHD-friendly (no blank page, no 20-question interviews, no option dumps).
- Ask **one useful question at a time**; do not re-ask what context should already know.
- Overwhelm → acknowledge → simplify → one next step. Stuck → clarify the difficulty, then support (not pile on tasks).

### Understanding before creating

- Universal conversation flow: **Connect → Clarify → Guide → Create → Review → Continue** (Phase 17).
- Universal creation journey: **Understand → Discover → Define → Build → Review → Improve → Complete → Remember** (Phase 11).
- Ask first when goal/context/direction is unclear; create first only when the request is clear and enough context exists.
- Room changes **expertise**, not the journey or the relationship (Room Independence Rule).

### Intelligence coordination

- One companion personality; many specialized intelligences behind the scenes (Phases 14, 26, 33).
- Spark chooses expertise, timing, and depth — the member does not manage a team.
- Each Chamber Member owns a bounded reasoning process (what it analyzes, what it does **not** own).
- Before adding capability: “Does this already exist?” — add expertise, not disconnected systems (Phase 21).

### Completion & memory

- Creation is not done at first draft — Review → Improve → Finalize → Save/Share → Remember (Phase 12).
- Member should feel “I created something,” not “I answered questions.”
- After meaningful work: quietly remember completed work, preferences, successful approaches, wins, patterns — for future ease, not surveillance.

### Experience quality gates

- One relationship · orientation before action · calm before complexity · executive function first · ownership always · connection everywhere (Spec 103 / Phase 21 quality review).
- Success test (Phase 17): *I am understood. I know what to do next. I can keep going.*

---

## 2. Existing systems that may already support these behaviors

No new systems needed for the principles themselves — substantial support already exists. Gaps are mostly **wiring and consolidation**, not missing philosophy.

### Strong alignment (production spine)

| Behavior cluster | Existing support |
|------------------|------------------|
| Intent → capability → place (member doesn’t navigate menus) | `lib/estateBrain/` — capability/expert registries, `routeEstateIntelligence`, intent-first navigation, coaching, discovery |
| Universal creation journey + Build archetypes | `lib/universalCreation/sparkEstateCreationJourney.ts` (`CREATION_ARCHETYPE_BUILD_FIELDS`), orchestrator, completion system |
| Live create entry on companion turns | `frictionlessActionLayer`, `conversationStabilization`, `createExperienceRouting` |
| Shari voice / human conversation | `shariCompanionEngine`, `humanConversation/*`, Phase-17 constants in `sparkEstateConversationEngine.ts` |
| Frosted conversation surface | `workspaceLayoutTokens`, WelcomeHome / Estate frosted panels |
| Estate knowledge & place routing | `estateBrain/knowledgeRegistry`, `estateExperiences/*`, place navigation helpers |
| Expert/Chamber collaboration model (encoded) | Phase-33 mirror + `estateBrain/expertRegistry` |
| Governance “no duplicates” (encoded) | Phase-21 mirror under `lib/estate/` |
| Frozen conversation canon (types + rules docs) | Specs 105–114, 111–113, 116–119; Wisdom Layer 120–131 |

### Partial / parallel support (exists but not the single path)

| Behavior cluster | Existing support | Note |
|------------------|------------------|------|
| Full conversation state machine | `sparkCoreIntelligence/conversationEngine` | Implemented + tested; **not** on main companion chat path |
| Core reasoning modes | `sparkCoreIntelligence/reasoningEngine` | Tests mainly; companion uses other stacks |
| Wisdom Loop | `lib/sparkWisdom/*` | Primary on Spark Alpha, not main companion |
| Spec 106–113 / 117–118 packages | `lib/sparkConversation*`, hospitality, memory, hidden work, Business Brain types | Largely **types/canon**; live behavior enforced ad hoc in frictionless + prompts |
| Memory | `companionMemory`, `memory/*`, `companionBrain`, Chamber memory, core memoryEngine | Fragmented substitutes for Spec 112/117 |
| Create stacks | `universalCreation` **and** `createWorkflow` / `createBuild` / facilitated creation / Create panels | Multiple entry shapes |
| Domain reasoning (Chamber libraries) | Full `XXX-006` for DEC, MOM, STR, SYS, PM, RES, EXF; stubs for many others | Knowledge assets — not yet a single runtime consumer |
| Experience patterns / Spec 103 | `lib/sparkUniversalExperience`, `sparkExperiencePatterns` types | Checklist/canon; not an enforcement engine |

---

## 3. Where current implementation conflicts with these principles

Conflicts below are **structural tensions**, not a redesign mandate. Observation Mode: document only.

### A. Canon beside the live path

Frozen Specs 105–131 and Phase 11/17/26 describe one conversation OS. Main companion chat is a large assembled pipeline (`CompanionPageClient` + `frictionlessActionLayer` + prompt blocks). Core `processConversationTurn` and Wisdom Loop largely sit beside that path. Risk: principles live in docs/types while behavior is enforced inconsistently.

### B. Duplicate / overlapping routing

Phase 21 forbids competing workflows. Live routing overlaps: Estate Brain, Phase-14 routing map helpers, companion turn/intent routers, semantic intent resolver, legacy workspace map. Same need can be classified in multiple places.

### C. Multiple creation systems

Phase 11 requires one journey; Build-Type knowledge only at Build. `sparkEstateCreationJourney` encodes that, but parallel create stacks can still surface type-specific UI or workflows outside the universal sequence depending on entry path (Make panels, facilitated creation, chamber project engine).

### D. Multiple “brains” with overlapping roles

Phase 26/33 require specialized expertise under one companion + shared memory. Today: Estate Brain, CompanionBrain (Plan My Day), Business Brain catalog, Chamber intelligence, Core Intelligence engines, institutional memory — overlapping “reason about the member” responsibilities without a single retrieval/write gate on the companion path.

### E. Environment / tool opening vs confirming

Specs 107–108 and Estate philosophy: conversation first; environment optional after understanding. Frictionless high-confidence paths can auto-open tools/workspaces/places — useful when right, but structurally closer to “act” than “confirm, then invite.”

### F. Incomplete Chamber reasoning depth

Library Standard expects production-depth Reasoning Frameworks. Only a subset of `XXX-006` files are full-length (e.g. Decision, Momentum, Strategy, Systems, Project Management, Research, Executive Function). Many members remain stub-length — future expertise cannot be trusted as equal peers until depth matches ownership rules.

### G. Phase protocol mirrors vs experience

Many `lib/estate/sparkEstate*.ts` files encode Phase principles + verification tests. That is valuable alignment scaffolding — it is **not** the same as the member experiencing those principles on every turn.

### H. Tension with frozen Observation Mode

Phase protocols describe expansive future Estate operating systems (dashboards, analytics, many rooms). Frozen architecture + Observation Mode say: improve conversation from evidence; do not add new specs/features from aspiration alone. Treat Phase docs as **future intent to align toward**, not as a build queue that overrides Specs 105–131 or Estate Constitution.

---

## 4. Reusable architecture vs Build-Type-specific knowledge

**Canonical source:** Build Type Catalog & Behavior Standard v1 — *“This specification does not create another engine.”*

Final catalog standard:

> The engine remains shared. Each Build Type supplies only the knowledge needed to create that specific useful result. The user experiences one consistent relationship with Shari, while Spark adapts the depth, questions, outputs, and implementation support to the work in front of them.

Also named in Phase 11 Step 4 and partially encoded as `CreationArchetype` + `CREATION_ARCHETYPE_BUILD_FIELDS` + `documentRegistry` / `documentCreationProfiles`.

### Reusable architecture (shared engine — never forked per type)

| Layer | Owns | Must not live in a Build Type |
|-------|------|-------------------------------|
| Shari voice / conversation | Identity, one-question flow, hospitality | Per-type personalities |
| Universal creation journey | Understand → Discover → Define → Build → Review → Improve → Complete → Remember | Per-type alternate journeys |
| Recognition & confidence | High → begin; Medium → name the type; Low → one clarifying question | Forced catalog browsing as only entrance |
| Depth model | Light · Guided · Living (adapt as complexity grows) | Hard-coded “always full expert” |
| Save / Projects / Calendar / Research / Visual Thinking / Chamber / Board | Shared capabilities | Duplicate infra per type |
| Reclassification | Shape can change without restart or duplicate work | Throw-away and rebuild |
| Cross-build linking | Related outputs stay connected to parent | Orphan secondary builds |
| Routing / memory / environment / governance | Estate Brain + Specs 105–113 | New OS per Sell/Teach/Plan category |

Map catalog names (“Universal Build Engine”, “Guided Creation Engine”, “Reasoning Engine”) onto **existing** `universalCreation`, conversation/reasoning packages, and Estate Brain — do not invent parallel engines because the catalog uses those labels.

### Build-Type-specific knowledge (definition payload only)

Each Build Type may define (catalog §6): success shape · who uses it · essential/expert/conditional areas · question bank · research triggers · outputs · visual options · stakeholders · dependencies · connections · assemble/polish rules · completion criteria · template behavior · version priority · Spark thinking prompts.

V1 catalog (keep small and deep):

| Category | Build Types | Default depth |
|----------|-------------|---------------|
| Organize & Systemize | SOP · Checklist | Guided / Light–Guided |
| Write & Communicate | Email | Light |
| Sell & Serve | Proposal · Offer · Client Onboarding | Guided (Onboarding → Living) |
| Teach & Facilitate | Workshop | Guided → Living |
| Plan & Grow | Marketing Plan | Living |

Also Build-Type-specific: Chamber `XXX-006` reasoning and room expertise flavor — still **not** voice, journey, or memory systems.

### What must not become Build-Type-specific

- Conversation engines · creation journeys · completion toolbars · companion personalities · memory systems · research infrastructure · Project/Calendar stacks  

Refine the **shared** engine only when behavior is truly common across types (catalog §15).

---

## 5. Member Journey validations (MJ-002 … MJ-007)

Uploaded foundational journeys. All Priority 1 / “Ready Now.” They validate that Spark behaves like Spark under real ADHD founder pressure — **not** that a new Member Journey product exists.

### Shared behaviors every MJ requires

Across all six:

1. **Reuse context** — never re-ask what Spark should already know  
2. **One recommendation** — not lists of equal options  
3. **Preserve work** — ideas, plans, unfinished threads stay safe  
4. **Smallest meaningful progress** — minutes, not planning sessions  
5. **Correct problem class** — prioritization ≠ idea generation; return ≠ absence shame; 15 minutes ≠ full plan; interruption ≠ amnesia  
6. **Estate connects only when helpful** — Projects, Chamber, Library, Evidence Vault — never as a menu dump  
7. **Emotional outcomes** — relief, focus, welcome, control — over productivity theater  

Spark difference repeated in every file: general AI generates or restarts; Spark organizes, remembers, recommends, and protects continuity.

### Per-journey behavior + existing support + conflicts

| Journey | Required behavior | Existing support | Conflict / gap |
|---------|-------------------|------------------|----------------|
| **MJ-001** Workshop ideas everywhere (**Gold Standard**) | Organize before produce; capture → group → themes → one next step; never jump to slides; preserve every idea | Clear My Mind / organize paths, workshop document plugin + profiles, Projects continuity, universal creation | Jumping straight into Workshop Build Type production would fail this journey; organize ≠ Workshop Living Build yet |
| **MJ-002** Too many ideas | Prioritize existing ideas; don’t brainstorm more; top 3 → one start; save the rest | Overwhelm / idea-overload routing, Clear My Mind, Decision Compass, ADHD situation atlas, capability registry | Documented: `"too many ideas"` can miss Clear My Mind and compete with Visual Thinking / mind-map paths |
| **MJ-003** Away for weeks | No judgment; restore where they left off; one next step; no start-over | Arrival Intelligence (`long_absence` / gentle return), companion-led continue, T-007 resilience canon | Copy risk: “Welcome back” / day-count vs T-007; must not run first-time intro |
| **MJ-004** Only 15 minutes | One time-fitting action; block scope creep; record progress | Timed focus / Do It Now fragments, effort estimates, Chamber “limited time” signals, prompt rules | No end-to-end short-window journey; no dedicated capability phrase for this ask |
| **MJ-005** What next? | One next action with why; start together | Plan My Day, action recovery (“what should I work on”), day-designer, board advisor overlap | Competing next-action surfaces; overlaps MJ-002/006; create/decide routing bugs can steal the turn |
| **MJ-006** Priorities changed | Adapt, don’t scrap the day; keep what still matters; one revised focus | Adapt My Day / Today’s Reality, adapt chat routing, Plan My Day adapt UI | Phrase coverage leans energy/“today changed,” not “priorities changed”; risk of full replan |
| **MJ-007** Lost train of thought | Restore context in ~1 minute; resume thread; don’t ask “what were we doing?” | Friction-first attention-wander replies, continue/resume, session/workflow continuation | Phrase gap for literal “lost my train of thought”; documented Continue-can-restart failures |

### Reusable architecture vs MJ-specific knowledge

| Reusable (do not fork per MJ) | Journey-specific knowledge only |
|-------------------------------|----------------------------------|
| Context reuse / memory before questions | Trigger phrases & situation labels (idea overload, long absence, time box, priority shift, attention wander) |
| One primary recommendation | Ideal 5-minute (or 1-minute) progress shape per situation |
| Preserve / defer work without loss | Acceptance tests & failure signals per journey |
| Overwhelm / return / adapt / resume hospitality patterns (Specs 106–112, T-007) | Connected Estate opportunities *when* they help — not new rooms |
| Prioritization & next-step routing (Plan My Day, Adapt My Day, Clear My Mind as capabilities under one companion) | Emotional outcome language for that moment |

**Do not create:** six separate workflows, six Member Journey engines, or a parallel `lib/memberJourney` product to satisfy these files. They are **validation lenses** on the existing companion spine.

`MEMBER_JOURNEY_ARCHITECTURE.md` remains the longitudinal layer (wins, keys, gallery, belonging over time). These MJ files are **situation validations** that feed that relationship — they are not the longitudinal layer itself.

---

## 6. Member Journey Library governance (`00`, `03`–`08`)

These files define **how Spark Estate decides what deserves to exist** and how journeys validate architecture — not a second product OS.

### Behaviors required

| Document | Requires of Spark / of builders |
|----------|----------------------------------|
| **00 README** | Library = canonical validation set. Every journey/feature must pass the Universal Test (so what · business forward · friction · decision fatigue · momentum · clarity · trust · connect · adapt · uniquely Spark). |
| **03 Prioritization** | Build journeys that make real life easier first — not interesting ideas. Score impact, friction, fatigue, momentum, frequency, emotion, architecture leverage, Spark difference, trust risk, readiness. First-20 mix must not be creation-only (include return, overwhelm, decision, celebration). |
| **04 Template** | Journeys validate experience: real words → real need → context to reuse → smallest progress → Spark difference → permission before create/connect/schedule → acceptance + failure signals. |
| **05 Validation & Architecture Guide** | Every journey must cover experience **and** architecture exercised **and** implementation reuse **and** regression risks. Final bar: glad they used Spark vs a general AI. |
| **06 Capability Matrix** | Map capabilities ↔ journeys. No new capability until: extend existing? member value? friction↓? multi-journey? uniquely Spark? |
| **07 Experience Validation** | Gate is “Should it exist?” not “Can we build it?” Architecture review + experience review before approval. |
| **08 Design Constitution** | Ten enduring principles: understand before generate · relationship before features · progress before productivity · reduce thinking · recommend don’t control · preserve momentum · connect don’t duplicate · one Estate · trust first · adapt to the member. Never become a feature catalog or generic AI with prettier screens. |

### Existing systems that already embody this

| Library idea | Already in Spark |
|--------------|------------------|
| Universal Test / “Should it exist?” | Spec 103 review checklist · Spec 100 seven design questions · Spec 119 eight QA gates · Observation Mode / Conversation Coach |
| Design Constitution principles | Specs 105–113 · Relationship Constitution · The Friend We All Deserve · T-007 · Spec 106 permission · Spec 118 iceberg |
| Capability inventory / no duplicates | Estate Brain capability + expert registries · Intelligence Blueprint One Brain · Phase 21 governance · `legacyWorkspaceMap` |
| Journey template fields | Spec 114 need/mode · Spec 121 hidden intent · Spec 112 memory · Spec 110/113 completion certainty · MJ-002…007 bodies |
| Prioritize high-leverage continuity | Arrival, continue/resume, Adapt My Day, Plan My Day, Clear My Mind, session continuity — same spines MJ section named |
| First-20 balance (not build-only) | Aligns with frozen conversation architecture: companion ≠ creation factory |

### Conflicts / honesty gaps

1. **Capability Matrix “Ready” vs runtime reality** — Inventory marks Estate Working Memory, Conversation Continuity, Chamber Orchestration, Adaptive Guidance, Personal Library, Project Awareness, Business Estate Context as **Ready**. Prior sections of this review found Spec memory/continuity packages largely types-only, memory fragmented, and Chamber/orchestration partially demo-wired. **Readiness labels in `06` should be treated as aspirational until journey-proven on the live companion path** — the library’s own rule (“status should be honest”) applies here.

2. **Naming drift** — Matrix names (Evidence Vault, Discovery Key, Research Council, Estate Working Memory) exist in Estate/Bible/Momentum Institute lore; they must map to existing registries (`estateBrain`, place IDs, Spec packages) — not become parallel capability systems with new names.

3. **Competing constitutions risk** — `08` Design Constitution overlaps Estate Constitution + Relationship Constitution + Spec 100/103. Keep it as a **journey-library lens** subordinate to Estate architectural authority and frozen Specs. Do not maintain two equal “constitutions” in code prompts.

4. **Missing library files** — `01` Universal Experience Principles and `02` Member Journey Standard are listed in `00` but were not in this upload. Until present, Spec 103 / T-003 and `MEMBER_JOURNEY_ARCHITECTURE.md` remain the stand-ins.

5. **Coverage matrix incomplete** — `06` shows MJ-001 checked for memory/continuity; MJ-002…007 (already studied) are not yet filled in the uploaded matrix. Filling the matrix is documentation work against existing capabilities — not new architecture.

6. **Observation Mode alignment** — Library says journeys validate before implementation and forbid duplicate architecture. That matches Observation Mode. Danger is interpreting Priority 1 “Ready Now” journeys as a mandate to build `lib/memberJourney/` or new rooms; they mandate **validating and tightening existing spines**.

### Reusable architecture vs library-/journey-specific knowledge

| Reusable architecture (one Estate) | Library / journey-specific knowledge |
|------------------------------------|--------------------------------------|
| Design principles already frozen (understand · permission · momentum · one companion) | Journey IDs, categories, priority scores, readiness honesty |
| Capability homes already in Estate Brain / conversation / creation / arrival | Capability↔MJ coverage matrix rows |
| Experience validation gates (Spec 103 / 119) | Per-journey acceptance tests, failure signals, regression lists |
| Shared EF patterns: restore context, one next step, defer safely | Situation profiles, member words, smallest-progress shapes |
| “Connect don’t duplicate” as governance | Decision records for why a journey was Priority 1 vs 4 |

**Final library rule (echoed):** No new architectural capability until existing ones cannot be extended. That is the same rule as Intelligence Blueprint / Phase 21 / Observation Mode.

Library Standard (Draft 1) is explicit: the Member Journey Library is **not** a runtime feature, intelligence layer, or member-facing system. Next library step named there: refine Gold Standard MJ-001 before expanding.

---

## 7. Build Type Catalog + reference Build Types + MJ-001

### Behaviors required

**Catalog**

- Member begins by intent — catalog browse is optional, never the only door  
- Recognize build type from words/outcome/context; confidence gates (high / medium / low)  
- Shared engine for all types; Build Type only supplies domain knowledge  
- Depth adapts: Light · Guided · Living  
- User may add/rename/remove/reorder sections and save My Template (not auto-promoted to system catalog)  
- Reclassify without restart; related builds stay linked to parent  
- Completion = real-world usability (not “document generated”)  
- Catalog stays small until each type is deep and reliable  

**Per-type specs (Workshop, Marketing Plan, Offer, Proposal, Client Onboarding)**  
Each adds: business outcome, typical language, essential/expert/conditional areas, Spark thinking, research triggers, outputs, completion criteria — without owning voice or infrastructure.

**MJ-001 (Gold Standard)**  
Workshop ideas everywhere → first problem is **organization**, not Workshop production. Capture, group, themes, reassure, one clarifying question, preserve continuity. Failing = slides/outline before clarity.

### Existing systems that already support this

| Catalog concept | Existing home |
|-----------------|---------------|
| Shared creation journey | `lib/universalCreation/` (orchestrator, phases, creation journey, completion) |
| Document/type plugins | `documentRegistry.ts`, `documentCreationProfiles.ts` (email, sop, proposal, workshop, checklist, marketing_plan/funnel, …) |
| Archetype Build fields | `CREATION_ARCHETYPE_BUILD_FIELDS` in `sparkEstateCreationJourney.ts` |
| Recognition from language | `detectUniversalDocumentType` / create fast path / frictionless create routing |
| Parallel Create UI | `createWorkflow` / Create panels — must stay subordinate to universal journey |
| Organize-before-build (MJ-001) | Clear My Mind / overwhelm organize paths — before Workshop plugin |

### Conflicts

1. **Label ≠ new engine** — Catalog names Universal Build Engine, Knowledge Fingers, Intelligence Activation Matrix. Treat as requirements on existing spines; Observation Mode forbids spawning those as new systems.  
2. **Catalog depth vs current plugins** — Full Build Type specs (essential/expert/conditional/completion/cross-build) are richer than today’s profiles; gap is **knowledge payload depth**, not a missing framework.  
3. **Archetype coverage** — Runtime archetypes/plugins cover SOP, Checklist, Email, Proposal, Workshop, Marketing Plan-ish paths; Offer and Client Onboarding are thinner or folded into other types — extend plugins, don’t fork engines.  
4. **MJ-001 vs Workshop Build Type** — Activating Workshop Build immediately on “ideas are everywhere” violates the Gold Standard. Recognition must choose **organize/prioritize** first; Workshop Build Type after clarity. Same pattern as MJ-002.  
5. **Work-order temptation** — Catalog §15 lists SOP→…→Marketing Plan design order. Under Observation Mode / architecture freeze, that is a **knowledge-authoring sequence**, not a mandate to redesign Create or add features.  
6. **Multiple create stacks** — Still a structural conflict (earlier §3C): Build-Type knowledge must land in one shared journey path.

### Reusable vs Build-Type (restated with catalog authority)

| Reusable | Build-Type-specific |
|----------|---------------------|
| Engine, voice, journey, depth model, recognition confidence, reclassification, cross-build linking, Projects/Calendar/Research/Chamber connections as shared services | Essential/expert/conditional areas, question banks, research triggers, output sets, completion criteria, Spark thinking prompts, template defaults |
| MJ Library validation process | Per-journey situation knowledge (MJ-001…007) |
| Chamber collaboration under one companion | Domain reasoning libraries (`XXX-006`) |

---

## Alignment verdict (understanding only)

| Question | Finding |
|----------|---------|
| Do these files demand new product architecture? | **No.** Catalog states it does not create another engine. Library Standard states MJ library is not runtime. Principles already live in Estate Constitution, Specs 100–131, `universalCreation`, Estate Brain. |
| Biggest gap | Deepen Build-Type **knowledge payloads** inside existing plugins; harden recognition so organize-first journeys (MJ-001/002) are not misrouted into premature Build; keep readiness claims honest. |
| Clearest reusable vs specific split | **Catalog Final Standard** — shared engine + Shari; Build Types supply only type knowledge. MJ files validate situations. Chamber files supply domain reasoning. |
| Recommended stance under Observation Mode | Author/align Build Type knowledge against `universalCreation` + document profiles. Validate with MJ-001 as Gold Standard. Do not invent Universal Build Engine 2.0, `lib/memberJourney` runtime, or a second constitution. Log conversation misses under the Rule of Three. |

---

## Related existing authorities (do not duplicate)

- `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md` · Estate Constitution · Living in Spark Estate · Bible
- `docs/SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md` · Specs 105–119
- `docs/SPARK_WISDOM_LAYER_FRAMEWORK.md` · Specs 120–131
- `docs/UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md` · Spec 103
- `docs/THE_FRIEND_WE_ALL_DESERVE.md` · Relationship Constitution
- `docs/MEMBER_JOURNEY_ARCHITECTURE.md` · `docs/ENTREPRENEURIAL_RESILIENCE.md` (T-007)
- Runtime: `lib/estateBrain/`, `lib/universalCreation/` (journey · registry · profiles · completion), `lib/sparkCoreIntelligence/`, `lib/sparkWisdom/`, Arrival / Plan My Day / Adapt My Day / friction-first continue paths

---

*End of alignment review. No code or architecture changes proposed in this document.*

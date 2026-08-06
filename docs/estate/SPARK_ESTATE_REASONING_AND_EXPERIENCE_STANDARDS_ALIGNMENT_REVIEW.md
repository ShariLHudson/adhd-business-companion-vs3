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

Runtime mirrors already present for many phases under `lib/estate/sparkEstate*.ts` and `lib/universalCreation/` — treated as **partial encoding**, not as proof of full companion-path wiring.

Member Journey layer status: `docs/MEMBER_JOURNEY_ARCHITECTURE.md` is **binding architecture, implementation deferred**; `lib/memberJourney/` is proposed / not present. MJ-002…007 are validation scenarios — they exercise reusable conversation/EF systems, not a separate product surface.

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

This is the central separation already named in Phase 11 Step 4 and encoded as `CreationArchetype` + `CREATION_ARCHETYPE_BUILD_FIELDS`.

### Reusable architecture (one system for every room / every create)

Keep as shared OS — do **not** fork per room or per deliverable type:

| Layer | Owns |
|-------|------|
| Companion identity & voice | Shari traits, hospitality, human voice, banned software language |
| Conversation flow | Connect → Clarify → Guide → Create → Review → Continue |
| Creation journey phases | Understand → Discover → Define → **Build** → Review → Improve → Complete → Remember |
| State / confidence / permission | Listen/clarify before create; permission before review surfaces; overwhelm/stuck patterns |
| Routing shell | Intent → need/state/context → capability → expert → experience (member never manages this) |
| Memory & certainty | What happened · where it lives · can I find it; quiet remember after completion |
| Environment rules | Conversation travels; room optional; same capability everywhere |
| Governance | One owner per concept; no duplicate intelligence; quality checklist |
| Experience standards | Spec 103 feelings/principles; EF-first; max choices; one primary next step |

These should converge on **existing** homes (`estateBrain`, `universalCreation`, conversation Spec packages / engines already in-repo) — not new parallel OS packages.

### Build-Type-specific knowledge (only varies at Build — and in expert libraries)

Vary **content and structure**, not process:

| Kind | Examples | Stays out of |
|------|----------|--------------|
| **Creation archetypes (Build fields)** | Project → goal/milestones/tasks/next actions; Email → purpose/audience/message/CTA; Funnel → journey/stages/messaging; Strategy → objective/approach/measurement; etc. (`CreationArchetype`) | Understand / Discover / Define / Review / Complete phases |
| **Chamber / domain reasoning** | Decision’s 10-stage process; Momentum’s nine lenses; EF demand/conditions model; Marketing messaging frameworks | Companion voice; universal journey; memory ownership; final decisions (member owns) |
| **Room expertise flavor** | Chamber of Momentum → progress/next steps; Marketing room → campaigns; Content room → writing | Separate personalities; separate creation workflows; separate completion menus |
| **Expert collaboration contributions** | What Momentum vs Strategy vs Research contributes when coached together | Member-facing “team management”; conflicting advice systems |

**Rule of thumb already in the files:**

> The room changes the expertise. The journey remains the same.  
> Technology stays behind the experience.  
> Specialized intelligence supports Spark — it does not replace Spark.

### What must not become Build-Type-specific

- New conversation engines per Chamber Member  
- New creation journeys per room  
- New completion/export toolbars per archetype  
- New companion personalities per expertise  
- New memory systems per domain  

Those belong in reusable architecture; domain files supply **reasoning content and boundaries** only.

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

## Alignment verdict (understanding only)

| Question | Finding |
|----------|---------|
| Do these files demand new product architecture? | **No.** Phase/reasoning docs and MJ-002…007 restate principles already in Estate Constitution, Specs 105–131, Spec 103, T-007, and partially encoded runtimes. |
| Biggest gap | Live companion path vs designed engines — plus phrase/routing consistency so foundational situations hit the right capability first time. |
| Clearest reusable vs specific split | Journey + voice + routing + memory = architecture; Build fields + Chamber `XXX-006` = domain knowledge; MJ files = situation validation knowledge on top of reusable EF/conversation patterns. |
| Recommended stance under Observation Mode | Use Phase docs + MJ acceptance/failure signals when validating conversations. Do not spawn duplicate systems. Prefer consistent wiring of Clear My Mind, Plan My Day, Adapt My Day, Arrival, and session resume — then log misses under the Rule of Three. |

---

## Related existing authorities (do not duplicate)

- `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md`
- `docs/SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md` · Specs 105–119
- `docs/SPARK_WISDOM_LAYER_FRAMEWORK.md` · Specs 120–131
- `docs/UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md` · Spec 103
- `docs/THE_FRIEND_WE_ALL_DESERVE.md` · Relationship Constitution
- `docs/MEMBER_JOURNEY_ARCHITECTURE.md` · `docs/ENTREPRENEURIAL_RESILIENCE.md` (T-007)
- Runtime: `lib/estateBrain/`, `lib/universalCreation/`, `lib/sparkCoreIntelligence/`, `lib/sparkWisdom/`, Arrival / Plan My Day / Adapt My Day / friction-first continue paths

---

*End of alignment review. No code or architecture changes proposed in this document.*

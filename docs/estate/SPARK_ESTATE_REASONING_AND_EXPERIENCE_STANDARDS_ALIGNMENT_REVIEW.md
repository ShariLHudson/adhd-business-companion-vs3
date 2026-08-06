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

Runtime mirrors already present for many phases under `lib/estate/sparkEstate*.ts` and `lib/universalCreation/` — treated as **partial encoding**, not as proof of full companion-path wiring.

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

## Alignment verdict (understanding only)

| Question | Finding |
|----------|---------|
| Do these files demand new product architecture? | **No.** They restate and extend principles already in Estate Constitution, Specs 105–131, Spec 103, and partially encoded Phase runtimes. |
| Biggest gap | Live companion path vs designed engines (conversation/reasoning/wisdom/memory Specs) — consolidation and consistent enforcement, not greenfield systems. |
| Clearest reusable vs specific split | Universal journey + voice + routing + memory = architecture; `CreationArchetype` Build fields + Chamber `XXX-006` reasoning = type/domain knowledge. |
| Recommended stance under Observation Mode | Use this review when validating conversations and mapping knowledge. Do not spawn duplicate systems or redesign from these Phase docs alone. Prefer wiring existing spines and deepening Chamber reasoning where stubs block equal expertise. |

---

## Related existing authorities (do not duplicate)

- `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md`
- `docs/SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md` · Specs 105–119
- `docs/SPARK_WISDOM_LAYER_FRAMEWORK.md` · Specs 120–131
- `docs/UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md` · Spec 103
- `docs/THE_FRIEND_WE_ALL_DESERVE.md` · Relationship Constitution
- Runtime: `lib/estateBrain/`, `lib/universalCreation/`, `lib/sparkCoreIntelligence/`, `lib/sparkWisdom/`

---

*End of alignment review. No code or architecture changes proposed in this document.*

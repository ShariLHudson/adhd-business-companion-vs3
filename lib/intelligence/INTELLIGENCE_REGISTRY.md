# Intelligence Registry

**Internal only — never user-facing.**

Blueprint for the ADHD Business Ecosystem™. When a new intelligence engine ships in two or five years, the question is not "What data do we need?" but "Which registered objects does it enrich, and which hooks already exist?"

Maintain this document when adding **object types**, **storage keys**, or **intelligence engines**.

---

## The standard

| Principle | Meaning |
|-----------|---------|
| **Build once. Enrich forever.** | Same object evolves (thought → task → project). No duplication. |
| **Relationships over content** | Store edges, lineage, confidence — not only text fields. |
| **Invisible evolution** | Users use the companion; intelligence compounds quietly. |
| **Hooks today, engines tomorrow** | Optional fields in V1; engines consume them later without migrations. |

Shared hook shape: `lib/intelligence/intelligenceReadyTypes.ts` → `IntelligenceReadyHooks`

```ts
id, createdAt, updatedAt?,
originatedFromId, originatedFromKind?,
connectionIds?,           // Living Intelligence Graph
intelligenceMeta?         // per-engine enrichments — never bulk-expose in UI
```

---

## Sprint gate (every feature)

1. What is this object?
2. What relationships might it eventually have?
3. Which intelligence engines could benefit?
4. What metadata should exist now even if unused?
5. Will this support features we have not imagined?

If any answer is "unknown" — redesign before shipping.

**Experience layer:** [Spec 100](../docs/ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) · [Spec 101 — Response Quality](../docs/RESPONSE_QUALITY_FRAMEWORK.md) · [Spec 102 — Trust Experience](../docs/TRUST_EXPERIENCE_FRAMEWORK.md) · [Spec 103 — Universal Experience](../docs/UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) · [Spec 104 — Create Experience](../docs/CREATE_EXPERIENCE_PHILOSOPHY.md) · [Spec 105 — Conversation Engine](../docs/SPARK_CONVERSATION_ENGINE_FRAMEWORK.md) · **[Spec 106 — Conversation Guardrails](../docs/SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md)** · **[Spec 107 — Conversation State Machine](../docs/SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md)** · **[Spec 108 — Environment Integration](../docs/SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md)** · **[Spec 109 — Frosted Conversation Workspace](../docs/SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md)** · **[Spec 110 — Conversation Completion](../docs/SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md)** · **[Spec 111 — Spark Hospitality](../docs/SPARK_HOSPITALITY_FRAMEWORK.md)** · **[Spec 112 — Companion Memory & Context](../docs/SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md)** · **[Spec 113 — Certainty Before Completion](../docs/SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md)** · **[Spec 114 — Conversation Flow Engine](../docs/SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md)** · **[Spec 115 — Conversation Examples](../docs/SPARK_CONVERSATION_EXAMPLES_FRAMEWORK.md)** · **[Spec 116 — Conversation Gold Standards](../docs/SPARK_CONVERSATION_GOLD_STANDARDS_FRAMEWORK.md)** · **[Specs 120–130 — Wisdom Layer](../docs/SPARK_WISDOM_LAYER_FRAMEWORK.md)** · [T-014 — Ecosystem Connection](../docs/ECOSYSTEM_CONNECTION_FRAMEWORK.md) · [T-015 — Gallery](../docs/GALLERY_FRAMEWORK.md) · [T-016 — Daily Discoveries](../docs/DAILY_DISCOVERIES_FRAMEWORK.md) · [T-017 — Estate Rooms](../docs/ESTATE_ROOMS_FRAMEWORK.md). Types: `lib/sparkTransformationConstitution/types.ts` · `lib/sparkResponseQuality/types.ts` · `lib/sparkTrustExperience/types.ts` · `lib/sparkUniversalExperience/types.ts` · `lib/sparkCreateExperience/types.ts` · `lib/sparkConversationEngine/types.ts` · `lib/sparkConversationGuardrails/types.ts` · `lib/sparkConversationStateMachine/types.ts` · `lib/sparkEnvironmentIntegration/types.ts` · `lib/sparkFrostedConversationWorkspace/types.ts` · `lib/sparkConversationCompletion/types.ts` · `lib/sparkHospitality/types.ts` · `lib/sparkCompanionMemory/types.ts` · `lib/sparkCertaintyBeforeCompletion/types.ts` · `lib/sparkConversationFlowEngine/types.ts` · `lib/sparkConversationExamples/types.ts` · `lib/sparkConversationGoldStandards/types.ts` · `lib/sparkWisdom/types.ts` · `lib/sparkEcosystemConnection/types.ts` · `lib/sparkGallery/types.ts` · `lib/sparkDailyDiscoveries/types.ts` · `lib/sparkEstateRooms/types.ts`. Runtime: `lib/sparkCoreIntelligence/conversationEngine/` · `lib/sparkWisdom/wisdomLoop.ts`.

---

## Object registry

### Core living objects

| Object | Kind | Primary storage | V1 user features | Future intelligence |
|--------|------|-----------------|------------------|---------------------|
| **Thought** | `thought` | `companionStore` → `BrainDumpEntry` | Clear My Mind capture, My Thoughts organize | Founder, Narrative, Opportunity, Content, Decision, Growth, Pattern, LIG |
| **Collection** | `collection` | `companion-thought-collections-v1` → `ThoughtCollection` | My Thoughts garden, many-to-many | LIG, Narrative themes, Mind Landscape |
| **Capture session** | `capture-session` | `captureSessionId` on thoughts + `clearMyMindIntelligence` | Continuous capture batches | Pattern, Recovery, Narrative rhythm |
| **Project** | `project` | `companionStore` → `Project` | Projects workspace, horizons | Business, Recovery, Pattern, Automation, Project |
| **Project item** | `project-item` | `companionStore` → `ProjectItem` | Sections, tasks, subtasks | Project, Growth, Automation |
| **Time block** | `time-block` | `companionStore` → `TimeBlock` | Plan My Day, calendar | Calendar, Recovery, Pattern, Growth |
| **Day state** | `day-state` | `companionStore` → `DayState` | Adjust My Day, energy | Recovery, Pattern, Arrival, Environment |
| **Conversation** | `conversation` | `companionStore` messages + chat API | Companion chat | Narrative, Relationship, Learning, Founder, Trust |
| **Conversation turn** | `conversation-turn` | `StoredMessage` | Thread history | All conversation-derived engines |
| **Estate adaptive preference** | `estate-adaptive-preference` | `estate-adaptive-intelligence-v1` → `AdaptivePreferenceState` | Invisible — shapes discovery, coaching, prep, anticipation | Arrival, Environment, Guidance, Pattern, Companion Presence |
| **Universal creation session** | `universal-creation-session` | `universal-creation-session-v1` → `UniversalCreationSession` | Create discovery + phase state before/during Create | Content, Guidance, Pattern, Business Brain, Adaptive |
| **Spark knowledge index** | `spark-knowledge-entry` | Composed from source registries via `lib/sparkKnowledge/` | Estate Guide, conversation hints, recommendations | Guidance, Arrival, Environment, All engines |
| **Estate restoration session** | `estate-restoration-session` | `estate-restoration-v1` → `RestorationSessionStore` | Read stories, favorites, return context | Recovery, Arrival, Pattern, Companion Presence |
| **Spark restoration evaluation** | `spark-restoration-evaluation` | Ephemeral per turn; registry in `lib/sparkRestorationIntelligence/` | Energy classification + recommendations | Recovery, Arrival, Environment, Pattern, Companion Presence |
| **Intent-aware conversation session** | `intent-aware-conversation-session` | `intent-aware-conversation-v1` → `IntentAwareSessionStore` | Conversation purpose + depth memory | Relationship, Guidance, Recovery, All conversation engines |
| **Decision** | `decision` | `lib/decision-intelligence/` | Decision Compass, support methods | Decision, Founder, Business, Narrative |
| **Opportunity** | `opportunity` | `lib/opportunity-intelligence/` | Opportunity surfacing (founder) | Opportunity, Business, Offer, Audience |
| **Relationship** | `relationship` | `lib/relationship-intelligence/` | People context, touchpoints | Relationship, Audience, Opportunity, Narrative |
| **Client avatar** | `client-avatar` | `companionStore` → `IdealClientAvatar` | AIRA, messaging | Audience, Offer, Content, Relationship |
| **Business profile** | `business-profile` | `companion-business-profile-v1` | Onboarding context | Business, Founder, Content, Offer |
| **Template** | `template` | `companionStore` → `TemplateItem` | Create, email, content | Content, PostCraft, Automation |
| **Snippet** | `snippet` | `companionStore` → `Snippet` | Reusable copy | Content, Automation |
| **Content draft** | `content-draft` | PostCraft / ecosystem APIs; `lib/artifactState/` universal artifact memory | Drafts, publishing, facilitated creation | Content, SEO, Social, GHL |
| **Momentum event** | `momentum-event` | `companionStore` momentum | Movement XP (no streaks) | Growth, Recovery, Pattern |
| **Reminder** | `reminder` | `reminderAt` on thought + scheduling | Thought reminders | Calendar, Automation, Recovery |
| **Founder event** | `founder-event` | `lib/ecosystem/events` | Analytics, dashboard | Founder, Business, Ecosystem |
| **Intelligence signal** | `intelligence-signal` | `lib/intelligence-layer/signalStore` | Trust inspector (internal) | All engines via signal bus |

### Planned / partial (register before UI ships)

| Object | Kind | Notes | Future intelligence |
|--------|------|-------|---------------------|
| **Calendar event** | `calendar-event` | Google Workspace bridge | Calendar, Relationship, Automation |
| **Document** | `document` | Uploads, Google docs | Learning, Content, Business |
| **Voice session** | `voice-session` | TTS / voice companion | Narrative, Learning, Relationship |
| **Journal entry** | `journal-entry` | `lib/growthJournalStore.ts` — Growth primary DB (private reflection) | Narrative, Recovery, Founder, Growth |
| **Portfolio entry** | `project` | `lib/growthPortfolioStore.ts` — Growth primary DB (creative work) | Growth, Content, Narrative, LIG |
| **Growth capture** | `capture-session` | `lib/growthCapture/` — universal inbox before filing | Growth, Arrival, Companion Presence |
| **Evidence entry** | `document` | `lib/evidenceBankStore.ts` — proof archive | Growth, Business, Pattern, LIG |
| **Asset** | `document` | `lib/assetLibrary/` — single store for uploads; referenced by Portfolio, Evidence, Journal, Capture, Wins, Journey, Reports | Growth, Content, Business, LIG |
| **Gallery memory** | `gallery-memory` | [T-015](../docs/GALLERY_FRAMEWORK.md) · `lib/gallery/` — experiential wall frames (curated from growth + asset library); `lib/sparkGallery/types.ts` — preservation framework | Narrative, Growth, Environmental Experience |
| **Peaceful place** | `peaceful-place` | `lib/peacefulPlaces/` — immersive estate destinations (Covered Deck™, Cozy Café™, Nature Escape™, etc.) with workspace-safe zones, layered audio spec, image brief | Environment, Recovery, Narrative, Companion Presence |
| **Garden banner menu item** | `garden-menu-destination` | `lib/peacefulPlaces/gardenBannerMenu.ts` — curated cloth-tag menus per path sign; future Arrival may warm-glow a recommended banner without forcing navigation | Arrival, Companion Presence, Recovery |
| **Offer** | `offer` | Product / service definitions | Offer, Audience, Opportunity |
| **Automation rule** | `automation` | GHL / workflow hooks | Automation, Business |
| **Business Asset** | `business-asset` | [Spec 002](../spark-intelligence-foundation/002-business-asset-architecture.md) · [Spec 104](../docs/CREATE_EXPERIENCE_PHILOSOPHY.md) — living business objects (workshop, offer, course, SOP, etc.); components attach; not file-centric | Business, LIG, Content, Offer, Learning, Automation, Narrative |
| **Spark Card** | `spark-card` (planned) | [T-011](../docs/SPARK_CARD_FRAMEWORK.md) — `lib/sparkCards/types.ts`; living wisdom, Brain-personalized; not gamified collectibles | Guidance, Learning, LIG, Gallery, Momentum, Experience |
| **Momentum Builder** | `momentum-builder` (planned) | [T-012](../docs/MOMENTUM_BUILDER_FRAMEWORK.md) — `lib/sparkMomentumBuilders/types.ts`; practice not games; V1 catalog in `lib/momentumBuilders/` | Capability Graph, Guidance, Momentum, Gallery, Guild, Learning |
| **Daily Discovery** | `daily-discovery` (planned) | [T-016](../docs/DAILY_DISCOVERIES_FRAMEWORK.md) — `lib/sparkDailyDiscoveries/types.ts`; Learn · Connect · Apply; not daily tips | Guidance, Learning, Observatory, Spark Card, Momentum, Gallery |
| **Knowledge Card** | `knowledge-card` | `lib/sparkMomentumInstitute/types.ts` — master knowledge object; one per concept; all experiences reference by id | Learning, Momentum Institute, LIG, Growth Profile, Evidence Vault |
| **Institute learning experience** | `institute-learning-experience` | `lib/momentumInstitute/learningExperienceStore.ts` — member session state + lifecycle | Learning, Momentum Institute, Growth Profile, Coaching |
| **Institute cabinet item** | `institute-cabinet-item` | `lib/momentumInstitute/cabinetStore.ts` — My Institute Cabinet™ references only | Learning, Narrative, Growth |
| **Institute growth profile** | `institute-growth-profile` | `lib/momentumInstitute/growthProfileStore.ts` — auto-updated competencies, timeline | Learning, Founder, Growth, Capability Graph |
| **Institute evidence opportunity** | `institute-evidence-opportunity` | `lib/momentumInstitute/evidenceBridge.ts` — permission-gated; bridges to `evidenceBankStore` | Growth, Evidence Vault, Learning |
| **Momentum Institute™** | `momentum-institute` (center) | `lib/momentumInstitute/` — Entrepreneur Development Center; catalog-driven; not a room | Learning, Guidance, Momentum, Apprenticeship, Business Lab, Simulation |
| **Spark Competency Framework™** | (taxonomy) | `lib/sparkCompetencyFramework/` — v1.0 four pillars, departments, drawers, competency levels (Exploring→Mentoring), Knowledge Perspectives™ | Momentum Institute, Growth Profile, Learning, Capability Graph |
| **Spark Knowledge Architecture™** | (Phase 3) | `lib/momentumInstitute/knowledgeArchitecture/` — hierarchy index, relationships, learning paths, competency graph · [MOMENTUM_INSTITUTE_ARCHITECTURE.md](../docs/MOMENTUM_INSTITUTE_ARCHITECTURE.md) | Momentum Institute, Guidance, Growth Profile, LIG |
| **Spark Curriculum Master Index™** | (Phase 4) | `lib/sparkCurriculumMasterIndex/` — 181+ topic roadmap, competency slugs, future experience map · [SPARK_CURRICULUM_MASTER_INDEX.md](../docs/SPARK_CURRICULUM_MASTER_INDEX.md) | Momentum Institute, Estate Intelligence, Growth Profile, CMS |
| **Spark Business Brain™ (Knowledge OS)** | `business-brain-knowledge-os` | `lib/businessBrain/` — institutional knowledge OS, Knowledge Council™, catalog provider · [SPARK_BUSINESS_BRAIN.md](../docs/SPARK_BUSINESS_BRAIN.md) | Momentum Institute, Estate Intelligence, Make It Mine, Coaching, Growth Profile |

## Spark OS foundational layers

| Layer | Spec | Role | Implementation (when wired) |
|-------|------|------|----------------------------|
| **Business Asset System™** | [002](../spark-intelligence-foundation/002-business-asset-architecture.md) | What members build — living objects | `business-asset` kind + future asset store |
| **Business Brain™** | [003](../spark-intelligence-foundation/003-business-brain.md) | Long-term business memory — remembers, does not decide | [009-lifecycle](../spark-intelligence-foundation/009-business-brain-lifecycle.md) · **[Spec 117](../docs/SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md)** · **[Spec 118](../docs/SPARK_HIDDEN_WORK_ENGINE_FRAMEWORK.md)** · `lib/sparkBusinessBrain/` · `memoryEngine/` |
| **Spark Knowledge Model™** | [004](../spark-intelligence-foundation/004-spark-knowledge-model.md) | Nine knowledge categories, confidence, ownership | `lib/sparkKnowledgeModel/types.ts` |
| **Guidance Engine™** | [005](../spark-intelligence-foundation/005-guidance-engine.md) | Reasons and recommends; member owns decisions | `lib/sparkGuidanceEngine/types.ts` |
| **Spark Response Architecture™** | [006](../spark-intelligence-foundation/006-spark-response-architecture.md) | Runtime pipeline — all interactions must flow through | `lib/sparkResponseArchitecture/types.ts` · `lib/sparkTrustPerformance/` |
| **Context Strategy™ & MVC** | [007](../spark-intelligence-foundation/007-context-strategy.md) | Intelligent context selection; six tiers; budgets | `lib/sparkContextStrategy/types.ts` |
| **Interaction Contracts™** | [008](../spark-intelligence-foundation/008-interaction-contracts.md) | One owner per responsibility; published contracts only | `lib/sparkInteractionContracts/types.ts` |

**Brain invariant:** retrieve context before re-asking; never generate content, recommendations, or member-facing copy; lifecycle stages govern storage; MVC governs retrieval ([009](../spark-intelligence-foundation/009-business-brain-lifecycle.md)).

**Knowledge invariant:** every record should declare `SparkKnowledgeCategory` + `SparkKnowledgeConfidence`; connect to Business Assets where applicable.

**Guidance invariant:** offers possibilities, never commands; reads Brain/Assets/Knowledge; Companion composes language.

**Response invariant:** no feature bypasses the 10-stage lifecycle; learning never blocks helping (Stage 10 async).

**Context invariant:** MVC only — never load entire Brain/Graph/Gallery; stop when sufficient confidence; Phase 1 blocks, Phases 2–3 async.

**Contract invariant:** systems never mutate peer internal state; only Companion speaks to the member; resolve ownership conflicts before shipping.

## Intelligence engine registry

| Engine | Code home (primary) | Consumes objects | Writes to |
|--------|---------------------|------------------|-----------|
| **Living Intelligence Graph** | `lib/arrivalIntelligence/livingIntelligenceGraph.ts`, thought `connectionIds` | Thought, Collection, Project, Relationship, Decision | `connectionIds`, `intelligenceMeta.living-intelligence-graph` |
| **Narrative Intelligence** | `lib/arrivalIntelligence/narrativeContext.ts` | Conversation, Thought, Project, Day state | `intelligenceMeta.narrative` |
| **Arrival Intelligence** | `lib/arrivalIntelligence/` | Day state, LIG arrivals, last activity | Greeting, home — not raw user data |
| **Companion Presence** | `lib/companionPresence/` | Conversation, emotional state, workspace | Presence copy only |
| **Founder Intelligence** | `lib/ecosystem/intelligence/`, founder workspace | Events, opportunities, decisions, projects | Founder dashboard, reports |
| **Decision Intelligence** | `lib/decision-intelligence/` | Decision, loops, cognitive load | `decisionStore`, support methods |
| **Opportunity Intelligence** | `lib/opportunity-intelligence/` | Opportunities, business profile, relationships | `opportunityStore` |
| **Business Intelligence** | `lib/ecosystem-intelligence/`, business profile | Profile, projects, content, revenue signals | Ecosystem snapshot |
| **Growth Intelligence** | `lib/momentum-intelligence/`, momentum events | Momentum, projects, thoughts handled | Momentum signals |
| **Recovery Intelligence** | `lib/recovery-intelligence/` | Day state, overwhelm, return patterns | Recovery insights |
| **Pattern Intelligence** | `lib/loop-intelligence/`, pattern awareness prefs | Loops, struggles, time-of-day | Loop store, signals |
| **Relationship Intelligence** | `lib/relationship-intelligence/` | Relationship, conversation, thoughts (person) | `relationshipStore` |
| **Content Intelligence** | PostCraft, templates, snippets | Template, draft, avatar | Content suggestions |
| **Learning Intelligence** | `lib/intelligence-layer/learningGates.ts` | Signals, trust, outcomes | Profile evolution |
| **Automation Intelligence** | GHL, ecosystem actions | Projects, content, calendar | External + events |
| **Project Intelligence** | `lib/founderWorkspace/intelligence/` | Project, items, time blocks | Project brain API |
| **Calendar Intelligence** | Google calendar routes, time blocks | Time block, reminder | Scheduling |
| **Audience Intelligence** | Avatars, business profile | Client avatar, profile | Messaging, offers |
| **Offer Intelligence** | Opportunity + business | Offer (planned), avatar | Opportunity engine |
| **Environment Intelligence** | `lib/environment-intelligence/` | Day state, workspace context | Environment scoring |
| **Environmental Experience Intelligence** | `lib/gallery/environmentExperience.ts` | Gallery visit, season, time, weather | Estate atmosphere, lighting, audio layers |
| **Homestead Room Architecture** | [T-017](../docs/ESTATE_ROOMS_FRAMEWORK.md) · `lib/companionHomestead/homesteadRoomRegistry.ts` | App section, place id, room shell | Permanent background + signature motion per room |
| **Gallery Demo Mode** | `lib/gallery/galleryDemoMode.ts`, `galleryDemoCatalog.ts` | Scripted journey scenes (no user PII) | Demo exhibitions only |
| **Gallery Curator Intelligence** | `lib/gallery/galleryCuratorIntelligence.ts` | Gallery memory archive, signals, rotation | Today's visible exhibition (12–20) |
| **Reflection Intelligence** | `lib/gallery/galleryReflectionIntelligence.ts` | Journal entries (private) | Wall wisdom — meaning without copied text |
| **Clear My Mind Intelligence** | `lib/clearMyMindIntelligence.ts` | Capture sessions, thoughts | LIG ingest (silent) |
| **Estate Intelligence™** | `lib/estateIntelligence/`, `lib/estateKnowledge/`, `lib/welcomeHome/estateConcierge.ts` | User text, emotion, intent, Registry entries, room knowledge docs | Chat hints, `WorkspaceOffer` routing — [docs/estate/KNOWLEDGE_BASE.md](../docs/estate/KNOWLEDGE_BASE.md) |
| **Estate Directory™** | `lib/estate/directory/` | Canonical place records + shell + media maps | `goToPlace`, backgrounds, suggestions, connections — 42 unified locations |
| **Conversation Drives Navigation™** | `lib/estate/conversationDrivesNavigation/` | Member environmental need phrases | Need → directory place offers; Spec 108 invitation flow |
| **Relief Intelligence** | `lib/reliefIntelligence.ts` | Capture behavior signals (voice, rhythm, return) | Companion voice tone only — never UI |
| **Ecosystem Intelligence** | `lib/ecosystemIntelligence.ts` | Cross-domain snapshot | Whole-system insight |
| **Trust / signal bus** | `lib/intelligence-layer/` | Chat, features, emotions | `IntelligenceSignal` store |
| **Momentum Institute Engine™** | `lib/momentumInstitute/` | Knowledge Card, Institute learning experience, cabinet, growth profile | Catalog, lifecycle, Growth Profile (auto), Evidence (permission), Cabinet, Journal refs, time slots, ecosystem links |
| **Spark Business Brain™ (Knowledge OS)** | `lib/businessBrain/` | Curriculum topics, Knowledge Cards, competencies, Knowledge Council | Institute catalog seed, synthesis context, Estate Intelligence, coaching, AI recommendations |
| **Spark Competency Framework™** | `lib/sparkCompetencyFramework/` | Pillar/dept/drawer taxonomy, perspectives, competency levels | Momentum Institute catalog scaffold, Growth Profile levels |

---

## Homestead rooms (companion home)

Canonical catalog: `lib/companionHomestead/homesteadRoomRegistry.ts` → `COMPANION_HOMESTEAD_ROOMS`

| Room | Purpose | Background | Signature motion | Sections |
|------|---------|------------|------------------|----------|
| Living Room | Everyday conversation | Cozy room + window (homestead scene) | Time-of-day lighting | `home`, `today`, `welcome-room` |
| Sunroom | Focus My Brain | Butterfly video + plants | Butterflies drifting | `focus` |
| Game Room | Momentum Games | Game room plate | Playful ambient | `games`, `activities` |
| Library | Learning | Warm bookshelves / reading nook | Dust motes, page-turn | `how-do-i` |
| Study | Planning | Elegant office | Morning light on desk | `plan-my-day`, `time-block` |
| Peaceful Places | Regulation | Chosen destination | Nature-specific (rain, waves, leaves, snow) | `focus-audio`, `breathe` |

Living Room lighting: `lib/homesteadScene/`. Signature motion layers: `HomesteadRoomSignatureMotion` + `homestead-room-motion.css`.

---

```
Thought ──collection──► Collection
   │                        │
   ├──projectId──────────► Project ──items──► ProjectItem
   ├──connectedPerson───► Relationship (string today; id future)
   ├──reminderAt────────► Reminder / TimeBlock
   ├──connectionIds─────► LIG edges (future typed connections)
   └──originatedFrom────► Thought | Conversation | … (evolution lineage)

Conversation ──signals──► IntelligenceSignal ──► all engines
FounderEvent ──refs──────► Project | Thought | Workspace
```

**Evolution without duplication:** `originatedFromId` + `originatedFromKind` when a thought becomes a project item, decision, or content draft.

---

## Storage index (local-first V1)

| Key / module | Object kinds |
|--------------|--------------|
| Brain dump list (`companionStore`) | `thought` |
| `companion-thought-collections-v1` | `collection` |
| Projects / items keys in `companionStore` | `project`, `project-item` |
| Time blocks, day state keys | `time-block`, `day-state` |
| Chat / messages keys | `conversation`, `conversation-turn` |
| `companion-business-profile-v1` | `business-profile` |
| Avatar list in `companionStore` | `client-avatar` |
| `lib/decision-intelligence/decisionStore` | `decision` |
| `lib/opportunity-intelligence/opportunityStore` | `opportunity` |
| `lib/relationship-intelligence/relationshipStore` | `relationship` |
| `lib/intelligence-layer/signalStore` | `intelligence-signal` |
| `companion-living-graph-arrivals-v1` | LIG arrival slice |
| `lib/ecosystem/events` | `founder-event` |
| `lib/gallery/` (planned persistence) | `gallery-memory`, gallery visit state |

### Life Area Intelligence (`classifyLifeArea`)

| Engine | Reads | Writes |
|--------|-------|--------|
| `classifyLifeArea` | task text, corrections, projects, contacts | — |
| Learning layer | corrections store | `companion-life-area-learning-v1` |
| Smart Life Areas | plan item titles | user life areas on accept |

Docs: `docs/plan-my-day/LIFE_AREA_INTELLIGENCE.md`

---

## Adding a new object (checklist)

- [ ] Add row to **Object registry** above
- [ ] Extend `EcosystemObjectKind` in `intelligenceReadyTypes.ts` if new kind
- [ ] Type includes `IntelligenceReadyHooks` fields (or subset with comment)
- [ ] Document storage key and ingest/event hook
- [ ] List which engines **read** vs **write**
- [ ] V1 UI uses only user-facing fields
- [ ] No second table for the same conceptual thing

---

## Adding a new intelligence engine (checklist)

- [ ] Add row to **Intelligence engine registry**
- [ ] Add `IntelligenceEngineId` key
- [ ] Declare which objects it reads (registry rows)
- [ ] Declare write target: `intelligenceMeta.<engine>` and/or signal bus
- [ ] Never require users to re-enter or reconnect existing data
- [ ] Ship behind calm surface — Intelligence Paradox

---

*Last aligned with: My Thoughts visual architecture, Clear My Mind continuous capture, `BrainDumpEntry` LIG hooks.*

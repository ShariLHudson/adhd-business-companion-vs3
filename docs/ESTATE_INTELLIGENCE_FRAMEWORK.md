# Estate Intelligence™ — Universal Estate Awareness & Routing

| Field | Value |
|-------|-------|
| **Status** | Phase 1 live — Welcome Home wired; Estate OS architecture in progress |
| **Core question** | *Does the Spark Estate already contain something designed to help with this?* |
| **Parent** | [ESTATE_ROOMS_FRAMEWORK.md](./ESTATE_ROOMS_FRAMEWORK.md) · [ECOSYSTEM_CONNECTION_FRAMEWORK.md](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) · [INTELLIGENCE_REGISTRY.md](../lib/intelligence/INTELLIGENCE_REGISTRY.md) |
| **Place guides** | [docs/estate/KNOWLEDGE_BASE.md](./estate/KNOWLEDGE_BASE.md) — Spark's internal room understanding (canonical over invented explanations) |

---

## Goal

Spark should not behave like a generic LLM when the Estate already has a room, tool, workflow, builder, card, template, or research capability that serves the request better.

**Spark is the concierge of the Spark Estate™.** The Estate is the first source of truth. General AI knowledge is second.

| Wrong | Right |
|-------|-------|
| "A peaceful place is…" | "I think I know exactly where we should go — Peaceful Places™ was made for moments like this." |
| Encyclopedia first | Estate capability first |
| User remembers room names | User describes need; Spark routes |

---

## The Conversation Front Door™

**Governing architectural rule** — applies to every future room, tool, builder, and capability.

> If a member can accomplish something by talking to Spark, they should never have to hunt through the Estate to find it.

| Layer | Role |
|-------|------|
| **Conversation** | The front door — how members enter, describe needs, and receive help |
| **Estate Intelligence™** | Quietly knows where the need belongs; invites when depth helps |
| **Rooms & destinations** | Beautiful places for deeper work — optional enrichment, not a prerequisite |

The Estate exists to **enrich** the conversation. It does not replace it.

Rooms remain valuable. They become immersive destinations for focus, creation, reflection, and momentum. But members should never need a map, sidebar, or mental catalog of room names to get started.

**As the Estate grows** (dozens of rooms, hundreds of capabilities), Spark stays simple because **talk is enough**.

### Design gate (before any feature ships)

1. Can the member get meaningful help from conversation alone?
2. Is Estate navigation optional enrichment — not a prerequisite?
3. Would a first-time visitor need to know a room name to succeed?

If (3) is yes → redesign before shipping.

**Code:** `CONVERSATION_FRONT_DOOR_PRINCIPLE` in `lib/sparkEstateRooms/types.ts`  
**Aligns with:** [Spec 105 Conversation Engine](./SPARK_CONVERSATION_ENGINE_FRAMEWORK.md) · [Spec 108 Environment Integration](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md) · [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) · [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) — *Spark goes with them; never sends them somewhere.*

**Estate Intelligence mandate:** Matcher and Router exist to serve this principle — Spark knows where the need belongs; the member describes the need.

---

## Pipeline position

```
User message
    ↓
Conversation layer (Spec 105–107 — listen, one question)
    ↓
Estate Intelligence™          ← NEW orchestration layer
    ├── Estate Registry™      (what exists)
    ├── Estate Matcher™       (does this message fit?)
    ├── Estate Router™        (primary destination + offer)
    └── Estate Journey Engine™ (multi-room sequences)
    ↓
Existing intelligence (reuse — do not duplicate)
    ├── companionNeedsIntelligence
    ├── intentRoutingIntelligence
    ├── ecosystem-intelligence
    ├── recovery / momentum / EF engines
    └── room orchestrators (e.g. momentumBuilderRoom)
    ↓
LLM (hints + member context)
    ↓
Response (guide · journey · answer · blend)
```

**Mandatory gate:** Every turn evaluates estate fit **before** the LLM composes a generic explanation.

---

## Core principle (three outcomes)

| Estate fit | Spark behavior |
|------------|----------------|
| **Strong** | Lead with the Estate — invite, don't define |
| **None** | Answer with general knowledge |
| **Partial** | Estate first, education second if helpful |

**Never explain what Spark already has** when a registered capability matches. Introduce the place; teach only after permission or when the member asks.

Aligns with [ESTATE_ROOMS_FRAMEWORK.md](./ESTATE_ROOMS_FRAMEWORK.md) — *Do the thing — never explain the room.*

---

## Module architecture

```
lib/estateIntelligence/
├── types.ts                 # EstateRegistryEntry, MatchResult, JourneyStep
├── estateRegistry.ts        # Central catalog — aggregates registrations
├── estateCapabilityIndex.ts # Keyword / emotion / goal inverted index
├── estateMatcher.ts           # Score message → registry entries
├── estateRouter.ts            # Primary route + invitation copy hints
├── estateJourneyEngine.ts     # Multi-room sequences
├── estateIntelligence.ts      # evaluateEstateIntelligence() — main entry
├── estateHintForChat.ts       # LLM hint block (like momentumBuilderRoomHintForChat)
├── registrations/             # One file per domain — thin adapters only
│   ├── rooms.ts
│   ├── tools.ts
│   ├── builders.ts
│   ├── knowledge.ts
│   ├── research.ts
│   └── workflows.ts
└── estateIntelligence.test.ts
```

### Responsibilities

| Module | Role |
|--------|------|
| **Estate Registry™** | Single source of truth for every estate asset |
| **Estate Capability Index™** | Fast lookup: keywords, emotions, goals → entry ids |
| **Estate Matcher™** | Score user text + signals against index |
| **Estate Router™** | Pick primary `AppSection` / place / workspace; build invitation |
| **Estate Journey Engine™** | Ordered multi-room paths when several assets apply |
| **Estate Intelligence™** | Orchestrates matcher + router + journey; emits chat hints + optional UI offers |

**Registration rule:** Features register themselves. Routing logic never hard-codes room lists.

---

## Estate Registry™ entry schema

Each asset registers once. Thin adapters re-export from existing modules — **no duplicate business logic**.

```typescript
type EstateRegistryEntry = {
  id: string;                          // e.g. "peaceful-places"
  name: string;                        // "Peaceful Places™"
  category: EstateAssetCategory;
  purpose: string;                     // One sentence — internal + hint fuel
  memberDescription: string;           // How Spark introduces it (not a definition lecture)

  // Navigation
  primarySection?: AppSection;
  sections?: AppSection[];
  placeId?: CompanionPlaceId;
  objectId?: string;
  route?: string;

  // Matching
  keywords: string[];
  emotionalStates?: string[];
  businessGoals?: string[];
  intents?: IntentCategory[];          // align with intentRoutingIntelligence

  // Capabilities (for matcher scoring — not shown as feature lists to members)
  problemsSolved: string[];
  outcomes: string[];

  // Relationships
  relatedEntryIds?: string[];
  journeyRole?: EstateJourneyRole;     // learn | think | plan | create | reflect | research | execute | recover

  // Integration hooks (optional)
  chatHint?: (ctx: EstateHintContext) => string | null;
  orchestrator?: (ctx: EstateOrchestrationContext) => unknown;
  offerBuilder?: (ctx: EstateOfferContext) => WorkspaceOffer | null;

  status: "live" | "partial" | "planned";
};
```

**Categories:** `room` · `tool` · `workflow` · `builder` · `knowledge` · `template` · `research` · `audio` · `report` · `collection` · `game`

---

## Existing systems inventory → registry migration

Today estate knowledge is **fragmented across 7+ catalogs**. Estate Intelligence **aggregates** them — it does not replace their runtime.

| Asset | Current source(s) | Registry status | Chat hint today |
|-------|-------------------|-----------------|-----------------|
| **Welcome Home** | `home`, arrival intelligence | Partial | Arrival only |
| **Clear My Mind™** | `brain-dump`, greenhouse place, `clearMyMindIntelligence` | Partial | `clearMyMindTrustHintForChat` |
| **Momentum Builder™** | `momentumBuilderRoom/roomRegistry` | **Full template** | `momentumBuilderRoomHintForChat` ✅ |
| **Plan My Day** | `plan-my-day`, study homestead room | Partial | Via intent routing |
| **Day Designer** | `lib/day-designer/` | Missing | Chat flow only |
| **Decision Compass™** | `decision-compass`, business-office | Partial | `decisionCompassHintForChat` ✅ |
| **Creative Studio™** | `creative-studio` place → `content-generator` | Missing | Create hints only |
| **Peaceful Places™** | `peacefulPlaces/registry`, `focus-audio` | Partial | **None** ❌ |
| **Soundscapes / Focus Audio** | `focus-audio`, `breathe` | Partial | Generic stress hints |
| **Observatory™** | `grow-observatory`, estate map | Nav only | **None** ❌ |
| **Library** | `how-do-i`, `growth-library` (split!) | Partial | How-to learning hints |
| **Business Mastery Minutes** | T-012 / grow | Planned | None |
| **Knowledge Cards / Spark Cards** | `grow-spark-cards` | Nav only | None |
| **Conservatory** | Clear My Mind bg, estate map | Visual only | None |
| **Coffee House™** | estate map, cozy cafe peaceful place | **No section** | None |
| **Gallery / Asset Library** | `the-gallery` | Partial | None |
| **Evidence Bank** | `evidence-bank` | Partial | Growth nav |
| **Business Profile** | `business-profile` | Partial | Profile context |
| **Client Avatars** | `client-avatars` | Partial | Create routing |
| **Research Lab** | observatory / future | Planned | None |
| **Builders (T-012)** | `sparkMomentumBuilders`, `guidedPracticeBridge` | Partial | Permission only in MB |
| **Templates** | `templates-library`, `artifactRegistry` | Partial | Artifact routing |
| **Games / Quick Recharge** | `games`, `momentumBuilders` catalog | Partial | Game room |
| **Recovery** | `recovery-intelligence` | Engine only | `recoveryHintForChat` |
| **Momentum Intelligence** | `momentum-intelligence` | Engine only | Offers only |
| **Guidance / Needs** | `companionNeedsIntelligence` | **Unwired to chat** ❌ | — |
| **Environment** | `environment-intelligence` | **Computed, unwired** ❌ | — |
| **Memory / Brain** | Spec 112 / 117 | Engine only | Hospitality recall |
| **Parking Lot** | docs | N/A | N/A |

**Template to copy:** `lib/momentumBuilderRoom/` — registry + orchestrator + mandatory `*HintForChat`.

---

## Fragmented catalogs → unified registry (adapter map)

| Existing module | Becomes registration adapter |
|-----------------|------------------------------|
| `lib/companionHomestead/homesteadRoomRegistry.ts` | `registrations/rooms.ts` — homestead rooms |
| `lib/momentumBuilderRoom/roomRegistry.ts` | `registrations/rooms.ts` — MB entry |
| `lib/peacefulPlaces/registry.ts` | `registrations/rooms.ts` — destinations as sub-entries |
| `lib/growNavigation.ts` | `registrations/knowledge.ts` — Observatory, Spark Cards, Guilds |
| `lib/estateMap/estateMapLocations.ts` | `registrations/rooms.ts` — map nodes → entries |
| `lib/companionConstitution/environmentIntelligence/roomRegistry.ts` | placeId ↔ section bindings |
| `lib/workspaceObjectIds.ts` | objectId on each entry |
| `lib/artifactRegistry.ts` | `registrations/workflows.ts` — Create deliverables |
| `lib/companionNeedsIntelligence/needsCatalog.ts` | emotion/goal → place mapping |
| `lib/intentRoutingIntelligence.ts` | intent → section (delegate, don't duplicate) |
| `lib/momentumBuilderRoom/estateIntegration.ts` | journey edges seed data |

**Rule:** Adapters **import** existing constants. Registry file is the index; feature modules stay authoritative for behavior.

---

## Estate Matcher™ algorithm (V1)

**Inputs per turn:**

- `userText`
- `activeSection`, `workspacePanel`
- `emotionalState`, `obstacle`, `somatic` (existing)
- `evaluateCompanionNeedsIntelligence()` result
- `intentRoutingIntelligence` category (existing)
- `recoveryOverridesProductivity`, momentum snapshot (when available)
- Session memory / project context (lightweight)

**Scoring (conceptual):**

1. Tokenize + phrase-match against **Estate Capability Index** (keywords, emotions, goals).
2. Boost entries whose `intents` match `IntentCategory`.
3. Boost `companionNeedsIntelligence.recommendedPlaceId` → registry entries for that place.
4. Penalize generic encyclopedia path when score ≥ threshold.
5. If multiple entries score high → **Journey Engine**; if one dominates → **Router**.

**Special cases (product rules):**

| User signal | Primary estate match | Never |
|-------------|---------------------|-------|
| "peaceful place" / calm / sleep audio | Peaceful Places™ | Generic definition of "peaceful place" |
| overwhelmed / stuck / momentum | Momentum Builder™ | Productivity framework lecture |
| clear head / brain dump | Clear My Mind™ | Note-app explanation |
| decide / which option | Decision Compass™ | Pros/cons essay without tool |
| research AI / trends | Observatory™ | Web-style research summary first |
| learn pricing / marketing | Library → BMM / Cards | Textbook chapter |
| create workshop / content | Creative Studio™ | Outline without workspace |
| reflect / debrief | Coffee House™ (journey end) | Journal app pitch |

---

## Estate Journey Engine™

Canonical journeys (from estate philosophy + `momentumBuilderRoom/estateIntegration.ts`):

```
Learn → Think → Plan → Create → Reflect
Research → Organize → Decide → Execute → Celebrate
```

**Example journeys (registry-defined edges):**

| Trigger | Journey |
|---------|---------|
| New opportunity | Observatory → Library → Conservatory → Momentum Builder → Creative Studio → Coffee House |
| Overwhelmed | Momentum Builder (maybe Clear My Mind first if scatter) |
| Learn + apply | Library → Momentum Builder → Creative Studio |
| Research decision | Observatory → Decision Compass → Momentum Builder |

Journey output: ordered `EstateJourneyStep[]` with **one primary invitation** (max 3 choices per T-003).

---

## LLM integration (where to wire)

### Primary insertion point

`CompanionPageClient.tsx` — `handleSend` API body, **before** existing hint merge:

```typescript
const estate = evaluateEstateIntelligence({
  userText: trimmed,
  activeSection,
  workspacePanel,
  emotionalState,
  needs: evaluateCompanionNeedsIntelligence({ ... }),
  intent: classifyIntent(trimmed), // delegate to intentRoutingIntelligence
});

// New hint — high priority in intentHint stack
estateIntelligenceHintForChat(estate),
```

### Hint priority order (proposed)

1. **Estate Intelligence™** — estate-first mandate + matched entry + invitation language
2. Governor / workflow locks (suppress when in room-specific coaching)
3. `intentRoutingHintForChat` (existing — delegate section offers to estate router when overlap)
4. Room-specific hints (MB, Decision Compass, Clear My Mind)
5. Ecosystem / wisdom / phase hints

### API route

`app/api/companion-chat/route.ts` already supports `workspaceContextHint`, `toolOfferHint`, ecosystem blocks. Add optional `estateIntelligenceHint` field or merge into `intentHint` with clear `ESTATE INTELLIGENCE (mandatory)` header (same pattern as Momentum Builder).

### UI offers (optional V1.1)

When `estateRouter` confidence is high + member permission culture allows:

- Reuse `WorkspaceOffer` from `workspaceMode.ts`
- Three-choice invitation: **Yes · Stay here · Show Estate map** (Spec 108)

---

## Conversation examples → registry + hints

### "What is a peaceful place?"

```
Matcher: keywords ["peaceful", "place"] → peaceful-places (score: high)
Router: primarySection = focus-audio
Hint: "Member may be asking about OUR Peaceful Places™ collection — not a dictionary definition.
       Lead with invitation. Example: 'Peaceful Places™ inside the Estate was made for exactly this.'"
```

### "I'm overwhelmed."

```
Matcher: emotionalStates [overwhelmed] → momentum-builder
Needs intelligence: likely planning-table or garden — estate layer resolves to Momentum Builder™ for forward motion
Hint: coaching invitation to Momentum Builder™ — never teach Eisenhower/Pomodoro
```

### "I need to research AI."

```
Matcher: goals [research], keywords [AI] → grow-observatory
Journey: Observatory → (optional) Library for depth
```

---

## What NOT to build (duplication guardrails)

| Do not duplicate | Reuse |
|------------------|-------|
| New intent classifier | `intentRoutingIntelligence` |
| New needs → place map | `companionNeedsIntelligence` |
| New artifact detection | `artifactRegistry` |
| New overwhelm routing | `overwhelmTodayRouting` |
| New strategy engines | Room orchestrators |
| New navigation tables | `homesteadSignpost`, `growNavigation` |
| Per-room encyclopedia prompts | Estate Registry `memberDescription` + Spec 108 invitations |

Estate Intelligence **composes** existing engines and **unifies** their outputs into one estate-first hint.

---

## Phased implementation plan

### Phase 0 — Document & types (this deliverable)

- [x] Implementation plan (this document)
- [ ] `lib/estateIntelligence/types.ts` — registry entry types only
- [ ] Update `INTELLIGENCE_REGISTRY.md` with Estate Intelligence row

### Phase 1 — Registry shell + Welcome Home wiring (done)

- [x] `lib/estateIntelligence/` — Registry, Matcher, Router, Offer, hints
- [x] `lib/welcomeHome/estateConcierge.ts` — Welcome Home orchestration
- [x] `CompanionPageClient` — concierge hint first; `workspaceOfferFromEstateEvaluation`
- [x] Unit tests — peaceful place, overwhelm journey, workshop, pricing
- [x] [ESTATE_E2E_WIRING.md](./ESTATE_E2E_WIRING.md)

### Phase 2 — Matcher + Router (V1)

- [x] `estateMatcher.ts` — scoring with product rules
- [x] `estateRouter.ts` — primary destination + `estateIntelligenceHintForChat`
- [x] Wire `evaluateEstateIntelligence()` into `CompanionPageClient` intentHint stack
- [x] Wire `evaluateCompanionNeedsIntelligence` into concierge evaluation
- [ ] Golden tests in browser for all 7 Welcome Home prompts
- [ ] Spec 108 frosted offer card UI

### Phase 3 — Journey engine (V1.1)

- [ ] `estateJourneyEngine.ts` — multi-step paths from registry `relatedEntryIds` + `journeyRole`
- [ ] Journey hints in chat (one primary step; others latent)
- [ ] Align with `momentumBuilderRoom/estateIntegration.ts` journey constants

### Phase 4 — Per-feature registration migration (rolling)

Each feature team adds **one registration block** (no routing logic changes):

- Creative Studio, Coffee House (section or place binding)
- Business Mastery Minutes, Knowledge Cards when live
- Templates, Builders, Research Lab
- Games, Evidence Bank, Business Profile

### Phase 5 — Offer UI + map (V2)

- High-confidence estate offers in frosted chat
- Estate map highlight on invitation
- Journey progress (ties to Momentum Path™ architecture)

---

## Success criteria

1. **"What is a peaceful place?"** → Spark invites to Peaceful Places™ — not a dictionary entry.
2. Members rarely think *"Which room should I open?"* — they describe needs.
3. Estate feels like **one intelligent place**, not disconnected features.
4. New rooms register in **one file** without changing matcher/router core.
5. LLM hints consistently say **Estate first** when match confidence ≥ threshold.
6. No regression: room-specific coaching locks (Momentum Builder, etc.) still win when member is already inside the room.

---

## Relationship to frozen conversation architecture

Observation Mode is active. Estate Intelligence is **routing and awareness** — not a redesign of Spec 105–119.

- **Allowed:** Estate-first hints, invitations, quiet routing, registry aggregation
- **Not allowed:** New conversation patterns, teaching menus, feature-navigation language (*"Open Clear My Mind™"*)
- **Language:** Spec 108 invitations — *"Let's head there together"* · *"Would you like to step into…"*

---

## Next step

Implement **Phase 1** with ~15 registry entries covering all live estate destinations, then wire **one** high-visibility fix: Peaceful Places knowledge routing — to prove the pipeline end-to-end before rolling registration across every feature.

**Canonical code home:** `lib/estateIntelligence/`  
**Canonical doc home:** this file + cross-link from [ESTATE_ROOMS_FRAMEWORK.md](./ESTATE_ROOMS_FRAMEWORK.md)

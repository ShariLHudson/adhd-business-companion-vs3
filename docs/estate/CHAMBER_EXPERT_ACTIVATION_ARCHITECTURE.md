# Chamber Expert Activation Architecture — Analysis & Recommendation

| Field | Value |
|-------|-------|
| **Status** | Architecture recommendation only — **no runtime code changes in this document** |
| **Date** | 2026-08-06 |
| **Mode** | Analysis → recommendation → phased plan (implementation requires separate handoff) |
| **Authority** | Estate Architectural Authority · Spec 105–131 · Reuse Before Reinvention · One Brain (`docs/architecture/SPARK_INTELLIGENCE_BLUEPRINT.md`) |
| **Depends on** | `docs/visual-spark-studios/Chamber-Member-Intelligence/CHAMBER_EXPERT_INTELLIGENCE_TEMPLATE.md` + 24 Expert Intelligence Profiles (this PR) |
| **Related** | `docs/estate/BUSINESS_BUILD_ROLE_DEFINITION.md` · `docs/estate/SPARK_ESTATE_REASONING_AND_EXPERIENCE_STANDARDS_ALIGNMENT_REVIEW.md` (branch `cursor/estate-standards-alignment-c069`) |

---

## 0. Verdict up front

1. **“Universal Reasoning Journey” and “Work Recognition” are not implemented under those names.** The closest live systems are the **Universal Creation Journey** (`lib/universalCreation/`) and several independent **intent/need classifiers** (`IntentCategory`, `EstateIntentCategory`, primary-turn classifier, goal classifier). A `processReasoning` scaffold exists (`lib/sparkCoreIntelligence/reasoningEngine/`) but is **not wired** into the companion chat path.
2. **Chamber expert activation today is shallow and fragmented across three mismatched ID sets**: a 6-member Phase 33 keyword system, a 15-member Estate Brain expert registry, and the new 24-member canonical Chamber list (docs only). None of them load the new Expert Intelligence Profiles.
3. **Knowledge Fingers have no runtime.** Working Memory (Spec 112/117) is **types-only**. The only thing that reliably reaches the LLM today is **string hint blocks** appended to the system prompt (`intentHint`, `businessContext`, `appFeatureKnowledgeHintForChat`, `formatEstateIntelligenceHint`, `sparkEstateExpertCollaborationCompanionHint`).
4. **The smallest safe path is a new hint function** — same shape as `appFeatureKnowledgeHintForChat` — that takes the *existing* `EstateIntelligenceRoute` (or intent category) and returns a short, need-based **Chamber Expertise Hint** built from the 24 profiles' §0/§1/§5 digests. This requires **no new engine, no new agent, no schema change**, and slots into the hint stack that already feeds `buildCompanionSystemPrompt`.

---

## 1. Current architecture — what actually runs today

### 1.1 Message → response pipeline (live path)

```
User message
  → CompanionPageClient.tsx
      → classifyPrimaryConversationTurn      (lib/conversation/primaryTurnClassifier.ts)
      → resolveIntentRouting                  (lib/intentRoutingIntelligence.ts)   — IntentCategory: build/decide/plan/organize/execute/learn/…
      → evaluateEstateConversationTurn
      → resolveFrictionlessAction             (lib/frictionlessActionLayer.ts)
            → resolveEstateIntelligenceRoute   (lib/estateBrain/routeEstateIntelligence.ts)
                  → resolveIntentFirstRoute    (lib/estateBrain/routeIntentFirstNavigation.ts)
                  → capability trigger scoring (lib/estateBrain/capabilityRegistry.ts)
                  → expertIds → expertNames    (lib/estateBrain/expertRegistry.ts)
            → shouldEnterUniversalCreation / shouldEnterDiscoveryMode / shouldCoachBeforeNavigate
      → hint assembly (intentHint stack, ~CompanionPageClient.tsx:14682–15130)
  → POST /api/companion-chat
      → buildCompanionSystemPrompt(coachingMode, inputType, { intentHint, … })   (lib/companionPrompt.ts)
      → finalSystem = priorityBlock + systemPrompt + businessContext + shariCompanionBlock + …
      → OpenAI call
```

**Confidence gating is real, but distributed** — not one Spec-107-style state machine. Each subsystem (intent routing, discovery mode, Estate Intelligence `confidenceFromScore`, primary-turn classifier) makes its own high/medium/low call. `processReasoning`'s ask-vs-answer gate exists but isn't in this path.

### 1.2 Where Chamber intelligence enters conversations today

| Mechanism | Members covered | How it reaches the LLM | Depth |
|-----------|-----------------|------------------------|-------|
| **Phase 33** `sparkEstateExpertCollaborationCompanionHint` (`lib/estate/sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture.ts`) | 6 (`momentum, marketing, content, project, research, data`) | Gated on collab keywords (`expert\|team\|collaborat\|chamber…`) → `shariCompanionHintForChat` → appended to `finalSystem` in `app/api/companion-chat/route.ts` | Expert **labels only** in one hint line, e.g. “Activate smallest helpful team: Marketing, Content.” |
| **Estate Brain** `formatEstateIntelligenceHint` (`lib/estateBrain/routeEstateIntelligence.ts`) | 15 (`copywriter, research-analyst, marketing-expert, …`) | Via `frictionlessHintForChat` → `intentHint` → system prompt | Expert **names only**, e.g. “Experts: Marketing Expert, Sales Expert.” |
| **Room cross-support** (`sparkEstateRoomIntelligenceArchitecture`) | 6 loose groups | Room-level, not per-turn expert selection | Presence only |
| **24 canonical Chamber members + Expert Intelligence Profiles** | 24 | **Not wired anywhere** | Docs only |

No mechanism today injects an expert's **frameworks, signature questions, or ADHD adaptations** into a response — only a name or label. The 24 profiles this PR added are the first place that knowledge actually exists in a structured, reusable form.

### 1.3 Naming collision (must resolve before wiring)

| System | ID example | Count |
|--------|-----------|-------|
| Phase 33 | `marketing`, `project`, `data` | 6 |
| Estate Brain | `marketing-expert`, `project-manager`, `business-strategist` | 15 (one orphan: `financial-educator`) |
| Canonical (MEMBER_INDEX + Expert Intelligence Profiles) | `MKT`, `PM`, `STR`, … | 24 |

**Recommendation:** the **24 canonical prefixes are the single source of truth** going forward (they already back this PR's profiles). Phase 33 and Estate Brain expert IDs should be treated as **legacy aliases** that map onto canonical prefixes — not separate registries to keep extending.

### 1.4 Knowledge Finger / Working Memory reality check

| Concept | Status |
|---------|--------|
| Knowledge Finger runtime | **Does not exist in `lib/`.** Only markdown (uploaded specs + this PR's profiles, which absorb the Finger reasoning-pattern role per `BUSINESS_BUILD_ROLE_DEFINITION.md` §7) |
| Working Memory (Spec 112) | `lib/sparkCompanionMemory/types.ts` — **types only** |
| Business Brain (Spec 117) | `lib/sparkBusinessBrain/*Types.ts` — **types only** |
| Closest live continuity | `lib/conversationSession/` (session spine: `currentIntent`, `currentNeed`, `answeredQuestions`, `pendingQuestion`) — not Spec 112/117, but the only thing actually read/written per turn |
| `lib/sparkCoreIntelligence/memoryEngine/` | Implemented (`runCoreMemory`, `proposeMemoryWrite`) but **only exercised in tests** — not called from chat |

**Implication:** any “Working Memory needs” declared in a Chamber profile (§ADHD layer, §6) cannot be persisted through Spec 112/117 today. The nearest real hook is `ConversationSession` fields, on a best-effort basis, until Spec 112/117 gets an implementation handoff of its own (out of scope here).

---

## 2. Where expert profiles could be injected (extension points, ranked)

| # | Extension point | File | Why it fits | Effort |
|---|------------------|------|--------------|--------|
| 1 | **New hint function**, same contract as `appFeatureKnowledgeHintForChat` | new: `lib/chamberExpertise/chamberExpertiseHint.ts` | Matches an existing, proven pattern (§`intentHint` stack); zero new plumbing | Smallest |
| 2 | **`EstateIntelligenceRoute.expertIds`** already carries expert IDs per turn | `lib/estateBrain/intelligenceTypes.ts` / `routeEstateIntelligence.ts` | Reuse the existing scored routing decision instead of a second scorer | Small |
| 3 | **`capabilityRegistry.expertIds`** — swap/extend to canonical prefixes | `lib/estateBrain/capabilityRegistry.ts` | Capabilities already carry the right *shape* (`expertIds: readonly string[]`) | Small–medium (touches many entries) |
| 4 | **Phase 33 keyword activation** as a second, richer signal | `lib/estate/sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture.ts` | Already has scoring + smallest-team-size logic + memory of “helpful experts” | Medium (needs 6→24 member expansion) |
| 5 | **`intentRoutingIntelligence.ts` `IntentCategory`** as the “work type” signal (Build/Decide/Plan/…) requested in the task | `lib/intentRoutingIntelligence.ts` | Matches the user's Example 1 (“Work type: Build/Improve”) almost exactly | Small (read-only consumer) |
| 6 | **`lib/createBuilderChat.ts` hint** for in-Create expert context | `formatCreateBuilderChatHint` | Lets Create Build Types receive expert framing without a new system | Medium |
| 7 | **`lib/universalCreation/documentCreationProfiles.ts`** plugin `essence` field | `lib/universalCreation/types.ts` | Could eventually carry a `primaryExpertPrefix` per document type — not required for Phase 1 | Later |

**Recommendation:** build extension point **#1**, sourced from **#2/#5** (reuse existing routing + intent signals), with **#3** as a small compatibility patch (add canonical-prefix aliases, don't rip out existing `expertIds`). Leave #4, #6, #7 for later phases.

---

## 3. What is missing for dynamic, need-based activation

The task requires activation based on **desired outcome, journey stage, missing information, decisions being made, and expertise needed** — not keywords alone. Gaps against that bar:

| Requirement | Current state | Gap |
|-------------|---------------|-----|
| Desired outcome | `IntentCategory` (build/decide/plan/…) exists and is live | Not yet connected to *which* Chamber expert(s) fit that outcome + topic |
| Journey stage | Session has `currentStage` (`ConversationSession`); Universal Creation has 8 named steps | Not consulted by any expert-selection logic today |
| Missing information | `reasoningEngine/preReasoning.ts` computes `missing` fields | Scaffold — not on the live path |
| Decisions being made | No live signal beyond `IntentCategory: "decide"` | Would need lightweight tagging, not a new engine |
| Expertise needed (topic) | Capability `triggers[]` + Estate Brain `expertIds` (topic-only, keyword-scored) | Usable as a first layer; needs canonical-prefix mapping |
| Multiple experts, ranked (primary/supporting/possible) | Only Phase 33 does “team” (max 2–4, flat list, no primary/supporting distinction) | Needs a ranked output shape: `{ primary, supporting[], possible[] }` |
| “Never keyword-only” | All three live systems (Phase 33, Estate Brain, capability triggers) **are** substantially keyword/trigger-based | Full compliance requires layering **intent category + capability category + topic triggers**, so no single keyword match can activate on its own — this is achievable without an LLM classifier call, using data already computed per turn |
| ADHD-adaptation gate before recommending | Not present in Estate Brain/Phase 33 at all | Chamber profiles supply this (§6/§7) — just needs to reach the prompt |

**Bottom line:** the pieces to satisfy “not keyword-only” already exist (intent category + capability category + confidence), they are just **not composed together** for expert selection. No new classification engine is needed — a composition function is.

---

## 4. Recommended architecture (no new engine)

```
Universal Spark Conversation Engine (existing)
        │
        ▼
Work Recognition layer (existing, composed — not new)
   IntentCategory (build/decide/plan/organize/execute/learn/…)
   + EstateCapabilityCategory (business/create/momentum/focus/…)
   + journey stage (ConversationSession.currentStage / UC step)
   + confidence (existing per-subsystem scores)
        │
        ▼
Chamber Expert Activation (NEW — thin composition function)
   Input:  userText, intentCategory, capabilityCategory, journeyStage, confidence
   Output: { primary: ChamberPrefix, supporting: ChamberPrefix[], possible: ChamberPrefix[] }
   Rule:   never fires on a single keyword alone — requires intent OR capability
           signal AND a topic trigger match (see §5.2)
        │
        ▼
Chamber Expertise Hint (NEW — same shape as appFeatureKnowledgeHintForChat)
   Reads §0/§1/§5/§6/§7 digest from the matched Expert Intelligence Profile(s)
   Returns a short string: role + one signature question + one ADHD adaptation
        │
        ▼
intentHint stack → buildCompanionSystemPrompt → finalSystem → LLM
        │
        ▼
Shari responds — one conversation, expertise invisible as a system
```

**Why this satisfies the constraints:**

- **One conversation engine** — nothing new is added to `app/api/companion-chat/route.ts` except one more optional string in the existing hint concatenation, exactly like `appFeatureKnowledgeHintForChat` and `shariCompanionHintForChat` already do.
- **No separate agent** — the “expert” never gets its own turn, model call, or persona; it is prompt content Shari uses.
- **No duplicate memory** — journey stage and confidence are read from existing session/routing state; no new store.
- **No Knowledge Finger runtime invented** — the 24 Chamber profiles already absorb the Finger reasoning-pattern role (per `BUSINESS_BUILD_ROLE_DEFINITION.md`); this architecture activates *those*, not a parallel Finger engine.

---

## 5. Data flow diagram

```mermaid
flowchart TD
  U[User message] --> PTC[classifyPrimaryConversationTurn]
  PTC --> IRI[resolveIntentRouting → IntentCategory]
  PTC --> FAL[resolveFrictionlessAction]
  FAL --> EIR[resolveEstateIntelligenceRoute → EstateIntelligenceRoute]
  EIR -->|capabilityCategory, expertIds, confidence| CEA
  IRI -->|intentCategory| CEA
  SESS[ConversationSession.currentStage] --> CEA
  CEA[Chamber Expert Activation\n(new, thin composition fn)]
  CEA -->|primary/supporting/possible\nChamber prefixes| CEH
  PROF[(24 Expert Intelligence Profiles\n§0 §1 §5 §6 §7)] --> CEH
  CEH[chamberExpertiseHintForChat\n(new, mirrors appFeatureKnowledgeHintForChat)]
  CEH -->|intentHint addition| BCP[buildCompanionSystemPrompt]
  BCP --> FS[finalSystem]
  FS --> LLM[OpenAI]
  LLM --> Shari[One Shari response]
```

### 5.1 Example trace — "I want to build a strategy for organizing my filing system."

| Step | Value |
|------|-------|
| `IntentCategory` | `build` (existing classifier) |
| `EstateIntelligenceRoute.category` | `business` or `momentum` (existing capability scoring on "organizing", "system") |
| Topic triggers matched | "filing system", "organiz-" → Systems / Knowledge Management vocabulary |
| Chamber Expert Activation output | `primary: SYS`, `supporting: [KMG]`, `possible: [AI]` |
| Hint injected | 2–3 lines: Systems Intelligence role + one MVP-Process-style question + one ADHD adaptation (visible checklist over full SOP) |

Matches the task's Example 1 exactly, using **only existing signals** plus the new composition step.

### 5.2 Anti-keyword-only rule (concrete)

Activation fires only when **at least two independent signals agree**:

1. `IntentCategory` (build/decide/plan/execute/organize/learn) **or** `EstateCapabilityCategory` (business/create/momentum/…), **and**
2. A topic trigger/vocabulary match against the target Chamber profile's `Invite when` / `Signals` list (§0 of each profile).

A bare keyword hit with no intent/capability agreement should **not** activate an expert — it should fall through to normal conversation. This directly implements the task's “not activated based only on keywords” rule using data already computed today.

---

## 6. File locations involved

### Read-only inputs (no changes needed)

| Purpose | File |
|---------|------|
| Intent category | `lib/intentRoutingIntelligence.ts` |
| Estate capability + confidence | `lib/estateBrain/routeEstateIntelligence.ts`, `lib/estateBrain/intelligenceTypes.ts`, `lib/estateBrain/capabilityRegistry.ts` |
| Journey stage | `lib/conversationSession/types.ts` (`ConversationSession.currentStage`), `lib/universalCreation/sparkEstateCreationJourney.ts` |
| Existing hint pattern to mirror | `lib/appFeatureKnowledge.ts` (`appFeatureKnowledgeHintForChat`) |
| Existing multi-expert precedent | `lib/estate/sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture.ts` |
| Prompt assembly | `lib/companionPrompt.ts`, `app/api/companion-chat/route.ts` |
| Chamber knowledge source | `docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles/*.md` |

### New (Phase 1 implementation handoff — not built here)

| Purpose | Suggested path |
|---------|-----------------|
| Canonical Chamber prefix registry (machine-readable digest of the 24 profiles' §0/§1/§5 fields) | `lib/chamberExpertise/chamberExpertRegistry.ts` |
| Composition function (intent + capability + stage → primary/supporting/possible) | `lib/chamberExpertise/resolveChamberExpertActivation.ts` |
| Hint builder (mirrors `appFeatureKnowledgeHintForChat`) | `lib/chamberExpertise/chamberExpertiseHintForChat.ts` |
| Legacy ID alias map (Phase 33 6 + Estate Brain 15 → canonical 24) | `lib/chamberExpertise/legacyExpertAliasMap.ts` |

**Nothing above touches** `app/api/companion-chat/route.ts` structurally — it only adds one more optional string to the existing hint concatenation, the same way `shariCompanionBlock` is appended today.

---

## 7. Smallest safe implementation phases

### Phase A — Registry only (no activation logic yet)
- Add `chamberExpertRegistry.ts`: 24 entries with `{ prefix, name, inviteWhenSignals[], primaryFrameworkNames[], oneSignatureQuestion, oneAdhdAdaptation }` — a **compiled digest**, sourced from the markdown profiles (kept in sync manually or via a small build script later; no runtime markdown parsing needed for v1).
- Add `legacyExpertAliasMap.ts` mapping Phase 33 + Estate Brain IDs → canonical prefixes (read-only, additive; does not remove old registries).
- **No behavior change.** Ships dark.

### Phase B — Composition function, tested in isolation
- Add `resolveChamberExpertActivation(input): { primary, supporting, possible, matchedSignals }`.
- Inputs: `intentCategory` (from `resolveIntentRouting` output, already computed), `capabilityCategory`/`expertIds` (from `EstateIntelligenceRoute`, already computed), `userText` (for topic triggers only — never sole signal).
- Unit tests using the task's three worked examples as fixtures (filing system → Systems/Knowledge Management/AI; marketing strategy → Marketing/Strategy/Client Relationships; retreat → Events/Marketing/Client Relationships).
- **Still not called from chat.**

### Phase C — Hint wiring (first live behavior change)
- Add `chamberExpertiseHintForChat(activation)` mirroring `appFeatureKnowledgeHintForChat`'s contract and tone rules (one clear digest, never a menu, never “Bringing in Systems Intelligence…”).
- Call `resolveChamberExpertActivation` once per turn where `EstateIntelligenceRoute` is already computed (inside `frictionlessActionLayer.ts`, alongside where `formatEstateIntelligenceHint` is used) and pass the resulting hint into the same `intentHint` stack.
- Feature-flag or confidence-gate the first release (e.g. only fire when the composition's `matchedSignals.length >= 2`, per §5.2).

### Phase D — Multi-expert / collaboration language
- When `supporting.length > 0`, allow the hint to include the one-line handoff pattern already proven in Phase 33 (`buildSparkEstateExpertHandoffLanguage`) — reuse that string builder, adapted to canonical prefixes, instead of writing a new one.

### Phase E — Deprecate duplicate registries (separate handoff, out of scope here)
- Migrate `capabilityRegistry.expertIds` and Phase 33's 6-member list to reference canonical prefixes via the alias map.
- Only after Phase C/D are proven in review — per Observation Mode's Rule of Three.

**Each phase is independently revertible and none requires a new engine, agent, or memory store.**

---

## 8. Risks

| Risk | Mitigation |
|------|------------|
| **Keyword-only regression** — reusing capability `triggers[]` could smuggle keyword-only activation back in | Enforce the two-signal rule (§5.2) in the composition function itself, with a unit test asserting single-signal inputs return no activation |
| **Hint bloat** — stacking yet another string onto `finalSystem` | Cap the Chamber hint to ~3 lines (mirrors `appFeatureKnowledgeHintForChat`'s brevity); only include primary + first supporting, not all 24 |
| **Naming collision resurfaces** — three ID systems already disagree | Canonical-prefix registry + alias map (Phase A) before any activation logic ships |
| **Expert voice leaking through** — profile content sounding like a second persona | Hint builder must only ever emit *guidance to Shari* (“notice X, ask Y”), never first-person expert speech — enforce via profile §12 “Shari-voiced lines,” not raw §1 identity text |
| **Working Memory promises unmet** — profiles declare WM needs Spec 112/117 can't yet store | Document explicitly (as this doc does) that WM stays best-effort via `ConversationSession` until Spec 112/117 gets its own handoff; do not block this work on that |
| **Chamber becomes a Q&A room again** — task's core complaint | Do not build any new chat surface, room, or "ask an expert" entry point; activation must always originate from the Universal Reasoning Journey signals, never a Chamber-initiated chat |
| **Scope creep into Business Build / Create** | Keep the composition function's output (`primary/supporting/possible`) as the only cross-boundary artifact; Business Build and Create consume it the same way chat does — no separate Chamber-to-Create pipe |

---

## 9. Acceptance test walkthrough (from the task)

> Enter from Chat / Create / Chamber / Board → "I need help creating a client onboarding process." → one conversation with Shari.

| Entry point | What's already shared | What this architecture adds |
|--------------|------------------------|------------------------------|
| **Chat** | Full pipeline in §1.1 | Chamber Expertise Hint added to `intentHint` |
| **Create** | `formatCreateBuilderChatHint` (`lib/createBuilderChat.ts`) already injects a hint into the same chat | Same composition function can feed Create's hint too (Phase D+, optional) — not required for the acceptance test to pass, since Create's chat already flows through `/api/companion-chat` |
| **Chamber** (Boardroom / round-table place) | Same companion chat endpoint — Estate places do not fork the conversation engine (Room Independence Rule, Spec 108) | Nothing additional required — expertise activation is place-agnostic by design |
| **Board** | Same companion chat endpoint | Same as above |

For this message: `IntentCategory: build`, capability category likely `business`, topic triggers → **Client Relationships** primary (per this PR's CR profile — onboarding is core), **Systems** supporting (process design). The user never sees a handoff — only Shari, using Client Relationships' Expectation Snapshot framework and Systems' Trigger–Path–Done framing in one voice.

---

## 10. Overlap analysis — duplication risks before implementation

| Existing concept | Relationship to Chamber Expert Activation | Duplication risk | Verdict |
|-------------------|--------------------------------------------|-------------------|---------|
| **Spark Experience Library** (Member Journey Library, Spec 103 patterns, `docs/visual-spark-studios/MEMBER_INDEX.md` context) | Validates *experience quality* (cognitive load, hospitality); does not select experts | None — different layer (validation vs activation) | **No overlap** — keep separate |
| **Knowledge Fingers** (uploaded specs; role absorbed into Chamber profiles per `BUSINESS_BUILD_ROLE_DEFINITION.md` §7) | The 24 Expert Intelligence Profiles **already are** the Finger-equivalent reasoning-pattern layer for their domains | **High risk** if a separate "Finger runtime" is later built alongside Chamber profiles — would create two knowledge-payload systems for the same job | **Resolve now:** treat Chamber Expert Intelligence Profiles as the canonical reasoning-pattern layer; do not additionally implement generic Knowledge Fingers as a parallel system |
| **Business Build journey** (`docs/estate/BUSINESS_BUILD_ROLE_DEFINITION.md`) | Business Build is a **journey role** (business-structure requests); Chamber Expert Activation is the **expertise-selection mechanism** that role would use | Low — Business Build already documents "Fingers supply how Spark thinks" and defers to the same Finger/Chamber layer | **Compatible by design** — Business Build's Finger table (§7 of that doc) should be updated to point at Chamber prefixes once this architecture ships, not duplicated |
| **Create Build Types** (`lib/universalCreation/`, Build Type Catalog) | Build Types are **artifact structures** (Offer, SOP, Marketing Plan); they consume expertise, they don't provide it | None if Build Types stay consumers — risk only if a Build Type re-implements its own "expert questions" instead of pulling from the shared registry | **Guard:** when Build Type question banks are deepened later, source signature questions from the matching Chamber profile (§5) rather than authoring new ones per Build Type |
| **Estate Brain `expertRegistry` (15 experts)** | Older, topic-only expert list | **Real duplication today** | Superseded by canonical 24 via alias map (Phase A/E) — not deleted immediately, but no longer extended |
| **Phase 33 (6 experts)** | Older, keyword-only "team" activation | **Real duplication today** | Same treatment — alias map now, migrate later |

**Single clearest rule to prevent future duplication:** *Chamber Expert Intelligence Profiles are the one place expert reasoning content lives.* Knowledge Fingers, Estate Brain's `expertRegistry`, and Phase 33's expert list should all be **routing/legacy-compatibility layers that resolve to canonical Chamber prefixes** — not independent content sources.

---

## 11. Explicit non-goals (unchanged from prior handoff)

- No Chamber card / UI redesign
- No new rooms
- No separate agents, models, or chat systems
- No duplicate memory system
- No replacement of the existing Chamber runtime (Phase 33 / Estate Brain keep functioning during migration)
- No Knowledge Finger runtime built in parallel to Chamber profiles

---

## 12. Recommended next step

Approve **Phase A + B only** (registry + composition function, unit-tested, not called from chat) as the first implementation handoff. Phase C (first live hint) should be a separate, reviewed change once Phase A/B are merged — consistent with Observation Mode's Rule of Three and this repo's "Wire before Build" pattern.

# Conversation Runtime Routing Audit

**Branch:** `deploy/companion-app-v3` · **HEAD:** `8c9bdecc`
**Scope:** inspection only. No product behavior was changed. One temporary probe test was created and **removed** after collecting evidence (see §G). Evidence below is from direct code reads plus the probe's deterministic classifier output.

> **Headline finding.** There is **no single routing owner** for a turn. Create can be opened by **five independent deterministic paths plus the model**, and only **one** of them (the creation-workspace pipeline) consults the exploratory-intent guard added in `8c9bdecc`. The estate **goal arbitration** path (`classifyConversationGoal → shouldEnterUniversalCreation`) opened Create for example #3 and bypasses that guard entirely. Examples #1 and #2 open Create even though **every deterministic classifier returns "no open"** — i.e., the live open is produced by the model or an integration layer the unit tests do not exercise. Duplicate "Taking you to Create." comes from two un-deduplicated post sites for a single navigation decision.

---

## A. End-to-end turn flow (observed order)

```
user message
  → normalizeRequest (understandRequest) / trims
  → [several INDEPENDENT classifiers run, not one owner]:
      • messageClassification.isExplicitCreationRequest / shouldAutoOpenWorkspaceBeforeChat
      • conversationStabilization.arbitration → classifyConversationGoal → goal
                 → selectWinningCapability → pipeline.winningCapability
      • universalRequestOutcome.understandUniversalRequest → runRequestIntoCreationWorkspace
      • frictionlessActionLayer → FrictionlessActionDecision (immediateCreateOpen / localReply / navigate)
      • companionConversationContext.resolveCompanionTurn → pending/object navigation
  → CompanionPageClient.handleSend consumes the FIRST path that "wins"
      • if immediate* open / navigate → post localReply + run navigation (posts navigationLine) → EARLY RETURN
      • else → POST /api/companion-chat (model) → finalizeMemberFacingAssistantText
                 → certifyCompanionDelivery (grounded-ack → topic-continuity → CQRI → CIE/HCV)
                 → applyShariVoiceLayer → answer-first repair (localFallbackMayReplace)
  → setMessages (client optimistic) + server reconciliation
  → rendered conversation entries
```

The problem: the "[several independent classifiers]" block has **no arbiter that all Create-openers share**. Each can independently cause navigation and each can independently post text.

---

## B. Routing ownership table

| File / function | Purpose | Navigates? | Emits text? | Replaces text? | In prod? | Tested = prod path? |
|---|---|---|---|---|---|---|
| `lib/messageClassification.ts` · `isExplicitCreationRequest` | explicit create request | indirect (via autoOpen) | no | no | yes | unit only |
| `lib/messageClassification.ts` · `shouldAutoOpenWorkspaceBeforeChat` | auto-open decision | yes | no | no | yes | unit only |
| `lib/conversationStabilization/goalClassifier.ts` · `classifyConversationGoal` | arbitration goal incl. `"create"` | yes (via capability) | no | no | yes | unit only |
| `lib/conversationStabilization/selectWinningCapability.ts` | goal → `winningCapability` | yes | no | no | yes | unit only |
| `lib/universalCreation/orchestrator.ts` · `shouldEnterUniversalCreation` | UC entry / doc-type detect | yes (via goal) | no | no | yes | unit only |
| `lib/universalCreation/createFastPath.ts` · `isSimpleCreateRequest` | fast create detect | yes (via goal) | no | no | yes | unit only |
| `lib/artifactRegistry` · `isRegistryArtifactExecution` | artifact execution detect | yes (via goal) | no | no | yes | unit only |
| `lib/createExperience/createExperienceRouting` · `isProjectCreationIntent` | project intent | yes (via goal) | no | no | yes | unit only |
| `lib/universalRequestOutcome/understandRequest.ts` · `understandUniversalRequest` | compositional intent (**holds 8c9bdecc guard**) | yes (via workspace) | no | no | yes | unit only |
| `lib/creationWorkspace/runRequestIntoCreationWorkspace.ts` · `decideCreationWorkspaceOpen` | open decision | yes | no | no | yes | unit only |
| `lib/frictionlessActionLayer.ts` | `immediateCreateOpen` / `localReply` / navigate | yes | yes | no | yes | partial |
| `lib/companionConversationContext/resolveCompanionTurn.ts` | pending/object navigation | yes | yes (`Taking you to …`) | no | yes | unit only |
| `app/companion/CompanionPageClient.tsx` · `handleSend` (~14100–14313) | consumes decisions, posts messages, runs navigation | yes | yes | yes | yes | **not unit-tested** |
| `app/companion/CompanionPageClient.tsx` · `runDirectEstateRoomNavigation` (~22466+) | arrival ack + section open | yes | yes (`navigationLine`) | no | yes | **not unit-tested** |
| `lib/estate/estateArrivalExperience.ts:111` | Create arrival greeting | no | yes (`What would you like to create together?`) | no | yes | no |
| `lib/createExperience/blockLegacyCreateWorkspaceRouting.ts` | legacy dead-end message | no | yes (`This Create room is still being prepared…`) | no | yes | no |
| `lib/certifiedConversation/certifyConversationDelivery.ts` | grounded-ack→continuity→CQRI→CIE/HCV | no | yes | **yes** (can regenerate/replace draft) | yes | partial |
| `lib/shariAnswerFirst/failSafeReply.ts` · `buildAnswerFirstFailSafeReply` | how-to/advice fail-safe (**high-stakes guard here**) | no | yes | fills absence only | yes | unit only |
| `lib/sparkConversation/coachingFallback` · `buildContextualChatFallback` | contextual fallback | no | yes | fills absence | yes | unit only |

---

## C. Create-opening map (every path + precedence)

**Independent deterministic Create-openers = 5** (plus the model):

1. **Explicit-request path** — `isExplicitCreationRequest` → `shouldAutoOpenWorkspaceBeforeChat`. (Correctly rejects "I want to create…".)
2. **Estate goal arbitration** — `classifyConversationGoal` returns `"create"` when **any** of `isProjectCreationIntent | isRegistryArtifactExecution | shouldEnterUniversalCreation | isSimpleCreateRequest` is true → `selectWinningCapability = "create"` → `executeEstateIntelligence.executeTaskCapability("create")` → navigation. **← opened example #3 (`shouldEnterUniversalCreation = true`). Does NOT consult the 8c9bdecc guard.**
3. **Creation-workspace pipeline** — `understandUniversalRequest` → `runRequestIntoCreationWorkspace` → `decideCreationWorkspaceOpen`. **← the only path holding the exploratory guard (`8c9bdecc`).**
4. **Frictionless layer** — `frictionlessActionLayer` → `immediateCreateOpen` (answer-first-suppressed at `CompanionPageClient` ~14110–14140 via `shouldBlockImmediateExperienceOpen`).
5. **Companion navigation** — `resolveCompanionTurn` pending/object navigation → `immediateEstatePlaceNavigate` (Create when a pending create-navigate offer was accepted).
6. **Model-driven (non-deterministic)** — when no deterministic path wins, the model answer + `certifyCompanionDelivery` can still yield navigation copy. **← the only explanation for examples #1 and #2** (all deterministic classifiers return "no open" — see §F).

**Precedence:** `handleSend` consumes whichever decision object is populated first; there is no shared eligibility gate, so precedence is *implementation order*, not a semantic contract. This violates architectural principle #1 (one routing owner).

---

## D. Message-source map (duplicate Create messages)

| Rendered line | Exact source |
|---|---|
| `Taking you to Create.` (copy 1) | `navigationLine` posted by `runDirectEstateRoomNavigation` arrival-ack (`CompanionPageClient` ~22533: `arrivalAck = navigationLine ?? estateCommandAckLine(command)` → `setMessages`). Set by `resolveCompanionTurn.ts:177`. |
| `Taking you to Create.` (copy 2) | `frictionlessAction.localReply` appended **separately and without dedup** at `CompanionPageClient:14305–14308`, immediately after the navigation call. `localReply` was set to the **same** string as `navigationLine` by `resolveCompanionTurn.ts:173`. |
| `Taking you to Create.` (copy 3, intermittent) | client optimistic post + server assistant message reconciliation, and/or a second navigation trigger when more than one open-path fires in the same turn. |
| `What would you like to create together?` | `lib/estate/estateArrivalExperience.ts:111` — Create-room arrival greeting fired on arrival. |
| `This Create room is still being prepared…` | `lib/createExperience/blockLegacyCreateWorkspaceRouting.ts:7` — legacy dead-end because the Create room is not yet available. |

**Why 3×:** the arrival-ack post at ~22538 **does** dedup (`prev.some(m => m.content === arrivalAck) ? prev : …`), but the `localReply` post at **14305 does not**, so it slips past the guard. A single navigation decision therefore produces ≥2 identical acknowledgements, and a second open-path (or server echo) adds a third. This violates principles #2 and #3 (navigate once / one acknowledgement).

---

## E. Fallback map

| Fallback generator | Trigger | High-stakes guard? | Topic continuity? | Chamber-aware? | Preserves substantive answer? | Natural voice? |
|---|---|---|---|---|---|---|
| `buildAnswerFirstFailSafeReply` (`failSafeReply.ts`) | model answer absent + answer-first intent | **yes** (shared boundary, `48e673db`) | n/a | no | yes (`localFallbackMayReplace`) | via voice layer |
| `buildContextualChatFallback` (`sparkConversation/coachingFallback`) | reached after knowledge/estate/answer-first return null | **no** | no | no | fills absence | partial |
| `certifyConversationDelivery` reflective fallbacks (`buildNaturalTopicReturn`, grounded-ack, CQRI) | draft fails a validator | no | yes | **can overwrite Chamber draft** | not always | yes |
| `topicPreservingFallbackLine` (`activeTopicGate`) | generic-fallback would fire under active topic | no | yes | no | n/a | partial |

**Gap:** `buildContextualChatFallback` and the reflective certification fallbacks do **not** consult the high-stakes guard (principle #8) and can **replace** a Chamber/expert draft (principle #7).

---

## F. Live-test traces

Deterministic classifier outputs captured via the probe (all context-free, matching what unit tests exercise):

| # | Input | goal | explicit | autoOpen | uc(`shouldEnterUC`) | simple | workspace.open | understand.primaryIntent | **Diverges at** |
|---|---|---|---|---|---|---|---|---|---|
| 1 | "What kinds of things could I create that would help ADHD entrepreneurs?" | general_conversation | false | false | false | false | false | unknown | **No deterministic open → live open is model/integration-driven** |
| 2 | "I create handmade journals. How could I market them better?" | general_conversation | false | false | false | false | false | unknown | **No deterministic open → model/integration-driven** |
| 3 | "What would it take to create an advisory board for my company?" | **create** | false | false | **true** | false | false | unknown | **goalClassifier → `shouldEnterUniversalCreation` (bypasses 8c9bdecc)** |
| 4 | "Create a marketing plan for my ADHD business." | create | — | — | — | — | true | create | correct (opens) |
| 5 | "I have an idea for an AI service… not sure if worth pursuing…" | (help/plan) | false | false | false | — | false | — | **generic step list = model output (no strong Chamber/strategy framing); no hardcoded "Here are some steps" string exists in repo** |
| 6 | "What's the difference between Canva and Adobe Express?" | help_how_to | false | false | false | — | false | — | comparison answered; **closing question appended by advice/comparison fallback or model** |
| 7 | "A prospective employee asked for a four-day work week…" | help_how_to | false | false | false | — | false | — | **generic 7-step list = model/how-to fallback, not Chamber** |
| 8 | "What's the difference between an LLC and an S-corp?" | help_how_to | false | false | false | — | false | — | overconfident legal/tax — **high-stakes honesty not enforced on the model answer path (only on the local fail-safe)** |

**Key divergence:** the unit-tested classifiers say #1/#2 stay conversational, but the **live** UI opened Create. This means the deployed path and the tested path are **not the same** for these inputs — the open originates downstream of the deterministic classifiers (model response or an integration layer in `CompanionPageClient`/`frictionlessActionLayer` reached with live session/workspace context the unit tests do not set).

---

## G. Test-to-production gap

- **Unit tests exercise isolated predicates** (`classifyConversationGoal`, `understandUniversalRequest`, `runRequestIntoCreationWorkspace`, `isExplicitCreationRequest`). They pass because those predicates are individually correct for #1/#2.
- **The live integration path is `CompanionPageClient.handleSend`**, which is **not unit-tested**, consumes multiple decision objects, reaches the model, and posts/navigates. No test drives this composed path end-to-end.
- Therefore green unit suites can coexist with broken live behavior (exactly what's happening). Principle #10 (prod and tests use the same decision path) is **violated**.
- Instrumentation added during this audit: one probe test (`lib/conversationStabilization/__probe_goal.test.ts`), **already deleted**. No behavior changed.

---

## H. Recommended repair sequence (smallest ordered set)

**Repair 1 — Introduce ONE shared Create-eligibility predicate and make every deterministic open-path consult it. (FIRST — foundational.)**
- Why first: it is the single boundary that fixes #3 deterministically and prevents future per-path drift. The `8c9bdecc` guard currently lives only in `understandUniversalRequest`; the goal-arbitration path (`shouldEnterUniversalCreation`/`isSimpleCreateRequest`/`detectUniversalDocumentType`) never sees it.
- Likely files: new `lib/createIntent/creationExecutionEligibility.ts` (exports `isCreationExecutionRequest`/`isExploratoryCreation`, reusing the existing exploratory predicate from `understandRequest.ts`); consumed by `goalClassifier.classifyConversationGoal` (gate the `return "create"` block) and by `understandUniversalRequest` (replace its inline gate). Trusted UI/research handoffs stay exempt via provenance flag.
- Tests: the 15 routing cases from the prior spec, driven through `classifyConversationGoal` **and** `runRequestIntoCreationWorkspace`, plus a test asserting capability arbitration cannot return `"create"` for exploratory input.
- Risk: medium — `shouldEnterUniversalCreation` feeds several flows; gate must be additive (only *subtract* exploratory opens), never change execution opens.

**Repair 2 — Single navigation acknowledgement. (SECOND.)**
- Why: independent of intent; removes the visible ×3 duplication once #1/#3 stop over-opening.
- Likely files: `CompanionPageClient` ~14299–14308 — stop posting `localReply` separately when `navigationLine` already posts the same acknowledgement (or route both through the same dedup used at ~22538). Pick one canonical line.
- Tests: a render/integration test asserting one navigation → exactly one acknowledgement; no repeated string.
- Risk: low.

**Repair 3 — Investigate the #1/#2 live open path (model/integration). (THIRD — needs live trace.)**
- Why: unit classifiers are already correct; the open must be added downstream. Requires an integration trace of `handleSend` with live session/workspace state (or the model's navigation directive) — not a phrase patch.
- Risk: unknown until traced; do not guess-patch.

**Deliberately wait:** fallback *style* (#5 generic step list, #6 closing question, #7 Chamber depth, #8 high-stakes-on-model-path). These are answer-quality/model-framing issues, not Create-routing, and the user directed that fallbacks/Chamber/answer-style wait. #8 specifically wants the high-stakes guard enforced on the **model** answer path (currently only on the local fail-safe) — a separate bounded change.

---

## Principle scorecard

| # | Principle | Status |
|---|---|---|
| 1 | One turn, one routing owner | **Violated** — ≥5 independent openers |
| 2 | Navigation happens once | **Violated** — multiple open-paths per turn |
| 3 | One navigation → one acknowledgement | **Violated** — localReply + navigationLine both post |
| 4 | Exploratory language stays conversational | **Partial** — held only in workspace pipeline; goal path bypasses |
| 5 | Explicit execution can open Create | Holds |
| 6 | Substantive answer not replaced by fallback | Holds for local fail-safe (`localFallbackMayReplace`); **at risk** in certification chain |
| 7 | Chamber expertise not flattened | **At risk** — CIE/HCV can overwrite expert drafts |
| 8 | High-stakes enforced before fallback style | **Partial** — only in `buildAnswerFirstFailSafeReply`, not the model path or `buildContextualChatFallback` |
| 9 | Closing questions optional | **Violated** in advice/comparison fallback + model |
| 10 | Prod and tests share the decision path | **Violated** — live open for #1/#2 is untested integration/model |

# Universal Work Recognition — Architecture Analysis (Chamber + Chat)

**Status:** Analysis only — no code written. Per founder instruction: "Do not
code until the architecture recommendation is reviewed."
**Trigger:** Loom example — a plain how-to request answered as a generic
instructional list instead of being recognized as a Develop/Process request.
**Relationship to prior work:** This is Build Order Step 2 ("the shared Work
Recognition layer") from `UNIVERSAL_REASONING_JOURNEY_DESIGN.md`, now
evidence-grounded against actual code instead of the earlier design-level
sketch.
**Method:** every claim below is a direct code citation (file:line), verified
by tracing the exact call chain for the test message *"I need to know how to
record a Loom video and upload it to YouTube"* through the live pipeline.
Nothing here is inferred without a citation.

---

## 1. Where recognition currently happens

Not one brain today — **four separate, independently-gated recognizers**,
three narrow and keyword-bound, one genuinely reasoning-first but walled off:

| # | Recognizer | Shape | Reachable from |
|---|---|---|---|
| 1 | `classifyConversationGoal` (`lib/conversationStabilization/goalClassifier.ts:128`) | Verb/regex goal categories: `create`, `plan_strategy`, `research`, `retrieve`, `decision_support`, `help_how_to`, `capture`, `explicit_navigation`, `general_conversation`. **No `develop`, `build`, or `improve` category exists at all.** `plan_strategy` only fires on a narrow literal regex (`marketing strategy\|business plan\|roadmap\|quarterly plan\|action plan\|prioriti[sz]e my`) or `isMomentumForwardIntent`. | Every chat message, via `handleSend` |
| 2 | `discoveryMode.ts`'s `shouldEnterDiscoveryMode` (`lib/estateBrain/discoveryMode.ts:74-83`) | 4-topic gate: `create_sop` (requires literal "sop"), `focus`, `business_growth`, `research`. Returns `false` if `detectDiscoveryTopic` finds none. | Every chat message, via `tryDiscoveryFlow` |
| 3 | `capabilityRegistry.ts` via `routeEstateIntelligence.ts` | 36+ capabilities, each keyword-triggered (e.g. `"create.general": ["write","draft","create","build","make","design"]`). Reached only if goal-classification already decided estate intelligence is needed. | Chat, gated behind #1 |
| 4 | `entranceUnderstanding.ts` (`lib/createEstate/entranceUnderstanding.ts`) — **the actual reasoning-first "understand before classify" conversation**, built for Create's own entrance (Phase 1 / Create Journey Integration) | Genuine multi-turn understanding: what → why → who → current situation → constraints, with acknowledgments and a missing-information note | **Only** `components/companion/CreateEstateEntrancePanel.tsx`. One consumption call in the whole 28k-line `CompanionPageClient.tsx`, at line 12605, inside the Create workspace-open function — never inside `handleSend`. |

**The one recognizer built to the founder's spec (#4) is structurally
invisible to chat and Chamber.** Everything chat and Chamber can actually
reach (#1–#3) is pattern-matching against literal words, not reasoning about
intent.

---

## 2. Where Chamber bypasses it

**Chamber has no separate bypass of its own — it inherits chat's exactly,
because it is chat.**

- `inviteChamberMemberCore` (`CompanionPageClient.tsx:10299-10343`) sets
  `activeChamberMemberIdRef.current` and pushes activation messages into the
  **same** `messages` state array `<SimpleChat messages={messages}>` renders.
- A subsequent chat message with a Chamber member active still runs through
  `handleSend` (`CompanionPageClient.tsx:14682`) — the identical function
  traced for plain chat. `chamberMemberChatHint` is computed
  (`CompanionPageClient.tsx:21066-21068`) and folded into the same
  `mergeGovernorHints([...])` array (lines 21190-21430) that produces the
  final system-prompt hints — **one entry among roughly sixty**, alongside
  every other signal.
- There is no separate Chamber submit function, API route, or recognition
  pipeline. The active persona changes **voice**, not **whether recognition
  happens**.

So: Chamber's gap is not a distinct architectural hole to patch — it is
chat's gap, inherited automatically. Fixing chat's fallthrough fixes Chamber
for free, and — just as automatically — a fix that lives inside Chamber's
own code would NOT fix chat, and would be the first step toward the "three
brains" the founder is right to worry about.

---

## 3. Where Chat bypasses it

Two distinct shapes, not one:

### 3a. The "no matching keyword" fallthrough (the Loom example, and the
primary gap Acceptance Test 1 exposes)

For text with no literal trigger word — no "create/build/plan/develop/
improve", no "sop", no "marketing strategy" phrase, no `HOW_TO_OPENER_RE`
match (`lib/howToLearningIntelligence.ts:7-8`, requires "how do I / how can
I / show me how to…" — **"I need to know how to…" does not match**) — every
recognizer in §1 returns no-match. `classifyConversationGoal` falls through
to `"general_conversation"` (`goalClassifier.ts:209`).
`shouldUseEstateIntelligence` (`lib/companionIntelligence/estateGate.ts:57`)
then returns `false`, and `resolveFrictionlessActionImpl` reaches its final
`category: "none"` return
(`lib/frictionlessActionLayer.ts:4386-4394`). `handleSend` falls through to
a plain `gpt-4o-mini` completion (`app/api/companion-chat/route.ts:348`)
with a generic persona system prompt and (for this message) essentially no
topic-specific hints. The instructional list is not a designed feature — it
is what an unrouted model produces for an unrouted how-to question.

### 3b. The "create" goal's own, separate bypass of the reasoning-first
conversation

Even when a message **does** classify as `"create"` (an explicit verb
match — `goalClassifier.ts:185-193`, fed by `shouldEnterUniversalCreation`
/ `isSimpleCreateRequest` / `isProjectCreationIntent`), that goal routes
into `universalCreation`'s own orchestrator (`shouldEnterUniversalCreation`
/ `resolveImmediateCreateAction`) — a **third**, older, chat-native create
pathway, entirely separate from `entranceUnderstanding.ts`. This is not
newly discovered — the Reasoning-First Migration architecture review
already on file flagged `shouldEnterUniversalCreation` /
`resolveImmediateCreateAction` as "shared with chat routing, not
Create-only" and named the exact regression class this creates. What this
analysis adds: it confirms that even chat's *existing, working*
create-recognition does not get the understanding conversation Phase 1
built for the Create entrance. A member typing "I need a newsletter"
straight into chat (Acceptance Test 3) hits this older path, not
`entranceUnderstanding.ts` — so today it very likely still classifies-then-
opens without the five-dimension conversation, the same problem Phase 1
solved only for the Create entrance UI.

---

## 4. The smallest safe change

**Do not touch `handleSend`, `resolveFrictionlessAction`,
`runConversationRoutingPipeline`, `arbitrateConversationRouting`,
`executeEstateIntelligence`, or any existing detector's matching logic.**
That machinery is deeply cross-wired — `handleSend` alone carries roughly
two thousand lines of special-case branches — and the architecture review
already on file documents the exact regression class ("a shared function's
behavior changing for a caller that wasn't the intended target") this
session hit once already during ADR-013 work. Reopening any of those shared
gates is the highest-risk move available and is not required for what the
founder is asking.

### The insertion point

One new, narrow, additive check, inserted **only at the point every
existing recognizer has already failed** — the exact fallthrough traced in
§3a: `lib/frictionlessActionLayer.ts:4386`, immediately before the
`category: "none"` return. This is deliberately a **last-chance gate, not a
replacement**: it only ever fires when nothing upstream matched, so it
cannot regress a single currently-working route. Existing "create",
"research", "plan_strategy", etc. classifications are entirely undisturbed.

### What the new seam does

Broadens the question from "does this match one of our literal patterns" to
the founder's actual acceptance-test question: *is the member trying to
accomplish something — Create, Plan, Develop, Build, or Improve — even
without using those words?* Regex cannot answer that question (the Loom
example proves it: no keyword present). This needs one lightweight judgment
call, delivered the same way every other contextual signal already reaches
the model: as one more entry in the existing `mergeGovernorHints([...])`
hint stack (`CompanionPageClient.tsx:21190-21430`) — the identical
mechanism `chamberMemberChatHint` already uses. No new prompt-delivery
plumbing is required.

### Reuse, not a second engine — the "one brain" requirement

The five verbs and the what/why/who/existing/constraints question shape
**already exist as data**: `lib/estateBrain/discoveryRegistry.ts`'s
`create_general` topic, built for the Create entrance, is already
Build-Type-agnostic in its wording ("What are you working on — or hoping to
make happen?"). The recommendation is to extend, not duplicate:

1. Broaden `detectDiscoveryTopic` (`discoveryMode.ts:64-72`) with a new
   general "work" recognition path — not another literal-keyword regex, but
   a real judgment call (the same kind of check proposed for the seam
   itself) answering "is this work, and which of the five verbs" — backed by
   the already-authored `create_general` question set (extended in Create
   Journey Integration to five real questions).
2. Once recognized, hand off into `discoveryMode.ts`'s existing session
   machinery (`estate-discovery-session-v1`, already chat-native and
   persisted across turns) — **not** `entranceUnderstanding.ts` directly,
   which is UI-bound to the Create entrance component and holds no session
   state of its own. `discoveryMode.ts` is the chat-native sibling that
   already does exactly this shape of thing for its four existing topics;
   it is the correct convergence point, not a new one.
3. This satisfies Guardrail AT-G1 from the acceptance contract — the count
   of parallel reasoning-journey engines goes **down** toward one, never up
   — because it is the same discoveryRegistry data, the same
   session-persistence module, reached by a new caller, not a new engine.

### Why this satisfies every stated requirement without new code paths

- **Chamber "becomes intelligence inside the journey," automatically.**
  Because Chamber shares `handleSend` verbatim (§2), the new seam fires for
  Chamber messages with zero Chamber-specific code. `chamberMemberChatHint`
  already demonstrates the exact mechanism a Knowledge-Finger-shaped
  expertise hint would use later — the slot already exists.
- **Test 1** (Loom) is answered by the seam itself: recognized as
  work → Develop → the discovery-mode conversation opens instead of an
  instructional list.
- **Test 2** (filing system strategy) is the same seam, same path — no
  Chamber-member routing is invoked because none is required; the journey
  itself carries whatever expertise it needs as a hint, later.
- **Test 3** ("I need a newsletter," from chat) is **not** fixed by the new
  seam alone — §3b shows this hits the older, separate `create` goal path
  today, not `entranceUnderstanding.ts`. Converging that path onto the same
  `discoveryMode`-backed journey is real, already-anticipated work (the
  Universal Reasoning Journey Design doc already names "one journey runtime,
  not two" as a standing guardrail) — but it means touching
  `shouldEnterUniversalCreation`/`resolveImmediateCreateAction`, the exact
  higher-risk shared gate the architecture review already flagged. This
  should be a **second, separate, explicitly-approved step** — never folded
  into the first change silently.

### Build order (two steps, not one leap)

1. **The fallthrough seam** (§4 above) — zero risk to any existing route,
   closes Test 1 and Test 2, gives Chamber the behavior for free.
2. **Converge the chat-native `create` goal onto the same journey** — real
   value (closes Test 3 from chat), but touches shared routing surface and
   needs its own scoped safety check (the same `sourceExperience`-style
   discipline used for the ADR-013 fix), reviewed and approved on its own.

---

## Evidence Matrix

- **Sources Used:** direct trace of `handleSend`
  (`CompanionPageClient.tsx:14682`) for the exact test message, through
  `resolveFrictionlessAction` → `runConversationRoutingPipeline` →
  `arbitrateConversationRouting`/`classifyConversationGoal` →
  `executeEstateIntelligence` → `discoveryMode.ts` →
  `capabilityRegistry.ts` → `/api/companion-chat/route.ts`; Chamber's
  `inviteChamberMemberCore` and `chamberMemberChatHint` injection point;
  `entranceUnderstanding.ts`'s import graph (confirmed unreachable from
  `handleSend`); regex/trigger grep confirming no detector matches
  Loom/record/upload/YouTube; prior-session
  `CREATE_REASONING_FIRST_MIGRATION_ARCHITECTURE_REVIEW.md` for the
  already-documented shared-gate regression class.
- **Sources Missing:** none required for this recommendation; the "converge
  the chat-native create goal" step (build order #2) will need its own
  fresh trace of `universalCreation`'s orchestrator before implementation.
- **Confidence:** High — every claim above traces to a specific file:line,
  verified against the live call chain for the actual test message rather
  than inferred from module names.

**Approval Status:** Proposed — awaiting founder review before any code.
**Decision Owner:** Founder.

```
Decision:   Insert one new Work Recognition seam at the existing
            "no recognizer matched" fallthrough (lib/frictionlessActionLayer.ts:4386),
            delivered as one more entry in the existing hint stack. Reuse
            discoveryRegistry.ts's create_general data and discoveryMode.ts's
            session machinery — do not build a new engine. Chamber inherits
            for free via the shared handleSend pipeline. Converging chat's
            separate, older "create" goal path is real but explicitly a
            second, later, separately-approved step.
Reason:     Recognition today is four narrow, independently-gated
            recognizers, not one brain; the one genuinely reasoning-first
            engine (entranceUnderstanding.ts) is UI-bound to Create and
            unreachable from chat/Chamber. The fallthrough point is the
            only place that can add recognition without touching any
            currently-working route.
Date:       2026-08-06
Approved by:
Supersedes: —
Related systems: goalClassifier.ts, discoveryMode.ts, discoveryRegistry.ts,
            capabilityRegistry.ts, frictionlessActionLayer.ts, Chamber
            (inherits via handleSend), entranceUnderstanding.ts (model to
            reuse conceptually, not to call directly from chat)
Evidence used: see Evidence Matrix above
```

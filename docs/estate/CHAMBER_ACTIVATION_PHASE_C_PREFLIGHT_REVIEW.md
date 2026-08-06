# Chamber Activation Phase C Preflight Review

| Field | Value |
|-------|-------|
| **Status** | Review complete → Phase C implemented on this branch |
| **Date** | 2026-08-06 |
| **Depends on** | Phase A/B (`docs/estate/CHAMBER_EXPERT_ACTIVATION_PHASE_A_B_SUMMARY.md`, approved) |
| **Governs** | `lib/chamberExpertise/chamberExpertiseHintForChat.ts` wiring into `app/companion/CompanionPageClient.tsx` |

---

## 1. Where should Chamber expertise enter the prompt stack?

### Entry point chosen

**The existing `intentHint` array inside the `mergeGovernorHints([...])` call** in `app/companion/CompanionPageClient.tsx` (~line 14829), immediately after `intentRoutingHintForChat(turnIntentRouting)`. This is the same list that already carries `appFeatureKnowledgeHintForChat`, `sparkEstateExpertCollaborationCompanionHint` (via `shariCompanionHintForChat` on the API side), `frictionlessHintForChat`, and a dozen other optional per-turn hints. Nothing new is built — one more entry is added to an existing, proven mechanism.

### Why this point and not another

| Candidate entry point | Verdict |
|------------------------|---------|
| **`intentHint` stack (chosen)** | Runs on **every turn**, in every room (Chat, Create, Chamber, Board) — matches the acceptance test's requirement that entry point shouldn't matter. Zero new plumbing. |
| Inside `resolveFrictionlessAction` / `frictionlessActionLayer.ts` | Rejected for Phase C v1 — would require threading `IntentCategory` into a function that doesn't currently receive it, and its `EstateIntelligenceRoute.category` (`EstateCapabilityCategory`) is only computed for a subset of turns (frictionless action must resolve first). Higher coupling for no v1 benefit. |
| Inside `evaluateEstateConversationTurn` / Estate conversation pipeline | Rejected — this only runs when `frostedChatContext || welcomeHomePrimary` (see `lib/estateIntelligence/estateConversationPipeline.ts:60`), i.e. **not every room**. Wiring here would violate the acceptance test (Chamber/Board/Create should behave identically to Chat). |
| A new tool-call / function-call to the LLM | Rejected — would be a new interaction pattern, not a hint; adds latency and a second round-trip; not requested. |
| Directly inside `buildCompanionSystemPrompt` (`lib/companionPrompt.ts`) | Rejected — that function is synchronous string assembly from an already-built `PromptContext`; per-turn *computation* belongs in the caller (exactly where `intentHint` is already assembled), matching every existing hint's pattern. |

### What data is available at that point (and what Phase C v1 uses)

| Signal | Available at entry point? | Used in Phase C v1? |
|--------|---------------------------|----------------------|
| `trimmed` (user text) | Yes, always | Yes |
| `turnIntentRouting.category` (`IntentCategory` — build/decide/plan/organize/execute/learn/…) | Yes, always (computed at line 12678, before the hint stack) | Yes |
| `estateIntelligenceEval` / `EstateIntelligenceEvaluation.category` (`EstateAssetCategory`) | Only when Estate conversation pipeline ran (not universal) | **Not used in v1** — different type (`EstateAssetCategory`, not `EstateCapabilityCategory`); wiring it would require reconciling a third "category" taxonomy, which the architecture doc already flagged as a naming risk. Deferred. |
| Legacy expert IDs (`EstateIntelligenceRoute.expertIds`) | Only inside `estateBrain` routing, not surfaced at this call site today | **Not used in v1** for the same reason — `resolveChamberExpertActivation` already accepts `legacyExpertIds` as optional, so this can be added later without a breaking change. |

**Conclusion:** Phase C v1 wires `userText` + `intentCategory` only. Both are universally available on every turn, in every room, with zero additional coupling. This is intentionally the *smallest* correct wiring — richer signals (Estate category, legacy expert IDs) are additive, optional inputs the function already supports and can be threaded in later without changing its contract.

---

## 2. Confirm: enriches the Universal Reasoning Journey, does not replace it

- The hint is appended **after** `intentRoutingHintForChat(turnIntentRouting)` — i.e., after Work Recognition has already run. Chamber activation **consumes** `turnIntentRouting.category` as an input; it does not compute intent itself, does not gate whether the turn proceeds, and does not change `routeMode`, `estateConversationTurn`, or any other Work Recognition output.
- `resolveChamberExpertActivation` has no side effects, no state, no async calls, and returns `undefined` from `chamberExpertiseHintForChat` whenever confidence is anything but high/medium. On the large majority of turns (casual chat, quick answers, app navigation) it silently contributes **nothing** to the prompt — it cannot crowd out or override any other hint.
- **Verdict: enriches. Does not replace.** The Universal Reasoning Journey's existing decision of *whether* and *how* to respond is untouched; Chamber activation only adds *which expert lens* to think with, when one clearly applies.

## 3. Confirm: does not interrupt the Shari conversation voice

- `chamberExpertiseHintForChat` output is explicitly labeled `(internal — shapes Shari's thinking, never announced)` and ends with a hard instruction: *"Speak only as Shari, one conversation, one voice."*
- It never appears in the response — it is system-prompt content, exactly like `appFeatureKnowledgeHintForChat` and `sparkEstateExpertCollaborationCompanionHint`, both of which are proven not to leak into visible replies today.
- The Companion System Prompt's existing constitutional blocks (voice, hospitality, guardrails) are unchanged and are concatenated **before** this hint in `buildCompanionSystemPrompt` — Chamber expertise is additive context, not a competing instruction set.

## 4. Confirm: no "expert joined" / "now talking to X" / handoff experience

The hint text itself contains the enforcement, quoting the exact forbidden patterns as counter-examples (mirroring the existing pattern in `sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture.ts`'s `SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_AVOID`):

> *"do not announce it, name it as a separate person, or say things like 'bringing in the Marketing expert' or 'now talking to Systems.' … The member should feel 'Spark is helping me think' — never a handoff."*

Tested directly in `chamberExpertiseHintForChat.test.ts` (`instructs Shari never to announce the expert or perform a handoff`). This is prompt-level guidance, not a runtime filter — consistent with how every other guardrail in this codebase works (Spec 106, hospitality language, etc.), and consistent with the fact that **nothing renders this hint to the member** — it never reaches the UI.

## 5. Verify activation timing

**Required order:** understand intent → recognize work type → *then* (if it clears the multi-signal bar) let expertise shape recommendations — never "keyword appears → expert appears."

This is enforced structurally, not just by convention:

1. `turnIntentRouting = resolveIntentRouting(...)` runs first (line 12678) — Work Recognition happens before the hint stack exists at all.
2. `chamberExpertiseHintForChat` is called *inside* the hint-stack array, receiving `turnIntentRouting.category` as an already-computed input — it cannot run before intent is known, because the value doesn't exist yet otherwise.
3. Inside `resolveChamberExpertActivation`, the **anti-keyword-only rule** (Phase B, unchanged) still applies: a topic/vocabulary match on the raw text is *never* sufficient alone. The user's own goal-language (intent) or estate context must independently corroborate it.

### Worked check against the task's own example

> "I want more ADHD founders to discover my ecosystem." — growth objective, audience, current situation *understood first*, marketing expertise supports *after*.

Tracing this through the current registry: `intentCategory` would resolve to something like `plan` or `build` (a growth/visibility goal); `MKT`'s activation signals include "visibility," "audience" — with intent corroboration, `MKT` would reach eligibility only because *both* the topic vocabulary *and* the already-recognized intent agree, not because the word "discover" or "ecosystem" appeared. **This is the same mechanism as "marketing" appearing in a sentence being insufficient** — a bare mention of "marketing" with no intent/estate corroboration produces `primary: null` today (see `resolveChamberExpertActivation.test.ts`'s anti-single-keyword suite).

---

## 6. Test scenarios (run before wiring, all passing)

All four scenarios were run against Phase B's `resolveChamberExpertActivation` **before** any prompt-stack wiring, using `npx vitest run lib/chamberExpertise`. Two registry refinements were made as a result (documented in Phase B's registry, not new logic):

| Scenario | Primary | Supporting (contains) | Result |
|----------|---------|--------------------------|--------|
| "I need to create a client onboarding process." | **Systems** | Client Relationships (possible: Knowledge Management) | ✅ Pass |
| "I need help figuring out why clients are not staying engaged." | **Client Relationships** | Strategy, Marketing | ✅ Pass (added retention/churn activation signals + `understand`/`decide` intent affinities to CR; reordered CR's collaboration cast to lead with Strategy/Marketing for this class of question) |
| "I want to organize my AI documentation." | **Knowledge Management** | AI & Technology, Systems | ✅ Pass (added "ai documentation" / "organize documentation" activation signals to KMG; promoted AI to KMG's primary supporting tier) |
| "I want to build a business strategy." | **Strategy** | Systems, Finance, Marketing | ✅ Pass (added `build` to Strategy's intent affinities; widened Strategy's supporting tier to 3 entries; raised the composition function's `MAX_SUPPORTING` cap from 2 to 3) |

**Note on tier labeling:** this review's scenarios describe two or three "Supporting" experts per example, while Phase B's original three worked examples sometimes split the cast into "Supporting" (1) + "Possible" (1). Both are correct outputs of the same underlying mechanism — `supporting` and `possible` are surfaced together in the Phase C hint text (`chamberExpertiseHintForChat` includes both under "Also relevant" and "Worth a mention if it fits"), so the functional outcome (which experts inform Shari's thinking) is the same regardless of which internal tier a given collaborator lands in. The tier split exists to let the hint differentiate *confidence* ("also relevant" vs. "worth a mention"), not to gatekeep which experts get surfaced.

---

## 7. Duplication check

| Existing concept | Overlap with Chamber Expert Activation? | Verdict |
|-------------------|-------------------------------------------|---------|
| **Knowledge Fingers** | Fingers = reasoning patterns (how an expert thinks). Chamber Expert Intelligence Profiles already absorb this role per `docs/estate/BUSINESS_BUILD_ROLE_DEFINITION.md` §7. Phase C does not introduce a second "how Spark thinks" system — it only decides *which* profile's thinking applies. | **No new duplication** — reaffirms the prior decision that Chamber profiles are the one reasoning-pattern layer. |
| **Spark Experience Library** (Member Journey Library, Spec 103) | Validates experience quality (cognitive load, hospitality, one-question-at-a-time). Chamber activation produces prompt content that must *pass* those validations — it doesn't replace or duplicate them. | **No overlap** — different layer (validation vs. content selection). |
| **Business Build journey** | Business Build is a journey *role* for business-structure requests (offers, CX, systems, growth). Chamber Expert Activation is the *mechanism* that role (and every other room) uses to pick expertise. Business Build's own Finger table already deferred to "Chamber prefixes" per its own doc. | **Compatible by design**, not duplicated. |
| **Create Build Types** | Build Types are artifact structures (Offer, SOP, Marketing Plan) that *consume* expertise; they don't provide it. `chamberExpertiseHintForChat` runs at the same `intentHint` layer Create's own `formatCreateBuilderChatHint` already uses — both are optional strings in the same stack, not competing systems. | **No overlap** — consumer/provider relationship preserved. |
| **Phase 33 expert team hint** (`sparkEstateExpertCollaborationCompanionHint`) | Still gated on different keywords (`expert\|team\|collaborat\|chamber\|…`) and still only activates its own 6-member list. Both hints can appear in the same `intentHint` array on a given turn — this is a **known, acceptable interim overlap** (not a new duplication introduced by this change), since Phase 33 was never removed per Phase A's "do not delete old registries" constraint. | **Pre-existing overlap, unchanged.** Flagged for Phase E (registry consolidation), not fixed here. |
| **Estate Brain `expertIds` hints** (`formatEstateIntelligenceHint`) | Same situation as above — a separate, older hint that can co-occur. Not touched by this change. | **Pre-existing overlap, unchanged.** |

**No new duplication is introduced by Phase C.** The two pre-existing overlaps (Phase 33, Estate Brain) were already identified in the Phase A/B architecture doc and are explicitly deferred to Phase E.

---

## 8. Role definition — who provides what

| Responsibility | Owner | Not owned by Chamber Expert Activation |
|-----------------|-------|------------------------------------------|
| **Interaction pattern** (one conversation, one voice, warm/practical/curious tone, ask-one-question-at-a-time) | Specs 105–111, Relationship Constitution, `COMPANION_SYSTEM_PROMPT` (`lib/companionPrompt.ts`) | Chamber activation never defines *how* Shari speaks — only *what she's thinking about* |
| **Work recognition / intent** | `lib/intentRoutingIntelligence.ts` (`resolveIntentRouting`), primary-turn classifier | Chamber activation *consumes* this; does not compute or override it |
| **Journey structure** (Understand → Discover → Define → Build → Review → Improve → Complete → Remember) | `lib/universalCreation/` (Universal Creation Journey), conversation state (Specs 107/114) | Chamber activation does not gate journey stage transitions; `journeyStage` is accepted as an optional future input but unused in v1 |
| **Domain expertise / reasoning** | **Chamber Expert Intelligence Profiles** (`docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles/`), surfaced via `lib/chamberExpertise/` | This is the one thing Chamber Expert Activation *does* own — deciding which profile's expertise is relevant this turn |
| **Output / artifact building** | `lib/universalCreation/` (Guided Creation Engine / Build Types), Create Studio | Chamber activation informs *what to notice while building*; it does not assemble documents, sections, or drafts |
| **Business-structure journey selection** | Business Build role (`docs/estate/BUSINESS_BUILD_ROLE_DEFINITION.md`) | A sibling consumer of the same Chamber registry — not redefined here |

**One-sentence summary:** *Chamber Expert Activation answers exactly one question — "which expert lens, if any, would help Shari think through this?" — and answers nothing else.* Everything about how the conversation flows, what stage it's in, and what gets built remains owned by the systems that already owned it.

---

## 9. Decision

**Approved to proceed to Phase C** on the basis of:

- Entry point identified and justified (§1)
- Enrich-not-replace and voice-continuity confirmed structurally, not just by convention (§2–3)
- No-handoff language enforced in the hint itself and unit-tested (§4)
- Activation timing verified against the task's own worked example (§5)
- All four preflight test scenarios pass against Phase B's composition function, with registry refinements documented as data changes, not logic changes (§6)
- No new duplication introduced; two pre-existing overlaps explicitly deferred to Phase E (§7)
- Role boundaries defined and cross-checked against every adjacent system (§8)

Implementation: one new file (`lib/chamberExpertise/chamberExpertiseHintForChat.ts`) plus a single-line addition to the existing `intentHint` array in `CompanionPageClient.tsx`. No other runtime file is modified.

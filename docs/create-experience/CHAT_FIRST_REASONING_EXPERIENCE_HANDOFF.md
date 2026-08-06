# Chat-First Reasoning Experience — Development Handoff

**Status:** Approved — Phase 1 implementation authorized (Founder,
2026-08-06): production Create reasoning-first migration only. Acceptance
contract: `UNIVERSAL_REASONING_JOURNEY_ACCEPTANCE_TESTS.md` (converts
AT-1.x, AT-2.x, AT-B6/B8 toward SATISFIED). Scope explicitly excludes
Projects, Chamber, Board, and Business Build (definition pending).
**Supersedes:** `133_CREATE_DISCOVERY_EXPERIENCE_REDESIGN.md` — the "Show Me
Categories" section only. Everything else in 133 (one search, one discovery
experience, no parallel interfaces) remains in force.
**Resolves:** the pending founder decision in
`CREATE_REASONING_FIRST_MIGRATION_ARCHITECTURE_REVIEW.md` §10 — mechanism 1
(reconnect existing discovery reasoning), scoped to the Create surface.

---

## Purpose and scope

Establish Spark's universal guided thinking pattern, with Create as its first
implementation:

> Before any artifact creation: understand intent → understand desired outcome
> → understand context → identify the appropriate Build Journey → confirm
> direction. The member experiences one continuous conversation with Shari.

Create is implementation #1. The pattern is designed to extend later to
Projects, Strategy, Business Build, and other areas — by adding question sets
and entry points, not new engines.

## Founder decision record

```
Decision:   Chat-first Reasoning Experience for Spark Create. Understanding
            conversation runs BEFORE Build Type classification. No categories
            first, no templates first, no sections first, no internal stages
            exposed. Build Journeys are hidden reasoning maps; Knowledge
            Fingers are expertise; Spark Experience files are behavior rules;
            Estate Working Memory carries continuity. Explicit creation
            confirmation (130), existing Working Memory architecture, research
            capability, and registries are preserved. No new engine —
            reconnect existing reasoning capabilities.
Reason:     The vision is already mandated by Constitution 131 and half-built
            (discoveryMode.ts); reconnection is the safe path identified by
            the Reasoning-First architecture review.
Date:       2026-08-06
Approved by: Shari Hudson (Founder)
Supersedes: 133 "Show Me Categories" section
Related systems: discoveryMode / discoveryRegistry, resolveCreateBeginOutcome,
            createIntentConfirmation (131), currentFocus + sopDiscoveryFocus
            (Phase 2 gate), creationRecord Working Memory, ADR-013 boundary
Evidence used: CREATE_REASONING_FIRST_MIGRATION_ARCHITECTURE_REVIEW.md,
            repo sweep 2026-08-06
```

## Current verified behavior (before this change)

- Create entrance (`CreateEstateEntrancePanel`): typed text → immediate
  classification (`resolveCreateBeginOutcome`) → confirm → open. Understanding
  happens *after* the Build Type is locked (SOP-only, via the Phase 2
  discovery gate inside Current Focus).
- "Start With Guidance" / Help Me Choose exposes the category browser
  (`CreateBrowseCategoriesPanel`) — a second, unreasoned path around
  classification (`resolveCatalogCreateConfirm`, hardcoded high confidence).
- The understanding conversation engine exists (`lib/estateBrain/
  discoveryMode.ts` + `discoveryRegistry.ts`) but is fenced off from Create by
  guard clauses shared with chat routing.

## Approved change

1. **Pre-classification understanding conversation at the Create entrance.**
   Typed intent starts a brief conversation (one question at a time, Shari
   voice): desired outcome, then audience/context. SOP-shaped requests use the
   already-authored `create_sop` question set — same question ids — so the
   Phase 2 in-focus gate finds them answered and never re-asks (273/278: never
   ask the same question twice).
2. **Classification on the enriched conversation** (original wording +
   answers), then the existing 130 confirm gate. The member's original wording
   — not the enriched blob — remains the creation identity (`originalRequest`,
   titles).
3. **Answers persist into continuity**: through the existing
   `applyDiscoveryAnswerToRuntimeCreationRecord` channel into
   `RuntimeCreationRecord.discoveryAnswers` + mapped Working Memory fields
   (`desiredResult`, `intendedAudience`, SOP fields), at the workflow seed
   site (`startFreshCreateFromEstate`).
4. **Entry-path convergence**: Help Me Choose starts the same conversation
   (goal question first) instead of exposing categories. The category browser
   remains reachable as a quiet in-conversation fallback — never shown first.

## Non-goals (this phase)

- No changes to chat routing: `shouldEnterDiscoveryMode`,
  `shouldEnterUniversalCreation`, `resolveImmediateCreateAction`, and
  `estateCoaching` guards are untouched. Chat behavior is provably unchanged.
- No new conversation engine, registry, taxonomy, or memory system.
- No coaching handoff when classification still can't resolve (existing
  clarify message stands) — future phase.
- No Implementation / Improvement journey stages (V2).
- No removal of `CreateBrowseCategoriesPanel` — demoted, not deleted.
- No extension yet to Projects / Strategy / Business Build — the module is
  deliberately shaped so those become question-set additions.

## Implementation map

| Piece | Home | Nature |
|---|---|---|
| `create_general` topic + universal questions | `lib/estateBrain/discoveryTypes.ts`, `discoveryRegistry.ts` | additive data |
| Entrance understanding sequencing | `lib/createEstate/entranceUnderstanding.ts` (new) | same pattern as `sopDiscoveryFocus.ts` — pure data reuse, sequential, no chat imports |
| Discovery→Working Memory field map extension | `lib/currentFocus/sopDiscoveryFocus.ts` | additive map entries (`create-outcome`→`desiredResult`, `create-audience`→`intendedAudience`) |
| Eligibility-aware `nextHelpfulStep` | `lib/currentFocus/creationRecord.ts` | fix: SOP-remaining wording only for SOP records |
| Conversation UI + convergence | `components/companion/CreateEstateEntrancePanel.tsx` | understanding feedback kind; composer doubles as answer input; Escape cancels layer before navigating (132) |
| Answers handoff | `lib/createEstate/entranceUnderstanding.ts` (armed session, `forceNewCreateSession` pattern) + consumption in `CompanionPageClient.startFreshCreateFromEstate` | additive |

## Acceptance tests

1. "I need a newsletter" → Spark asks the outcome question (no category, no
   template, no confirm yet) → answer → audience question → answer → confirm
   ("It looks like you'd like to create a Newsletter") → Yes → workspace
   opens; Working Memory holds `desiredResult` and `intendedAudience`;
   `originalRequest` is exactly "I need a newsletter".
2. "help me create an SOP for onboarding clients" → SOP questions asked at the
   entrance (same ids as the Phase 2 gate) → after open, Current Focus goes
   straight to sections — the member is never asked twice.
3. Highly specific request whose signals already answer the questions → no
   understanding questions; straight to confirm (sufficient context skip).
4. Skip: member can skip any question; skipped ids recorded; flow continues.
5. Escape during the conversation cancels the conversation layer, not the
   room (132).
6. Help Me Choose → conversation opens with the goal question; categories are
   not rendered until the member explicitly asks for examples.
7. Chat regression guard: all existing `discoveryMode` / routing tests pass
   unmodified.
8. 130 guard: no path — including a fully-answered understanding conversation
   — creates Work without the explicit confirm.

## Regression risks

- Entrance certification tests that assert typed-submit → immediate confirm
  will need updating to expect the understanding step (approved behavior
  change; cite this doc).
- `applyDiscoveryAnswerToRuntimeCreationRecord` previously ran only for SOP
  records; it now also runs for entrance answers on any type — the
  `nextHelpfulStep` recompute must not claim "Continue understanding your
  SOP" for non-SOP records (fixed in this change, covered by test).
- Guided domains (Event / Marketing / Business Plan / Facebook Community)
  mint their own identities; handoff consumption is a safe no-op when no
  runtime record exists under the workspace id.

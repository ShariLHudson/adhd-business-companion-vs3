# Work Identity Implementation Plan

| Field | Value |
|-------|-------|
| **Status** | **Plan only. No code changes in this document or this delivery.** |
| **Date** | 2026-08-07 |
| **Purpose** | Sequence the approved design work into an implementation plan, using the same phased, flag-gated, validate-before-default-flip discipline already proven in this codebase for Chamber Activation V2 and the Work State Priority Model. |
| **Approved designs this plan implements** | `WORK_IDENTITY_MODEL.md` (the `workId` concept) · `WORK_IDENTITY_TRANSITION_RULES.md` (the five verbs) · `COMMITMENT_RECOGNITION_DESIGN_REVIEW.md`, whose §7 (`resolveCommitmentGate`'s signature) is this plan's **Recognition Layer Contract** and whose §10 (twelve scenarios) is this plan's **Recognition Acceptance Tests** — named that way in the request; this plan cites them by section rather than assuming separate files exist, since neither was written as a standalone document. |
| **Explicitly not authorized by this document** | Any code change. This is a sequencing and risk plan, to be reviewed before slice 1 begins. |

---

## 1. Smallest safe implementation slice

The single guiding constraint from every design document in this series is **do not create duplicate systems** and **founder controls commitment** — which together imply the safest possible first slice is one that changes **zero runtime behavior** while making the rest of the plan possible to build and test in isolation.

### Slice 0 — inert foundation (types + pure functions, wired into nothing)

| Add | Where | Behavior change |
|-----|-------|---------------------|
| Optional `workId?: string` field | `UniversalCreationSession` (`lib/universalCreation/types.ts`), `SessionArtifact` (`lib/conversationSession/types.ts`) | **None.** Optional field, unread by any existing code path. |
| `"possibility"` value added to `SessionArtifactStatus` | `lib/conversationSession/types.ts` | **None.** A new enum member existing code never produces or switches on. |
| `resolveCommitmentGate()` — the Recognition Layer Contract (`COMMITMENT_RECOGNITION_DESIGN_REVIEW.md` §7), implemented as a pure function | New file, e.g. `lib/workIdentity/resolveCommitmentGate.ts` | **None.** Not called from any live route yet — exists only to be unit-tested against the Recognition Acceptance Tests (§10 of that document) in isolation. |
| `mintWorkId()` — a trivial id-generation helper | New file, e.g. `lib/workIdentity/workId.ts` | **None.** A pure function with no callers yet. |

**Why this is the correct first slice**: every subsequent slice becomes a wiring exercise — connecting an already-tested pure function to a live call site — rather than a design-and-build-and-wire exercise all at once. This mirrors exactly how `resolveSupportGate` was built and unit-tested before Work State Priority Phase 2 ever wired it into `CompanionPageClient.tsx`, and how `resolveChamberExpertActivationV2` existed and passed its own test suite before `NEXT_PUBLIC_CHAMBER_ACTIVATION_V2` ever gated a live call site. Slice 0 can be merged with no feature flag at all, because nothing reads what it produces.

### Slice 1 — wire the gate into the chat entry point only (flagged)

Connect `resolveCommitmentGate` to the one call site named across every design document as the most-cited, most-consequential gap: `isSimpleCreateRequest`/`inferDocumentTypeFromCreateText` in `lib/universalCreation/createFastPath.ts`, called from wherever `CompanionPageClient.tsx` currently decides to start Universal Creation. Behind a flag (§5). This is Scenario 1 and 3 of `WORK_IDENTITY_TRANSITION_RULES.md` — the two most common, most validated transitions — and nothing else.

### Slices 2+ — everything else, one mechanism at a time

Each subsequent slice adds exactly one of the remaining transition rules, always the same shape (a design already fully specified, wired to one call site, behind the same flag, validated before moving on):

2. Pause/resume reuse for the Support Gate PAUSE branch (`WORK_IDENTITY_TRANSITION_RULES.md` §1/§6) — using the already-built `pauseActiveArtifact`/`resumeArtifact`/`setActiveArtifact`.
3. Multiple-ideas detection reusing `splitOnConjunctions` (§7) — the one slice needing a genuinely new (if small) piece of logic, per `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §4.
4. Project-linking and completion-closing (`WORK_IDENTITY_TRANSITION_RULES.md` §4, §9) — attaching `workId` through to `SavedWorkItem` and, optionally, `Project`.
5. Create-panel entry parity (`WORK_IDENTITY_TRANSITION_RULES.md` §2) — the Create panel doorway minting or carrying forward the same `workId`, closing the "doorway determines destiny" gap for good.
6. Multi-day resume surfacing via `companionLedContinue.ts` (`SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §3) — the lowest-urgency slice, since it's additive discovery of dormant work rather than a correctness fix to a live path.

**This plan does not authorize building past Slice 0 in one sitting** — each slice above should get its own founder-language validation round before the next begins, the exact discipline already used for Chamber Activation V2 and the Work State Priority Model (`SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §9 recommended the identical sequencing for this same body of work).

---

## 2. Existing files/systems involved

| File / system | Role in this plan |
|----------------|------------------------|
| `lib/universalCreation/types.ts` | `UniversalCreationSession` gains `workId?` (Slice 0) |
| `lib/universalCreation/createFastPath.ts` | `isSimpleCreateRequest`, `inferDocumentTypeFromCreateText`, `SIMPLE_CREATE_VERB_RE`, `ARTIFACT_INFERENCE` — the call site Slice 1 gates, never rewrites |
| `lib/universalCreation/orchestrator.ts` | `startUniversalCreationTurn` — where a `workId` is minted (Slice 1) or where a resumable session is checked for first (Slice 2) |
| `lib/conversationSession/types.ts` | `SessionArtifact`, `ConversationSession`, `SessionArtifactStatus` — gains `workId?` and `"possibility"` (Slice 0) |
| `lib/conversationSession/pauseResume.ts` | `pauseActiveArtifact`, `resumeArtifact`, `setActiveArtifact` — already built, already tested, reused unchanged (Slice 2) |
| `lib/conversationSession/adapters/universalCreationAdapter.ts` | The dual-write mirror — must be updated to **attach**, never mint, `workId` (Slice 1) |
| `lib/workStatePriority/resolveSupportGate.ts` | Read, never modified — its output is a required input to `resolveCommitmentGate` (§7 of the Commitment doc) |
| `lib/companionEmotions.ts` | `detectEmotionalState`, `isGenuineConfusionSignal`, `detectObstacle` — read, never modified |
| `lib/chamberExpertise/textMatch.ts` | `splitOnConjunctions` — reused for artifact-type detection per clause (Slice 3), a new *use* of existing, unmodified logic |
| `CompanionPageClient.tsx` | The live call site where the Support Gate is already wired into the Create Fast Path condition (per the Work State Priority Model) — this plan's Slice 1/2 extend that same conditional, not a new one |
| `companion-saved-work-v1` (`SavedWorkItem` store) | Gains an optional `originatedFromId`/`originatedFromKind` pair carrying `workId` forward (Slice 4) |
| `lib/companionStore.ts` | `Project`, `projectId` linking — read and extended additively, never restructured (Slice 4) |
| `lib/companionLedContinue.ts` | Extended with a dormant-session input source (Slice 6), per `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §3's already-specified design |

---

## 3. What can be reused (nothing below needs to be rebuilt)

- `pauseActiveArtifact` / `resumeArtifact` / `setActiveArtifact` — built and tested, currently unwired for this purpose; Slice 2 is wiring, not building.
- `resolveSupportGate` — the precondition every commitment-gate decision reads first (`COMMITMENT_RECOGNITION_DESIGN_REVIEW.md` §7's precedence rule); read-only dependency.
- `isGenuineConfusionSignal`, `detectEmotionalState`, `detectObstacle` — the emotional-signal vocabulary the Commitment doc's §5/§6 hedging rules are built on.
- `splitOnConjunctions` — proven against false positives already (Chamber Activation V2), reused for a new purpose (Slice 3) rather than reimplemented.
- `SIMPLE_CREATE_VERB_RE` / `inferDocumentTypeFromCreateText` — the existing lexical detectors that remain the *first* stage of detection; this plan only adds a *second* stage (the commitment gate) after them, never replaces them.
- The `originatedFromId`/`originatedFromKind` lineage pattern — already established elsewhere in this codebase (Intelligence-Ready Architecture rule) as the mechanism `workId` rides on; no new lineage mechanism is invented.
- `companionLedContinue.ts`'s memory-cue abstraction (`conversationOption`/`memoryCueFromLastActivity`) — Slice 6 adds an input source to it, not a parallel resolver.

---

## 4. What should not be changed

- **The Conversation Commitment Engine** (`lib/conversationCommitmentEngine/`) — confirmed in `COMMITMENT_RECOGNITION_DESIGN_REVIEW.md` §0 to be a separate, correctly functioning system answering a different question (accept/decline Spark's own offer). No slice touches it.
- **`resolveSupportGate` itself** — every design in this series treats its tier as an upstream, authoritative precondition. No slice modifies its logic; all of them only add a new *consumer* of its output.
- **`SIMPLE_CREATE_VERB_RE` and `inferDocumentTypeFromCreateText`'s existing matching behavior** — these remain the detection layer. This plan gates what happens *after* a match, never changes what counts as a match. Changing the regex itself is out of scope for every slice above.
- **Chamber activation logic** (`resolveChamberExpertActivationV2` and its supporting registry) — nothing in this plan touches expert selection; `workId` is, at most, light metadata a future slice could attach to an artifact (`WORK_IDENTITY_MODEL.md` §1.9), never a dependency Chamber relies on.
- **The "no chat history database" product decision** (`loadConversation()` never called) — every slice above works around this, per `SPARK_WORK_MEMORY_MODEL.md` §4; none of them reopens it.
- **`UniversalCreationSession`, `SessionArtifact`, `SavedWorkItem`, and `Project`'s existing shapes and stores**, beyond the single additive field each gains — no slice merges, migrates, or restructures any of these four systems, per `WORK_IDENTITY_MODEL.md`'s central constraint.
- **Growth Greenhouse and the four Parking Lot systems** — `WORK_IDENTITY_MODEL.md` §6 explicitly recommended against connecting them; no slice in this plan does.

---

## 5. Feature flag strategy

Following the exact, already-proven pattern from Chamber Activation V2 (`NEXT_PUBLIC_CHAMBER_ACTIVATION_V2`, documented default-flip in `CHAMBER_ACTIVATION_V2_DEFAULT_FLIP.md`):

| Flag | Gates | Default at Slice 1 | Default flip condition |
|------|-------|--------------------|------------------------|
| `NEXT_PUBLIC_WORK_IDENTITY_V1` | Slices 1–5 (every behavior-changing wiring step) | `false` — current behavior byte-for-byte unchanged | Only after each slice's own founder-language validation round passes (§1), mirroring `CHAMBER_ACTIVATION_V2_VALIDATION_SET.md`'s precedent before that flag's own flip |

**One flag, not one per slice.** Splitting into per-slice flags would let slices ship in an order that produces inconsistent states (e.g., commitment recognition live but pause/resume reuse not yet wired, silently reintroducing the exact "fresh session on resume" bug `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §1 diagnosed). A single flag, flipped only once all of Slices 1–5 have individually passed validation with the flag on in a test environment, keeps the rollout atomic and the rollback trivial (`NEXT_PUBLIC_WORK_IDENTITY_V1=false` restores today's exact behavior, at any point, the same guarantee already proven for the Chamber flag).

**Slice 0 needs no flag** — it changes no runtime behavior by construction (§1).

**Slice 6** (multi-day resume surfacing) is additive-only (an extra offered continue option) and can ship under the same flag without materially increasing rollback risk, since declining or ignoring the offer has no side effect.

---

## 6. Test plan

| Layer | Source | What it verifies |
|-------|--------|----------------------|
| **Unit — Recognition Layer Contract** | `resolveCommitmentGate` implementing `COMMITMENT_RECOGNITION_DESIGN_REVIEW.md` §7 | The pure decision function in isolation, before any wiring — can be fully tested at Slice 0, with zero live-system risk |
| **Unit — Recognition Acceptance Tests** | `COMMITMENT_RECOGNITION_DESIGN_REVIEW.md` §10's twelve scenarios | Exact expected `commit`/`explore`/`clarify` outcome per scenario, run against Slice 0's implementation before Slice 1 wiring begins |
| **Unit — transition rules** | `WORK_IDENTITY_TRANSITION_RULES.md` §1–§9's "what must never happen" columns | Each becomes a negative test: e.g., resuming never mints a second `workId` (§6); a multi-idea message never mints any `workId` (§7); pausing never marks an artifact `complete` (§8) |
| **Regression — flag off** | Existing `createFastPath.test.ts`, `universalCreation.test.ts`, Work State Priority `endToEndFounderJourneys.test.ts`, Chamber's `combinedExperienceEndToEnd.test.ts` | With `NEXT_PUBLIC_WORK_IDENTITY_V1=false`, every existing passing test must continue to pass unchanged — the same "byte-for-byte unchanged" bar already required of the Chamber flag's off-state |
| **Golden conversations — flag on** | New scenarios modeled on `WORK_STATE_PRIORITY_MODEL.md`'s and `END_TO_END_FOUNDER_JOURNEYS_VALIDATION.md`'s existing style | Full-turn journeys per slice: Scenario 1 (support→build), Scenario 2 (research interruption), Scenario 4 (multiple ideas), Scenario 5 (direction change) from `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md`, each run end-to-end once its slice is wired |
| **Lineage integrity** | New | A `workId` minted in chat and later completed via the Create panel (or vice versa) resolves to exactly one `SavedWorkItem` with one `originatedFromId` chain — never two disconnected records (`WORK_IDENTITY_MODEL.md` §2's core claim, made testable) |
| **Founder-language validation round** | New, per slice | 10–20 realistic founder phrasings per slice, the same discipline as `CHAMBER_ACTIVATION_V2_VALIDATION_SET.md` — run before that slice's portion of the flag is considered flip-ready |

---

## 7. Migration risks

| Risk | Description | Mitigation |
|------|-------------|----------------|
| **Pre-existing sessions have no `workId`** | Any `UniversalCreationSession` or `SessionArtifact` already in a founder's `localStorage` before this ships was created with no `workId` field at all. | The field is optional everywhere it's read (§3's reuse list treats it as such) — a session with `workId: undefined` is a valid, legal state, not an error. `resumeArtifact`/`startUniversalCreationTurn` should mint one lazily, the first time such a session is touched post-upgrade, rather than requiring a backfill migration. No data migration is proposed or needed. |
| **Regression in currently-passing Work Recognition scenarios** | `WORK_RECOGNITION_CHAMBER_INTEGRATION_VALIDATION.md` and `END_TO_END_FOUNDER_JOURNEYS_VALIDATION.md` already validated specific founder phrasings entering Universal Creation directly. If the commitment gate (Slice 1) misclassifies any of those same phrasings as `explore` or `clarify`, previously-working flows would regress. | Every phrasing from those two existing validation documents must be added to the Slice 1 founder-language validation round (§6) as regression cases, not just the new Commitment doc's own twelve scenarios — this is a materially larger test surface than the twelve scenarios alone cover, and must be run before that slice's flag flip. |
| **`splitOnConjunctions` misfiring on non-idea sentences (Slice 3)** | This mechanism is proven for Chamber's expert-lens splitting; using it for artifact-type detection is a **new application** of existing logic, not a proven one for this purpose yet. A sentence like "I want a workshop and a break" could be misread as two possibilities. | Slice 3's own founder-language validation round (§6) must specifically stress-test conjunction edge cases before that slice is included in the flag flip — flagged here as the single highest-uncertainty slice in this plan, consistent with `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §4 already calling this "the one scenario needing a genuinely new small concept." |
| **Dual-write mirror drift (chat entry, Slice 1)** | `universalCreationAdapter.ts`'s existing dual-write must be updated to *attach* the orchestrator's `workId`, never mint its own — if this is missed, the mirror and the source-of-truth session would silently diverge, recreating exactly the fragmentation this whole series exists to close. | Explicit unit test asserting `SessionArtifact.workId === UniversalCreationSession.workId` after every dual-write, for the lifetime of Slice 1's rollout. |
| **Ambiguous-referent guessing (Slice 2/pronoun resolution)** | If the `clarify` branch (`COMMITMENT_RECOGNITION_DESIGN_REVIEW.md` §7.4/§8) is implemented loosely, there's a risk of defaulting to "most recent" possibility instead of genuinely asking — silently resuming the wrong `workId`. | Test explicitly asserts that two-or-more open possibilities with no just-named referent always produces a `clarify` outcome, never a `commit` — this is one of the twelve Recognition Acceptance Tests (§10, scenario 6) and should be treated as a release blocker, not a nice-to-have. |
| **Flag interaction with Chamber Activation V2** | Both flags can independently be on or off; a founder's message could trigger both a commitment-gate decision and a Chamber activation decision in the same turn. | No interaction is expected by design (`WORK_IDENTITY_MODEL.md` §1.9: Chamber remains stateless and independent of `workId`) — but this plan calls out that the combined-flags-on state should be included in Slice 1's validation round explicitly, rather than assumed safe from each flag's own isolated testing. |
| **Scope creep into Growth Greenhouse/Parking Lot connection** | Because those systems share vocabulary ("possibility," "parking") with this plan's new concepts, there's a natural temptation during implementation to "just connect them while we're in there." | Named explicitly as out of scope (§4) — `WORK_IDENTITY_MODEL.md` §6 already gave the reasoning; this plan does not revisit it, and no slice should either. |

---

## 8. Non-goals

- No code implemented by this document or any slice description above — this is a plan to be reviewed, not a build log.
- Does not choose exact TypeScript signatures beyond what `COMMITMENT_RECOGNITION_DESIGN_REVIEW.md` §7 already specified — implementation-time detail.
- Does not write the founder-language validation phrasings themselves for each slice — names the requirement and the discipline (§6), leaves the actual scenario authorship to each slice's own review, consistent with how every prior phase in this body of work was run.
- Does not revisit or re-approve any of the four design documents this plan implements — treats all of them as settled inputs.
- Does not propose a timeline — sequencing is defined by dependency and risk order (§1), not by calendar estimate.

Stopping here, per the request — no implementation, until this plan is reviewed.

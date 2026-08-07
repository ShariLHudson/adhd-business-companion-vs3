# Create Foundation Convergence — Phase C Implementation Plan

**Status:** Plan only, per founder instruction — no code in this pass.
**As of:** 2026-08-07. Builds directly on `CREATE_FOUNDATION_CONVERGENCE_REVIEW.md` (§1-§5) and `WORK_RECOGNITION_ACCEPTANCE_TESTS.md`.
**New evidence this pass:** a targeted trace of which workspace shell actually opens after `entranceUnderstanding.ts`'s conversation, for document types vs. object types — this materially changes and *simplifies* the plan below, so read §1 before anything else.

---

## 1. Canonical Create journey — confirmed, and narrower than it first looked

**Confirmed:** every entry point — dropdown Create, chat creation request, Create Foundation classification — converges into `lib/createEstate/entranceUnderstanding.ts`. No new reasoning engine. This was the direction proposed in the prior review; it is now confirmed correct and, importantly, **already half-true today**.

**New finding that changes the plan's shape:** I traced what actually renders *after* the understanding conversation, for a document type (Newsletter, Checklist, SOP) versus an object type (Event, Course, Project) picked from the catalog. There is no split. Both go through the identical chain:

```
CreateEstateEntrancePanel.tsx:482 onBeginCreate
  → CompanionPageClient.tsx:28093 (canonicalWorkId path) / :12502 startFreshCreateFromEstate (fallback)
  → CompanionPageClient.tsx:12531 bootstrapWorkspaceV2Session(artifactType)   [lib/createWorkspaceV2.ts:628]
  → phase: "workspace" → CreateEstateWorkingPanel (CompanionPageClient.tsx:27983)
  → CurrentFocusInteraction mounted inside it (CreateEstateWorkingPanel.tsx:8,498)
```

`bootstrapWorkspaceV2Session`/`typeLabel` is an opaque string — it selects which work-type template loads, not which shell mounts (`lib/createWorkspaceV2.ts:106-119`). `ContentGeneratorPanel` (the shell that *does* support `chatLayoutMode:"split"`) is not in this chain at all for any catalog-pick type; it's explicitly quarantined legacy code (`lib/createEstate/legacyCreateShellQuarantine.ts:1-37`, `lib/createEstate/createOwnershipContract.ts:43-48`), reached only through unrelated legacy entrances (`openCreateWithShari`, Snippets/Content-Types panels) that the entrance catalog never calls.

**What this means for scope:** the "canonical journey" isn't five things to build — it's **one thing to build (the hand-off from Create-Foundation classification into the conversation) plus four things that already exist and already work identically for every type**:

1. Work Recognition — exists (`workRecognitionFallthrough.ts`, Phase A/B, shipped).
2. Understanding conversation (what/why/who/existing/constraints) — exists (`entranceUnderstanding.ts`, 5 questions).
3. "What I understand" — the confirm step already exists (`createIntentConfirmation.ts`'s `createIntentConfirmMessage`), under different copy than the literal phrase "What I understand" (that exact phrase is dead/unused constants in `bannedCopy.ts`/`trustContract/promises.ts` — cosmetic, not a missing mechanism).
4. Current Focus — exists (`CurrentFocusInteraction.tsx`), and per this pass's finding, **already the universal destination for every catalog-picked type today**, document or object.
5. Optional full workspace — `CreateEstateWorkingPanel` itself, already what step 4 mounts inside.

**The only missing piece is the connector between a chat message classified by `resolveCreateFoundationClassification` and step 2.** Everything downstream of step 2 is shared, proven, and untouched by this plan.

---

## 2. Standard 066 review

**What principle it protects:** single-attention, single-ownership interaction — never two surfaces (chat pane + workspace pane) competing for the member's attention or input at once. Concretely: "Current Focus" is the sole component allowed to ask questions/accept answers while a Creation Destination is open; companion chat goes dormant rather than run in parallel. This is not a cosmetic layout preference — it's a correctness property (prevents two systems racing to own the same reply) sitting directly downstream of the app's own binding constitutional principles (128 — Simplicity & Cognitive Load; the Companion Covenant's "reduce cognitive effort, never expose architecture").

**Does the new architecture still require it — yes, and more than the standard's own prose suggests.** 066's prose (`066_SINGLE_EXPERIENCE_WORKSPACE_STANDARD.md:89`) names only object-shaped Creation Destinations (Event, Book, Course, Project, Marketing Campaign, Research, Business Plan). But the actual enforcement code doesn't check type at all: `coerceCreationDestinationQuestionMode` (`lib/currentFocus/questionMode.ts:20-32`) is called unconditionally inside `startFreshCreateFromEstate` for **every** artifact type and forces `questionMode: "current_focus"`, never `split_screen`; `formatCreateWorkspaceV2ChatHint` (`lib/createWorkspaceV2.ts:646-664`) emits the literal "STANDARD 066 RULES — Current Focus is the only answer surface" text generically for any `typeLabel`. **Newsletter, Checklist, and SOP are already governed by 066 today**, via the exact same catalog-pick path this plan converges chat onto. The canonical journey (§1) isn't newly adopting 066's model — it's already built on top of it.

**Recommendation: 066 remains, unchanged.** It should not be weakened, narrowed to "object types only," or retired — doing so would mean tearing out enforcement the working Create path already depends on, for a class of types (document-shaped) that turn out to already be inside its scope. Retiring or narrowing it would be a regression to the very failure condition it exists to prevent, not a simplification.

**The genuine tension, resolved:** the founder's "preserve split-screen workspace as optional later-stage view" cannot mean `WorkspaceLayout.tsx`'s `chatLayoutMode:"split"` dual-pane, because that mechanism is *already* unreachable from the live entrance-catalog path for every type — not something this convergence would newly break, but something already true today, enforced by code the canonical journey already depends on. I recommend interpreting "optional later-stage view" as **already satisfied by step 5 of the canonical journey itself** — the full `CreateEstateWorkingPanel` workspace *is* the optional, later-stage, richer view that opens once the understanding conversation confirms. No dual-pane chat-beside-document mechanism needs to be resurrected or newly wired for chat-originated Create-Foundation types; nothing needs to be built here to satisfy this preservation item, and nothing in this plan touches `WorkspaceLayout.tsx`, `chatLayoutMode`, or `assertCreationDestinationQuestionMode`. **This is a recommendation, not a decision I'm making unilaterally — flagging for explicit founder confirmation before Phase C-2 (below) proceeds**, since it reinterprets rather than literally implements one of the four "preserve" items.

---

## 3. `checklistCreateFoundationHandoff.test.ts` review

Two tests, one still valid, one describing abandoned architecture.

**Test 1 (passing) — still correct, keep as-is.** Classifies "checklist" text → `deriveCreationIdentity` → `classificationTypeFromWorkingIntent` → `bootstrapWorkspaceV2Session("Checklist")`, confirms `typeLabel`. This is exactly the downstream call the modern path (`startFreshCreateFromEstate`) already makes — it locks in real, live behavior. No change needed.

**Test 2 (failing) — abandoned architecture, confirmed by reading its intent, not just its failure.** It asserts `CompanionPageClient.tsx` contains a constant `CREATE_FOUNDATION_HANDOFF`, a function `openUniversalCreationFromText`, and a comment "never fall through to tryUniversalCreationFlow," inside `completeImmediateCreateOpen`. The file's own top comment — *"Does not patch UC questions — Checklist must not enter questionIndex loops"* — reveals the design intent: bootstrap the Workspace V2 session **directly from classified text, skipping any question conversation entirely**. That is the opposite of what's being built. The canonical journey requires the 5-question understanding conversation to run for every entry point, including chat-classified Create-Foundation types — it does not want to skip straight to the workspace.

**One part of the old intent is still correct and must be preserved, just via a different mechanism:** Checklist (and every Create-Foundation-direct type) must never enter Universal Creation's own discovery-question loop (`orchestrator.ts`'s interview, the confirmed dead-end engine). That's still true and already enforced today by `shouldRouteDirectlyToCreateFoundation` returning `true` and stopping UC discovery before it starts (§1 of the prior review). What's abandoned is specifically the *skip-the-conversation-entirely* part, not the *skip-UC's-old-interview* part.

**Recommendation: rewrite test 2, keep test 1.** New test 2 should assert: a chat message classified as Create-Foundation-direct (e.g. checklist-shaped text) triggers `entranceUnderstanding.ts`'s typed conversation start (the same function the catalog path already calls) — not a direct workspace bootstrap, and not Universal Creation's discovery loop. The rewritten test becomes the first real regression coverage for the mechanism this plan builds, rather than for the one it's replacing.

---

## 4. Implementation plan

### Scope split — two checkpointed slices, not one

Mirroring this session's established discipline (and because the founder's own 5-step journey includes both "asks questions" and "workspace opens" as distinct steps), this splits into two independently shippable, independently verifiable slices:

- **Phase C-1 — recognition + typed understanding conversation.** Fixes the reported bug: chat-classified Create-Foundation messages get recognized and asked the 5 questions, instead of a dead `"none"` decision. Directly analogous to Work Recognition Phase 1's already-proven scope (recognition + conversation only). Lower risk.
- **Phase C-2 — open the workspace from a chat-confirmed conversation.** Completes "asks questions... **before workspace**" by wiring the confirm step to the same `startFreshCreateFromEstate`-equivalent open call the catalog path already uses. This is the piece the Doorway Convergence Map called "the load-bearing pair" and deliberately deferred out of Work Recognition Phase 1. Higher risk — touches `RuntimeCreationRecord`/Working Memory wiring, the same category of code where this session already found and fixed one real id-mismatch bug (guided/event domains).

Recommend implementing, verifying, and committing C-1 first; stop for review before C-2, exactly as every phase this session has done.

### Files affected

**Phase C-1:**
- `lib/creationIdentity/createFoundationRouting.ts` — fix the "landing page" precedence bug found in the prior review (the `PRE_WORKSPACE_DISCOVERY_UC_TYPES` check currently short-circuits before the `CREATE_FOUNDATION_DIRECT_LABELS` check is ever reached for this one label). Small, contained, same file already in scope.
- `lib/estateBrain/workRecognitionFallthrough.ts` (or a new sibling file if it turns out cleaner — decide at implementation time, default to extending the existing file to avoid a new module) — one new exported function that: calls `resolveCreateFoundationClassification(text)`; if `routeDirectlyToCreateFoundation` is true, calls `startEntranceUnderstandingForCatalogType(label, text)` (the exact function the catalog path already calls — no new classifier, no new conversation logic); wraps the result via the existing `applyStep` helper (export it rather than duplicating its logic). Reuses the existing chat-native session storage pattern — default to the *same* storage key Work Recognition already uses (only one recognition-originated conversation can plausibly be in flight at once), not a new key, unless testing reveals a real collision risk.
- `lib/frictionlessActionLayer.ts` — at the **hard-exit** Create-Foundation call sites only (`:4277-4282`, `:4503-4508`, `:4520-4524` — the ones that `return finish({...none})`/exit `resolveFrictionlessActionImpl` entirely), replace the dead exit with a call to the new function, wrapped into a proper `FrictionlessActionDecision`. **Deliberately not touching** the two call sites *inside* `tryUniversalCreationFlow` itself (`:1516-1521`, `:1956-1962`) — those are a shared sub-function consulted from multiple callers with logic after the null return; changing them has a materially larger, harder-to-predict blast radius for the same benefit, since the primary reported bug (a bare chat message) already reaches a hard-exit point. Flagged as a possible follow-up, not required for this fix.
- `lib/creationIdentity/checklistCreateFoundationHandoff.test.ts` — rewrite test 2 per §3; keep test 1.
- New/extended test coverage in `lib/estateBrain/workRecognitionFallthrough.test.ts` (or the new sibling file) — the acceptance tests below.

**Phase C-2 (separate checkpoint, not started until C-1 is verified and reviewed):**
- `app/companion/CompanionPageClient.tsx` — wire the new function's "understood"/confirm outcome to call the same open-workspace path `CreateEstateEntrancePanel.tsx`'s `onBeginCreate`/`startFreshCreateFromEstate` already uses, carrying the gathered understanding-conversation answers into `RuntimeCreationRecord.workingMemory` (reusing the exact fix pattern from this session's earlier guided/event-domain Working Memory bug — write to `registerCreationDestinationWorkspace`'s returned id, not a possibly-mismatched pre-existing variable).
- Possibly `lib/currentFocus/creationRecord.ts` if the workingMemory-application function needs a chat-origin variant — to be determined at implementation time, not assumed here.

**Not touched by either slice:** `lib/createEstate/entranceUnderstanding.ts` (already correct, reused as-is), `components/companion/CreateEstateEntrancePanel.tsx` (catalog path untouched), `components/companion/WorkspaceLayout.tsx`, `docs/create-experience/standards/066_SINGLE_EXPERIENCE_WORKSPACE_STANDARD.md`, `lib/singleExperienceWorkspace/`, `lib/universalCreation/orchestrator.ts` (the 6 `PRE_WORKSPACE_DISCOVERY_UC_TYPES` stay on their existing path, unchanged), `lib/contentAudience.ts`/`lib/audienceContext.ts` (client avatar/voice-tone — confirmed disconnected from this flow, nothing to change).

### Risks

1. **Uneven call-site semantics.** Not all five/six Create-Foundation `return null` sites mean the same thing — some are a shared sub-function declining (with a caller that may do something else afterward), others are hard exits of the whole turn. Mitigated by only touching the hard-exit sites in C-1 (see Files, above); mis-scoping this is the single highest-likelihood mistake in this plan.
2. **Circular import.** `createFoundationRouting.ts` already deliberately avoids importing `orchestrator.ts` ("avoids importing orchestrator (circular risk)," its own comment). The new function needs to import both `createFoundationRouting.ts` and `entranceUnderstanding.ts` — neither currently imports the other or `workRecognitionFallthrough.ts`, so this should be safe, but must be verified at implementation time (a build/typecheck failure would surface it immediately, not a silent bug).
3. **Session collision.** Reusing Work Recognition's existing chat-native session key for typed conversations — low risk (mutually exclusive entry conditions: shape-match vs. Create-Foundation classification), but needs an explicit test rather than an assumption.
4. **Landing-page fix over-reach.** Narrowing the precedence bug fix strictly to "landing page" — must not change routing for genuine `website`-shaped requests ("I want website copy") that should still reach Universal Creation's website flow unchanged.
5. **Phase C-2's Working Memory wiring** — the same class of bug (id mismatch between the function that registers a workspace and the function that writes to it) already happened once this session for guided/event domains. Recommend the same live browser before/after verification methodology used then, not just unit tests.
6. **Standard 066 interpretation (§2).** My recommendation — that "optional later-stage view" is already satisfied by the existing Current Focus/full-workspace step, and that no dual-pane mechanism should be reconnected — is a judgment call on a founder-authored preservation item, not a fact I can verify in code alone. Explicit founder confirmation requested before C-2 opens a workspace through this path for the first time from chat.

### Acceptance tests (extends `WORK_RECOGNITION_ACCEPTANCE_TESTS.md` case 2; supersedes its "GAP" grade once shipped)

1. "I want to create a newsletter." in chat → recognized, asks the 5 understanding questions, reaches confirm — parity with picking "Newsletter" from the dropdown (same question set, same confirm-message shape). *(C-1)*
2. Same parity check for the other 8 already-catalog-pickable Create-Foundation labels (checklist, sop, proposal, document, lead magnet, landing page, offer, course outline). *(C-1)*
3. The 7 labels with no catalog entry point (guide, playbook, workbook, agenda, template, course, training manual) behave consistently (documented collapse-to-generic-label behavior is acceptable; silent wrong behavior is not). *(C-1)*
4. "I want a landing page." no longer routes into Universal Creation's dead-end interview; resolves through the Create-Foundation-direct path. *(C-1)*
5. An active Work Recognition/entrance session is not interrupted by a Create-Foundation-classified message arriving mid-conversation, absent an explicit redirect — reusing the AT-5.7 resumption-priority pattern. *(C-1, verifies §1's "preserved for free" claim from the prior review is still true after this change)*
6. The 6 `PRE_WORKSPACE_DISCOVERY_UC_TYPES` (email, sales_funnel, website, presentation, business_plan, social_post) are unaffected — still route through Universal Creation's own interview exactly as before. *(C-1 regression)*
7. Rewritten `checklistCreateFoundationHandoff.test.ts` test 2 passes against the new mechanism; test 1 continues passing unmodified. *(C-1)*
8. Client avatar / voice-tone regression: existing `contentAudience.test.ts`/`audienceContext.test.ts` suites pass unmodified — confirms the global picker mechanism feeding `buildCreationDraft.ts` is untouched. *(C-1 regression)*
9. "I want to create a newsletter." reaches a fully opened workspace (Current Focus, `CreateEstateWorkingPanel`) after confirm, carrying the conversation's answers into `RuntimeCreationRecord.workingMemory` — verified live (browser), not just unit-tested, per the Working Memory bug precedent. *(C-2)*
10. The workspace opened via C-2 is already 066-compliant by construction (reuses the same open-call the catalog path uses) — a regression test that `questionMode` resolves to `"current_focus"`, never `"split_screen"`, for a chat-originated open, same as a catalog-originated one. *(C-2)*

### Rollback strategy

- **C-1** is purely additive at specific, identifiable call sites (a `return null`/`return finish({...none})` replaced with a function call). Each call site is independently revertible via a single-file diff; the new function itself can be deleted or simply left unreferenced with zero effect on any other path, since nothing else calls it. No data migration, no schema change, no session-format change (reuses the existing Work Recognition session shape).
- Recommend gating C-1 behind a boolean check at rollout, consistent with existing precedent in this codebase (`isConversationStabilizationEnabled()`, `isEstateIntelligenceRuntimeEnabled()` — both already gate comparable pipeline behavior in `frictionlessActionLayer.ts`) — a single flag flip fully disables the new hand-off without a code revert if something unexpected surfaces after landing.
- **C-2** carries more state (writes into `RuntimeCreationRecord`) — rollback there means reverting the `CompanionPageClient.tsx` wiring; no destructive data operations are proposed (workspace creation is additive, matching how the catalog path already creates workspaces — nothing is deleted or overwritten by this change).
- Both slices: verified via the existing A/B methodology this session has used throughout (file backup/restore for before/after regression comparison, never `git stash`) before every commit.

---

## Evidence Matrix

- **Sources:** targeted Explore-agent trace (2026-08-07, read-only, Subagent Safety Rule observed) of the post-conversation workspace-shell decision; direct reads of `066_SINGLE_EXPERIENCE_WORKSPACE_STANDARD.md` (full text) and `checklistCreateFoundationHandoff.test.ts` (full text, both tests); `lib/currentFocus/questionMode.ts`, `lib/createWorkspaceV2.ts`, `lib/createEstate/legacyCreateShellQuarantine.ts`, `lib/createEstate/createOwnershipContract.ts`; prior docs `CREATE_FOUNDATION_CONVERGENCE_REVIEW.md`, `WORK_RECOGNITION_ACCEPTANCE_TESTS.md`.
- **Confidence:** High on the workspace-shell unification finding (directly traced, code cited, not inferred) — this is the load-bearing fact the whole plan's simplification rests on. High on 066's actual enforcement scope (cited to the specific unconditional call sites, not just the standard's prose). Moderate on the exact best home for the new function (`workRecognitionFallthrough.ts` vs. a new sibling file) — a genuine implementation-time judgment call, not resolved here.
- **Not done in this pass:** no code changed. `resolveCreationWorkspaceLayoutMode`'s behavior on the dead legacy `openCreateWorkspace.ts` path was not chased to completion (flagged as unverified in the underlying trace, but that path is confirmed unreachable from the flow this plan touches, so it doesn't affect the plan).

**Decision Owner:** Founder. Awaiting approval of the C-1/C-2 split, the 066 interpretation in §2, and the file-scope decisions in §4 before any code.

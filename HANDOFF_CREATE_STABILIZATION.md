# Handoff — Create-Engine Stabilization (post-S4.2)

Focused handoff for a fresh Claude Code conversation. Scope: Create discovery/draft
stabilization. The Boundary-ownership work (S4/S4.1/S4.2) is **done**; the open work is
the Create *draft-composition* defects, next up **D3**.

## 1. Branch / commit / deployment
- **Branch:** `deploy/companion-app-v3`
- **Latest relevant commit:** `e9fe56c3` — "fix: propagate Boundary decision through the Create fast-path handoff (S4)" (this is **S4.2**). Prior: `30964582` (S4 + S4.1).
- **Deployed preview (verified):** `nxbll52ja` — Ready, built from `e9fe56c3`.
  `https://adhd-business-companion-vs3-nxbll52ja-shari-hudsons-projects.vercel.app`

## 2. What S4 / S4.1 / S4.2 accomplished
- **S4 (Boundary = single ownership authority), commit `30964582`:**
  - *Phase 0 — pre-turn snapshot invariant:* `resolveTurnBoundaryDecision` reads a **captured pre-turn snapshot**, never state the current turn just mutated. Fixes ActiveTopic self-contamination (`processActiveTopicOnUserTurn` had written the current message into `unresolvedNeed` before the Boundary read it).
  - *Phase 1:* `classifyCreateTurnRelationship` consumes a discovery answer **only** when the Boundary grants it; removed the `lastAssistantText` position heuristic as an independent ownership claim.
- **S4.1 (slot-aware ownership), part of `30964582`:** `pendingQuestion` carries `role` / `outstandingRoles` / `affordances` derived from `UniversalDiscoverySlot` + each workflow's `signalPatterns`. `answerFillsPendingSlot` decides ownership via affordance or general role shape. **No business-domain keywords in the Boundary.**
- **S4.2 (handoff propagation), commit `e9fe56c3`:** threaded `turnBoundaryDecision` through the page→frictionless seam into the **two deeper** `classifyCreateTurnRelationship` calls that were dropping it (`frictionlessActionLayer.ts:1955` and `orchestrator.ts:819` inside `resolveUniversalCreationTurn`). Optional param → non-page callers unchanged. Fixed the "slot-valid answer → `unrelated-turn` → parked-then-cleared → answer-first reflective/failsafe" bug.

## 3. S4.2 status
**Complete. Do not reopen without new evidence.** The propagation change does not touch draft composition; the defects below are pre-existing in the Create draft engine and were merely *exposed* once Create began running to completion.

## 4. Five deployed-preview outcomes (`nxbll52ja`)
| # | Turn 2 | Result |
|---|---|---|
| 1 | "My dog just threw up on the carpet." | Parked; dog conversation ("Kinsey…"); no email. ✓ |
| 2 | "To update the client on the project timeline." | **Create owns + continues** ("Updated — here's the same email with that change."); no failsafe. ✓ |
| 3 | "Let's work on something completely different…" | Parked; "Sure! What would you like to focus on instead?" ✓ |
| 4 | "Actually…" | Clarification "Would you like to share what's shifting for you?"; no email. ✓ |
| 5 | "They need to know." | **Create owns + drafts**; no failsafe. ✓ |
Reflective response and "Here's a practical way to approach…" failsafe are **gone** for #2/#5.

## 5. Defect list & status
- **D2 — closed** (clean-session testing artifact). Stale "tax documents" subject did **not** reproduce in a fully wiped local session; it came from the real account's server history.
- **D2′ — parked.** Hypothesis: prior *account/server* Create history bleeds into a new unrelated draft. Needs a **controlled account audit** (can't be tested in a clean session). Not chased.
- **D3 — confirmed, ACTIVE (next task).** A discovery answer is harvested into the wrong email slot; recipient defaults to "Client".
- **D1 — confirmed.** Duplicated / raw-echo subject options ("1. <answer> / 2. <answer>").
- **D5 — unresolved product decision.** Draft appears after a **single** answer (skips remaining discovery). May be intended.
- **D4 — low priority (presentation).** Trailing concatenation ("…focus on instead? **with whatever you need**").

## 6. Exact clean-session D3 reproduction
1. "Help me write an email." → app enters discovery and asks **"Who is receiving this email — one person, a role, or a small group?"** (slot `who`, question id `email-recipient`).
2. "To update the client on the project timeline." (a *purpose*, answering the wrong slot).
3. **Observed:** the answer is treated as purpose/subject/body, while **recipient defaults to "Client"** — draft footer shows `(to: Client)` and subject options echo the purpose line (also D1).

## 7. Next task
**Audit D3 only.** Trace the full path: question definition → slot identifier → answer storage → phase advancement → composer input → rendered draft. Determine the exact component that stores the answer under the wrong (or no) slot before composition.

## 8. Required deliverables
Reproduction · exact root cause · affected files · smallest safe fix · regression risks · test plan. **Report root cause before any code.**

## 9. Guardrails
- Audit existing implementation before proposing code.
- **No fix until root cause is reported.**
- **No business-domain keyword heuristics** (the current `/\bclient\b/ → "Client"` default is the anti-pattern to replace, not extend).
- Preserve the Boundary as the single ownership authority (don't reintroduce ownership logic downstream).
- **Do not begin S5.**
- Do **not** batch D1/D3/D5 fixes; D3 is isolated.
- Reproduce in a **clean session** (wipe `sessionStorage` + `localStorage` + IndexedDB).

## 10. Known locations / commands (time-savers)

### Preliminary D3 trace already done (verify, don't assume)
- Recipient "Client" is **fabricated** by `applyEmailDiscoveryDefaults` in `lib/universalCreation/discoveryContextHarvest.ts` — a keyword sniff `/\bclient\b/i` over the *combined* conversation sets `email-recipient = "Client"` even though "the client" was inside a *purpose* answer.
- Harvest assigns by **content keywords**, not by the pending slot's stable id. `mergeHarvestedAnswers` (`orchestrator.ts:648`) runs **before** the pending-slot `applyAnswer` (`orchestrator.ts:715`); `hasExecutableDraftContext` then short-circuits to `draftArtifactTurn`, so the answer is never bound to `email-recipient` and premature drafting occurs.

### Key files
- `lib/universalCreation/types.ts` — `UniversalDiscoverySlot = "what"|"why"|"who"|"success"`; `UniversalDiscoveryQuestion = { id, slot, prompt, signalPatterns? }`.
- `lib/universalCreation/documentCreationProfiles.ts` — EMAIL `discoveryQuestions` (ids: `email-recipient`(who), `email-relationship`(who), `email-purpose`(why), `email-context`(what), `email-ask`(what), `email-success`(success)) + `signalPatterns`; `getDocumentCreationProfile(type)`.
- `lib/universalCreation/orchestrator.ts` — `resolveUniversalCreationTurn`(803), `advanceUniversalCreation`(635), `mergeHarvestedAnswers`(322), `recomputeSessionFromAnswers`(339), `applyAnswer`(483, stores under stable `question.id`), `nextQuestion`(~471), `extractPrefilledAnswers`(299), `draftArtifactTurn`.
- `lib/universalCreation/discoveryContextHarvest.ts` — `harvestDiscoveryFromConversation`(14), `harvestEmailDiscovery`(24), `applyEmailDiscoveryDefaults` (the `/\bclient\b/ → "Client"` default), keyword heuristics over combined text.
- `lib/universalCreation/draftComposer.ts` — `recipient = answer(session, "email-recipient")`(80); footer `(to: ${recipient})`(131). Also D1 subject-line generation lives here.

### Boundary/handoff files (S4/S4.1/S4.2 — reference only, do not modify for D3)
- `lib/conversationBoundary.ts`, `lib/conversationBoundaryInputs.ts`, `lib/universalCreation/createTurnRelationship.ts`, `lib/frictionlessActionLayer.ts` (`FrictionlessActionInput.boundaryDecision`; calls at 1955 + `resolveUniversalCreationTurn` at 1976), `app/companion/CompanionPageClient.tsx` (`turnBoundaryDecision` computed ~14407; threaded at 14448, 14889, 15699, and into `resolveCreateFastPathAction`).

### Repro environment
- Local dev: `.claude/launch.json` config **companion-dev** (port 3000) → `/companion`. Clean via console: `sessionStorage.clear(); localStorage.clear(); indexedDB.databases?.().then(d=>d.forEach(x=>indexedDB.deleteDatabase(x.name))); location.reload()`.
- **No `OPENAI_API_KEY` locally** — non-Create responses fall to a failsafe, but Create **discovery + draft are local** (no key needed), so D3 is fully reproducible locally.
- Deployed preview needs Supabase app login → use the real Chrome browser tools with the user's session; each preview origin requires its own login; `sessionStorage.clear()` (not `localStorage`) resets the conversation while staying signed in.

### Tests / build / lint
- Run: `npx vitest run <file>`. New S4 suites (all green): `lib/frictionlessCreateBoundary.s4.test.ts`, `lib/conversationBoundarySlotFill.s4_1.test.ts`, `lib/conversationBoundaryPreTurnSnapshot.test.ts`, `lib/universalCreation/createOwnershipBoundary.s4.test.ts`.
- Existing Create suites: `lib/universalCreation/createFastPath.test.ts`, `createLifecycle.integration.test.ts`.
- **Known pre-existing failures (NOT yours):** `createLifecycle.integration.test.ts` A1 (`resolveRecoveryContinuation`); `lib/universalCreation/universalCreation.test.ts` fails to load (missing module `@/lib/conversation/earlyLocalSupportTurn`).
- Build: `npm run build` (`next.config` has `typescript.ignoreBuildErrors: true`). Lint: `npx eslint <files>`.
- Pre-commit hook runs `companionBehaviorAudit.test.ts` when companion-behavior files are staged.

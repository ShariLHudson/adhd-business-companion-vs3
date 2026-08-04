# Phase 3.1 Implementation Handoff

> Durable handoff for continuing the Phase 3.1 conversation-ownership repair in a fresh session.
> Written before any implementation. **No application code has been changed. Nothing new has been committed.**

---

## 1. Repository state

- **Branch:** `deploy/companion-app-v3`
- **Verified baseline commit:** `2144d535715a6cea5f8c5b79323a044827bad89d` — *fix: export conversation ownership API*
- **Production build:** passes (`npm run build` → exit 0, "✓ Compiled successfully").
- **Phase 3 ownership tests:** **18/18 pass** — `lib/conversationSession/ownership/ownershipPhase3.test.ts` + `ownershipPhase3Slice2.test.ts` (run with `npx vitest run <paths>`).
- **Phase 3 build fix:** already pushed to origin (`679c9ba3..2144d535`). The fix was the single line `export * from "./ownership";` at the end of `lib/conversationSession/index.ts`.
- **Untracked local directories must remain untouched:** `GPT-Client_Experience_Studio_2.1 navigation/` and `Intelligence Library/`. Do not read into, modify, move, or delete them. `git status --short` at baseline shows only these two `??` entries (plus, now, the two new handoff docs in §2).

Working-tree note: this handoff and `PHASE3_AUDIT.md` are new untracked files at the repo root (`companion-app/`). They are documentation only and are **not** to be committed unless explicitly authorized.

---

## 2. Authoritative documents

1. **`PHASE3_AUDIT.md`** (repo root, `companion-app/PHASE3_AUDIT.md`) — the full read-only audit: Report 1 (technical, findings F1–F21), Report 2 (UX scenarios A–J), consolidated root-cause map, fix order, fix boundaries, duplication assessment, the 17-row certification matrix (C1–C17), and the plain-English executive summary. **This is the authoritative audit for the repair phase.**
2. **The approved Phase 3.1 implementation plan** — captured in full in §4–§8 below. It was reviewed and approved in the originating conversation and is bounded to F9, F11, and the F1+F19+F2 coordinated repair only.

Every finding ID (F#) below maps to `PHASE3_AUDIT.md`.

---

## 3. Confirmed root problem (plain English)

The Phase 3 **ownership spine** (`lib/conversationSession/ownership/`) exists, is well-typed, and works correctly — but **several parts of the turn pipeline are not yet required to obey it.** Navigation routing, the phase 2–11 proactive-suggestion observers, the acceptance regexes, and the LLM system prompt each still decide on their own from the raw user message.

The most damaging consequence: when the assistant asks a **free-form question** (e.g. "Want to build one?"), **nothing registers a pending owner** — the arming code only runs on the frictionless-local reply branch, not on streamed LLM answers. So the user's short answer ("yes") arrives **unowned**, and an unrelated system (a background business suggestion, a navigation router) can capture it. That is the customer-persona failure (Audit Scenario A).

Phase 3.1 does **not** rebuild the spine. It makes the few highest-harm parts of the pipeline obey the spine, and makes a trailing assistant question a first-class, owned pending question.

---

## 4. Approved implementation scope

### Phase 3.1A — safe isolated fixes (ship first)
- **F9** — A practical request that merely *contains* a distress word ("I'm overwhelmed by all these tasks, help me prioritize") must **not** be replaced by stress-relief / breathing routing. Pure distress ("I'm overwhelmed", no task ask) must still get relief.
- **F11** — A clarification question ("what does that mean?") must **not** clear/cancel the active offer.

### Phase 3.1B — active-question ownership (F1 + F19 + F2 as ONE coordinated repair)
- **B1** — Arm a first-class pending-question claim when a **free-form** assistant reply ends in a question/offer (streamed path, not just the frictionless branch).
- **B2** — Bind short confirmations ("yes", "go", "that one", "the first one", "next", "continue", "let's do it") to that active question **before** unrelated systems run.
- **B3** — Prevent unrelated observers (phase 2–11 proactive stack) from running on the turn where the pending question was accepted.
- **B4** — Soften the prompt's mandatory action-close that manufactures untracked questions (F2).
- **B5** — Preserve the active question through a clarification / quick side question (reuses the F11 machinery — this is why 3.1A ships first).

---

## 5. Exact files and functions (from the approved plan)

All line numbers verified against baseline `2144d535`. `CPC` = `app/companion/CompanionPageClient.tsx`.

### F9 (Repair A1)
- **Edit:** `lib/stressRouting.ts` → `shouldOfferStressRelief()` (lines 192–199). Add an early guard: if the message carries an explicit practical task-help ask, return `false`.
- **Reuse / co-locate predicate in:** `lib/conversation/overwhelmNeedClassifier.ts` → `classifyOverwhelmNeed()` (54), `isTaskBreakdownNeed()` (32), `isCognitiveOverloadNeed()` (28). Add a minimal `hasPracticalTaskAsk()` there (small `PRACTICAL_ASK_RE` for "help me prioritize/plan/organize", "where do I start", "what should I do first") and import into `stressRouting.ts`.
- **Consumers unchanged** but fixed transitively: CPC `stressReliefTurn` (17543), `pendingStressOffer` (19560–19569 — note it nulls the workspace offer at 19574 and the tool offer at 19602), chat hint (20595–20597).
- No import cycle: `overwhelmNeedClassifier` does not import `stressRouting`.

### F11 (Repair A2)
- **Edit:** `lib/pendingAcceptanceAuthority.ts` → `topicChangeInvalidatesOffer()` (375–387). Add at top (after the `isBareGenericAcceptance` short-circuit): `if (isClarificationRequest(t)) return false;` + the import.
- **Reuse:** `lib/topicContinuityAnchorIntelligence/clarificationDetection.ts` → `isClarificationRequest()` (8–13).
- **Covers both CPC call sites transitively:** 16214 (`conversationWorkflow`) and 16245 (`pendingAcceptanceRecord`).

### F1 + F19 + F2 (Phase 3.1B)
- **B1 arm:**
  - `lib/conversationConfirmationGate.ts` → `messageAsksUserConfirmation()` (57–61) / `CONFIRMATION_QUESTION_PATTERNS` (14–29): widen to include build/create/draft/make invitations ("want (me) to build/create/draft/make", "want to build one", "should we build/create", "shall we").
  - `CPC`: extract the existing arming block at **14309–14322** into a helper `armPendingQuestionFromAssistantReply(replyText, {kind, frictionlessPending?, workspaceOffer?})`; call it on the **streamed-reply finalize path** (assistant-append sites 16462 / 22039 / 22071) **only if nothing already armed a pending this turn**.
  - Seed spine ownership on arming: `confirmation` owner, `status:"awaiting_user"`, `expectedReply:{kind:"confirmation"}` — reuse `beginSpineOwnership`/`setSpineOwnership` (already used at CPC 18238/18274/18313). This makes `collectOwnershipClaims` pick it up via the spine-claim branch (`adaptLegacyOwnership.ts:109–125`).
- **B2 bind:**
  - `lib/conversationConfirmationGate.ts` → `ACCEPT_RE` (89–90) / `isConfirmationAcceptance` (92–96): extend with the bounded binding tokens ("go", "that one", "the first/second one", "next", "continue"; "let's do it/that" already present). Keep `^`-anchored; these only act when a pending question is active (inside the `AWAITING_REPLY_OWNERS` branch of the resolver).
  - Resolver already handles the acceptance hold: `lib/conversationSession/ownership/resolveOwnership.ts` → `AWAITING_REPLY_OWNERS` (44–47) and the `confirmation_acceptance` → `continue_owner` branch (244–263).
- **B3 gate observers:**
  - `CPC`: at the phase 2–11 proactive-observer gate (**18456**), add the condition that when this turn is a bound confirmation acceptance (resolver `reason:"confirmation_acceptance"`), the observer block and frictionless navigation are skipped. Reuse the existing `menuContinuation.active`-style short-circuit already at that gate.
- **B4 prompt:**
  - `lib/companionPrompt.ts` lines **104** ("End turns with: decision, next step, action…"), **298** ("Then offer ONE action: 'Want to start this now?'"), **403** ("ask exactly ONE question OR offer ONE action"): reword from *mandatory* to *conditional* ("offer an action only when it maps to a registered offer — otherwise simply end"). Wording only; leave 297/329 empathy guidance intact. Leave FOUNDER BOARD FLOW (282) / ECOSYSTEM FEATURE (188–195) unless they directly conflict (bounded).
- **B5 preserve:** no new logic beyond F11/A2 + the existing 2-turn expiry window (`PENDING_ACCEPTANCE_TURN_LIMIT = 2`, `pendingAcceptanceAuthority.ts:53`). If a clarification+answer overruns the window, that is a **Phase 3.2** tuning item — do **not** change the constant in 3.1.

---

## 6. Required tests and certification conversations

### Tests to add / update
- **F9:** `lib/stressRouting` unit tests — `shouldOfferStressRelief("I'm overwhelmed by all these tasks, help me prioritize")` → `false`; `shouldOfferStressRelief("I'm overwhelmed")` → `true`; "frustrated … prioritize" vs "overwhelmed … prioritize" parity. Unit tests for new `hasPracticalTaskAsk`.
- **F11:** `pendingAcceptanceAuthority` tests — pending "hiring a marketing assistant" + "What does that mean?" → `topicChangeInvalidatesOffer` `false`; + genuine new subject → `true`.
- **B1:** `conversationConfirmationGate` — `messageAsksUserConfirmation("Want to build one?")` → `true`. Ownership resolver (extend `ownershipPhase3*`): spine `confirmation` seeded → following acceptance resolves `confirmation_acceptance`/`continue_owner`, not `no_specialized_owner`.
- **B2:** `isConfirmationAcceptance` for each new token; resolver test pending `confirmation` + "go"/"that one"/"the first one" → `confirmation_acceptance`.
- **B3:** reducer/CPC test — on a bound acceptance turn the phase-observer gate is skipped.
- **B4:** prompt-snapshot byte-diff test for the three reworded lines.
- **B5 / full Scenario A:** arm (B1) → clarification "what does that mean?" → preserved (F11) → "yes" → binds (B2), no proactive pivot.
- **Regression:** the existing 18 `ownershipPhase3*` tests must stay green.

### Certification conversations (map to Audit C-matrix)
1. "I'm overwhelmed by all these tasks, help me prioritize" → prioritization help, **no** relief-options card. (C15)
2. "I'm overwhelmed." → relief-options card still appears. (C15)
3. Spark offers to build X → "what do you mean?" → explains, **offer still live**, later "yes" accepts. (C5)
4. Explain persona → "Want to build one?" → "yes" → **starts building the persona**, no warm-lead / pipeline pivot. (C3 — the headline Scenario A fix)
5. Offer → "go" / "that one" / "the first one" → binds to the offer. (C2)
6. Informational question with no offer → model does **not** append an unrelated "want to start X?". (C12/C7, B4)

---

## 7. Commit boundaries

| # | Commit message | Contents | Depends on |
|---|---|---|---|
| 1 | `fix(companion): keep practical intent out of stress relief routing (F9)` | Repair A1 | — |
| 2 | `fix(companion): preserve active offer through clarifications (F11)` | Repair A2 | — |
| 3 | `feat(ownership): arm first-class pending question on free-form assistant offers (F1/F19)` | B1 | commit 2 (for B5 protection) |
| 4 | `feat(ownership): bind short confirmations to active question before observers (F1)` | B2 + B3 | commit 3 |
| 5 | `chore(prompt): soften mandatory action-close conflicting with active-question ownership (F2)` | B4 | ships with 3/4 |

Each commit is independently revertable. Suggested delivery: **one PR for 3.1A** (commits 1–2, fast to certify) and **one PR for 3.1B** (commits 3–5). Every commit message ends with the standard `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` trailer. Do not commit without following the current-next-action sequence and any required authorization.

---

## 8. Explicitly OUT of scope (do not touch in Phase 3.1)

- Router consolidation (F5 / F16 / F21)
- Classifier consolidation (F18)
- Reminder / rhythm architecture changes (F12)
- Dormant-code cleanup (F20 dead prompt fields & per-domain engines / F15 dead chamber-lock helper)
- Full awaiting-state unification (F8 — beyond seeding one spine `confirmation` claim in B1)
- Broad acceptance-regex cleanup (F7 — beyond the bounded binding tokens in B2)
- Side-question stack redesign (F17)
- Phase 4 (any new capability work)

---

## 9. Current next action

**Implement Phase 3.1A only, beginning with F9 (Repair A1)** — the `shouldOfferStressRelief` practical-ask guard in `lib/stressRouting.ts` with the `hasPracticalTaskAsk` predicate in `lib/conversation/overwhelmNeedClassifier.ts`. Then F11 (Repair A2). Do **not** start 3.1B until 3.1A is implemented, tested, and reported. Do not change this sequence unless Shari authorizes a different order.

---

## 10. Safety rules (binding for the implementer)

- **Audit existing code before adding anything** — read the target file and its consumers first.
- **Reuse existing functions** (e.g. `classifyOverwhelmNeed`, `isClarificationRequest`, `createAwaitingConfirmationState`, `beginSpineOwnership`, the `AWAITING_REPLY_OWNERS` resolver branch). Do not reimplement what exists.
- **No duplicate systems** — one owner per behavior; do not add a parallel ownership/awaiting tracker.
- **No unrelated refactors** — touch only the lines the approved plan names.
- **Do not modify untracked files/directories** — especially `GPT-Client_Experience_Studio_2.1 navigation/` and `Intelligence Library/`.
- **Verify, then report** — run focused tests (the specific vitest files), run the production build (`npm run build`), and report in **plain English** what changed and what improved. Report failures honestly with output.
- **Follow project canon** — Spark Estate / Companion constitutions (esp. 128 simplicity, 130/131 create intent, 132 no-surprise). Ownership before navigation; no unsolicited action from chat.
- **Windows/PowerShell environment** — use Bash-tool heredocs (not PowerShell `@'…'@`) when passing multi-line strings in the Bash tool; commit messages via `git commit -F -` or a Bash heredoc.

---

*End of handoff. Baseline `2144d535`, branch `deploy/companion-app-v3`. No app code changed; no commit made.*

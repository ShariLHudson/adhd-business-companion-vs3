# Work State Priority Model — Support vs Build Precedence

| Field | Value |
|-------|-------|
| **Status** | **Design approved and implemented**, in the explicitly-authorized order: Phase 1 (classifier distinction) → Phase 2 (the gate) → Phase 3 (golden-conversation validation). See §9 for the implementation summary. |
| **Date** | 2026-08-07 |
| **Triggered by** | `WORK_RECOGNITION_CHAMBER_INTEGRATION_VALIDATION.md` §4.1 — Create Fast Path overriding a correctly-detected overwhelm signal. This document is that finding's "own review," as recommended there. |
| **Answers** | The precedence between emotional detection, overwhelm/support routing, Work Recognition, Create Fast Path, Estate routing, and Chamber activation, when a message contains both a work object and a human-state signal. |
| **Implementation scope** | §9 — Phases 1–3 only (the entry-turn gate). §3.6's mid-session re-evaluation and §5's founder-led transition mechanics remain designed, not yet implemented, per the approved incremental order. |

---

## 1. Current precedence (evidence, not opinion)

Six systems exist. Today, they are **not ordered by priority at all** — they run in file/call order, and the earliest one to touch a turn wins by default, regardless of what a later one would have concluded.

| Order today | System | What it does | Consults human state? |
|---|--------|---------------|---------------------------|
| 1st | **Create Fast Path** (`lib/universalCreation/createFastPath.ts`, called ~line 10639 of `CompanionPageClient.tsx`) | Lexical only: create-verb regex OR a bare artifact keyword (`workshop`, `newsletter`, …) appearing *anywhere* in the text | **No.** Fires identically whether the sentence is calm or in crisis. |
| 2nd (only if #1 didn't fire) | **Emotional Detection** (`detectEmotionalState`, `lib/companionEmotions.ts`) | Classifies into `stuck \| overwhelmed \| unclear \| focused \| building \| emotional` | N/A — this *is* the human-state signal |
| 3rd (only if #1 didn't fire) | **Overwhelm/Support Routing** (`tryEarlyCompanionSupportFlow`, `tryEmotionalCanonFlow`, `detectOverwhelmTodayRoute`) | Would route generic overwhelm toward Clear My Mind / a calming flow | Yes — but never reached if Create Fast Path already fired |
| 4th | **Work Recognition** (`resolveIntentRouting`) | Classifies work type, feature offers, tone | Receives emotional state as metadata; does not gate on it |
| 5th | **Estate Routing** (`resolveEstateIntelligenceRoute`) | Picks a destination room/capability | Independently, *correctly* resolves overwhelm-flavored text to `restore.calm` — but only reached if Create Fast Path didn't already return |
| 6th | **Chamber Activation** (`resolveChamberExpertActivationV2`) | Names which expert lens(es) inform Shari's thinking | Correctly stays silent (`primary: null`) on pure distress text with no real business signal — but is an LLM-prompt hint only, never a routing decision |

**The core defect, restated precisely:** emotional detection *runs* even inside the Create Fast Path branch (it's computed twice, at lines 10643–10644, fed into `resolveIntentRouting` as metadata) — but its result is never used to decide *whether Create Fast Path should have fired at all*. The signal exists. It is simply never asked the question that matters.

A second, subtler finding from the same investigation: `detectEmotionalState`'s `"unclear"` bucket is a catch-all. It correctly captures genuine confusion (*"I don't know what I need"*, bare *"confused"*, *"unsure"*), but it **also** catches build requests that simply used a word form the classifier's regex doesn't recognize — *"I need help **planning** a workshop"* returns `"unclear"` only because the regex checks for `\bplan\b`, not `planning`. **Any design that treats `"unclear"` as a single signal will incorrectly treat a word-form gap as if it were human confusion.** §3.2 addresses this directly.

---

## 2. The taxonomy this model is built on

### 2.1 Two independent signal types, always present together or separately

| Signal type | Examples | Detected by (today) |
|---|---|---|
| **Work object** | "workshop," "newsletter," "process," "course" | `inferDocumentTypeFromCreateText` (Create Fast Path) — lexical, artifact-keyword only |
| **Human state** | overwhelmed, stuck, confused, unsure, frustrated | `detectEmotionalState` — already a real classifier, already computed, just not consulted for gating |

These are **orthogonal**. A message can have a work object with no human-state signal (*"I want to create a workshop"*), a human-state signal with no work object (*"I'm overwhelmed"*), or both together (*"I'm overwhelmed about my workshop"*) — and the precedence model exists specifically to answer what happens in that third case, since the first two are already unambiguous.

### 2.2 Three tiers of human state (mapped onto the EXISTING `EmotionalState` enum — no new classifier proposed)

This model deliberately does not invent a new emotional classifier. `detectEmotionalState` already exists, is already computed on every Create Fast Path turn, and its 6 values already sort cleanly into three tiers by what they call for:

| Tier | `EmotionalState` values | What it means | What it calls for |
|------|--------------------------|------------------|------------------------|
| **PAUSE** | `overwhelmed`, `emotional` | The founder's *capacity* right now is the actual subject of the message. A named work object is incidental context, not an active request. | Full support. No discovery question this turn. |
| **SOFTEN** | `stuck` | The founder is still *oriented toward* the object ("trying to figure it out") but named a real friction point. | Support acknowledgment **woven into** the same turn as a build step — not a separate detour. |
| **PROCEED** | `building`, `focused`, and `unclear` **only when the confusion is genuine, not a classifier miss** (§3.2) | No distress signal, or the founder is already engaged and moving. | Build proceeds. If the message explicitly says "help me," build proceeds in a more scaffolded, step-by-step register (**Build Guidance**) rather than a rapid-fire discovery volley. |

**Why `stuck` gets its own tier, distinct from `overwhelmed`/`emotional`:** the four given worked examples in §4 only make sense with three tiers, not two. *"I'm overwhelmed about my workshop"* and *"I'm stuck trying to figure out my workshop"* are given **different** expected outcomes (Support vs. Support-then-build) despite both being "distress" in a loose sense. The distinction the examples draw is real: overwhelm is global capacity language ("too much," "can't think"); stuck is object-specific friction language ("frozen on this one thing") — and `detectEmotionalState` already encodes exactly this distinction structurally, it's just never been used for a gating decision before.

---

## 3. Target precedence order

```
1. Emotional/Human-State Detection         — ALWAYS runs first. Cheap, side-effect-free, already exists.
2. Support Gate Decision (NEW, §3.1)       — the missing piece. Classifies the turn into PAUSE / SOFTEN / PROCEED
                                              using the tiers in §2.2. Nothing else acts until this returns.
3. Work Recognition                        — ALWAYS computed, regardless of tier (cheap; needed either way —
                                              a PAUSE turn still benefits from knowing what the founder was
                                              trying to do, for Working Memory and the eventual transition).
4. Estate Routing                          — ALWAYS computed. Already independently correct for both branches:
                                              resolves to `restore.*` capabilities on real overwhelm text, and to
                                              creation capabilities on calm build text — it never needed fixing,
                                              it only needed to be REACHED.
5a. IF PAUSE:  Overwhelm/Support Routing   — fires. Create Fast Path does NOT act this turn (§3.3).
5b. IF SOFTEN: Create Fast Path            — fires, but its FIRST reply is reshaped (§3.4), not suppressed.
5c. IF PROCEED: Create Fast Path           — fires normally; "help me" framing shifts register, not gate (§3.5).
6. Chamber Activation                      — ALWAYS computed as an LLM hint, same as today. Already correctly
                                              self-gates to silence on pure-distress text (§1) — no change needed.
```

**The single architectural change this model proposes:** insert the Support Gate Decision as a checkpoint *before* Create Fast Path is permitted to act on its own lexical match — not before it's permitted to *compute* that match (computing is fine, side-effect-free, and can happen in parallel). Everything else in the stack is either already correct (Estate, Chamber) or already computing the right signal but not consulting it (Emotional Detection). This is a **routing change, not a new engine** — consistent with how every fix in the Chamber Activation work landed (small, evidence-grounded, additive).

### 3.1 The Support Gate Decision (new, smallest possible surface)

A single function, conceptually:

```
resolveSupportGate(userText, emotionalState) -> "pause" | "soften" | "proceed"
```

It does **not** replace `isSimpleCreateRequest` — that function stays exactly what it is today, a pure lexical "could this be a creation request" check. The Support Gate Decision sits *above* it and decides whether Create Fast Path's own affirmative answer is allowed to be **acted on** this turn. This separation matters: `isSimpleCreateRequest` should stay single-purpose (lexical detection), and "should we act on it right now given the human's state" should be a separate, composable concern — exactly the same "don't conflate two questions in one function" principle the Chamber activation eligibility fix depended on.

### 3.2 Handling the `"unclear"` conflation (must be resolved before implementation, not after)

`"unclear"` cannot be used as a blanket SOFTEN or PAUSE trigger, because it currently catches two unrelated things:

1. **Genuine confusion** — bare "confused," "unsure," "I don't know what I need," short vague input. This *should* inform the gate.
2. **A classifier word-form gap** — "planning" not matching `\bplan\b`, and likely other verb-form misses not yet found. This is a **bug in the classifier**, not a human-state signal, and must not be treated as one.

**Recommendation, not yet authorized:** before the Support Gate Decision can safely use `"unclear"` for anything, either (a) `detectEmotionalState`'s build-verb regexes need the same word-form-completeness pass this whole project has repeatedly applied to Chamber's own vocabulary (`planning`, `developing`, `building`, `hosting`, etc. — the identical pattern found and fixed a dozen times over in `CHAMBER_ACTIVATION_V2_VALIDATION_SET.md`), or (b) the Support Gate Decision uses a **narrower, purpose-built check** for genuine confusion (an explicit short list: bare "confused," "unsure," "not sure," "don't know where to start," "no idea") rather than reusing the full `"unclear"` bucket. Recommend **both** — narrow the gate's own check (safe immediately) and separately file the classifier word-form gap (low-risk, same pattern as always, but a distinct piece of work).

### 3.3 PAUSE behavior — what "support wins" actually means

- Create Fast Path's match is computed but **not acted on** — no discovery question, no draft, no "who is this workshop for."
- The named work object, if any, is captured into session-scoped Working Memory (*"founder mentioned a workshop while overwhelmed"*) — never asserted as a permanent memory from a single utterance (Spec 112's own rule), but available so the eventual build conversation never has to re-ask.
- Response leads entirely with grounding — no build question in the same breath, matching this codebase's own existing `STATE_HEADERS`/`PRESENCE_LINES` for `overwhelmed`/`emotional` (`lib/companionEmotions.ts`), which already exist and already read correctly; they are just never reached today because Create Fast Path returns first.
- Estate routing's already-correct `restore.*` resolution becomes the live destination for this turn, instead of being computed and discarded.

### 3.4 SOFTEN behavior — how support and build blend in one turn

This is the *"Support + eventual build"* case, and it is explicitly **not** a two-step detour (support turn, then a separate later build turn). Per the given example, it should feel like one coherent turn: brief acknowledgment, then a narrower, easier first question than the standard opening.

- Create Fast Path still fires and Universal Creation discovery still starts — but the **first question is not the standard opening question** ("Who is this for? What transformation?"). It should be simpler and more concrete, narrowing scope rather than opening it further (e.g., "What's one thing about this workshop that feels hardest to pin down right now?" rather than a cold "Who is the workshop for?").
- The acknowledgment must be brief (a sentence, not a paragraph) and must not repeat itself if `stuck` persists across turns — Spec 112's "never say the same reassurance twice" pattern.

### 3.5 PROCEED behavior — Build vs. Build Guidance

Both are "build wins," but the register differs:

- **Build** (no explicit help-seeking framing — *"I want to create a workshop"*): proceeds straight into standard Universal Creation discovery, as it already correctly does today.
- **Build Guidance** (explicit *"help me"* / *"I need help"* framing — *"I need help planning a workshop"*): same destination, but the pacing should be more scaffolded — smaller steps offered explicitly, more checking-in, less assumption that the founder already knows the shape of what's ahead. This is a **tone/pacing distinction within Build**, not a different destination, and maps onto `resolveIntentRouting`'s already-existing `supportStyle: "guided"` value (already computed, already correct for this example per the investigation — it is simply not yet connected to how Universal Creation paces its own questions).

---

## 4. Worked examples (every case given, plus the ones this investigation already found)

| # | Message | `EmotionalState` (today, verified) | Tier | Expected outcome | Matches given expectation? |
|---|---------|--------------------------------------|------|-------------------|---------------------------------|
| 1 | "I want to create a workshop." | `building` | PROCEED | Build — standard discovery | ✅ **Build** |
| 2 | "I'm overwhelmed about my workshop." | `overwhelmed` | PAUSE | Full support this turn; workshop remembered, not raised | ✅ **Support** |
| 3 | "I'm stuck trying to figure out my workshop." | `stuck` | SOFTEN | Brief acknowledgment + one narrow, concrete question about the workshop, same turn | ✅ **Support + eventual build** |
| 4 | "I need help planning a workshop." | `unclear` (classifier word-form gap, not genuine confusion — see §3.2) | PROCEED, Build Guidance register | Build, but scaffolded/step-by-step framing (via existing `supportStyle: "guided"`) | ✅ **Build guidance** — *contingent on §3.2's narrow-check fix; today's raw `"unclear"` value alone is not a safe signal* |
| 5 | "I'm overwhelmed trying to figure out my workshop." *(from the prior validation round)* | `overwhelmed` | PAUSE | Same as #2 | Consistent with #2 |
| 6 | "I don't know, this is too much." *(mid-discovery, from investigation)* | n/a (mid-flow) | PAUSE (re-evaluate each turn, not just turn 1) | Support, even mid-Universal-Creation — §3.6 | New finding, not previously covered |

### 3.6 A gate re-checked once is not enough — mid-conversation transitions matter too

The investigation found that Universal Creation's own turn handler (`advanceUniversalCreation`) only special-cases explicit **uncertainty** phrases ("I don't know," "not sure") as a document-uncertainty menu — it does not re-run any human-state check on subsequent turns. A founder who starts calm and becomes overwhelmed **partway through** discovery (a very real ADHD-founder pattern — this codebase's own "Boredom Survival Design" and momentum-cycle language elsewhere assumes exactly this) is not currently caught by anything. **The Support Gate Decision should run on every turn of an active Universal Creation session, not only on the turn that started it** — this is a natural consequence of treating it as a gate rather than a one-time entry check, and costs nothing extra to design in from the start even though it is out of this document's implementation scope.

---

## 5. Support → Build transition mechanics

The question "how does Spark transition from support to building?" has one governing principle already established elsewhere in this codebase's own rules (T-007 Entrepreneurial Resilience: *"Recovery Before Productivity... Then one small action. Never lead with unfinished tasks or guilt."*) — this model applies it precisely rather than inventing a new one:

1. **The transition is founder-led, never system-timed.** Spark does not count turns and auto-resume the build topic. There is no "after 2 turns of support, go back to the workshop."
2. **Readiness is signaled one of two ways:** (a) the founder's own next message returns to the object themselves (*"ok, so about the workshop..."*), or (b) Spark makes **one** gentle, low-pressure offer — never repeated, never guilt-adjacent — along the lines of *"Whenever you feel ready, we can pick the workshop back up — no rush at all."* If the founder doesn't take it, Spark does not ask again; it waits for the founder to reopen it.
3. **No re-explaining required.** Because the work object was captured into session Working Memory during the PAUSE turn (§3.3), the eventual build conversation resumes with full context — it does not re-ask "what are you working on" as if the PAUSE turn never happened. This is the same "conversation travels, never restarts" principle already governing room transitions elsewhere.
4. **The already-computed Work Recognition / Estate / Chamber signals from the original PAUSE turn are reused, not recomputed from scratch**, if the session continues to the same object — matching the existing "question de-duplication" principle already documented for Working Memory continuity (`CHAMBER_ACTIVATION_V2_PROPOSAL.md`'s own Tier-3 Working Memory continuity signal, itself flagged-but-unbuilt, is the same idea recurring here).
5. **SOFTEN never needs an explicit transition** — by design (§3.4), support and build already happened in the same turn, so there is no separate "moment" where Spark decides to switch modes; the blend *is* the transition.

---

## 6. Acceptance test specifications (design-level — describes what must be tested, does not implement the tests)

| # | Test name (proposed) | Input | Asserts |
|---|------------------------|-------|---------|
| AT-1 | `resolveSupportGate: PAUSE wins on pure overwhelm with a named object` | "I'm overwhelmed about my workshop." | Gate returns `"pause"`. Create Fast Path's own match is computed but not acted on — no discovery question in the resulting turn. |
| AT-2 | `resolveSupportGate: PAUSE wins on the exact validation-round overwhelm phrasing` | "I'm overwhelmed trying to figure out my workshop." | Same as AT-1 — this is the exact sentence `WORK_RECOGNITION_CHAMBER_INTEGRATION_VALIDATION.md` §4.1 flagged; this test is the regression lock for that finding once it's fixed. |
| AT-3 | `resolveSupportGate: SOFTEN wins on stuck, object still referenced in the same turn` | "I'm stuck trying to figure out my workshop." | Gate returns `"soften"`. The turn's reply contains both a brief acknowledgment AND a concrete question referencing the workshop — never a bare support-only reply, never a bare discovery-only reply. |
| AT-4 | `resolveSupportGate: PROCEED wins with no distress signal` | "I want to create a workshop." | Gate returns `"proceed"`. Standard Universal Creation discovery fires unchanged from today's behavior. |
| AT-5 | `resolveSupportGate: PROCEED + Build Guidance register on explicit help-seeking` | "I need help planning a workshop." | Gate returns `"proceed"`. `supportStyle` resolves to `"guided"` (already true today) AND the eventual UC pacing reflects it (more explicit small-step framing) — this is the assertion that currently has no implementation to check against. |
| AT-6 | `Support Gate does not misfire on the classifier's "unclear" conflation` | "I need help planning a workshop." | `detectEmotionalState` alone returns `"unclear"` — this test asserts the gate does NOT treat that as SOFTEN/PAUSE; it must use the narrower confusion check from §3.2, not the raw bucket. |
| AT-7 | `Genuine confusion still reaches SOFTEN even without an object` | "I'm not sure what I need help with." | Gate returns `"soften"` or routes to Chamber's existing insufficient-evidence clarifying question (already built, `CHAMBER_ACTIVATION_DECISION_TABLE.md`) — this test exists to confirm the new gate and the existing Chamber insufficient-evidence mechanism don't conflict or double-ask. |
| AT-8 | `Mid-session re-evaluation` | Turn 1: "I want to create a workshop." (proceeds). Turn 2 (mid-discovery): "I don't know, this is too much." | Gate re-evaluates on turn 2 independently of turn 1's tier, returns `"pause"` for turn 2 — confirms §3.6's "re-checked every turn" requirement, not just entry. |
| AT-9 | `PAUSE preserves the object for a later, founder-led transition` | Turn 1 (PAUSE, workshop named) → founder's turn 3 returns to the topic unprompted | The build conversation that follows does not re-ask "what are you working on" — Working Memory already has it from turn 1. |
| AT-10 | `Estate and Chamber signals remain correct and unchanged` | All of AT-1 through AT-5 | `resolveEstateIntelligenceRoute` and `resolveChamberExpertActivationV2` outputs are identical to their current (already-correct, per §1) values — this model changes *what acts on* those signals, never what they compute. Regression guard against the temptation to "fix" systems that were never broken. |

**Explicitly not specified here:** the literal wording of PAUSE/SOFTEN acknowledgment lines (existing `PRESENCE_LINES`/`STATE_HEADERS` in `lib/companionEmotions.ts` are strong candidates and should be reused, not rewritten, unless review finds them insufficient), and the exact function signature/file location for `resolveSupportGate` — these are implementation details for the authorized build phase, not this design.

---

## 7. Non-goals

- No code implemented by this document.
- No new emotional classifier — `detectEmotionalState` is reused as-is, tiered, not replaced.
- No change to Estate routing or Chamber activation logic — both are already correct per §1; this model only changes whether they're *reached* on PAUSE turns.
- Does not resolve the `"unclear"` classifier word-form gap (§3.2) — flagged as its own small, separate, low-risk fix (the same class of fix already applied a dozen times to Chamber's own vocabulary), not bundled into this precedence change.
- Does not specify UI/copy for the PAUSE or SOFTEN acknowledgment lines beyond noting that suitable copy already exists (`lib/companionEmotions.ts`) and should be reused.
- Does not implement the mid-session re-evaluation (§3.6) — flagged as a requirement the eventual implementation should include from the start, not an afterthought, but not built here.

## 8. Recommendation (original — see §9 for what was actually built)

Implement in this order, each as its own reviewable change, mirroring how every other structural fix in this body of work was sequenced (analysis doc → specification → implementation → validation):

1. Narrow confusion check for the Support Gate (§3.2's option b) — smallest, safest, unblocks everything else without waiting on a classifier audit.
2. `resolveSupportGate` itself, wired as a checkpoint before Create Fast Path's action (not its lexical check) — the single architectural change this whole document argues for.
3. SOFTEN's reshaped first question (§3.4) and PROCEED's Build Guidance pacing (§3.5) — smaller, presentation-layer follow-ons once the gate itself is proven with AT-1 through AT-5.
4. Mid-session re-evaluation (§3.6) and the founder-led transition mechanics (§5) — once the entry-turn gate is solid, extend it to every turn of an active session.

Each step should be validated the same way the Chamber Activation V2 work was: a real founder-language scenario set run through the actual pipeline, not hand-picked examples, before being trusted.

---

## 9. Implementation summary (Phases 1–3, as approved)

**Phase 1 — classifier distinction** (`lib/companionEmotions.ts`):

- Closed the vocabulary gap directly: `detectEmotionalState`'s four internal "return building" checks were missing `develop`, `design`, and — critically — the bare artifact nouns `workshop`, `process`, and `course` (the exact four "work objects" named in this model; `newsletter` was already present). Verified empirically beforehand: 8 of 10 natural continuous-tense business sentences ("I'm building a workshop," "I'm developing a process," "I'm planning a workshop," ...) were misclassifying as `"unclear"` before this fix, not because of a gerund/tense issue as first suspected, but because the underlying artifact noun was simply never in any word list.
- Fixed a real regression risk found while adding `course`: the common phrase "of course" would have false-matched. Guarded with a negative lookbehind (`(?<!of )course`), verified against "of course," "yes, of course," and "I'll help, of course."
- Added `isGenuineConfusionSignal(text)` — a small, separate, exported function distinguishing genuine confusion ("not sure," "confused," "no idea," "don't know where to start") from `detectEmotionalState`'s `"unclear"` catch-all, which also (still) fires for short/greeting text and any remaining unrecognized build phrasing. `EmotionalState` itself was not changed — no new enum value, per §2.2's "no new classifier" principle.
- New test file: `lib/companionEmotions.test.ts` (19 tests).

**Phase 2 — the gate** (`lib/workStatePriority/resolveSupportGate.ts`, new module):

- `resolveSupportGate(userText, emotionalState?)` — a pure function implementing exactly the tiering in §2.2, using `isGenuineConfusionSignal` to resolve the `"unclear"` conflation from Phase 1 rather than treating the whole bucket as one signal.
- `softenResponse(reply, userText)` — blends one of two existing-tone acknowledgment lines into an already-generated reply (never replaces it, never invents new discovery questions), matching "modifies the response" precisely.
- **Wired into `app/companion/CompanionPageClient.tsx`** at the exact Create Fast Path decision point identified in §1: the condition became `(isSimpleCreateRequest(trimmed) || universalCreationContinuation) && supportGate !== "pause"`, and `createFastPathAction.localReply` is passed through `softenResponse` when the gate returns `"soften"`. This is the "only change ownership" instruction applied literally — `isSimpleCreateRequest`, `detectEmotionalState`, and Universal Creation's own discovery logic are all untouched; only the admission decision changed. Confirmed via `tsc --noEmit` and `eslint` clean; this specific file has no pre-existing automated test coverage (a pre-existing condition of the codebase, not introduced here), so the change was kept as small and additive as possible — a single new `&&` condition and one conditional reassignment — precisely to minimize risk given that gap.
- New test file: `lib/workStatePriority/resolveSupportGate.test.ts` (12 tests).

**Phase 3 — golden conversations** (`lib/workStatePriority/workStatePriorityGoldenConversations.test.ts`, new file, 12 tests):

All five given examples, run through the real integrated chain (not hand-simulated):

| Golden conversation | Verified outcome |
|----------------------|----------------------|
| Build: "I want to create a workshop." | `resolveSupportGate` → `proceed`; Create Fast Path fires |
| Support: "I'm overwhelmed about my workshop." | `resolveSupportGate` → `pause`; Create Fast Path **would** fire on lexical grounds alone (`isSimpleCreateRequest` → `true`) but is correctly blocked; Estate routing (now reached) resolves to `restore` |
| Blend: "I'm stuck trying to figure out my workshop." | `resolveSupportGate` → `soften`; Create Fast Path still fires; `softenResponse` confirmed to weave in the acknowledgment without replacing the underlying question |
| Business process: "I want to develop a process for new clients." | `proceed`; Chamber resolves Systems primary / Client Relationships supporting; Estate resolves `create.sop` |
| Event: "I want to plan a birthday party for a staff member." | `proceed`; Chamber resolves Events primary, explicitly not Strategy |

**Verification:** 435/435 passing across the full chamber + companion-emotions + Work State Priority + estate test suites (up from 411 before this delivery — the 24 new tests across Phases 1–3). Full project suite: no new failures (167 pre-existing, unrelated failures confirmed unchanged via repeated `git stash` checks across this whole engagement). `tsc --noEmit` and `eslint`: clean.

**Not implemented in this delivery** (unchanged from §7's non-goals): §3.6's mid-session re-evaluation (the gate currently only governs turn 1 of a Create Fast Path decision, not every turn of an already-active Universal Creation session) and §5's founder-led transition mechanics (Working Memory capture of the paused object, the one-time re-offer). Both remain fully specified above, ready for their own future, equally incremental authorization.

**Follow-up validation**: `docs/estate/END_TO_END_FOUNDER_JOURNEYS_VALIDATION.md` runs four whole founder scenarios (not individual-system tests) through this implementation plus Chamber Activation, Estate Routing, and Universal Creation's own multi-turn discovery together — confirming the Working Memory gap above is real and reproducible, fixing an unrelated but adjacent gap it surfaced (Universal Creation didn't recognize "a process" as an SOP document), and elevating "founder-led, never system-timed" as a standalone, structurally-evidenced principle.

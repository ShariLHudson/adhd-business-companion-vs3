# End-to-End Founder Journeys — Validation

| Field | Value |
|-------|-------|
| **Status** | Complete. One narrow fix applied; one gap confirmed and left honestly deferred. |
| **Date** | 2026-08-07 |
| **Requested as** | A different kind of validation than everything before it — not individual-system tests, but whole founder scenarios chained through every real system: Support Gate → Chamber Activation → Estate Routing → Universal Creation's own multi-turn discovery. |
| **Test** | `lib/workStatePriority/endToEndFounderJourneys.test.ts` (18 tests, all passing) |

---

## 0. Honest scope statement

This environment has no LLM access, so Shari's literal generated sentences cannot be simulated. What this validation *can* verify — and does, for all four given scenarios — is every deterministic system a live turn actually passes through before an LLM ever sees it: whether the founder's message is admitted into creation, which discovery questions get asked and in what order, whether prior context is genuinely prefilled or lost, and which Chamber lenses (with what real substantive content, not just names) would inform Shari's eventual response. Universal Creation's own multi-turn discovery is simulated the same way its own existing test suite already does (`lib/universalCreation/universalCreation.test.ts` — localStorage stub, no React, no LLM) — this is a proven, established pattern in this codebase, not a new testing approach invented for this validation.

---

## 1. Journey 1 — New client experience: "I want to develop a process for new clients."

| Expected | Verified |
|----------|----------|
| Recognizes building | ✅ `resolveSupportGate` → `proceed` |
| Understands client experience goal | ✅ (see fix below) |
| Brings Systems + Client Relationships | ✅ Chamber: primary `SYS`, supporting `CR` |
| Eventually creates process workspace | ✅ (see fix below) |

**Fix applied**: before this validation, `detectUniversalDocumentType` had no way to recognize "a process" as an SOP document — only the literal words "SOP" or "standard operating procedure" matched. This sentence was falling through to Universal Creation's **generic** document-discovery profile (five generic questions: main reason / who / what should it contain / format / success) instead of SOP's own, more specific questions (own business or client? starting from scratch? who will use it? what process? how often? where do people get stuck?).

Added a targeted, phrase-based pattern to `lib/universalCreation/documentRegistry.ts`'s SOP plugin and the matching `lib/universalCreation/createFastPath.ts` artifact inference: `develop|create|build|document|write(?: down)?|design` + `a/an/our/my/the/new process`, plus `process for (new/our) clients`. Deliberately **not** a bare `process` keyword — verified this does not false-match "I'm going through a difficult process right now" or "What's the process for signing up?" (both correctly return no document type). This is the same specificity-over-bare-keyword discipline applied throughout the Chamber Activation work.

**Result**: the journey now genuinely completes — SOP discovery drives to a `"ready"` state with a real SOP-flavored preparation line, through SOP's own question set, not a generic fallback.

---

## 2. Journey 2 — Workshop overwhelm: "I'm overwhelmed about creating a workshop for ADHD entrepreneurs."

| Expected | Verified |
|----------|----------|
| Support first | ✅ `resolveSupportGate` → `pause`; confirmed `isSimpleCreateRequest` alone still returns `true` (this is a real gate effect, not a case that would never have reached creation anyway) |
| Reduce overwhelm | ✅ No Universal Creation session starts while paused; Estate independently resolves this exact text to a `restore` destination |
| Later offer workshop development | 🟡 **Confirmed working, but not smoothly** — see below |

**Honest finding, deliberately not fixed here**: a later, calm follow-up ("Okay, I think I'm ready to work on the workshop now.") does resume toward building — the gate correctly returns `proceed` — but it starts **Universal Creation discovery completely fresh**. The detail "for ADHD entrepreneurs" from the paused turn is not carried over; the founder would need to mention it again. This is exactly the Working Memory capture gap already identified and explicitly deferred in `WORK_STATE_PRIORITY_MODEL.md` §3.3/§5 ("captured into session-scoped Working Memory... not yet implemented"). This validation confirms that gap is real and reproducible, and locks in a test that documents *current* behavior honestly rather than silently fixing or silently ignoring it. The test itself says, in its own name, to be updated once that gap is closed — not before.

---

## 3. Journey 3 — Newsletter: "I want to create a newsletter for my ADHD business community."

| Expected | Verified |
|----------|----------|
| Understand purpose first | ✅ The opening discovery question asks *why* ("What's the main reason you're creating this newsletter?"), never jumps to drafting |
| Consider audience | ✅ "business community" in the opening sentence prefills the `who` discovery slot immediately — the audience question is never asked again as a separate turn |
| Research if needed | ✅ **Correct, conditional behavior — not a defect.** Research is not force-triggered by audience language alone (verified: a calm continuation never surfaces it) but becomes available the moment the founder expresses genuine uncertainty ("I'm not sure, whatever works" → uncertainty menu offering "I can research current best practices"). "If needed" was the operative phrase in the original request, and the system honors it precisely — research is available, not imposed. |
| Create newsletter | ✅ Full discovery set drives to a `"ready"` state |

No fix needed for this journey — every expectation was already met by the existing, previously-built Universal Creation discovery profile.

---

## 4. Journey 4 — Event: "I want to plan a retreat for my clients."

| Expected | Verified |
|----------|----------|
| Events | ✅ Chamber primary `EVT`, explicitly not `STR` |
| Client Relationships | ✅ Present in the activated set |
| Experience design | ✅ **Genuine substance, not name-only.** `selectExpertContribution` returns the "Event Promise Anchor" framework ("Let's name what people should leave with, then only keep what serves that"), two ADHD translations, and a real signature question ("What should someone feel relieved, clear, or ready to do when they leave?") — locked in as a permanent regression test so this quality bar is never silently allowed to regress to a generic fallback. |

No fix needed — this journey was already working correctly end to end, including the deep intelligence layer built in the I-4 batch.

---

## 5. Governing principle, elevated: "Founder-led, never system-timed"

This phrase, from `WORK_STATE_PRIORITY_MODEL.md` §5, is worth stating as a standalone principle rather than a footnote of the transition-mechanics section it originated in:

> **Spark never decides "you've had enough support, now we build." The founder decides. Spark's only job is to make the next step easier whenever the founder is ready for it.**

This validation gives it direct, structural evidence, not just design intent: `resolveSupportGate` takes no turn count, no session age, no timer, and no memory of how long a founder has been in a PAUSE or SOFTEN state. There is no code path anywhere in this delivery — nor could there be, given the function's own signature — that could decide "it's been long enough, let's offer the workshop back." Journey 2's transition happens *exclusively* because the founder's own next message changed (calm language, no distress signal) — never because of elapsed turns, elapsed time, or any system-side judgment about the founder's readiness.

**This is proposed as a candidate for elevation to the Relationship Constitution or Entrepreneurial Resilience (T-007) level** — it is a direct, sharper restatement of T-007's own existing "Recovery Before Productivity... never lead with unfinished tasks or guilt" principle, specifically naming the *mechanism* that principle requires (no timers, no turn-counting, no system-side readiness judgment) rather than only its intent. Consistent with this whole engagement's practice around canon documents, this write-up does not unilaterally amend the Relationship Constitution or T-007 itself — it names the principle clearly, evidences it structurally, and proposes the promotion for the constitution's own owners to decide, the same way "Expertise follows purpose, not keywords" was proposed rather than inserted in the prior round (`CHAMBER_EXPERT_ACTIVATION_QUALITY_STANDARD.md` §11).

---

## 6. Verification

- All 4 journeys, 18 tests: passing, via the real integrated chain (Support Gate, Chamber, Estate, Universal Creation discovery) — not hand-simulated.
- Full chamber + companion-emotions + Work State Priority + universal-creation + estate + message-classification suite: 465/465 passing (up from 435 before this validation).
- `tsc --noEmit` and `eslint`: clean on all changed files (`lib/universalCreation/documentRegistry.ts`, `lib/universalCreation/createFastPath.ts`, plus the new test file).
- One pre-existing, unrelated test-file failure (`lib/universalCreation/universalCreation.test.ts`'s own missing-module import error) confirmed, as in every prior validation round, to predate this delivery.

## 7. Recommendation

Approved for this phase, per the request. The next validation — a full "Spark stays with me" journey test — was explicitly flagged as the step to run *before* any further Chamber expert expansion, not something to build in this same delivery; it will need its own scenario set and acceptance criteria defined the way this round's four scenarios were, and should specifically target the Working Memory capture gap confirmed (not fixed) in §2 as one of its core cases, since "staying with the founder" through a pause is precisely what that gap currently interrupts.

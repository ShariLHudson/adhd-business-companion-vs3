# ADR-012: Unify Shari's Guidance Settings — Conversation Style, Help Mode, Support Style, How Shari Invites Me

**Status:** Approved — documentation only; implementation has not begun
**Date:** 2026-08-05
**Decision owner:** Founder
**Approved by:** Shari Hudson
**Approval date:** August 5, 2026
**Supersedes / refines:** `docs/estate/SETTINGS_FUNCTIONALITY_AND_DUPLICATION_AUDIT.md` §4 rows 2–3, §5 — this ADR's traced recommendation supersedes the prior audit where they differ (see **Relationship to the prior audit**, below)
**Related:** `docs/THE_FRIEND_WE_ALL_DESERVE.md` · `docs/constitution/128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md` · `docs/estate/01 - Spark Estate Constitution.md` · `lib/companionTonePreferences.ts` · `lib/conversationStabilization/shariVoiceLayer.ts` · `lib/supportStyle/` · `lib/curiosityBeforeCommands/`

---

## Context

Settings currently exposes four separate rows that all answer one underlying member question — *"how should Shari help me?"*:

- **Conversation Style** (`aiTone`) — 6 values
- **Help Mode** (`helpMode`) — 5 values
- **Support Style** (`supportStyleId`) — 7 values, plus a "Create My Own" composer and a "Use This Style Most of the Time" checkbox
- **How Shari Invites Me** (`curiosityBeforeCommands`) — 5 values

A full read-only trace of all four — UI → persistence → every runtime reader → actual response differences — was completed this session (four parallel deep-dives, each with exhaustive file:line citations, cross-checked against three specific claims from the prior settings audit). The trace confirmed, verified, or exceeded every prior suspicion. Findings are summarized below; full detail lives in the trace outputs referenced in this ADR's evidence.

**The central discovery:** the canonical model already exists, in code, and ships to the model on every request:

```ts
// lib/companionTonePreferences.ts:90-91
how: {
  scope: "Conversation Style",
  examples: "Gentle, Balanced, Direct, Playful, Strategic, Motivational, Concise, Listen Only",
  ...
}
```

Eight values, one axis — matching `THE_FRIEND_WE_ALL_DESERVE.md` line 195 exactly. The current UI fragments those same eight values across three different settings (`aiTone` holds six of them, Help Mode owns "Concise," Support Style owns "Listen Only"), then adds a fourth setting on top. The codebase contains three separate functions whose only job is reassembling this fragmentation back into the canon's shape (`SHARI_DELIVERY_SCENARIOS`, `toneDeliveryProfilePrefs`, `tonePreferenceOverridesRoutingGuidance`) — the reconstruction cost of the split is itself evidence the split is wrong.

---

## Governing Constitution principles

This decision is evaluated against, and required by, the following binding documents (Decision Hierarchy order):

1. **`THE_FRIEND_WE_ALL_DESERVE.md`** — highest authority for conversation logic and how Spark speaks.
   - **The Immutable Friend** (constitutional article, line 139): *"Members may choose HOW Spark communicates. Members never choose WHO Spark is."*
   - **Architecture Hierarchy** (line 183): Level 1 WHO (immutable) → Level 2 HOW (Conversation Style, 8 named values) → Level 3 TODAY (Today's Reality). Support Style is named as a distinct concept that can conflict with Conversation Style (line 177) and must be resolved in the relationship's favor.
   - **Runtime enforcement already exists and must be preserved unchanged:** `THE_IMMUTABLE_FRIEND_GUARDRAIL` (`lib/companionTonePreferences.ts:109-129`) is prepended to every tone block before it reaches the model.

2. **`128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md`** — binding product law.
   - **Rule 3 — Remove Decisions:** *"The goal is not to give users more options. The goal is to eliminate unnecessary decisions."*
   - **Rule 6 — One Thing At A Time.**
   - **Rule 15 — The Ultimate Test:** *"It just knows what I need"* vs. *"I had to figure out the platform."* Four rows that require a disclaimer card explaining why they are not the same setting fail this test today.
   - **Mandatory Simplicity Audit, Q1:** *"What decision did we remove?"* — this ADR's answer is two settings collapse to fewer real decisions without losing any real capability, because the "removed" options were already behaviorally dead or duplicated.

3. **`docs/estate/01 - Spark Estate Constitution.md`** — *"The relationship is the product. Everything we build must protect that relationship."* Settings that dilute a single clear delivery instruction across seven competing paragraphs work against this, not for it.

**The governing principle this ADR applies, stated plainly:** a setting may change *the shape of the help* — how long, how direct, how much at once, what comes first. It may never change *the relationship* — that Shari is glad you came, tells the truth kindly, and never makes you earn belonging. The Immutable Friend guardrail already enforces the second half correctly and needs no change. This ADR only addresses the first half, where four settings currently do the job one and a half should.

---

## Audit findings that justify the change

Full traces (UI, persistence, every runtime reader, actual behavior per option) were produced for all four settings this session, each with exhaustive file:line evidence. Headline findings:

### Duplication

| # | Finding | Evidence |
|---|---|---|
| 1 | `"direct"` is a value in **both** `AiTone` and `HelpMode`. OR'd into one branch **exactly 3×**, two of which mutate reply text, not just prompt wording. | `lib/conversationStabilization/shariVoiceLayer.ts:247, 276, 286` |
| 2 | `"step-by-step"` is a value in **both** `HelpMode` (zero readers) and `SupportStyleId` (live, `intentRoutingIntelligence.ts:434`). | `lib/companionStore.ts:2329` vs. `lib/supportStyle/types.ts:10` |
| 3 | Support Style's disclaimer card reaches the model **twice, verbatim**, plus 6 total "how these settings relate" paragraphs ride along in one prompt. | `CompanionPageClient.tsx:21056` + `companionTonePreferences.ts:255` |
| 4 | Three near-identical "be direct" paragraphs, one from each of three settings. | `AI_TONE_DELIVERY.direct` (`:217`) · `HELP_MODE_DELIVERY.direct` (`:232`) · curiosity `direct` (`phrasing.ts:140`) |

### Conflicts (all unresolved — no function anywhere arbitrates between any two of the four settings)

- Conversation Style = Gentle + Help Mode = Direct → the model receives both *"validate before structure"* and *"minimal preamble,"* unranked. Code silently resolves this in Help Mode's favor by stripping the soft opener (`shariVoiceLayer.ts:286`) — undocumented, invisible to the member.
- How Shari Invites Me = "Be direct with me" → the model receives *"invite clearly without feeling-based questions"* **and** a five-item catalogue of feeling-based question templates in the same prompt. This happens because the client sends the member's real choice while the server independently rebuilds the same block from a default that ignores it (`lib/companionTonePreferences.ts:272`, `typeof window === "undefined"` forces `"situational"` on every server-side request).
- "Use This Style Most of the Time" unchecked → the client omits one sentence; the server hardcodes `useMostOfTheTime: true` and asserts it anyway (`companionTonePreferences.ts:258`). Worse than a no-op.
- Documented precedence (`promptHint.ts:93`: Support Style > Conversation Style) and executed precedence (`shariVoiceLayer.ts:286`: Help Mode > Conversation Style) govern different pairs and never meet. Help Mode and How Shari Invites Me appear in **no** documented precedence chain at all.

### Dead or misleading choices

- Help Mode's `navigate` ("Take me to the right place") and `step-by-step` — **zero deterministic readers**, prompt text only.
- How Shari Invites Me's `situational` and `unsure` — **byte-identical prompt output**, no `unsure` branch exists (`phrasing.ts:148-153`).
- Support Style's `gentle-first`, `practical-first`, `talk-it-through`, `adaptive` — **identical** at the deterministic layer (all produce the same choice count and pacing).
- `curiosityCopyIsSafe()`, the guard against pressure-language phrasing — **zero callers anywhere**, including its own preview.

### Two live, member-visible correctness bugs found during the trace

1. **Hospitality rooms and `/spark-alpha` send the lossy legacy Support Style field** while main chat sends the canonical one. Round-trip result: `step-by-step`, `give-me-choices`, and `custom` all silently degrade to `adaptive` on those surfaces. (`components/companion/hospitality/useHospitalityRoomChat.ts:150`, `components/sparkAlpha/SparkAlphaPage.tsx:353`)
2. **The server discards the member's "How Shari Invites Me" choice on every request.** The prompt block is rebuilt server-side with no argument, and `getCuriosityBeforeCommandsPreference()` returns the hardcoded default under `typeof window === "undefined"`. Every member gets the `situational` variant from the server path regardless of what they selected.

### What already works and must not regress

- The Immutable Friend guardrail is prepended first, before any style modifier, and is tested (`hintPreservesShariIdentity`, `companionTonePreferences.ts:342`).
- Support Style's deterministic effects are real and reach ~15 production call sites: `maxVisibleChoices`, `oneQuestionAtATime`, `preferExamples` (`lib/adaptiveCompanionIntelligence/presentationResolver.ts:30-90`).
- "Use My Saved Patterns" (Pattern Awareness, fixed this session in a prior contained change) genuinely shapes Plan My Day's priority cap and overwhelm routing and is unrelated to this ADR's scope.

---

## Decision

Reduce four guidance settings to two:

### 1. Conversation Style *(Level 2 — how Shari sounds)*

One dropdown, restoring the canon's own eight values:

> Gentle · Balanced · Direct · Playful · Strategic · Motivational · Concise · Listen Only

Absorbs `aiTone`'s six values plus Help Mode's `concise` and Support Style's `listen`/`talk-it-through` framing as "Listen Only" — not inventing anything, reuniting what `companionTonePreferences.ts:90-91` already declares as one axis.

### 2. "When I'm struggling, start with…" *(what Spark does first — renamed from "Support Style" to the question it actually answers)*

Reduced from 7 presets to 4:

> Adapt to the moment *(default)* · Gentle first · Practical first · One step at a time

Kept **separate** from Conversation Style — not merged into it — for three reasons, in Decision Hierarchy order: (1) the canon names Support Style as a distinct thing that can conflict with Conversation Style; (2) it is the only one of the four settings with real non-prompt runtime effects (choice-count caps, pacing); (3) the ADHD experience standard requires separating support types — a member who freezes on three options needs "one step at a time" as accessibility, not as a matter of taste.

### Removed

| Setting | Disposition |
|---|---|
| **Help Mode** | Removed as a visible control. `concise` migrates into Conversation Style. `direct` was a proven duplicate of Conversation Style's `direct`. `ask-first`, `step-by-step`, `navigate` were dead or near-dead. |
| **How Shari Invites Me** | Removed as a visible control. Its one bit of real signal was half-broken (server silently discarded it on every request); its safety guard never ran a single time in production; it was never server-persisted. |

---

## What stays dormant vs. what is removed

Consistent with this codebase's established pattern (already applied twice this session, to Notification Sounds and Pattern Awareness): **hide the promise, keep the hook.**

**Removed from the visible UI (future implementation phases):**
- Help Mode's Settings row, panel, and dropdown.
- How Shari Invites Me's Settings row, panel, and dropdown.
- Support Style's `talk-it-through`, `give-me-choices`, and `custom` as separately visible presets.

**Kept in place, untouched, as dormant/future-ready hooks — nothing described in this ADR requires deleting any of the following:**
- `HelpMode` type, its storage field, and its five values in `lib/companionStore.ts` — a future feature may still read it.
- `curiosityBeforeCommands` storage, types, and the entire phrasing engine in `lib/curiosityBeforeCommands/` — including `curiosityCopyIsSafe()`, which should be wired to something real before this capability ever resurfaces, not deleted for having never been wired.
- `SupportStyleId` values `"talk-it-through"`, `"give-me-choices"`, `"custom"`, and all `customSettings` fields — the underlying capability is sound (per-style choice-count and pacing behavior is real and tested); only the number of presets exposed at once is reduced.
- `PatternSuggestionCard`, `saveSparkSuggestedPattern`, and `canNoticeNewPatterns()` — unrelated to this ADR, already made dormant in a prior contained change this session, listed here only to confirm the same non-deletion standard applies consistently.

This ADR does not propose deleting a single function, type, or storage key. It proposes changing what four settings the member sees down to two.

---

## Why this improves cognitive load and trust

**Cognitive load (128 Constitution):**
- Four decisions become two. Per Rule 3, this is the actual goal — not fewer pixels, fewer *decisions the member must make* before receiving help.
- A member currently has to read a disclaimer card explaining that Conversation Style, Support Style, and Planning Preferences are not the same thing. Two settings that answer two genuinely different questions need no such card — the difference becomes self-evident from the questions themselves ("how should Shari sound?" vs. "when I'm struggling, what should she do first?").
- Removing `navigate`, `step-by-step` (Help Mode), `unsure`, and three of Support Style's presets removes options that currently cost a member a real decision (which of these do I want?) while returning **zero** difference in what Shari actually does.

**Trust:**
- Trust depends on the platform doing what it says. Today, selecting "Be direct with me" under How Shari Invites Me produces a prompt containing an instruction to skip feeling-based questions *and*, from the server's silently-defaulted rebuild, five templates of feeling-based questions to use. A member cannot trust a setting that contradicts itself in the same response.
- Today, choosing a Support Style in a hospitality room silently degrades three of seven choices to a different one than was selected, with no error and no indication to the member. Reducing the visible preset count to four choices that are all genuinely, individually honored removes the surface area for this class of bug rather than papering over it.
- The Immutable Friend guardrail already promises *"the voice is constant, the delivery adapts."* Fewer, cleaner delivery settings make that promise easier to keep and easier to verify — one clear instruction beside one clear identity guardrail, rather than seven competing paragraphs an LLM must silently rank on the platform's behalf.

---

## Phased migration plan

Each phase is one contained, testable, committable change — no phase depends on a later phase to be correct on its own. This ADR is Phase 0.

| Phase | Change | Risk | Rationale |
|---|---|---|---|
| **0** *(this document)* | Documentation-only decision record. No code touched. | None | Record the decision and its evidence before any implementation begins. |
| **1** | Remove "How Shari Invites Me" as a visible Settings control. Storage, types, and engine remain dormant. | Very low | Never server-persisted → zero migration burden. Removes a provable self-contradiction from every chat prompt. Same shape as the Notification Sounds and Pattern Awareness fixes already completed this session. |
| **2** | Retire the dead Help Mode options (`navigate`, `step-by-step`) from the visible dropdown; keep them in the type. | Very low | Pure honesty fix — these options have zero deterministic effect today. |
| **3** | Fix the wire: hospitality rooms and `/spark-alpha` send the canonical Support Style id instead of the lossy legacy mirror; stop aliasing `supportStyleId: supportStyle` server-side; narrow the `SupportStyle` union type so the two alphabets can no longer typecheck against the same field. | Medium | Stops a live silent-degradation bug affecting 3 of 7 Support Style choices on two real chat surfaces. |
| **4** | Consolidate prompt assembly to a single owner for the tone/support block, replacing the current client-builds-one-copy / server-independently-rebuilds-another pattern. | Medium-high | The architectural root cause behind the curiosity contradiction, the temporary-override contradiction, the `useMostOfTheTime` inversion, the dropped custom settings, and the hospitality degradation. Recommended **before** Phase 5, so the merged Conversation Style does not inherit the same dual-assembly corruption. |
| **5** | Merge Help Mode's remaining live value (`concise`) and Support Style's `listen`/`talk-it-through` framing into Conversation Style's visible dropdown, restoring the canon's 8 named values. | Medium | Now safe to do because Phase 4 has removed the duplication/conflict source this merge would otherwise inherit. |
| **6** | Shrink Support Style's visible presets from 7 to 4 and rename the row to the question it answers; drop `custom` from the visible UI (storage stays). | Medium | Last, because it depends on Phases 3 and 4 having already made the remaining presets individually correct on every chat surface. |
| **Later / V2** | A real conflict-resolution function for the two remaining settings; server-side persistence for member prefs generally; reconsider `custom` support style if a maintained implementation across all chat surfaces is prioritized. | — | Not required for this ADR's honesty goal. |
| **Do not build** | A fifth "delivery" setting of any kind; a settings screen that requires a disclaimer card explaining why its settings are not the same setting. | — | Constitution 128 Rules 3 and 5. |

**Migration note:** 21 test files across the repo reference `aiTone`, `helpMode`, `supportStyle`, or `curiosityBeforeCommands` (some are false-positive namespace collisions with unrelated `GuidanceHelpMode`/`ChamberHelpMode` types discovered during the trace — those are out of scope and must not be touched). Test migration cost should be budgeted primarily into Phases 5 and 6.

---

## Relationship to the prior audit

`docs/estate/SETTINGS_FUNCTIONALITY_AND_DUPLICATION_AUDIT.md` §4 already recommended consolidating these settings, in two rows:

> 2. **How Shari Talks & Helps** — one merged control absorbing Conversation Style + Help Mode + How Shari Invites Me…
> 3. **Support Style** — the 6 presets only; drop "Create My Own"…

This ADR reaches the same directional conclusion (fewer, honest settings) via a full code trace the prior audit did not have available, and **refines the shape in two specific ways worth naming explicitly:**

1. **Where "Listen Only" belongs.** The prior audit implicitly left Listen-Only framing inside Support Style (as one of its 6 kept presets). This ADR places it under Conversation Style instead, because `lib/companionTonePreferences.ts:90-91` explicitly enumerates "Listen Only" as one of Conversation Style's own eight canon values — a fact only visible once the code (not just the settings UI) was traced.
2. **Support Style's final size.** The prior audit recommended keeping 6 presets (dropping only "Create My Own"). This ADR recommends 4, because the trace showed `gentle-first`, `practical-first`, `talk-it-through`, and `adaptive` are already behaviorally identical at the deterministic layer (`presentationResolver.ts:30-90`) — keeping `talk-it-through` and `give-me-choices` as separately visible rows sells a distinction the runtime does not currently deliver.

Both refinements are grounded in the same evidence cited above. Per Founder approval, this ADR's traced recommendation **supersedes** `SETTINGS_FUNCTIONALITY_AND_DUPLICATION_AUDIT.md` §4 rows 2–3 and §5 on these two specific points; the prior audit's broader direction (fewer, honest settings) stands and is not otherwise altered. No other repository standard, constitution, or binding document was found to conflict with this decision.

---

## Consequences

- Two settings replace four. No storage key, type, or engine function is deleted.
- The Immutable Friend guardrail, `THE_IMMUTABLE_FRIEND_GUARDRAIL`, and all identity-preservation code are unaffected — this ADR governs only the HOW layer beneath that guardrail, never the WHO.
- Pattern Awareness (`noticeNewPatterns`/`useSavedPatterns`) is out of scope; already addressed in a separate contained change this session.
- This record is approved. Implementation has **not** begun — Phase 1 begins as its own separate, contained change.

## Files changed (this phase)

- `docs/adr/ADR-012-unify-shari-guidance-settings.md` (this document)

## Decision Record

```
Decision:      Reduce four Shari-guidance settings (Conversation Style, Help Mode,
               Support Style, How Shari Invites Me) to two (Conversation Style — 8
               canon values; a renamed, 4-preset Support Style). Fix dual prompt
               assembly before merging. Remove Help Mode and How Shari Invites Me
               as visible controls; keep all storage/types/engines dormant.
Reason:        The canon already defines one Level-2 "HOW" axis with 8 named values
               (THE_FRIEND_WE_ALL_DESERVE.md:195; lib/companionTonePreferences.ts:90-91).
               Implementation fragmented that axis across 4 settings, then reassembles
               it at runtime in 3 separate places, producing verified duplication,
               unresolved conflicts, dead options, and 2 live correctness bugs.
               128 Constitution Rules 3, 5, 6, 15.
Date:          2026-08-05
Approved by:   Shari Hudson (Founder) — August 5, 2026
Supersedes:    SETTINGS_FUNCTIONALITY_AND_DUPLICATION_AUDIT.md §4 rows 2–3 and §5,
               where they differ from this ADR's traced recommendation — see
               "Relationship to the prior audit," above.
Related:       lib/companionTonePreferences.ts · lib/conversationStabilization/shariVoiceLayer.ts
               lib/supportStyle/* · lib/curiosityBeforeCommands/* · lib/companionPrompt.ts
               app/api/companion-chat/route.ts · app/companion/CompanionPageClient.tsx
Evidence used: Observed — full source trace, all citations file:line, produced this
               session across four parallel deep-dives plus direct verification of the
               dual prompt-assembly claim. Documented — THE_FRIEND_WE_ALL_DESERVE.md,
               128 Constitution, Spark Estate Constitution.
```

# Chamber Expertise Contribution Tests — Phase C.5

| Field | Value |
|-------|-------|
| **Status** | Implemented — precedes Phase D per founder direction |
| **Date** | 2026-08-06 |
| **Depends on** | Phase A/B/C (registry, composition function, hint wiring — all approved and live) |
| **Question this answers** | Not "is the right expert selected?" (Phase B/C) — **"does that expert actually improve the answer?"** |

---

## 1. Why this phase exists

Phase B/C proved *activation* works: the right primary/supporting experts are chosen from multiple fused signals. But activation alone doesn't guarantee **contribution** — a hint that only names "Marketing Intelligence" could still produce a generic response ("Here are some marketing ideas") that never actually reasons like a marketing expert would.

This phase closes that gap in two places:

1. **The 24 Chamber Expert Intelligence Profiles** now each declare an **Expert Thinking Pattern** — a signature move, not a job description.
2. **`chamberExpertiseHintForChat`** now surfaces that thinking pattern *and* concrete themes for every activated expert (primary and supporting), not just their names.

---

## 2. Expert Thinking Pattern (new required profile field)

Added to `docs/visual-spark-studios/Chamber-Member-Intelligence/CHAMBER_EXPERT_INTELLIGENCE_TEMPLATE.md` §2 as a **required, lead** element, answering: *"When this expert helps, what do they notice that others miss?"*

All 24 profiles now have this field (verified — see §6). Examples, exactly as the founder specified:

| Expert | Expert Thinking Pattern |
|--------|--------------------------|
| Systems | Notices friction before the founder names it. Reduces repeated decisions into a written path. Creates the repeatable route once, so willpower is never the plan again. |
| Marketing | Notices when a message is technically true but unclear to a stranger. Connects what the audience actually needs to what the offer already provides — before reaching for more channels. |
| Finance | Notices when growth is being funded by avoidance instead of margin. Protects the founder's resources before protecting the plan's ambition. |
| Momentum | Notices overwhelm before the founder calls it that. Breaks the frozen next move into a step small enough to actually take today. |

This field is now also part of the **runtime registry** (`ChamberExpertRegistryEntry.expertThinkingPattern` in `lib/chamberExpertise/types.ts`), not just documentation — it reaches the hint text, and therefore the model, every time that expert activates.

---

## 3. What changed in the hint (`chamberExpertiseHintForChat`)

**Before (Phase C v1):** named the primary/supporting/possible experts only.

```
Leading perspective: Systems Intelligence.
Also relevant: Client Relationships Intelligence, Knowledge Management Intelligence.
```

**After (Phase C.5):** each primary/supporting expert contributes its thinking pattern **and** up to 5 concrete themes drawn from its `expertiseAreas`.

```
Leading perspective: Systems Intelligence — Notices friction before the founder names it.
Reduces repeated decisions into a written path. Creates the repeatable route once, so
willpower is never the plan again. Bring in: Repeatable steps and process design,
checklist architecture, handoff design, documentation of what happens before, during,
and after the work, exception handling.

Also relevant: Client Relationships Intelligence — Notices the gap between what the
client was told and what they now expect. Repairs trust with a small honest update
before it becomes a bigger silence. Bring in: Trust building, client avatar / ICP,
journey moments and member experience, onboarding, status communication.
```

The "possible" tier stays name-only — it is deliberately the lightest-weight signal (see the Phase C preflight review's tier discussion), so it doesn't bloat the hint with themes for a merely-plausible collaborator.

**Guardrail language updated accordingly:** now explicitly forbids listing themes as a visible checklist ("do not list them as a checklist") and adds "never a generic answer that ignores these themes" to the existing no-handoff, no-announcement instructions — directly targeting the failure mode this phase exists to prevent.

---

## 4. Registry data changes to support the three worked examples

`expertiseAreas` were reordered/enriched (content only, no logic changes) so the first 5 entries for the tested experts match the founder's exact required themes:

| Expert | Top 5 `expertiseAreas` (in order) |
|--------|-----------------------------------|
| Marketing | Audience clarity · positioning · channel strategy · offer messaging and message clarity · testing and simple measurement |
| Systems | Repeatable steps and process design · checklist architecture · handoff design · documentation of what happens before, during, and after the work · exception handling |
| Client Relationships | Trust building · client avatar / ICP · journey moments and member experience · onboarding · status communication |
| Events | Attendee transformation · experience design and guest journey mapping · logistics and run-of-show planning · energy management · ADHD-friendly pacing |

---

## 5. Contribution tests (`lib/chamberExpertise/chamberExpertiseContribution.test.ts`)

All three founder-specified examples pass, plus a general quality bar suite:

| Example | Asserts |
|---------|---------|
| "I need a marketing strategy." | Hint contains audience, positioning, channel, message/messaging, testing — not `/here are (some )?marketing ideas/i` |
| "I need to create a client onboarding process." | Systems side contains repeatable, handoff, documentation, "before, during, and after"; Client Relationships side contains trust, communication, member experience/journey |
| "I want to plan a two-day ADHD business retreat." | Hint contains transformation, experience design, logistics, energy management, ADHD-friendly pacing — never collapses to `create an agenda` |
| **General quality bar** | Every activated expert's line includes a `Bring in:` themes clause (not name-only); the hint is never just `"CHAMBER EXPERTISE: <Name>."` |

**11/11 contribution tests passing.** Combined with existing suites: **40/40 total** in `lib/chamberExpertise/`.

---

## 6. Honest scope — what these tests can and cannot verify

**Can verify:** the *material handed to the model* is substantive, specific, and non-generic — the right themes are present, in the right combination, for the right expert, and the hint text itself never degrades to a bare label.

**Cannot verify:** the model's actual generated prose. These are unit tests against a deterministic string-building function, not an LLM eval harness. A model could still, in principle, receive a rich hint and write a generic reply — that failure mode is a prompt-following question for `buildCompanionSystemPrompt`/`COMPANION_SYSTEM_PROMPT` as a whole, not something `chamberExpertiseHintForChat` can guarantee on its own.

**If deeper verification is wanted later:** an LLM-graded eval (fixed prompts → model output → rubric scoring against these same five-theme lists) would be the natural next layer — out of scope for this phase, which is unit-testable hint *content* only.

---

## 7. Verification checklist (all 24 profiles)

```
$ rg -c '\*\*Expert Thinking Pattern:\*\*' docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles/*.md
```

All 24 files return exactly 1 match. `lib/chamberExpertise/chamberExpertRegistry.ts` has `expertThinkingPattern` populated for all 24 canonical IDs (enforced by the existing `assertChamberExpertRegistryIsWellFormed` + TypeScript's required-field check on `ChamberExpertRegistryEntry`).

---

## 8. Not done in this phase

- Phase D (multi-expert collaboration language) — next, per founder direction ("before Phase D")
- LLM-graded output evals (documented as future work, §6)
- Retrofitting `expertThinkingPattern` into the Estate Brain (`expertRegistry.ts`) or Phase 33 registries — those remain legacy/alias-only per the Phase A/B architecture

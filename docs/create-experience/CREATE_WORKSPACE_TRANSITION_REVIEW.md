# Create Workspace Transition — Review

**Status:** Review only, per founder instruction — no code changes.
**Trigger:** screenshots showing a fresh Checklist workspace ("Sections
start empty — we shape them together... 0 of 0 sections have content")
immediately after a full understanding conversation gathered purpose, why,
audience, existing situation, and constraints.
**Method:** every claim below is traced to actual code (file:line), not
inferred.

**The founder's principle, restated as the standard this review measures
against:** *the workspace should remember the thinking, not replace the
thinking.* Conversation → Working Memory → Living Workspace — not
Conversation → Empty Template.

---

## What's actually happening (traced, not assumed)

The understanding conversation works exactly as designed — it gathers all
five dimensions and writes them into `RuntimeCreationRecord.workingMemory`
(`desiredResult`, `whyItMatters`, `intendedAudience`, `existingAssetsFound`,
`constraints`) via the same write path the SOP gate uses. **That data is
correctly captured.** The gap is entirely on the other side: almost nothing
downstream ever reads it back.

- **"What We Already Know" exists as a mechanism** — but it only renders
  from `workflow.workspaceKnownFacts`, which is built by
  `buildCanonicalKnownFacts(sectionContent, sections)` — it reads **only
  filled-in section answers**, never `workingMemory`. For a brand-new
  Checklist with no sections answered yet, this is empty, so the whole
  block doesn't render. (What produced "This is a workshop." in earlier
  testing was a *different* code path — Event-type workspaces read
  `EventRecord` fields, not `workingMemory` either.)
- **Working Memory is write-mostly.** Across the entire component tree,
  exactly one field is ever displayed: `nextHelpfulStep`, and only as a
  short resume-card label ("Continue with X"). `desiredResult`,
  `whyItMatters`, `intendedAudience`, `existingAssetsFound`, `constraints`
  — gathered, persisted, and then read by **nothing** in production render
  code. Only tests read them.
- **Checklist's sections are static and generic.** `CHECKLIST_SECTIONS` is
  four bare `section(id, label)` entries with no authored `prompt`/`why` —
  unlike `SOP_SECTIONS`, which carries both per section. Section
  *resolution* (`resolveTemplateSections`) has no path that consults
  `workingMemory` or `discoveryAnswers` at all.
- **Current Focus's per-section questions start cold.** Every section's
  question is the generic fallback `"What belongs in ${label}? A rough
  phrase is plenty."` — with exactly one exception: the very *first*
  question prefixes the member's raw typed opening text ("You said:
  ..."). Every question after that — including all three remaining
  Checklist sections — never references why it matters, who it's for, what
  already exists, or what constraints apply, even though the conversation
  that just happened established all four.
- **"Got it — that's part of your creation now"** is real and consistently
  applied to every genuine answer (confirmed at
  `submitCurrentFocusResponse.ts:536`) — this is the one piece already
  working in Spark's voice. It's a per-answer acknowledgment, not a
  reflection of the *whole* conversation.
- **"Build a polished draft" doesn't build a draft.** It calls
  `runCreateAssistance("review_this")`, which returns a static template
  sentence keyed only on the section title and whether it has content —
  never reads Working Memory, never calls generation, never touches
  `draftContent`. The actual draft-builder
  (`buildCreationDraftFromFocus` — real generation, real persistence)
  exists in the codebase but is **called from nowhere**. This matches a
  defect a prior audit already recorded (C11) and a currently-failing guard
  test confirms it's still true today, unfixed, on this branch.

---

## Answering the four questions

**1. Should Spark continue asking discovery questions before opening the
workspace?** No — the entrance conversation should stay bounded (it
already asks the right five dimensions). The gap isn't "not enough
questions before opening" — it's that everything asked gets dropped the
moment the workspace opens. Extending the entrance further would just move
the same failure later without fixing it.

**2. Should sections be generated only after understanding purpose,
audience, situation, constraints, desired outcome?** Reframe slightly:
sections don't need to wait on all five before *existing* — Checklist's
four sections are a reasonable skeleton. What they need is to be **written
with the five already known**, the same way `SOP_SECTIONS` already proves
is possible (authored `prompt`/`why` per section, filled from context
instead of generic fallback text). The mechanism to do this already exists
for SOP; it was never extended to other Build Types.

**3. Should the workspace become a reflection of the conversation instead
of an empty structure?** Yes — and the founder's own example is the exact
right target:

```
Travel Checklist
Purpose: "Make sure I don't forget important items before my trip."
Created for: "My personal travel needs."
Important considerations: "Medication, technology, documents, ADHD-friendly
organization."
Then sections are generated from the conversation.
```

This is achievable with data that **already exists** in
`workingMemory` — the work is entirely on the render side: a real
"What We Already Know" that reads `desiredResult` / `intendedAudience` /
`whyItMatters` / `constraints` / `existingAssetsFound` directly (not just
`sectionContent`-derived facts), shown in the member's own words, before
a single section is touched.

**4. Is "Build Draft" happening too early?** Different problem than
timing — it's currently **not happening at all**. It's not that draft
generation fires prematurely; it's that the button doesn't generate a
draft. Once real draft generation is wired to the actual builder, *then*
timing becomes a live question — and the founder's instinct is right to
flag it preemptively: draft generation should wait until there's real
section content (the real builder already has this shape, since
`buildCreationDraftFromFocus` needs content to draft from) — not fire the
moment a workspace opens.

---

## Recommendation — the shape of the fix, not the implementation

Three changes, escalating in scope, each independently valuable:

1. **A real "What We Already Know."** Extend the section that already
   exists structurally — feed it `workingMemory`'s five fields directly,
   in the member's own words, rendered the moment the workspace opens,
   before any section is touched. This alone converts the founder's
   before/after example into reality with no new data pipeline — the data
   is already there.
2. **Section-aware questions.** Extend the `prompt`/`why` authoring pattern
   from `SOP_SECTIONS` to Checklist (and eventually other V1 types),
   letting each section's question reference what's already known ("Since
   this is for your own travel, let's think about what needs to come with
   you") instead of the generic fallback. This is additive per Build Type,
   same mechanism Phase 1 of the SOP work already proved.
3. **Wire the real draft builder.** Replace the `review_this` stub with an
   actual call to `buildCreationDraftFromFocus`, gated on real section
   content existing (matching the founder's "not too early" instinct) —
   this closes the C11 defect that's been outstanding since the earlier
   audit.

None of these require a new engine, new data model, or new conversation
mechanism — every piece of data needed is already flowing into
`workingMemory`; this is a rendering and prompt-authoring gap, not an
architecture gap.

---

## Evidence Matrix

- **Sources used:** `CreateEstateWorkingPanel.tsx` (what-we-know
  rendering), `creationRecord.ts` (`workspaceKnownFacts`,
  `applyDiscoveryAnswerToRuntimeCreationRecord`), `canonicalFacts.ts`
  (`buildCanonicalKnownFacts`), `createTemplates.ts` (`CHECKLIST_SECTIONS`
  vs `SOP_SECTIONS`, `resolveTemplateSections`),
  `resolveCanonicalFocus.ts` (per-section prompt fallback,
  `acknowledgeOriginalRequest`), `submitCurrentFocusResponse.ts`
  (acknowledgment variants), `CreateEstateWorkingPanel.tsx` +
  `CompanionPageClient.tsx` (Build Draft button → `runCreateAssistance` →
  `buildAssistance.ts`), `buildCreationDraft.ts`
  (`buildCreationDraftFromFocus`, confirmed zero callers),
  `legacyRuntimeRetirement.test.ts` (guard test currently failing,
  confirming C11 unfixed on this branch).
- **Confidence:** High — every claim traced to source, several confirmed
  against a live-failing test rather than inferred.

**Approval Status:** Proposed — awaiting founder direction on
implementation order (see priority list below).
**Decision Owner:** Founder.

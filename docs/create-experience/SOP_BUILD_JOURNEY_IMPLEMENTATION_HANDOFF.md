# SOP Build Journey — Implementation Handoff

**Version:** 1.1
**Status:** Planning artifact. Architectural decisions approved 2026-08-05. No code changes yet — implementation has not begun.
**Acceptance specification:** [`SOP_BUILD_JOURNEY_SPECIFICATION.md`](./SOP_BUILD_JOURNEY_SPECIFICATION.md)
**Purpose:** Translate the approved specification into a precise coding plan that reuses Spark Estate's existing architecture.

---

## Approved architectural decisions (2026-08-05)

These were open questions in v1.0. They are now settled and binding on implementation. Do not reopen them mid-build; if one proves wrong, stop and raise it.

| # | Decision | Consequence |
|---|---|---|
| **D1** | **`RuntimeCreationRecord` is the Working Memory carrier.** Extend it additively with the specification §9 fields not already derivable from section answers. | `CreationWorkspace` is **not** adopted. SOP is not routed back toward the surface ADR-013 moved it away from, and no second record per creation is created. |
| **D2** | **Research is deferred out of the SOP pilot.** No "Research This" affordance on SOP sections. | Specification §8 is explicitly unmet for this pilot and recorded as deferred, not silently narrowed. Revisit when a retrieval provider is real. |
| **D3** | **Phase 3 begins with output repair.** C11 (inert "Build a polished draft" button) and C12 (failing guard test) are fixed before any new output capability is added. | Repair is a hard gate on Phase 4 visibility. SOP must not become member-visible while a button claims work it does not do. |
| **D4** | **Section expansion (4 → 7) lands in Phase 1.** | Confirmed placement. `templateSections` is frozen per record, so any later move would strand in-flight work. |
| **D5** | **A decision gate stands before Phase 2 opens.** | Phase 2 may not begin until D1's field list is written down and agreed. Phase 2 writes member answers; the shape must be settled first. |

---

## Non-negotiables carried into every phase

- Do not create an SOP engine.
- Do not create SOP-specific architecture.
- Do not duplicate conversation, saving, research, mapping, registry, or Working Memory systems.
- SOP is **one thin Build Definition** proving the shared Spark operating model.
- Preserve one continuous conversation with Shari.
- The member never manages internal capabilities.
- Reuse before reinvention.

---

## Empirical baseline — what actually happens today

Before planning changes, the current SOP path was traced live in the running dev app (2026-08-05). This is measured behavior, not inference:

| Step | Result |
|---|---|
| Member types *"I need an SOP for how Izna records and shares a Loom video"* | Classified correctly |
| Confirm gate | Renders **"Create SOP"**, no competing alternatives |
| Confirm accepted | Opens Current Focus (not Creation Workspace — ADR-013 holds) |
| First question shown | **"What belongs in Purpose? A rough phrase is plenty."** |
| Sections rendered | Purpose, Scope, Steps *(+ Notes & Tips)* |
| Assist affordances | All six wired and working behind a "Need a hand?" disclosure: Help me think · Give me ideas · Show examples · Review this · I'm not sure · Skip for now |
| "Give me ideas" on Purpose | Works, but returns generic ideas: *"Name the change you want someone to feel or make after this."* |

**The single most important finding in this handoff:**

> SOP already runs end to end today — entry, classification, confirm, workspace, questions, save, resume — entirely through shared infrastructure. **There is no missing path. There is missing content.**

The gap between the live behavior and the specification is almost entirely *what Spark says and what it remembers*, not *how the plumbing works*. This is what makes a genuinely thin Build Definition possible, and it should discipline the entire implementation: if a phase proposes new machinery, it is probably solving the wrong problem.

Compare:

- **Today:** "What belongs in Purpose? A rough phrase is plenty."
- **Specification §5:** "Before we start writing steps, what should someone be able to complete successfully when they follow this process?"

That difference exists because `CreateTemplateSection` is `{ id, label }` — there is nowhere to put an authored question. The prompt is auto-derived from the label at [`resolveCanonicalFocus.ts:183`](../../lib/currentFocus/resolveCanonicalFocus.ts).

---

## 1. Existing systems to reuse

Every item below was verified to exist and be wired. Nothing here should be rebuilt.

### Entry and classification
| System | File | Reuse |
|---|---|---|
| Free-text intent resolution | `lib/createEstate/resolveCreateBeginOutcome.ts` | Already returns SOP for natural language |
| Confirm-before-create gate | `CreateEstateEntrancePanel.tsx` · `createIntentConfirmation.ts` | Preserve exactly; never bypass |
| ADR-013 routing boundary | `lib/creationWorkspace/openDecision.ts` | Single artifacts → Create/Current Focus |
| Registry → confirm shape | `lib/createRegistry/confirmAdapter.ts` | Built Phase 1 of registry work; still unwired |

### Conversation runtime — the largest reuse surface
| System | File | Reuse |
|---|---|---|
| **Question engine** | `lib/currentFocus/resolveCanonicalFocus.ts` | Selects next unanswered, unskipped section. This *is* the guided conversation. |
| Non-linear section entry | `focusFromActiveSection()` (077) | Member may open any section in any order, already supported |
| Sole submission path | `lib/currentFocus/submitCurrentFocusResponse.ts` | Durable-verified before advancing |
| Response types | `lib/currentFocus/types.ts` | Includes `unsure`, `ideas`, `skip` — the non-form affordances |
| Assist UI | `components/companion/CurrentFocusInteraction.tsx` | Six affordances behind progressive disclosure |
| Section ideas | `lib/currentFocus/sectionIdeas.ts` → UWE `sectionRuntime/sectionIdeas` | Mechanism works; catalog is per-work-type |
| Fallback ideas | `IDEAS_BY_SECTION` in `submitCurrentFocusResponse.ts` | Already keyed for `purpose` and `steps` |

### Build Definition (sections)
| System | File | Reuse |
|---|---|---|
| Template registry | `lib/createTemplates.ts` → `PRESET_TEMPLATES` | `sop-default` keyed by `itemType: "SOP"` |
| Selection chain | `defaultTemplateFor()` → `resolveTemplateSections()` | `resolvedTypeLabel` "SOP" resolves automatically |
| Section rendering | `lib/createWorkspaceSections.ts` → `workspaceV2Sections()` | Drives both display and question order |
| Supporting-output templates | `Training Guide`, `Checklist` presets | Already exist; both are named SOP outputs |
| Member templates | `saveCustomTemplate()` / `loadCustomTemplates()` | "My Templates" — deferred, but exists |

### Save, durability, resume
| System | File | Reuse |
|---|---|---|
| Durable persist | `lib/creationDurable/` → `persistCreationFocusAnswer`, `persistCreationDraft` | Supabase-verified read-back |
| Truthfulness gate | `lib/trustKernel` → `authorizeCreationEgress` | Never claims success without evidence |
| Runtime record | `lib/currentFocus/creationRecord.ts` → `RuntimeCreationRecord` | localStorage + memory; schema frozen per record |
| Canonical facts | `lib/currentFocus/canonicalFacts.ts` | Derived member-visible context |
| Error classification | `classifyCreationDurableWriteError` | Fixed earlier this session |
| Resume eligibility | `lib/resumeWorkSignals.ts` · `resumeWorkEligibility.ts` · `continuityManifest.ts` | `active-creation` restored earlier this session |
| Continuity snapshot | `persistCreationContinuitySnapshot` · `focusRecoveryBuffer.ts` · `hydrate.ts` | |

### Output
| System | File | Status and reuse |
|---|---|---|
| **Assemble** | `lib/universalWorkEngine/sectionRuntime/assembleWork.ts` → `assembleWorkFromWorkflow` | **Real and wired.** Reached by `completeItNow()` from the "Assemble the full piece" button (`CreateEstateWorkingPanel.tsx:698`). Deterministic concatenation of member content — no LLM. Reuse as-is. |
| Staleness marking | `markAssembledOutputStale` | Fires on every section edit |
| Brief assembly | `buildWorkspaceV2Brief()` · `buildFullCreateBrief()` | The injection point for SOP knowledge if generation is added |
| LLM generation | `/api/generate` | **Real, but not on the Current Focus path.** Reached only from `ContentGeneratorPanel` and chat readiness. |
| `buildCreationDraftFromFocus` | `lib/currentFocus/buildCreationDraft.ts` | **Exists but has zero production callers** — verified. Do not assume it runs. |
| In-place transform | `/api/refine` (`refine \| rewrite \| simplify \| break-down \| modify`) | Real, but **overwrites** the text. Basis for polish only if made non-destructive. |
| Export / print | `ExportActions.tsx` · `buildDownloadArtifact.ts` (`txt/md/csv/pdf/docx`) | Real; mounted for Create via `CreateWorkCommandToolbar` |
| Title promotion | `humanReadableIdentity.ts` | |

### Connections
| System | File | Reuse |
|---|---|---|
| Project linkage | `activeWorkspaceRegistry` → `projectHomeId` | Field exists end to end |
| Connected assets | `lib/connectedAssetEditor/connectionBundle.ts` | |
| Registry intent | `canBecomeProject: true` on the `sop` item | |

---

## 2. Current conflicts with the approved SOP experience

| # | Conflict | Evidence | Severity |
|---|---|---|---|
| C1 | Sections do not match the Knowledge Finger | `SOP_SECTIONS` has 4 (Purpose, Scope, Steps, Notes & Tips); spec requires 7. Missing: **Intended User, Before You Begin, Completion Check, Troubleshooting** | High — these four are what make an SOP usable by someone else |
| C2 | Questions are auto-derived, not authored | `CreateTemplateSection = { id, label }`; prompt built as `` `What belongs in ${label}?` `` | High — this is the "feels like a form" root cause |
| C3 | Registry declares the wrong builder | `builderType: "structured-form"` on the `sop` item vs Constitution "Guided Builds should never feel like completing forms" | High — declared intent contradicts required experience |
| C4 | **Research has no retrieval capability** | `liveRetrieval` hardcoded `null` (`ResearchLibraryPanel.tsx:75`); `getLiveResearchProviderStatus()` hardcoded `false`; UWE research functions are a paste-in state machine over an in-memory `Map` with no product callers | **Critical — see phase-order conflicts** |
| C5 | Working Memory does not exist as a system | No `workingMemory` identifier anywhere. `runCoreMemory` is dead code. `EstateMemory` is **sessionStorage** (does not survive a browser session) | High |
| C6 | The record with the right fields is the one SOP does not use | `CreationWorkspace` has `purpose`, `intendedAudience`, `primaryOutcome`, `missingPieces` — but ADR-013 routes single artifacts *away* from Creation Workspace, and it is not linked to `RuntimeCreationRecord` | High — architectural fork, must be decided before Phase 2 |
| C7 | Polish does not exist; Assemble does | `assembleWorkFromWorkflow` is real and wired. But there is one output body — no `polishedContent`/`polishedDraft`/`refineDraft` symbol anywhere. `/api/refine` **overwrites** in place | Medium |
| **C11** | **"Build a polished draft" is a live inert button** | `CreateEstateWorkingPanel.tsx:707` shows "Build a polished draft" / "Building your draft…". Its handler (`CompanionPageClient.tsx:27986`) calls `runCreateAssistance(..., "review_this")`, which returns a **hardcoded guidance sentence**. `draftContent` is never touched. `buildCreationDraftFromFocus` has **zero callers** | **Critical — shipping truthfulness violation on the exact path SOP uses** |
| **C12** | **The guard test for that wiring is failing** | `legacyRuntimeRetirement.test.ts:123` asserts `CompanionPageClient.tsx` contains `"buildCreationDraftFromFocus"`. The string is absent. Confirmed failing (3 failures in that file, pre-existing — this tree has no code changes) | High — a regression guard fired and was tolerated |
| C8 | Assembly carries no Build Type knowledge | Assemble is pure concatenation; `/api/generate` (not on this path) interpolates `type` into a generic prompt | Medium |
| C9 | Ideas are generic for SOP | Ideas catalogs live on UWE work-type packages; SOP has none, so `workTypeId` is null. Verified live: Purpose ideas returned "Name the change you want someone to feel" | Medium |
| C10 | Phantom work-type id | `sop` resolves via `resolveWorkTypeIdFromMemberLabel` but is never registered — silent degradation, not a throw | Low — do **not** fix by registering a UWE package |

---

## 3. Required changes

Ordered by phase. Each is an extension of something existing.

**R1 — Extend `CreateTemplateSection`** with optional authoring fields (`prompt?`, `why?`, `placeholder?`). Additive and backward compatible: every existing template keeps working, and `resolveCanonicalFocus` prefers `section.prompt` when present, falling back to today's derived string. *This one change is what turns the form into a conversation, for every Build Type — not just SOP.*

**R2 — Replace `SOP_SECTIONS` with the Knowledge Finger's seven sections**, each carrying an authored prompt drawn from the already-approved question sequence.

**R3 — Correct `builderType`** on the `sop` registry item from `structured-form` to `guided-conversation`.

**R4 — Extend `RuntimeCreationRecord` with the Working Memory fields** (D1 approved; field list and gate in §10). Additive and optional only.

**R5 — Inject SOP knowledge into the brief**, not the route: extend `buildWorkspaceV2Brief` (or supply Build-Definition guidance alongside it) so `/api/generate` receives SOP completion criteria and beginner-gap awareness. No API change.

**R6 — Separate assembled from polished output** — a second stored field plus an explicit member action. The assembled version must remain available.

**R7 — Add SOP section-level ideas** via the same section authoring as R1, without creating a UWE package.

**R8 — Flip verification flags and visibility** only after a live end-to-end run passes route, save, reopen, and required-actions checks.

---

## 4. Explicit non-changes

These must **not** happen during this pilot. Each is listed because it is a plausible temptation.

- **No SOP engine, runtime, store, or package.** Do not create `lib/sop/` or `lib/universalWorkEngine/packages/sop/`.
- **Do not register `sop` as a UWE work type** to fix C9 or C10. That would convert a thin Build Definition into a fifth parallel stack.
- **Do not modify `/api/generate`** to special-case SOP. Knowledge enters through the brief.
- **Do not touch ADR-013**, `openDecision.ts`, or the confirm gate.
- **Do not build a new persistence path.** `lib/creationDurable/` is the only durable writer.
- **Do not build a research retrieval provider** as part of this pilot (see phase-order conflict B).
- **Do not wire Browse Categories to the registry.** That is a separate, later phase.
- **Do not make any other registry item visible.** Only `sop` is in scope, and only at the end.
- **Do not add a new taxonomy, category system, or artifact type.**
- **Do not create Member Journey objects.** Completion bridges (Gallery, Evidence) belong to that layer and are out of scope.
- **Do not expose registry ids, lifecycle status, builder type, or work-type ids to the member.**

---

## 5. Registry and Build Definition connection

The `sop` registry item (`lib/createRegistry/items.v1Priority.seed.ts`) and the `sop-default` template (`lib/createTemplates.ts`) are today **two unconnected descriptions of the same thing**. The registry entry already declares `dependencies: ["lib/createTemplates.ts#SOP_SECTIONS"]` — an intent that nothing enforces.

**The Build Definition for this pilot is the section list plus its authored prompts.** That is the entire domain-specific payload. Everything else is shared.

Connection approach, in reuse order:

1. **Phase 1 — declare, don't rewire.** Keep `defaultTemplateFor("SOP")` as the runtime source. Add a test asserting the registry item and the template agree (same id, same section count). This makes the existing `dependencies` claim real without introducing a new lookup at runtime.
2. **Later, out of scope —** when Browse Categories migrates, the registry becomes the runtime source and `registryItemToConfirmShape()` carries it into the confirm gate.

Rationale: making the registry the runtime source *now* would couple the pilot to the unstarted Browse migration and put a hidden, unverified item on a live path. The specification's own visibility gate forbids that.

---

## 6. Natural language entry experience

**Verified working. Changes needed: none.**

The member types what they are actually thinking. The trace above confirms `"I need an SOP for how Izna records and shares a Loom video"` reaches a correct SOP confirm without the member choosing a category, template, or builder.

Two requirements to protect:

- **Recognition without vocabulary.** Specification §2 requires phrases like *"I keep explaining the same thing"* and *"I need to train Izna"* to reach SOP. These need a test pass; today's matching is term-based (`searchTerms: ["sop", "standard operating procedure", "procedure", "workflow doc"]`), so outcome-shaped language may fall through to clarify. **Falling through to a clarify question is acceptable** — silently creating the wrong thing is not.
- **Confirm gate stays.** The member always sees "Create SOP" before anything is created.

---

## 7. How guided questions work without becoming a form

This is the heart of the pilot, and the mechanism already exists.

**How it works:** `resolveCanonicalCurrentFocus` returns exactly one focus at a time — the next section that is neither answered nor skipped. The member sees one question. `focusFromActiveSection` lets them jump to any section instead. Answers persist per section, and the next question is recomputed from state, never from a step counter.

**Why it currently feels like a form:** the question text is generated from the section label. "What belongs in Purpose?" is a field label with a question mark.

**The fix is content, not machinery** — R1 plus R2. With authored prompts, the same engine produces:

| Section | Authored prompt (from the approved Knowledge Finger) |
|---|---|
| Purpose | "What should someone be able to accomplish after following this SOP?" |
| Intended User | "Who will be using these instructions?" |
| Before You Begin | "What should they already have before beginning?" |
| Step-by-Step | "What happens first?" |
| Completion Check | "How will they know they did it right?" |
| Troubleshooting | "What usually goes wrong?" |

Non-form guarantees already implemented and verified: *I'm not sure* · *Give me ideas* · *Skip for now* · *Show examples* · *Review this* · *Help me think*, all behind a "Need a hand?" disclosure so the default screen stays calm. Answers are never required to advance, and skipping is first-class (`responseType: "skip"`).

**Gentle intervention (specification §10)** is *not* required for the pilot to pass. It is the natural next layer once authored prompts exist, and is listed under deferred work rather than faked with keyword matching.

---

## 8. When maps appear and how they evolve

**Recommendation: no map in this pilot.**

First, a distinction that must not be blurred — the codebase has **two unrelated things called "map":**

| | **Visual Focus maps** | **Workshop Map / `mapGroups`** |
|---|---|---|
| What | Real node/edge mind maps, 13 modes | An accordion that *groups section headings* |
| Where | `lib/visualFocus/**`, `lib/cartographersStudio/**` | `blueprints/mapGrouping.ts`, `packages/*/[type]MapGroups.ts` |
| Storage | localStorage `companion-visual-focus-maps-v1` | None — derived at render |
| Linkable to a creation? | **No** — `VisualFocusMap` has no `workId`/`creationId` field, and `CreateWorkflowState` has no map id field | N/A |

The specification's §7 map (stages, decision points, handoffs, failure paths) means the **first** kind. That system is entirely standalone: nothing reads a creation record and produces a map, and map generation is deterministic heuristics with zero LLM involvement.

**Therefore:** an SOP map would require either linking two currently-unlinked record systems, or a UWE package (forbidden, §4), or a new generic mapping layer (new architecture, forbidden). All three violate the non-negotiables to satisfy an explicitly optional requirement.

**Phase 1 side effect, checked and clear:** growing SOP from 4 to 7 sections crosses `DEFAULT_GROUP_MAP_THRESHOLD = 6`. It does **not** change rendering — `shouldUseGroupedMap` returns `false` when no `mapGroups` are defined, and SOP has none. The seven sections render as a flat list. Verified in `mapGrouping.ts:32-41`.

The honest evolution path, deferred: when a generic "map from sections" capability exists for *all* Build Types, SOP inherits it, because `focusFromActiveSection` (077) already accepts any `activeSectionId` — section-click navigation is the one piece already proven.

---

## 9. Research activation and storage

**Decision D2 (approved): research is out of scope for this pilot. The "Research This" affordance must not be offered on SOP sections until retrieval exists.**

This is the most consequential finding in the handoff, and it is a trust question rather than a scope question.

What was verified:

- `liveRetrieval` is hardcoded `null`; the "Research with Sources" path always returns the unavailable notice.
- `getLiveResearchProviderStatus()` returns `liveResearchAvailable: false` unconditionally.
- The UWE research functions (`createResearchRecord`, `approveResearch`, `applyApprovedResearch`) are a status state machine over an in-memory `Map`, with no product callers and no persistence.
- The only outbound network call in the research area is an OpenAI completion for avatar expansion — generation, not retrieval.
- `researchSelectedWorkspaceArea` generates hardcoded boilerplate findings.

**Why this matters more for SOP than for any other Build Type:** the canonical SOP scenario is *current Loom recording and sharing steps*. The Knowledge Finger's own research triggers are "software changes frequently," "official procedures matter," "permissions affect success." Offering research here would return model-recalled UI steps with no citation and no currency — presented inside a document whose entire purpose is that someone can follow it *without asking*. A member would ship confidently wrong instructions to a new hire.

That directly violates the Constitution's *Research Must Lead to Action* and *Trust Is Everything*, and the specification's rule that Spark "must never claim an action succeeded unless it did."

**Storage, when research does arrive:** reuse `lib/researchLibrary/persistence.ts` (already localStorage-backed with collection and session shapes) and the existing approval flow — add below / combine / replace / save separately / cancel. Do not build SOP-specific research storage.

---

## 10. Working Memory requirements

**There is no Working Memory system to reuse.** This is a genuine gap, not a wiring problem — the only named memory engine is dead code, and `EstateMemory` uses sessionStorage, so it does not survive a browser session.

What already satisfies part of specification §9, via section answers:

| §9 field | Already covered by |
|---|---|
| SOP name | `RuntimeCreationRecord.title` |
| Purpose | Purpose section answer |
| Intended user | Intended User section answer *(after R2)* |
| Captured steps | Step-by-Step section answer |
| Current stage | `focusSectionId` / `currentFocusTitle` |
| Member's own words | `originalRequest` |
| Derived context | `canonicalFacts` / `knownFacts`, surfaced as `knownContext` |
| Connected Project | `projectHomeId` |

Genuinely missing: **desired result** (distinct from purpose), **open questions**, **decisions**, **research used**, **people responsible**, **dependencies**, **external document link**, **next helpful step**, **why it matters**.

### The C6 fork — resolved by D1

Two carriers existed and were not linked:

- **`RuntimeCreationRecord`** — what SOP actually uses. Section answers plus facts. Missing the reasoning fields.
- **`CreationWorkspace`** — has `purpose`, `intendedAudience`, `primaryOutcome`, `intendedUse`, `missingPieces`, `researchStatus`. But ADR-013 deliberately routes single artifacts *away* from Creation Workspace.

**Decision D1 (approved): extend `RuntimeCreationRecord` additively.** Adopting `CreationWorkspace` would either re-route SOP back into the surface ADR-013 just moved it out of, or create a second record per creation — the duplicate-system risk the non-negotiables forbid. Extension keeps one record, one save path, and one resume path.

**Field list to agree at the Phase 2 gate (D5).** These are the §9 fields not already covered above. All optional, all additive, so existing records hydrate unchanged:

| Field | Why it is not already covered |
|---|---|
| Desired result | Distinct from purpose — what the *reader* achieves, not why the SOP exists |
| Open questions | Nothing today records "we still don't know X" |
| Decisions | Why a step is ordered this way; lost entirely on resume today |
| People responsible | Owner/performer/reviewer, when named in conversation |
| Dependencies | Tools, permissions, prerequisites surfaced but not yet sectioned |
| Next helpful step | `focusSectionId` gives location, not the human next action |
| Why it matters | The urgency behind the SOP; shapes tone and completeness |
| External document link | Where the real procedure lives, if elsewhere |

Research-used is **excluded** per D2 — recording a field for a capability that does not exist would be architecture ahead of need.

**Gate condition:** Phase 2 does not open until this list is confirmed or amended. Fields must be optional; `lib/creationDurable/mapping.ts` carries them into the durable payload additively; a hydrate test must prove records saved without them still open.

---

## 11. Save, leave, and exact resume behavior

**Largely working. Reuse everything.**

Verified in place: durable Supabase write with read-back verification; `authorizeCreationEgress` refuses to claim success without evidence; the member's words are preserved on every failure path with Retry available; `active-creation` appears in Continue Where I Left Off; `templateSections` and `schemaVersion` persist so resume never re-derives structure.

Two behaviors to add or verify:

- **Next helpful step** — the specification requires the member to see *"Next: Review the sharing steps"*, not just a resume link. `currentFocusTitle` exists on the record; the continuation card should surface it.
- **Reasoning context on resume** — depends entirely on R4.

### Schema-freeze warning (affects phase order)

`ensureRuntimeCreationRecord` stores `templateSections` per record, and `mergeRuntimeRecordIntoWorkflow` prefers the **record's** stored sections over the workflow's. This is deliberate (072 — "never re-derive on resume") and correct.

**Consequence:** any SOP started before the 4→7 section change keeps four sections forever. The section change must land in **Phase 1, before any member or test member starts an SOP** — otherwise Phase 2 inherits stranded in-flight records and needs a migration that this pilot has no mandate to write.

---

## 12. Draft output vs polished output separation

This section was rewritten after direct verification overturned an initial assumption. The corrected picture:

**Assemble is real.** "Assemble the full piece" (`CreateEstateWorkingPanel.tsx:698`) → `completeItNow()` → `assembleWorkFromWorkflow` produces the output body by **deterministic concatenation** of the member's own section content, in map order, and writes it to `draftContent`. No LLM, no rewriting. This is exactly what the specification wants from Assemble — *"combine completed sections while preserving the user's meaning and decisions"* — and it already behaves correctly. **Reuse it unchanged.**

**Polish does not exist.** There is one output body. No `polishedContent`, `polishedDraft`, or `refineDraft` symbol exists anywhere. The nearest capability, `/api/refine`, **overwrites** the text in place — which is precisely the failure the Constitution forbids: *Spark must never silently change the member's intent.*

**And there is a live defect in between (C11).** Sitting directly beside the working Assemble button is a second button labeled **"Build a polished draft"** (`:707`), which shows "Building your draft…" while running. Its handler calls `runCreateAssistance(..., "review_this")` and returns a hardcoded sentence. It generates nothing and writes nothing. `buildCreationDraftFromFocus` — the function that would do the work — has **zero callers**, and the guard test asserting its wiring (C12) is failing.

This is not a gap to fill later. It is a member-facing promise that is not kept, on the exact screen the SOP pilot runs through, and it violates the specification's own rule that *no action is claimed as successful unless it actually succeeded.*

**Required (R6), revised:**
1. **Resolve C11 first** — either wire the button to something real or remove it. A button that lies is worse than a missing feature, and it must not survive into Phase 4 when SOP becomes visible.
2. **Add a separate polished field.** Never overwrite `draftContent`. The assembled version stays reachable at all times.
3. **Make polish explicit and optional** — never automatic, never on save.
4. **Fix or retire the failing guard (C12)** rather than leaving a red test as documentation.

**Knowledge injection (R5)** belongs with assembly: because Assemble is pure concatenation, SOP expertise cannot reach the output through it at all today. Either the polish step carries the Knowledge Finger's completion test (*could a beginner do this unaided?*), or generation is wired through the existing brief builders. Whichever is chosen, it happens through existing seams — not by special-casing `/api/generate`.

---

## 13. Connections to Projects, people, calendar, assignments, checklist, external documents

**Structural support exists; surfacing does not.** `projectHomeId` flows through `activeWorkspaceRegistry`, `connectionBundle`, and `continuityManifest`. The registry item already declares `canBecomeProject: true`.

For this pilot, connections stay **minimal and honest**:

- **In scope:** offer a Project connection *after* the draft exists, never before. Reuse `projectHomeId`. If the connection fails, say so — never report success unattempted.
- **In scope:** offer the existing **Checklist** template as a supporting output, since both the Knowledge Finger and the Activation Matrix name it, and the template already exists.
- **Deferred:** owner, reviewer, due date, training date, review date, calendar follow-up, external document link, version history. These are specification §11 "optional, at the right time" fields — real, but not what the pilot is proving, and adding them early risks recreating the setup form the specification forbids.

---

## 14. Tests proving success

Reuse the existing patterns: static certification tests for structure, unit tests for logic, jsdom component tests for interaction, and a live browser pass for truth. Baseline discipline stays as used all session — `git stash` to separate pre-existing failures from regressions.

| Test | Proves | Phase |
|---|---|---|
| SOP template has the 7 Knowledge Finger sections, in order | C1 closed | 1 |
| Every SOP section carries an authored prompt | C2 closed | 1 |
| Existing templates without prompts still resolve (backward compatibility) | R1 is additive | 1 |
| Registry `sop` item and `sop-default` template agree | §5 connection real | 1 |
| Registry `sop` declares `guided-conversation` | C3 closed | 1 |
| `sop` still computes as not user-visible | Visibility gate honored | 1 |
| First focus prompt is the outcome question, not "What belongs in Purpose?" | Specification §5 | 2 |
| One question at a time; no multi-field render | Specification §6 | 2 |
| Skip / unsure / ideas leave the member on the same focus and never advance falsely | Non-form guarantee | 2 |
| Member can open any section out of order | Non-linear work | 2 |
| Outcome-shaped language ("I keep explaining the same thing") reaches SOP or an honest clarify — never a wrong silent create | Specification §2 | 2 |
| Assembled output preserves member wording verbatim | Ownership | 3 |
| Every visible output button performs what its label promises | **C11 closed** | 3 |
| `legacyRuntimeRetirement.test.ts` passes, or is corrected to assert reality | **C12 closed** | 3 |
| Polished version is separate; assembled remains reachable and unmodified | C7 closed | 3 |
| Draft/polish failure preserves answers and offers Retry | Existing contract holds | 3 |
| Resume restores exact section, answers, and next step | Specification §12 | 4 |
| Working Memory fields survive reload | R4 | 4 |
| `active-creation` for an SOP appears in Continue Where I Left Off | Regression guard | 4 |
| No SOP-specific engine, store, or UWE package was created | Non-negotiables | every phase |

**Live browser pass, every phase:** the Izna Loom scenario end to end — type it, confirm, answer, leave, return, resume, draft. Screenshots or DOM evidence, not assertions of belief.

---

## 15. Deferred work

Named honestly so it is not mistaken for done:

| Deferred | Why | Revisit |
|---|---|---|
| Research activation | No retrieval capability exists (C4) | When a retrieval provider is real |
| Visual map for SOP | Would require a UWE package or new mapping layer | When generic section-mapping exists for all Build Types |
| Gentle intervention (§10) | Needs authored prompts first; keyword-matching it would be worse than absent | After Phase 2 proves the conversation |
| Assignment fields (§11) | Risks recreating a setup form | After the pilot |
| Supporting outputs beyond Checklist | Training Guide template exists but is unproven for this path | After Phase 3 |
| Browse Categories → registry | Separate approved phase | After the pilot |
| Other 6 V1 Build Types | Must inherit a proven pattern | After SOP is certified |
| Member Journey completion bridge | Different layer | Owned by Member Journey |
| Retiring `createParentTypes.ts` / `createCatalogData.ts` | `intentStabilizer.ts` dependency must be re-homed first | Separate phase |

---

# Phases

## Phase 1 — Experience Foundation

**Goal:** Make the Build Definition match the approved specification, before any member data is written against the old shape.

**Includes the 4 → 7 section expansion (D4 approved).** This is deliberately *not* in Phase 2. `ensureRuntimeCreationRecord` freezes `templateSections` per record and `mergeRuntimeRecordIntoWorkflow` prefers the record's stored copy on resume — so any SOP created before this change keeps four sections permanently. Expanding here means no record is ever created against the old shape and no migration is needed.

**Files involved**
- `lib/createTemplates.ts` — `SOP_SECTIONS`, `sop-default`
- `lib/createWorkflowState.ts` — `CreateTemplateSection` type
- `lib/createTemplateEditOptions.ts` — duplicate type declaration, keep in sync
- `lib/currentFocus/resolveCanonicalFocus.ts` — prefer authored prompt
- `lib/createRegistry/items.v1Priority.seed.ts` — `builderType`
- New test file under `lib/createEstate/` or `lib/createRegistry/__tests__/`

**Reuse points:** the entire selection chain (`defaultTemplateFor` → `resolveTemplateSections` → `workspaceV2Sections` → `resolveCanonicalCurrentFocus`) is untouched. Only its input data changes.

**Behavior:** an SOP opens with seven sections and asks the outcome question first. Every other Build Type is unchanged.

**Risks**
- Two `CreateTemplateSection` declarations exist (`createWorkflowState.ts`, `createTemplateEditOptions.ts`). Diverging them causes confusing type errors. Extend both or consolidate.
- Adding a required field would break every existing template — the new fields must be optional.
- Section-id changes affect `IDEAS_BY_SECTION` keys (`purpose`, `steps` already match — preserve those ids).
- *Checked and clear:* 7 sections crosses `DEFAULT_GROUP_MAP_THRESHOLD = 6`, but grouping requires `mapGroups`, which SOP has none of. Sections render flat. No action needed.

**Tests:** rows 1–6 of §14.

**Browser journey:** open Create → type the Izna Loom request → confirm → observe seven sections and the outcome question as the first prompt.

**Acceptance criteria**
- Seven Knowledge Finger sections, in order, with authored prompts.
- First prompt matches specification §5.
- All existing templates still resolve; no other Build Type's questions change.
- `sop` remains not user-visible.
- No new engine, store, or package.

**Commit boundary:** one commit — section schema, type extension, prompt preference, registry `builderType` correction, and tests. These ship together because splitting them leaves the registry describing a builder that does not match the template.

---

## Phase 2 — Conversation Slice

> ### ⛔ Decision gate (D5) — Phase 2 does not open until this passes
>
> Phase 2 is the first phase that writes member answers into the extended record shape. Before the first line of Phase 2 code:
>
> 1. The D1 field list (§10) is **confirmed or amended in writing**.
> 2. Every new field is **optional** — no required field may be added to `RuntimeCreationRecord`.
> 3. The `lib/creationDurable/mapping.ts` change is agreed as **additive only** (it affects every creation type, not just SOP).
> 4. A hydrate test is written **first**, proving records saved without the new fields still open cleanly.
>
> If any of these is unsettled, stop and raise it rather than proceeding on assumption. Retrofitting a record shape after members have real data is the one mistake this pilot cannot cheaply undo.

**Goal:** Prove the conversation is a conversation, on a record shape that can hold what the conversation learns.

**Files involved**
- `lib/currentFocus/creationRecord.ts` — `RuntimeCreationRecord` extension (R4)
- `lib/creationDurable/mapping.ts` — carry new fields into the durable payload
- `lib/currentFocus/submitCurrentFocusResponse.ts` — `IDEAS_BY_SECTION` entries for new SOP sections
- `lib/currentFocus/resolveCanonicalFocus.ts` — surface next helpful step
- Section ideas authoring (R7), alongside the prompts from Phase 1

**Reuse points:** submission, durability, trust gate, assist affordances, non-linear navigation — all unchanged.

**Behavior:** the member answers one question at a time, may skip or say "I'm not sure" without penalty, may jump sections, and gets SOP-shaped ideas rather than generic ones. Context accumulates on the record.

**Risks**
- Extending `RuntimeCreationRecord` touches the mapping into Supabase; new fields must be optional so existing rows hydrate cleanly. Covered by the gate above.
- `mapping.ts` changes affect every creation type, not just SOP — additive only.
- Ideas authoring must not drift into a UWE package.
- Research fields must **not** be added speculatively (D2). Do not create a `researchUsed` field for a capability that does not exist.

**Tests:** rows 7–11 of §14, plus a hydrate test for records saved without the new fields.

**Browser journey:** answer Purpose → skip Scope-equivalent → jump to Troubleshooting → return → confirm nothing was lost and no question repeated.

**Acceptance criteria**
- One question at a time; never a multi-field form.
- Skip and unsure never falsely advance.
- Out-of-order section entry works.
- New context fields persist and survive reload.
- Old records without the new fields still open.

**Commit boundary:** two commits — (a) record + mapping extension with hydrate tests, (b) conversation content (ideas, next-step surfacing). The data shape lands first so the second commit has somewhere to write.

---

## Phase 3 — Output

**Goal:** Repair what is already broken, then produce something implementable.

**Opens with output repair (D3 approved).** The first commit fixes C11 and C12 — no new output capability is added until every visible button performs what its label promises. This ordering is deliberate: repairing a broken promise outranks adding a new feature, and C11 is a hard gate on Phase 4 visibility.

**Files involved**
- `components/companion/CreateEstateWorkingPanel.tsx` — the two output buttons (`:698` assemble, `:707` the inert one)
- `app/companion/CompanionPageClient.tsx:27986` — the `onBuildDraftInFocus` handler
- `lib/currentFocus/buildCreationDraft.ts` — currently unwired
- `lib/currentFocus/creationRecord.ts` — separate polished field (R6)
- `lib/universalWorkEngine/sectionRuntime/assembleWork.ts` — **read only; reuse unchanged**
- `lib/currentFocus/legacyRuntimeRetirement.test.ts` — failing guard (C12)

**Reuse points:** `assembleWorkFromWorkflow` / `completeItNow` unchanged — it already preserves member wording exactly. Durable persist unchanged. Export/print unchanged. `/api/generate` and `/api/refine` unchanged.

**Behavior:** Assemble produces the member's own content, organized. Polish produces a **separate** improved version. Both remain reachable, and no button claims anything it did not do.

**Risks**
- **Highest ownership risk in the pilot.** If polish writes into `draftContent`, the member's wording is destroyed. `/api/refine` overwrites by default — using it as-is would do exactly this. The new field must be additive.
- **C11 is a live trust defect, not a feature gap.** Resolving it is a prerequisite for Phase 4, not optional cleanup.
- C12 means a red test currently stands in for documentation. Fix the wiring or fix the assertion — do not leave it red.
- Assemble is pure concatenation, so SOP knowledge cannot reach the output through it. Decide deliberately where knowledge enters.

**Tests:** rows 12–16 of §14, plus an explicit regression test that polishing does not mutate the assembled content.

**Browser journey:** answer enough sections → Assemble the full piece → confirm the output is the member's own words organized under the seven headings → polish → confirm two distinct versions exist and the assembled one is byte-identical to before.

**Acceptance criteria**
- Assembled output preserves the member's wording and decisions verbatim.
- Polished version is separate, optional, and never automatic.
- No output button promises an action it does not perform.
- `legacyRuntimeRetirement.test.ts` passes or asserts reality.
- The assembled SOP contains intended user, prerequisites, ordered steps, a completion check, and troubleshooting.

**Commit boundary:** three commits — (a) resolve C11/C12 (honest buttons), (b) polished-version separation, (c) knowledge injection. (a) ships first because it fixes something already wrong rather than adding something new.

---

## Phase 4 — Continuity

**Goal:** Prove the member can leave and come back to exactly where they were — then, and only then, make SOP visible.

**Files involved**
- `lib/creationDurable/hydrate.ts` — restore new context fields
- `lib/resumeWorkSignals.ts` · `resumeWorkEligibility.ts` — verify SOP eligibility
- `components/companion/CreateWorkspaceResumeList.tsx` — next helpful step on the card
- `lib/createRegistry/items.v1Priority.seed.ts` — verification flags and lifecycle

**Reuse points:** the entire resume stack. `active-creation` eligibility was already restored earlier this session.

**Behavior:** an unfinished SOP appears in Continue Working with a real next step. Reopening restores the exact section, every answer, and the accumulated context. No question is asked twice.

**Risks**
- **Visibility is irreversible in perception.** Flipping `lifecycleStatus` to `ready` before a genuine live pass would put an unproven build in front of members — the exact failure the registry's gate exists to prevent.
- Flags must reflect *verified* reality, not intent. `reopenVerified` requires an actual reopen.
- Hydrating older records must not crash on missing fields.

**Tests:** rows 15–17 of §14, plus a full-cycle integration test: create → answer → leave → hydrate → resume → draft.

**Browser journey:** the complete Izna Loom scenario across a full reload — start, answer two sections, navigate away, return via Continue Working, verify exact restoration, then finish and draft.

**Acceptance criteria**
- Resume restores exact section, answers, and context.
- Next helpful step is shown, not just a link.
- Nothing is re-asked.
- All four verification flags set only after a real live pass.
- `computeIsUserVisible` returns true for `sop` **only** once every flag is genuinely earned.

**Commit boundary:** two commits — (a) continuity restoration and tests, (b) the visibility flip, alone, with the live evidence recorded in the message. The flip is a product decision and must be separable and revertible.

---

# Architectural conflicts that should change the phase order

Five findings affect sequencing. Three change it.

### A. Section schema must move earlier — **changes the plan** *(resolved by D4)*
`templateSections` is frozen per record by design (072), and the record's copy wins on resume. Any SOP created before the 4→7 change keeps four sections permanently. If the section change sits in Phase 2 ("Conversation Slice"), Phase 1 testing creates stranded records and Phase 2 inherits a migration this pilot has no mandate to write.

**Resolution:** the section list and authored prompts belong in **Phase 1**, as planned above. Do not let them drift into Phase 2.

### B. Research cannot be a phase — **changes the plan** *(resolved by D2)*
Research appears in specification §8 and would naturally fall into Phase 2 or 3. It cannot: there is no retrieval capability, `liveRetrieval` is hardcoded `null`, and the UWE research functions are dead. Building retrieval would be new architecture, which the non-negotiables forbid.

For SOP specifically the risk is not merely absence but harm — the canonical scenario depends on *current official Loom steps*, and a model-recalled answer presented as procedure would send a new hire confidently wrong instructions.

**Resolution:** research is removed from the pilot entirely and recorded as deferred. The "Research This" affordance must not appear on SOP sections until a retrieval provider exists. This is the honest reading of *Trust Is Everything*.

### C. The Working Memory carrier decision must precede Phase 2 — **changes the plan**
C6 was a genuine fork: the record with the right fields (`CreationWorkspace`) is the one ADR-013 routes SOP away from. Phase 2 begins writing member answers, so choosing afterward would mean either migrating real data or maintaining two records per creation.

**Resolution (D1 + D5, approved):** `RuntimeCreationRecord` is extended additively, and a formal decision gate now stands before Phase 2 opens (see the gate block in Phase 2). The field list is in §10.

### D. Visibility is structurally last — **confirms the plan**
`computeIsUserVisible` requires `reopenVerified`, which is a Phase 4 property. SOP therefore cannot become member-visible before continuity is proven. The proposed phase order already respects this; it is recorded so no phase is tempted to flip the flag early to "show progress."

### E. Phase 3 opens by fixing, not building — **confirms the phase, changes its content** *(resolved by D3)*
C11 and C12 were discovered during this handoff, not anticipated by the specification. A button labeled "Build a polished draft" runs, says "Building your draft…", and returns a canned sentence; the function that would do the work has zero callers; and the guard test asserting that wiring is failing.

This does not move Phase 3 — output is where it belongs. But it changes what Phase 3 *starts with*: the first commit repairs an existing broken promise before any new capability is added. It also becomes a hard gate on Phase 4, because making SOP visible while that button is inert would ship the specification's clearest prohibition — claiming success for something that did not happen.

Worth noting for its own sake: this defect was invisible from the specification, from the registry, and from a passing test suite. It surfaced only by tracing the live path. Later Build Types should assume the same — **verify the running behavior, do not infer it from the code's intent.**

**Net effect:** the four-phase order stands. Phase 1 absorbs the section schema, a decision gate is added before Phase 2, research leaves the plan rather than moving within it, and Phase 3 begins with repair rather than construction.

---

## Stop condition

This document is a plan. **No code has been modified and nothing has been committed.**

The five architectural decisions (D1–D5) are approved and recorded at the top of this document. The plan is ready to execute, and execution has not started.

**Where the next session begins:** Phase 1 — extend `CreateTemplateSection` with optional authoring fields, replace `SOP_SECTIONS` with the seven Knowledge Finger sections and their authored prompts, correct `builderType` to `guided-conversation`, and add the tests in §14 rows 1–6. One commit. `sop` stays hidden.

**Where it must stop:** the decision gate before Phase 2 (§Phase 2). The D1 field list must be confirmed in writing before any code writes member answers into the extended shape.

**A note on method.** Several claims in v1.0 of this handoff were wrong, and were corrected only because the live path was traced rather than inferred from code intent. Two corrections were material: a draft-generation path assumed to exist has zero callers and does not run, and an assemble step assumed missing is real and working correctly. A guard test had been failing in place of documentation.

None of that was visible from the specification, the registry, or a green-looking suite. Any implementation session should carry the same posture: **verify running behavior before building on it.** That habit is the reason this pilot has an accurate plan, and it is the single most transferable thing about it for the seven Build Types that follow.

# SOP Build Journey Specification

**Version:** 1.0
**Status:** Approved product specification — governing acceptance standard for the SOP vertical-slice pilot
**Type:** First Build Journey Specification. Reference pattern for all future Build Types.
**Scope:** The SOP Build Type only. This document defines member experience and intelligence requirements. It does not create architecture, does not redesign Create, and does not define implementation.

---

## Naming and layer boundary

"Build Journey" means the member's path through *creating one thing* — from "I need to make this repeatable" to a usable, resumable SOP.

This is **not** the Member Journey. `docs/MEMBER_JOURNEY_ARCHITECTURE.md` is binding architecture and reserves that term for the longitudinal relationship layer — Momentum, Discovery Keys, Spark Cards, Gallery of Wins, Hall of Accomplishments, Evidence Vault. That document states plainly: *"The Member Journey is not Creation."*

This specification lives one layer down, in that architecture's own stack:

```
Relationship → Conversation Session → Creating Together → Studio → Artifact
```

Do not conflate the two. Do not rename or alter the Member Journey concept. When an SOP is finished, the *completion* may bridge upward into the Member Journey (a Gallery entry, an Evidence item) — but that bridge is owned by the Member Journey layer, not by this Build Type.

---

## Governing sources

This specification is subordinate to, and must remain consistent with:

| Authority | Governs |
|---|---|
| Spark Estate Experience Constitution v1 | Experience philosophy. Highest authority — if this document conflicts, this document changes. |
| Member Journey Architecture | Layer boundaries; prevents duplicate systems |
| Universal Build Engine v1 | The shared build process SOP must run through |
| Build Type Catalog & Behavior Standard v1 | What a Build Type is permitted to own |
| Spark Guided Creation Engine v1 | One engine, many Knowledge Fingers, one conversation |
| SOP Knowledge Finger — Full Specification v1 | The SOP expertise itself (already authored — reuse, do not rewrite) |
| Reuse Before Reinvention Principle v1 | Mandatory governance check before anything new |
| Spark Reasoning Engine v1 | The 12-stage reasoning flow |
| Spark Intelligence Activation Matrix v1 | Which intelligence activates for an SOP request |
| Business Knowledge Library Architecture v1 | Where expertise lives (Domains → Fingers → Builds) |

**Constitutional test, applied to every requirement below:** *Does this feel like working with Shari?*

---

## Why SOP is the first proof, not just the first builder

SOP is the first complete test of the new operating model. In one build it must prove Spark can:

- understand the member's real need
- guide without turning the experience into a form
- activate research only when useful
- use memory to preserve context
- help organize the work visually when needed
- produce something implementable
- restore the exact work later

If SOP proves this end to end — **Registry → Conversation → Knowledge → Output → Save → Resume → Continuation** — every later Build Type inherits a working pattern instead of reinventing one. The goal is not "build all SOP functionality." The goal is one complete, honest vertical slice.

---

## What this Build Type owns — and does not own

Per the Build Type Catalog & Behavior Standard, a Build Type supplies *only the domain knowledge needed to produce this particular useful result*.

**SOP owns:** what success looks like for an SOP, who needs one, what a beginner will forget, the essential and expert areas, conditional branches, its question bank, its research triggers, its possible outputs, its completion criteria.

**SOP does not own — and must not re-implement:**

| Not owned | Owned by |
|---|---|
| Shari's voice and personality | Constitution (settings change *how*, never *who*) |
| The conversation engine | Guided Creation Engine / Universal Build Engine |
| Saving, autosave, durable persistence | Existing Create durable-save path |
| Research infrastructure | Shared research capability |
| Projects, Calendar, Visual Thinking | Their own Estate systems |
| Chamber / Board routing | Estate Intelligence |
| Which room or space fits a need | Estate Intelligence |
| Momentum, wins, celebration | Member Journey |

A dedicated SOP engine, SOP-private storage, or an SOP-specific conversation runtime would each violate this boundary. The engine stays shared; only the knowledge changes.

---

## Reuse Before Reinvention — mandatory findings

The Reuse principle requires answering five questions *in order* before anything new is proposed. Applied to SOP:

**1. Does this capability already exist?** Partly. These assets exist today and must be reused, not replaced:

- **SOP Knowledge Finger — Full Specification v1** — complete expert thinking model, required sections, research triggers, conditional logic, completion test. This is the expertise. It is already authored. It must not be rewritten inside a builder.
- **Registry entry `sop`** (`lib/createRegistry/`) — category `build_run_the_business` / `operations_and_systems`, `lifecycleStatus: "needs-audit"`, all verification flags false, correctly hidden from members.
- **`SOP_SECTIONS` template** (`lib/createTemplates.ts`) — an existing 4-section shape.
- **Create Estate / Current Focus flow** — the conversation and durable-save surface SOP already routes to.
- **Confirm-before-create gate** — must be preserved exactly.

**2. Can an existing capability be extended?** Yes — this is the expected path. Extend the existing template shape and the existing Current Focus flow rather than introducing a parallel builder.

**3. Can existing capabilities work together?** Yes. Most of what SOP needs (conversation, save, resume, research, Projects, Calendar) already exists separately.

**4. Is the missing piece orchestration?** **Yes — this is the honest answer.** The gap is not missing features. It is that the SOP Knowledge Finger's expertise is not connected to the conversation, and the conversation's understanding is not connected to what gets saved. SOP is an orchestration and connection problem far more than a construction problem.

**5. Is something genuinely missing?** Only the connective layer above. No new engine. No new taxonomy. No fifth Create stack.

**Architectural preference order, binding:** Reuse → Extension → Connection → Orchestration → Creation. Creation is the last option.

---

## 1. Member and problem

Every SOP build should establish:

- **Who needs the SOP** — the founder themselves, a team member, a contractor, a client, a volunteer, a future hire not yet in the picture, or the founder's own future self.
- **What they are trying to make repeatable** — a task, a process, a handoff, a recurring decision.
- **Who it is for**, specifically — so the founder can stop repeating themselves to one person, or so anyone filling a role could pick it up.
- **What is currently going wrong** — nothing written down, inconsistent results, the founder is the single point of failure, onboarding takes too long, mistakes happen when the founder isn't there.
- **Why it matters now** — a hire is starting, delegation is overdue, an error just happened, the founder is stretched too thin, or the business is trying to scale past what one person can hold in their head.

## 2. Member language

Spark should recognize the need from ordinary language, not a form field:

> "I need to train Izna."
> "I keep explaining the same thing."
> "I know how to do it, but I don't know how to write it down."
> "Someone else needs to be able to do this without asking me every step."

The SOP Knowledge Finger adds the same situation in other words: *"I do this from memory." · "People keep asking me." · "Everyone does it differently." · "Training takes too long." · "I'm afraid to delegate." · "I'm worried I'll forget something."*

**None of these contain the word "SOP."** Recognition — not vocabulary — drives the build. Requiring the member to name the artifact is a failure of this specification.

## 3. Emotional and cognitive friction

Documenting a process you already know how to do is harder than it looks. Spark should anticipate:

- fear of forgetting steps
- difficulty explaining what feels automatic (the expert blind spot)
- overwhelm at documenting a large process all at once
- uncertainty about how much detail is enough
- embarrassment that the process is disorganized or was never written down
- impatience, because the work needs to be delegated quickly and writing feels like it is in the way

Shari's tone absorbs this friction rather than adding to it. The Constitution's *Reduce Cognitive Load* applies directly: simplify choices, remember context, never ask the same question twice, protect working memory.

## 4. What Spark must understand first

Before starting any SOP structure, Spark should determine:

- What outcome must the process produce?
- Who will follow it?
- How experienced are they?
- What already exists — notes, a rough draft, a mental model only?
- Is the process stable enough to document, or does it still change every time?
- Is one SOP appropriate, or is this several connected SOPs?
- Are there tools, people, permissions, dependencies, or risks involved?
- **Is the founder trying to document current reality, or design a better process?**

That last question matters most. Sometimes the process should be improved *before* it is documented — writing down something broken only makes the broken thing repeatable.

This section is the local expression of the Constitution's *Curiosity Before Answers* and the Reasoning Engine's Stage 1–2 (Listen, Understand Context). Spark must never begin by deciding what to generate.

## 5. First helpful response

The first response must never be a template picker. It must never sound like:

> ~~"Choose an SOP template."~~

It should sound like:

> "We can work through this together. Before we start writing steps, what should someone be able to complete successfully when they follow this process?"

Outcome first, structure later. This is *Conversation Before Creation* — the artifact is the result of the conversation, never the purpose of it.

## 6. Conversation flow

The likely flow — adaptive, never a rigid wizard. The member may skip, revisit, answer "I don't know yet," or jump ahead at any point:

1. Understand the desired outcome
2. Identify the person performing the work
3. Capture the current process
4. Notice gaps, hidden decisions, and dependencies
5. Decide whether research is needed
6. Organize the steps
7. Add completion checks
8. Add troubleshooting
9. Review the process for clarity
10. Assemble the SOP
11. Create an optional polished version
12. Connect implementation work
13. Save exact continuation context

**One question at a time.** Per the SOP Knowledge Finger, Spark asks only the next useful question — *"What should someone be able to accomplish after following this SOP?"* → *"Who will be using these instructions?"* → *"What should they already have before beginning?"* → *"What happens first?"* — rather than requesting the entire process at once.

### Reused artifact structure (do not redesign)

The SOP Knowledge Finger already defines the required sections. These are authoritative:

1. Title
2. Purpose
3. Intended User
4. Before You Begin
5. Step-by-Step Instructions
6. Completion Check
7. Troubleshooting

Optional, offered only when relevant: estimated time, safety notes, screenshots, video links, related SOPs, quality standards, version history, owner, review date, FAQ, tips.

## 7. Visual map structure

When a visual map genuinely helps, it may show:

- starting condition
- prerequisites
- major stages
- decision points
- dependencies
- people involved
- handoffs
- completion point
- common failure paths

The Knowledge Finger names the useful forms: workflow map, decision tree, process flow, responsibility map.

The map appears only when it earns its place, and must represent the same underlying work — never a duplicate record. It must never become another required screen standing between the member and progress.

## 8. Research opportunities

Research may help with:

- current software steps
- official platform instructions
- permissions and settings
- industry standards
- safety or accessibility considerations
- common mistakes
- recommended quality checks

The Knowledge Finger's triggers: software changes frequently · official procedures matter · permissions affect success · current screenshots are needed · platform terminology changes. Preferred sources are official documentation, help centers, and release notes.

**Before offering research, Spark must be able to answer: what does this research change in the SOP?** Research must improve the actual process, not merely add information beside it. This is the Constitution's *Research Must Lead to Action*.

Research never silently overwrites member work. The member chooses: add below, combine, replace, save separately, or cancel.

## 9. Estate Working Memory

Across the build, Spark should remember:

- SOP name
- purpose
- intended user
- desired result
- current stage
- captured steps
- open questions
- decisions
- research used
- people responsible
- dependencies
- connected Project
- external document link
- next helpful step
- why the SOP matters

This is what makes "restore exact continuation" real — not just the drafted text, but the reasoning behind it. A member who returns after a week should never be asked a question they already answered.

**Boundary note:** this is Conversation Session / build state, not Member Journey state. Per the Member Journey Architecture, "discovery answers for the current build" and "draft content" belong to the Conversation Session. Do not store build context in the Member Journey layer.

## 10. Gentle intervention rules

Spark should intervene — supportively, never correctively — when:

- the process is too broad for one SOP
- important decisions are hidden inside a step
- the member has skipped prerequisites
- the order appears unsafe or inefficient
- two people have unclear responsibilities
- the process depends on information not yet available
- the SOP describes a broken process that should be improved first

Correct tone:

> "I think this may actually be two connected processes. We can keep them together for now, but separating setup from delivery may make it much easier for Izna to follow."

Never a verdict ("This SOP is too complicated"). Always an offer, with the member deciding. *Spark recommends; members decide.*

### Beginner thinking

Assume the intended reader has never completed this process. Spark should actively surface: jargon, missing clicks, assumed knowledge, missing permissions, setup requirements, and common misunderstandings.

**Reference scenario (from the Knowledge Finger — reuse this, do not invent a new one):** a complete beginner must open Loom, record correctly, stop recording, review, rename, copy the correct link, set sharing permissions, send the link, and verify the recipient can actually access it. The verification step is the one most often forgotten — and the one that determines whether the SOP actually worked.

## 11. Assignment and implementation

The SOP should support these as optional fields appearing at the right time — never all at once, never as a setup form:

- owner
- person performing the process
- reviewer
- due date
- training date
- review date
- linked checklist
- connected Project
- calendar follow-up
- external document
- version history

Supporting outputs the build may offer (from the Knowledge Finger): quick checklist, training checklist, new-employee version, troubleshooting guide, resource list, printable copy, review checklist.

**Honesty rule:** Spark must clearly distinguish a suggestion from a completed action, and must never claim a connection succeeded unless it actually succeeded.

## 12. Success definition

The journey is successful when:

- another person can follow the process
- prerequisites are clear
- steps are ordered correctly
- decisions are understandable
- responsibilities are clear
- success can be recognized
- common problems are addressed
- the founder knows what happens next
- the work can be resumed without rebuilding context

Success is **not** "an SOP document was generated." Success is that someone else can actually do the thing without the creator present.

---

## Alignment mappings

### To the Universal Build Engine

SOP runs through the shared engine. It does not get a private workflow.

| Engine stage | SOP expression |
|---|---|
| 1 Understand | Section 4 — what Spark must understand first |
| 2 Define the Result | "What should someone be able to complete successfully?" |
| 3 Recommend Approach | Guided depth; escalate to multiple connected SOPs if warranted |
| 4 Activate Knowledge | Operations + Communication (see Activation Matrix below) |
| 5 Design the Build | The 7 required sections; optional sections held back |
| 6 Work Through It | One question at a time; non-linear; "I don't know yet" accepted |
| 7 Create Outputs | Full SOP + optional checklist / training version / troubleshooting guide |
| 8 Assemble | Combine sections preserving the member's meaning and wording |
| 9 Polish | Separate improved version; never replaces the assembled one |
| 10 Verify | Completion test — could a beginner succeed unaided? |
| 11 Implement | Owner, review date, Project, Calendar — suggestions, honestly labeled |
| 12 Continue and Learn | Estate Working Memory restores exact context |

### To the Spark Reasoning Engine

Stages 1–2 (Listen, Understand Context) map to Section 4. Stage 3 (Think Like an Expert) is supplied by the SOP Knowledge Finger's ten-layer expert thinking model. Stages 5–6 (Stakeholders, Dependencies) drive the intervention rules in Section 10. Stage 8 (Decide Whether Research Helps) governs Section 8. Stage 9 (Guide the Conversation) is the one-question-at-a-time rule.

### To the Intelligence Activation Matrix

For *"Help me create an SOP"*, the Matrix specifies:

- **Activate:** Operations, Communication
- **Suggest:** Checklist, Training Guide, Project Link

Suppression rules apply: do not load unrelated domains, do not ask duplicate questions, do not reveal internal architecture, do not present unnecessary choices, do not interrupt momentum.

---

## Known conflicts requiring resolution

Recorded here rather than quietly narrowed. These are gaps between this specification and the current codebase, surfaced honestly:

1. **`builderType: "structured-form"`** — the registry entry for `sop` currently declares a structured form. This specification and the Constitution both require a conversation ("Guided Builds should never feel like completing forms"). The declared builder type contradicts the required experience and must be reconciled before `sop` can be certified.

2. **Section-shape mismatch** — the existing `SOP_SECTIONS` template carries four sections (Purpose, Scope, Steps, Notes & Tips). The approved Knowledge Finger requires seven (Title, Purpose, Intended User, Before You Begin, Step-by-Step Instructions, Completion Check, Troubleshooting). *Intended User*, *Before You Begin*, *Completion Check*, and *Troubleshooting* are precisely the sections that determine whether another person can succeed. Extend the existing template — do not create a second one.

3. **The Knowledge Finger is not connected to anything.** The SOP expertise exists as an approved document with no runtime representation. Connecting it is the orchestration work identified in Reuse question 4.

4. **Understanding currently has nowhere to go.** Discovery answers and conversation context have no persisted home on the creation record, so "restore exact continuation" (Section 9) cannot be satisfied by the current data shape.

5. **Visibility gate.** `sop` is `lifecycleStatus: "needs-audit"` with all verification flags false, and is therefore correctly hidden. It must not be made visible until route, save, reopen, and required-actions are verified against a live run — never before.

None of these should be resolved by inventing a new system. Each is an extension or connection of something that already exists.

---

## Acceptance criteria

Adapted from the SOP Knowledge Finger's own criteria, and binding for the pilot:

- Spark asks one useful question at a time.
- Spark recognizes the need without the member using the word "SOP."
- Spark anticipates what beginners forget.
- Spark explains why missing information matters.
- Spark researches only when appropriate, and states what it changes.
- Spark preserves the member's process and wording.
- Spark can create multiple supporting outputs.
- Spark supports non-linear editing — add, edit, remove, skip, postpone.
- Spark restores the exact working state when the member returns.
- Assemble and Polish remain separate.
- No action is claimed as successful unless it actually succeeded.
- Every recommendation answers "So what?"
- The experience passes the Constitution's final test: *does this feel like working with Shari?*

---

## How this document is used

This is the acceptance specification for the SOP vertical-slice pilot. Implementation is checked against every section above, in order — not treated as inspiration to reinterpret. Where the codebase cannot yet meet a requirement, the gap is named explicitly (see *Known conflicts*) rather than quietly narrowed or declared out of scope.

It is also the **reference pattern for future Build Types**. Once SOP proves the model, later Build Journey Specifications — Checklist, Email, Proposal, Offer, Client Onboarding, Workshop, Marketing Plan — should follow this same shape: layer boundary, governing sources, ownership limits, a Reuse Before Reinvention pass, the twelve member-experience sections, alignment mappings, honestly recorded conflicts, and acceptance criteria.

The catalog stays intentionally small until each build is deep and reliable. One proven Build Type is worth more than eight shallow ones.

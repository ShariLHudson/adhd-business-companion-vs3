# SOP Build Journey Specification

**Version:** 1.0
**Status:** Approved product specification — governing acceptance standard for the SOP vertical-slice pilot
**Scope:** The SOP Build Type only. This document does not redesign Create, the Universal Build Engine, or Knowledge Architecture — it is the first concrete instance of them.

**Naming note:** "Journey" here means the SOP *build/creation* experience — the path a member walks from "I need to make this repeatable" to a usable, resumable SOP. This is distinct from `docs/MEMBER_JOURNEY_ARCHITECTURE.md`'s binding use of "Member Journey" (Momentum, Discovery Keys, Gallery of Wins, Hall of Accomplishments — the longitudinal relationship layer, explicitly *not* Creation). This document lives in the Conversation Session → Creating Together → Studio → Artifact layer of that architecture. Do not conflate the two.

---

## Why SOP is the first proof, not just the first builder

SOP is the first complete test of the new operating model. It must prove Spark can, in one build:

- understand the member's real need
- guide without turning the experience into a form
- activate research only when useful
- use memory to preserve context
- help organize the work visually when needed
- produce something implementable
- restore the exact work later

If SOP proves this end to end — Registry → Conversation → Knowledge → Output → Save → Resume → Continuation — every later Build Type inherits a working pattern instead of reinventing one.

---

## 1. Member and problem

Every SOP build should establish:

- **Who needs the SOP** — the founder themselves, a team member, a contractor, a client, or a future hire not yet in the picture.
- **What they are trying to make repeatable** — a task, a process, a handoff, a recurring decision.
- **Who it's for**, specifically — is this so the founder can stop repeating themselves to one person, or so *anyone* who fills a role could pick it up.
- **What is currently going wrong** — nothing written down, inconsistent results, the founder is the single point of failure, onboarding takes too long, mistakes happen when the founder isn't there.
- **Why it matters now** — a hire is starting, delegation is overdue, an error just happened, the founder is stretched too thin, or the business is trying to scale past what one person can hold in their head.

## 2. Member language

Spark should recognize the need from ordinary language, not a form field. Real examples:

> "I need to train Izna."
> "I keep explaining the same thing."
> "I know how to do it, but I don't know how to write it down."
> "Someone else needs to be able to do this without asking me every step."

None of these mention the word "SOP." Recognition, not vocabulary, drives the build.

## 3. Emotional and cognitive friction

Documenting a process someone already knows how to do is harder than it looks. Spark should anticipate:

- fear of forgetting steps
- difficulty explaining what feels automatic (expert blind spot)
- overwhelm at documenting a large process all at once
- uncertainty about how much detail is enough
- embarrassment that the process is disorganized or was never written down
- impatience because the work needs to be delegated quickly and writing feels like it's in the way of that

Spark's tone should absorb this friction, not add to it — patience and structure instead of a blank page.

## 4. What Spark must understand first

Before starting any SOP structure, Spark should determine:

- What outcome must the process produce?
- Who will follow it?
- How experienced are they?
- What already exists (notes, a rough draft, a mental model only)?
- Is the process stable enough to document, or does it still change every time?
- Is one SOP appropriate, or is this actually several connected SOPs?
- Are there tools, people, permissions, dependencies, or risks involved?
- Is the founder trying to document current reality, or design a better process?

That last question matters most. Sometimes the process should be improved *before* it is documented — writing down something broken just makes the broken thing repeatable too.

## 5. First helpful response

The first response must never be a template picker. It should never sound like:

> "Choose an SOP template."

It should sound like:

> "We can work through this together. Before we start writing steps, what should someone be able to complete successfully when they follow this process?"

Outcome first, structure later.

## 6. Conversation flow

The likely flow (adaptive, not a rigid wizard — the member may skip, revisit, or jump ahead at any point):

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

The map appears only when it earns its place. It must never become another required screen standing between the member and progress.

## 8. Research opportunities

Research may help with:

- current software steps
- official platform instructions
- permissions and settings
- industry standards
- safety or accessibility considerations
- common mistakes
- recommended quality checks

Before offering research, Spark should be able to answer: **what does this research change in the SOP?** Research must improve the actual process, not merely add information beside it.

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

This is what makes "restore exact continuation" possible — not just the drafted text, but the reasoning behind it.

## 10. Gentle intervention rules

Spark should intervene — supportively, never correctively — when:

- the process is too broad for one SOP
- important decisions are hidden inside a step
- the member has skipped prerequisites
- the order appears unsafe or inefficient
- two people have unclear responsibilities
- the process depends on information not yet available
- the SOP describes a broken process that should be improved first

Example of the right tone:

> "I think this may actually be two connected processes. We can keep them together for now, but separating setup from delivery may make it much easier for Izna to follow."

Never: "This SOP is too complicated." Always: an offer, not a verdict.

## 11. Assignment and implementation

The SOP should support, as optional fields appearing at the right time — never all at once:

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

Success is **not**: "an SOP document was generated." Success is that someone else can actually do the thing.

---

## How this document is used

This is the acceptance specification for the SOP vertical-slice pilot. Implementation work should be checked against every section above, in order — not treated as inspiration to reinterpret freely. Where the current codebase cannot yet meet a requirement here, that gap should be named explicitly rather than quietly narrowed.

This document is also the reference pattern for future Build Types: once SOP proves the model, later Build Journey specs (Checklist, Email, Proposal, Offer, Client Onboarding, Workshop, Marketing Plan) should follow the same twelve-section shape.

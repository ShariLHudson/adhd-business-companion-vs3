# CB-022 Addendum — Intent-First Classification, Workflow-State Validation, and Strategy Library Preservation

## Purpose

Extend the global topic-ownership contract so Spark Estate™ gives priority to the user’s current intent, validates old workflow state before resuming it, and preserves the existing Strategy Library as an intentional destination under **Get Advice**.

This is a global contract. It must not be implemented as a single-page or phrase-specific patch.

---

## Confirmed Failure Pattern

The user clearly stated:

> “I need to create a new strategy for better communications with my VA.”

The platform then:

1. asked the user to classify the request as ADHD or Business
2. received a clear answer
3. incorrectly resumed an old Create Document workflow
4. required correction
5. restarted the same classification prompt
6. made the user repeat the request
7. entered an older strategy conversation flow without clear ownership

This exposes three global issues:

- unnecessary classification
- stale workflow override
- unclear Strategy Library routing and placement

---

# Global Rule 1 — Intent-First Classification

Before asking a classification question, determine whether the user’s intent is already sufficiently clear.

Ask only when:

- two materially different paths remain plausible
- the distinction changes the next action
- current evidence is insufficient
- a wrong assumption would create meaningful cost, risk, or confusion

Do not ask users to translate their request into internal platform categories.

## Example

User:

> “I need a business strategy for better communication with my VA that works with my ADHD.”

Sufficient interpretation:

- requested outcome: create a business strategy
- topic: communication with a VA
- adaptation: ADHD-aware
- likely destination: Strategy Library / strategy-building experience
- next step: continue without asking “ADHD or Business?”

---

# Global Rule 2 — Infer and Continue

When confidence is high:

1. reflect the interpretation briefly
2. preserve the user’s stated goal
3. proceed to the next useful step

Example:

> “Let’s build a communication strategy that works for your business and your ADHD.”

---

# Global Rule 3 — Workflow-State Validation

Before resuming prior work, validate semantic compatibility with the current user intent.

Use a structured decision equivalent to:

```ts
type WorkflowResumeDecision = {
  shouldResume: boolean;
  workflowId?: string;
  workflowType?: string;
  reason:
    | "explicit_continue"
    | "high_confidence_match"
    | "stale_state"
    | "workflow_conflict"
    | "new_intent"
    | "insufficient_evidence";
  confidence: "high" | "medium" | "low";
};
```

Validate:

- current goal
- current topic
- requested outcome
- requested artifact type
- current destination
- prior workflow type
- last confirmed state
- explicit continuation evidence
- conflict with current request

---

# Global Rule 4 — New Intent Beats Stale State

A clear new intent outranks old workflow state.

Examples:

- new strategy request outranks old document state
- client question outranks old reminder state
- technology question outranks old Chamber arrival state
- project request outranks old Clear My Mind state

Stale work may remain available for later recovery, but it must not interrupt the current turn.

---

# Global Rule 5 — Explicit Resume for Conflicting Workflows

Conflicting prior work may resume only when the user explicitly asks.

Valid examples:

- “Go back to the document.”
- “Continue where we left off.”
- “Let’s finish that strategy.”
- a valid current Resume button
- a valid current workflow card selection

Invalid evidence:

- a loosely related word
- a broad category match
- a member alias
- “business”
- “strategy”
- “document”
- “okay”
- “yes” outside a valid pending context

---

# Global Rule 6 — Classification Must Not Restart

Once answered, a classification must remain resolved unless:

- the user contradicts it
- the topic materially changes
- the earlier answer was truly ambiguous
- the workflow is intentionally restarted

---

# Global Rule 7 — Artifact and Experience Type Must Match

Distinguish among:

- strategy
- document
- plan
- project
- reminder
- message
- email
- note
- framework
- checklist

Do not treat all “create” requests as Create Document.

Do not treat all “strategy” mentions as document creation.

Do not treat business questions as generic help.

---

# Global Rule 8 — Preserve the Existing Strategy Library

The existing Strategy Library is a valid Spark Estate capability and must be retained.

It should be available under:

**Get Advice → Strategy Library**

The Strategy Library may contain:

- ADHD strategies
- business strategies
- recommended strategies
- saved strategies
- custom strategy creation

Do not remove or replace it merely because an older conversation flow is involved.

---

# Global Rule 9 — Separate Strategy Library from Stale Strategy State

Preserving the Strategy Library does not mean automatically resuming old strategy sessions.

When the user asks for a strategy:

- open or use the Strategy Library intentionally
- identify whether they want to browse, apply, or create
- infer the likely path when clear
- preserve their current wording and goal
- do not revive an unrelated previous strategy draft

---

# Global Rule 10 — Strategy Library Placement

The Strategy Library must appear under **Get Advice**.

It should not be treated primarily as:

- a document creator
- a generic workspace
- a hidden legacy route
- an unrelated Strategy page detached from advisory navigation

The route and labels must reflect its purpose as advice and guided strategy support.

---

# Global Rule 11 — Current Intent Controls Strategy Entry

Examples:

### Browse

> “Show me strategies for procrastination.”

Expected:

- open Strategy Library
- filter or recommend relevant strategies

### Apply

> “Help me use a strategy for getting started.”

Expected:

- use the Strategy Library’s guided application path

### Create

> “I need to create a communication strategy for my VA.”

Expected:

- begin custom business strategy creation
- preserve communication-with-VA context
- include ADHD adaptation
- do not ask ADHD versus Business when already clear

### Resume

> “Continue the strategy we were building.”

Expected:

- validate and resume the matching strategy draft

---

# Global Rule 12 — Shari Remains Response Owner

The Strategy Library supplies:

- strategies
- frameworks
- prompts
- recommendations
- saved/custom strategy data

Shari remains the visible companion.

---

# Definition of Done

The platform:

- infers clear intent
- avoids unnecessary classification
- validates workflow state
- blocks stale document or strategy resumption
- preserves the Strategy Library
- places it under Get Advice
- distinguishes browse, apply, create, and resume
- uses the user’s current goal
- keeps one visible Shari response

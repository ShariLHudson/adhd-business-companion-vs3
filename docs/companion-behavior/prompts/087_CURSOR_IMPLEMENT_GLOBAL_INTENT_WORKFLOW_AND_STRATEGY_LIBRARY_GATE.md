# Cursor Implementation Prompt — Global Intent, Workflow-State, and Strategy Library Gate

Implement the global fix using:

- CB-022
- the intent/workflow/Strategy Library addendum
- completed global gap map
- existing Strategy Library assets

## Required Implementation

### 1. Authoritative Intent Owner

Use one Conversation Engine owner for:

- active topic
- interpreted user goal
- artifact type
- workflow type
- classification status
- workflow resume decision

### 2. Intent-First Classification Gate

Before asking a category question:

- evaluate current evidence
- infer when confidence is high
- ask only when the distinction materially changes the next step

### 3. Workflow Resume Gate

Before resuming work:

- require explicit continuation or high-confidence semantic match
- reject stale or conflicting state
- preserve rejected work as inactive, not active
- prevent rejected workflows from reopening on the next turn

### 4. Artifact-Type Gate

Distinguish:

- strategy
- document
- project
- plan
- reminder
- message
- email
- note
- framework
- checklist

### 5. Preserve Strategy Library

Retain the existing Strategy Library and its valid knowledge/data.

Do not remove:

- ADHD strategies
- business strategies
- recommended strategies
- saved strategies
- custom strategy creation

### 6. Place Under Get Advice

Register and expose:

**Get Advice → Strategy Library**

Use the existing approved navigation architecture.

Avoid duplicate destinations.

### 7. Strategy Entry Modes

Support distinct entry modes:

```ts
type StrategyEntryMode =
  | "browse"
  | "apply"
  | "create"
  | "resume";
```

Examples:

- browse: “show me strategies for procrastination”
- apply: “help me use a strategy”
- create: “create a communication strategy for my VA”
- resume: “continue the strategy we were building”

### 8. Preserve Current User Context

For custom strategy creation, carry forward:

- strategy topic
- business context
- ADHD adaptation
- people involved
- desired outcome
- stated obstacles

Do not ask the user to restate known details.

### 9. No Old Document Hijack

A strategy request must not resume Create Document unless:

- the user explicitly requests a document
- the strategy workflow intentionally produces a document at a later approved stage
- the user confirms that output

### 10. One Shari Response

No duplicate:

- strategy greeting
- document continuation
- generic help
- classification prompt
- Chamber opener

## Required Automated Tests

### Clear Strategy Intent

`i need to create a new strategy for better communications with my VA`

Pass:

- strategy intent recognized
- no document continuation
- no unnecessary ADHD/Business prompt
- custom strategy mode selected
- current context retained

### Explicit ADHD-Aware Business Strategy

`a business strategy for better communication that works for me and my adhd`

Pass:

- Business strategy remains primary
- ADHD is treated as adaptation
- classification does not restart

### Reject Wrong Workflow

After stale document state appears in test setup:

`i am not creating a document`

Pass:

- document workflow invalidated
- it does not reopen next turn
- strategy intent remains active

### Browse Strategy Library

`show me strategies for procrastination`

Pass:

- Get Advice → Strategy Library
- browse mode
- no custom creation unless chosen

### Apply Strategy

`help me use a strategy for getting started`

Pass:

- apply mode
- relevant strategy selected or clarified

### Resume Strategy

`continue the strategy we were building`

Pass:

- semantic match checked
- matching strategy resumes
- unrelated strategy or document does not

### Explicit Document

`create a letter to my client`

Pass:

- document flow
- not Strategy Library

### Explicit Topic Change

Begin strategy creation, then:

`actually help me create a reminder`

Pass:

- reminder becomes active
- strategy is paused, not lost
- no stale strategy prompt on next turn

## Navigation Verification

Confirm:

- Strategy Library appears under Get Advice
- existing Strategy Library data remains available
- no duplicate top-level Strategy route unless intentionally retained as an alias
- direct links resolve correctly
- Back behavior is correct
- Return to Estate behavior remains correct

## Required Report

Return:

- files changed
- authoritative intent/workflow owner
- Strategy Library route
- Get Advice placement
- duplicate routes removed or aliased
- stale-state guards
- tests
- preview commit
- authenticated preview URL
- remaining limitations
- deploy or do-not-deploy recommendation

## Constraints

- preview only
- no production deployment
- no Strategy Library deletion
- no member-specific patches
- stop after preview verification

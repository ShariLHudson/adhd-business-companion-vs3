# 328 — Collection Composition and Orchestration Runtime

## Purpose

Define how a Collection becomes a coherent production experience composed from multiple capabilities, assets, Work Types, and contributors.

## Core principle

A Collection is not a folder of resources.

It is an orchestrated business experience.

## Collection runtime responsibilities

The Collection owner is responsible for:

- intent fit
- asset selection
- capability assembly
- contributor coordination
- user adaptation
- output coherence
- Work integrity
- approval flow
- progress continuity
- certification
- maintenance

## Collection execution context

Required context:

- Collection ID
- owner Member
- contributor Members
- active business
- business identities
- business stage
- current goal
- active Work
- capability state
- confidence state
- adaptive context
- user preferences
- entry surface
- selected or inferred asset
- certification state

## Composition sequence

1. Resolve Collection.
2. Verify owner.
3. Resolve current Work.
4. Select asset or direct Collection flow.
5. Resolve required capabilities.
6. Resolve optional capabilities.
7. adapt depth.
8. request contributions.
9. validate conflicts.
10. synthesize output.
11. request approval where needed.
12. apply approved changes.
13. update progress.
14. preserve exact resume.
15. record provenance.

## Collection modes

### Explore

Helps the user understand what the Collection contains and what may be relevant.

### Guided

Leads the user through a recommended sequence.

### Direct Work

Starts or resumes a specific Blueprint, Playbook, Framework, or output.

### Review

Evaluates existing Work using Collection capabilities.

### Operating Mode

Supports an ongoing business process, such as:

- content operations
- client delivery
- event operations
- inventory management
- sales pipeline
- course delivery

## Asset selection

The runtime should choose assets based on:

- explicit request
- active Work
- business identity
- stage
- capability state
- confidence
- current context
- urgency
- dependencies
- prior progress

Do not force the user to browse the complete Collection.

## Contributor coordination

The Collection owner must:

- prevent duplicated advice
- reconcile terminology
- identify conflicts
- prioritize the Collection's purpose
- retain contributor provenance
- avoid exposing internal assembly unless useful

## Cross-Collection behavior

A Collection may:

- reference another Collection
- request one of its published capabilities
- connect related Work
- recommend a transition
- open a linked asset

A Collection must not clone another Collection's assets.

## Progress model

A Collection may track:

- not started
- exploring
- active
- paused
- blocked
- awaiting input
- awaiting approval
- completed
- maintained
- archived

Collection progress must not replace canonical Work status.

## Exact resume

Resume must restore:

- business context
- Collection
- asset
- Work ID
- current step
- last completed step
- unresolved question
- current draft
- pending approval
- relevant contributor outputs
- next suggested action

## Required tests

- Collection resolution
- owner enforcement
- asset selection
- capability assembly
- contributor conflict
- low-energy adaptation
- advanced-user adaptation
- exact resume
- cross-Collection reference
- no asset duplication
- approval flow
- progress continuity
- operating mode
- failure recovery

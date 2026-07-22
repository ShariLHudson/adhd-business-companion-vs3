# 103 — Anywhere-Origin Universal Work Routing

## Purpose

Make the Universal Work Engine and Universal Blueprint Framework callable from every appropriate Spark Estate experience.

The user may begin meaningful work anywhere. The origin may change, but the quality, continuity, intelligence, Work ID, relationships, and source of truth may not.

Do not build Marketing Plan in this step.

## Governing principle

> Any Spark Estate experience may originate meaningful work. Every origin must resolve through the Universal Work Engine to continue existing work, connect existing work, create new work, or remain a conversation/support experience.

No origin may create a private workspace, private save path, shadow Work record, duplicate Blueprint registry, or competing source of truth.

## Required origins

Implement approved routing from:

- Create
- Projects
- Strategies
- Blueprints
- Cartography
- Body Doubling
- Shari conversation
- Chamber
- Board
- Research
- Clear My Mind
- Tasks
- Welcome Home
- Templates area, if still present
- other platform destinations that already express platformIntent for meaningful work

## Universal launch contract

Create or finalize one authoritative launch contract, using the existing codebase conventions.

It must carry enough context to resolve work safely, including:

- origin
- user intent
- original user message
- candidate Work Type
- candidate Blueprint
- related Work ID
- Project ID
- section ID
- task ID
- Cartography node ID
- conversation ID
- Chamber member ID
- Board review ID
- research record ID
- Body Doubling session ID
- known context
- requested mode
- requested depth
- whether the user wants talk-only or work-on-this behavior

Do not expose unnecessary technical fields to the user.

## Resolution sequence

Every origin must use the same resolution sequence:

1. Determine whether the user is only talking, reflecting, researching, or requesting structured work.
2. Identify the likely Work Type and compatible Blueprints.
3. Search for related existing Work.
4. Evaluate duplicate risk.
5. Determine one of:
   - Continue existing Work
   - Connect to existing Work
   - Create new Work
   - Keep as conversation/support only
6. Ask only when ambiguity materially affects the result.
7. Resolve one canonical Work ID.
8. Attach origin context and approved relationships.
9. Open the universal work interface at the correct section or focus.
10. Preserve continuity across refresh and reopening.

## Duplicate prevention

Before creating a new Work item, evaluate:

- same user
- same Work Type
- similar title or intent
- related Project
- related Blueprint
- related conversation
- recent creation
- active incomplete Work
- matching source content
- matching Cartography node
- matching Chamber or Board context

When a likely match exists, offer or perform a contextually appropriate continue/connect decision.

Do not create a duplicate merely because the user entered through a different destination.

## Origin-specific requirements

### Create

- retains direct creation behavior
- uses the same universal launch and resolution contract
- no privileged private path

### Projects

- a simple Project may remain the master Work item
- a complex Project may become a parent connected to one or more Work items
- Project-first work must not require starting over in Create
- approved task and milestone synchronization must preserve ownership boundaries

### Strategies

- user may talk through a strategy or create a reusable Strategy Work item
- strategy-originated work must use the same Work ID and Blueprint framework
- no separate strategy document engine

### Blueprints

- Blueprint selection must initialize or continue through the Universal Work Engine
- no Blueprint-only shadow workspace

### Cartography

- nodes reference canonical Work IDs
- user may create connected Work from a node
- opening a node must resume the same Work
- Cartography stores relationships and visualization, not duplicate content

### Body Doubling

- session may attach to existing Work, section, task, or milestone
- user may start new Work during a session through the universal flow
- session notes and progress must attach to the same Work context
- Body Doubling may not create a private checklist as the sole record when structured Work exists

### Shari conversation

Support two clear modes:

- Talk only: no Work changes
- Work on this: approved changes attach to the canonical Work item

Shari should help the user begin where they are without forcing navigation first.

### Chamber

- Chamber advice may contribute to an existing Work item
- Chamber may suggest creating linked Work
- Chamber may originate Work through the universal flow
- Chamber may not create its own save path or private creation engine
- contributions must retain member attribution and source context

### Board

- Board may review whole Work, section, or decision
- Board may recommend linked Work
- Board-originated Work must use the universal flow
- recommendations do not alter Work until approved

### Research

- research can remain research-only
- research can attach to existing Work
- research can propose a new Work item
- Research → Review → Approve → Apply must remain enforced
- research may not silently rewrite Work

### Clear My Mind

- thoughts may remain unstructured
- thoughts may connect to existing Work
- thoughts may create new Work
- clustered thoughts must not create multiple Work items without explicit or contextually safe confirmation

### Tasks

- task may attach to Work, section, milestone, Project, or decision
- a task may reveal the need for deeper Work
- converting a task into Work preserves provenance and relationships
- no duplicate task copies across Project and Work

### Welcome Home

- continue meaningful previous Work
- begin recommended Work
- help the user choose
- all paths must use the universal resolution flow

## Platform intent routing

Audit and replace old aliases, template fallthroughs, or destination-specific routing that bypasses the Universal Work Engine.

Required natural-language examples:

- Help me plan a business luncheon.
- I need to organize an online workshop.
- Let us work on my three-day retreat.
- Turn this Project into a book-signing plan.
- Use the retreat Blueprint.
- Continue the workshop I started.
- Body double with me while I work on the event agenda.
- Ask the Chamber to help improve this event.
- Have the Board review this event budget.
- Research venues for this retreat.
- This thought from Clear My Mind should become an event.
- Show this event in Cartography.

Each must resolve through the universal registry and canonical Work identity.

## Relationship requirements

Preserve approved relationships among:

- Work
- Project
- Blueprint
- Cartography node
- task
- milestone
- decision
- research
- Chamber contribution
- Board review
- Shari conversation
- Body Doubling session
- Clear My Mind source
- file
- calendar event
- reminder

Use canonical IDs and relationship types.

Do not duplicate the substantive Work content.

## User experience

The user should not need to know which module owns the capability.

Use natural responses such as:

- I found the event you were already working on.
- This looks connected to your Launch Project.
- We can talk this through first, or build it together.
- This may deserve its own plan.
- I found a Blueprint that fits.
- Would you like to connect this rather than create another copy?

Do not expose architecture language like canonical ID, registry, schema, or runtime.

## Required tests

Add unit, integration, and end-to-end tests proving:

- every required origin can launch the Universal Work Engine
- every origin can continue existing Work
- every origin can connect existing Work
- every origin can create new Work when appropriate
- every origin can remain non-creating when appropriate
- duplicate detection works across origins
- one canonical Work ID survives all transitions
- origin context is preserved
- Blueprint compatibility is preserved
- no legacy template fallthrough occurs
- no origin creates direct durable records outside approved owners
- Project-first work remains valid
- Cartography references Work without duplication
- Body Doubling attaches to existing Work
- Shari talk-only mode does not mutate Work
- Shari work-on-this mode requires approved application
- Chamber and Board contributions retain attribution
- Research approval flow remains enforced
- refresh and reopen preserve location and relationships
- Event/Create regression remains passing
- UWE regression remains passing
- Blueprint regression remains passing

## Required documentation

Create:

- `docs/create-experience/103_ANYWHERE_ORIGIN_ROUTING_REPORT.md`
- `docs/create-experience/103_ANYWHERE_ORIGIN_ROUTING_BLOCKERS.md`

Include:

- origins implemented
- authoritative launch contract
- routing and resolution flow
- duplicate detection
- origin-specific behavior
- platformIntent aliases replaced
- relationship handling
- files changed
- tests added
- browser evidence
- regression results
- unresolved risks

The blockers file must include only release-blocking issues.

## Completion rule

Do not declare complete unless:

- all required origins use the Universal Work Engine
- no private origin workspace exists
- all natural-language examples resolve correctly
- duplicate prevention works across origins
- one canonical Work ID is preserved
- Event remains passing
- all regression suites pass
- no Marketing Plan code was added

Do not commit or push until implementation, testing, browser verification, reports, and blocker review are complete.

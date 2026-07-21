# 310 — Universal Capability Routing and Orchestration Architecture

## Purpose

Define how Spark Estate routes user intent to Work, Collections, Blueprints, capabilities, Chamber Members, and supporting experiences without requiring the user to understand platform structure.

## Routing principle

Route to the capability and Work context—not merely to a destination.

## Routing stages

### 1. Intent resolution

Determine:

- what the user wants
- whether they want to talk, decide, create, review, learn, or execute
- whether a canonical Work item already exists
- whether the request is personal, business-specific, or cross-business

### 2. Work resolution

Choose:

- continue existing Work
- connect existing Work
- create new Work
- remain conversation-only

Use one canonical Work ID.

### 3. Collection resolution

Identify:

- likely Collection
- relevant Blueprint or asset
- active business identity
- current business stage
- context fit

### 4. Capability resolution

Determine:

- required capabilities
- optional capabilities
- validation capabilities
- risk-review capabilities
- measurement capabilities

### 5. Member resolution

For every capability:

- identify authoritative owner
- confirm certification
- resolve dependencies
- identify allowed contributors
- prevent duplication

### 6. User-adaptation resolution

Adjust:

- depth
- language
- number of questions
- amount of teaching
- degree of execution support
- visible choices
- pace

based on:

- capability state
- confidence
- current context
- preferences

### 7. Orchestration

The Collection owner or Shari assembles contributions.

The user receives one coherent experience.

### 8. Approval and application

Contributions must declare:

- proposed content or change
- source capability
- owner
- assumptions
- evidence
- confidence
- approval requirement

Only approved mutations apply to canonical Work.

## Routing origins

Routing must work from:

- Welcome Home
- Shari conversation
- Chamber
- Board
- Create
- Projects
- Strategies
- Blueprints
- Cartography
- Research
- Body Doubling
- Clear My Mind
- Parking Lot
- Tasks
- Business Estate
- Founder Studio
- Intelligence Library

No origin may create a shadow workspace.

## Natural-language examples

- Help me grow my speaking business.
- I need to price a new service.
- I want to prepare for a craft show.
- Help me create LinkedIn content.
- I am overwhelmed by this launch.
- Review my workshop plan.
- Turn this idea into a Project.
- I have only 20 minutes.
- I know marketing but not finance.
- I need you to narrow this down.

## Ambiguity handling

When several routes are possible:

1. Prefer existing Work.
2. Prefer the user's active business.
3. Prefer the most specific certified Collection.
4. Prefer a reversible next step.
5. Ask one high-value question only when needed.
6. Do not expose internal routing choices unless useful.

## Cross-member orchestration

Example: Workshop

Owner:

- Events Intelligence or the registry-defined owner

Capabilities:

- event planning
- learning outcomes
- facilitation
- marketing
- pricing
- execution
- measurement

Contributors remain attributable, but the user sees one Workshop experience.

Example: Etsy Business

Owner:

- registry-defined Handmade Business owner

Capabilities:

- product strategy
- listing optimization
- photography
- pricing
- inventory
- marketing
- customer experience
- analytics

## Routing locks

Required locks include:

- explicit Create lock
- awaiting-answer lock
- Talk Only lock
- no-auto-launch-after-mention
- duplicate Work prevention
- approved-change lock
- quiet-hours behavior
- current-focus preservation

## Failure handling

When routing fails:

- preserve the user's message
- preserve active Work
- explain simply
- offer one useful fallback
- log unresolved intent
- do not send the user through menus
- do not fabricate a Member or Collection

## Observability

Track:

- intent
- resolved Work
- Collection
- Blueprint
- capabilities
- owners
- adaptation depth
- routing confidence
- user correction
- duplicate prevention
- final outcome

Do not expose sensitive internal profiling.

## Required tests

- every supported origin
- existing Work resume
- create/connect/conversation-only paths
- Collection resolution
- capability resolution
- owner resolution
- cross-member orchestration
- user-level adaptation
- low-energy routing
- ambiguity
- routing locks
- approval
- failure recovery
- no shadow Work
- provenance
- regression with existing Member routing

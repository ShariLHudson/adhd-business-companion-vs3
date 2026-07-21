# 300 — Spark Estate Intelligence Architecture v2

## Status

Platform-governing architecture.

This specification governs all current and future:

- Chamber Members
- Round Table Board Members
- Intelligence Collections
- Business Collections
- Industry Collections
- Capabilities
- Blueprints
- Frameworks
- Playbooks
- Templates
- Reports
- Calculators
- Guided experiences
- Universal Work
- Projects
- Events
- Research
- Cartography
- Shari interactions
- adaptive recommendations

No future feature may create a competing architecture.

## Mission

Spark Estate is an adaptive business operating partner that learns how each person thinks, works, decides, creates, leads, and grows.

It uses that understanding to reduce:

- friction
- cognitive load
- decision fatigue
- unnecessary repetition
- working-memory demands
- navigation burden
- uncertainty
- startup resistance
- overwhelm

while increasing:

- clarity
- confidence
- meaningful progress
- follow-through
- business capability
- consistency
- evidence of growth
- quality of decisions

Spark Estate is not a collection of disconnected AI assistants.

It is one coherent intelligence platform.

## Core architectural model

Spark Estate consists of these connected layers:

1. Universal Work Engine
2. Intelligence Members
3. Published Capabilities
4. Capability Graph
5. Collections
6. Blueprints and reusable assets
7. Business DNA
8. User Capability and Confidence Maps
9. Adaptive Context
10. Universal Routing
11. Shari orchestration
12. Projects and execution
13. Research and evidence
14. Cartography and relationships
15. Testing, certification, and maintenance

## Canonical object hierarchy

### Intelligence Member

Owns a durable domain of expertise.

Examples:

- Marketing Intelligence
- Finance Intelligence
- Learning Intelligence
- Events Intelligence
- Leadership Intelligence

A Member publishes capabilities.

A Member does not duplicate another Member's expertise.

### Capability

An atomic, reusable unit of certified expertise.

Examples:

- Audience Definition
- Pricing Analysis
- Learning Outcome Design
- Event Risk Planning
- Campaign Measurement

Capabilities are consumed by Collections, Blueprints, conversations, Projects, and recommendations.

### Collection

A coherent group of related business experiences and reusable resources.

A Collection may cross multiple Chamber Members.

Every Collection has:

- one accountable owner
- zero or more contributors
- declared capabilities
- declared audiences or business identities
- lifecycle
- certification status
- asset registry

### Blueprint

A guided implementation pattern that produces or advances canonical Work.

Blueprints reuse:

- Universal Work Engine
- capabilities
- context
- routing
- Projects
- Research
- Cartography
- Shari
- Chamber
- Board

Blueprints never own a competing runtime.

### Business DNA

The evolving model of the user and their business.

It includes:

- business identities
- industries
- revenue models
- offers
- audiences
- business stage
- active responsibilities
- goals
- constraints
- tools
- workflows
- preferences

### User Capability Map

Tracks experience separately by domain.

A user may be:

- advanced in marketing
- beginning in finance
- experienced in speaking
- unfamiliar with hiring
- confident in content
- uncertain in sales

No global beginner/intermediate/advanced label is sufficient.

### User Confidence Map

Tracks confidence separately from knowledge and experience.

Guidance must adapt when:

- knowledge is high and confidence is low
- confidence is high and knowledge is low
- both are high
- both are low

### Adaptive Context

Represents what matters now:

- energy
- focus
- motivation
- stress
- time
- urgency
- deadlines
- workload
- current location
- health constraints
- financial pressure
- recent decisions
- unfinished work

Adaptive Context must influence how much the platform asks, presents, recommends, and expects.

## Platform invariants

### One source of truth

Every meaningful Work item has:

- one canonical Work ID
- one history
- one relationship graph
- one current state
- one authoritative owner

### No duplicate intelligence

Domain expertise lives with its owning Intelligence Member.

Collections and Blueprints reference published capabilities rather than copying knowledge.

### One seamless experience

The user should not need to understand:

- which Member owns a capability
- which registry is involved
- which module stores the Work
- which service performs retrieval
- how contributors were assembled

### Progressive disclosure

The platform reveals only what is useful now.

It must not make comprehensiveness feel like complexity.

### Context reuse with consent

Spark Estate should reuse known information but must:

- show material assumptions
- allow correction
- avoid silently applying uncertain facts
- never repeatedly ask for already-confirmed information without reason

### User agency

Recommendations remain explainable and reversible.

Board, Chamber, Shari, and automation contributions must preserve user control.

### Accessibility and cognitive ease

Every layer must reduce burden through:

- clear language
- limited choices
- visual hierarchy
- recovery from interruption
- resume support
- low-energy modes
- readable design
- forgiving workflows
- no punitive completion model

## Operating-partner behavior

Before responding or recommending, Spark Estate should determine:

1. What is the user trying to accomplish?
2. What canonical Work already exists?
3. What does the platform already know?
4. Which capabilities are required?
5. Which Member owns each capability?
6. Which Collection or Blueprint best fits?
7. What is the user's experience in each relevant capability?
8. What is the user's confidence in each relevant capability?
9. What is their current cognitive and practical capacity?
10. What is the smallest useful next step?
11. Should the platform teach, guide, collaborate, execute, review, or simply listen?
12. What should be hidden for now?

## Guidance modes

Spark Estate may adapt between:

- Talk It Out
- Help Me Choose
- Teach Me
- Guide Me Step by Step
- Build It With Me
- Draft It for Me
- Review What I Have
- Challenge My Thinking
- Give Me the Essentials
- Take Me to the Right Place
- Body Double With Me

The mode may be suggested, but never forced.

## Relationship to existing architecture

This specification does not replace the Universal Work Engine.

It governs how intelligence, Collections, capabilities, user adaptation, and orchestration connect to it.

Existing certified Work Types remain authoritative.

Existing Chamber knowledge, routing, implementation, conversation, testing, and certification files remain valuable and must be mapped into this architecture rather than discarded.

## Required implementation outcomes

The platform must eventually provide:

- Intelligence Member Registry
- Capability Registry
- Collection Registry
- Blueprint Registry
- Business Identity Registry
- User Capability Map
- User Confidence Map
- Adaptive Context contract
- capability-based routing
- contributor orchestration
- provenance and attribution
- duplicate detection
- certification harness
- architecture health reporting

## Completion standard

This architecture is successfully implemented only when:

- Collections can cross multiple Members without duplicating knowledge
- one owner remains accountable
- contributors are dynamically assembled through capabilities
- user guidance adapts by capability, confidence, and current state
- existing Work remains canonical
- users experience one business partner rather than many disconnected systems

# Cursor Implementation Prompt — Add Create to My Work

## Purpose

Add **Create** as a first-class destination under **My Work**.

Create is currently missing from the My Work navigation even though creation is a core Spark Estate™ capability.

The user must be able to intentionally enter a creation experience from My Work without first having to phrase a request in chat, open an unrelated document workflow, or navigate through another destination.

---

# Required Navigation Structure

Under:

**Welcome Home → My Work**

add:

**Create**

Preserve all existing My Work destinations.

Do not remove, rename, reorder, or merge unrelated destinations unless existing approved navigation evidence requires it.

Place Create in a prominent, logical position near the beginning of My Work.

Recommended order:

1. Create
2. Projects
3. existing remaining My Work destinations

If the repository has an already approved My Work order, insert Create in the most prominent appropriate position without disturbing the established structure.

---

# Required Meaning of Create

Create is the intentional starting place for making something.

It is not limited to documents.

It may begin work such as:

- document
- email
- social post
- presentation
- worksheet
- checklist
- plan
- strategy
- framework
- client material
- business content
- visual content
- template
- other supported creations

Create must use the existing global Create architecture and capability routing.

Do not build a disconnected second creation engine.

---

# Entry Behavior

Clicking:

**My Work → Create**

must:

- close the Welcome Home menu
- open the approved Create destination
- show the user what Create is for
- allow the user to begin a new creation
- avoid resuming stale work automatically
- avoid asking ADHD versus Business unless genuinely needed
- avoid routing to an old Create Document workflow by default
- avoid forcing the user into a document type before their goal is understood
- keep Shari as the single visible response owner

Fresh entry means:

- new intentional creation entry
- no silent stale workflow resume
- no unrelated old draft appearing
- no previous artifact type being assumed

Explicit Resume remains available where approved, but must not take over fresh Create entry.

---

# Create Destination Experience

## Title

**Create**

## Plain-Language Explanation

Recommended:

> Make something new with Shari—from a quick email or checklist to a strategy, presentation, client resource, or larger project.

The explanation should make clear that Create is broader than Create Document.

## Starting Choices

Use a calm, readable estate-style presentation.

Recommended high-level choices:

- Start with what I need
- Browse things I can create
- Continue a saved creation

Do not show an overwhelming grid of every possible artifact on first entry.

The first option should allow the user to state naturally what they want to make.

The second may progressively reveal supported creation types.

The third must show only valid saved or resumable creations.

---

# Create Is Not Projects

Clearly preserve the difference:

## Create

Use when the user wants to make an output.

Examples:

- write an email
- build a checklist
- create a strategy
- draft a presentation
- develop a client resource

## Projects

Use when the user wants to organize and manage ongoing work.

Examples:

- track a launch
- manage a client engagement
- collect related tasks and files
- maintain a longer body of work

Visible explanation should make this distinction understandable where useful.

Do not automatically create a Project for every creation.

---

# Create Is Not Strategy Library

Strategy creation may be initiated from Create, but:

- Strategy Library remains under Get Advice
- Strategy Library owns browse, apply, create, and resume strategy modes
- Create may route a clear strategy request to the Strategy Library create mode
- do not duplicate the strategy-building architecture

---

# Create Is Not a Generic Document Fast Path

The existing global intent and workflow gate must determine the correct creation capability.

Required:

- “create a strategy” → strategy create mode
- “write an email” → email creation
- “make a checklist” → checklist/document capability as appropriate
- “create a presentation” → presentation capability
- “help me make something” → gentle clarification
- “continue my saved proposal” → valid resume decision

Do not treat all requests as simple document creation.

---

# One How Do I…

The Create destination must contain exactly one shared:

**How Do I…**

It may explain:

- what Create is for
- how to begin
- how to choose a creation type
- the difference between Create and Projects
- how saved creations work
- how to resume
- how Shari helps

Do not create separate help sections for each creation type on the entrance screen.

---

# Spark Estate Presentation

Create must use the approved estate format.

Required:

- dedicated estate destination or estate-style shared window
- large readable title
- short explanation
- calm progressive disclosure
- readable creation choices
- one shared How Do I…
- full vertical scrolling
- Welcome Home return control
- Escape and click-outside behavior where the global window contract applies

Do not use:

- old split chat/workspace shell
- tiny legacy toolbar controls
- an overwhelming artifact grid
- a generic blank document screen
- unrelated floating corner widgets

---

# Scrolling

The Create experience must be scrollable.

Verify:

- all choices reachable
- How Do I… reachable
- saved creations reachable
- creation-type browser reachable
- no buttons clipped
- no content hidden behind fixed navigation
- mouse, trackpad, keyboard, and touch scrolling
- no unnecessary nested scroll traps

---

# State and Ownership

Identify and preserve authoritative owners for:

- My Work navigation
- Create route
- Create intent
- creation-type classification
- workflow resume decision
- active creation state
- visible Shari response
- saved/resumable creations

Do not create duplicate stores or route owners.

Use the existing:

- global intent/workflow gate
- WorkflowResumeDecision
- Universal Create or successor architecture
- explicit-create lock
- single-response ownership

where applicable.

---

# Required Automated Tests

## Navigation

- My Work shows Create
- Create is independently clickable
- existing My Work destinations remain
- Create opens on first click
- dropdown closes after selection
- keyboard activation works

## Fresh Entry

- fresh Create does not resume stale document work
- fresh Create does not assume a prior artifact type
- fresh Create shows the entrance experience
- one visible Shari response only

## Intent Routing

- create a strategy routes correctly
- write an email routes correctly
- make a checklist routes correctly
- create a presentation routes correctly
- ambiguous create request asks one useful clarification
- explicit resume uses WorkflowResumeDecision

## Experience

- Create versus Projects distinction is clear
- one How Do I… appears
- window scrolls fully
- Welcome Home works
- Escape and click-outside follow the global contract

## Regression

- Projects still opens
- Strategy Library still opens from Get Advice
- old saved creations remain available
- no duplicate Create item
- no unrelated My Work item changes

---

# Constraints

- do not create a second creation engine
- do not make Create synonymous with Create Document
- do not move Strategy Library out of Get Advice
- do not merge Create and Projects
- do not remove existing My Work destinations
- do not auto-resume stale work
- do not deploy production until authenticated preview passes

---

# Required Report

Return:

- exact files changed
- My Work navigation owner
- Create route owner
- Create entrance owner
- intent/classification owner
- workflow-resume owner
- saved-creation owner
- Shari response owner
- automated tests
- preview URL
- screenshots or preview evidence
- remaining limitations
- deploy or do-not-deploy recommendation

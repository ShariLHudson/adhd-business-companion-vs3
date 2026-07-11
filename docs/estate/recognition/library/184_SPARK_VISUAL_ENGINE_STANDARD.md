# 184_SPARK_VISUAL_ENGINE_STANDARD

# Spark Estate™
## Spark Visual Engine™ Standard

**Version:** 1  
**Status:** Binding product law  
**Date:** 2026-07-09  
**Series:** Visual Thinking / Visual Engine (184)  
**Source:** `Downloads/184_SPARK_VISUAL_ENGINE_STANDARD.md`

**Related:**
- [183 Universal Access Standard](./183_UNIVERSAL_ACCESS_STANDARD.md)
- [182 Spark Estate Completion Roadmap](./182_SPARK_ESTATE_COMPLETION_ROADMAP.md)
- [151 Spark Companion Runtime Architecture](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md)
- [100 Spark Estate Master Manifest](./100_SPARK_ESTATE_MASTER_MANIFEST.md)
- Runtime — `lib/sparkVisualEngine/` · `lib/visualThinkingStudio.ts`

---

## Purpose

Define the shared visual mapping engine used across Spark Estate™.

The Spark Visual Engine™ is not a single room and not a standalone feature. It is a universal visual layer that can appear anywhere when the member wants to see, map, organize, connect, compare, or understand something visually.

Member-facing language should usually be:

- Visualize This
- Map This Out
- Show Me Visually
- Create a Mind Map
- Create a Workflow
- Show the Connections

---

## Core Principle

Visual Thinking™ is a capability, not a destination.

The member may request a visual map from any room, experience, or conversation.

Spark should open the correct visual view immediately when the request is clear.

---

## Activation Paths

### 1. Direct Member Request

Direct requests always take priority.

Examples:

- “Create a mind map.”
- “Make a flowchart.”
- “Show this as a timeline.”
- “Create a workflow.”
- “Map this out.”
- “Show the relationships.”
- “Create a decision tree.”
- “Visualize this project.”

Spark should immediately open the requested visual view.

Do not ask whether they want to visualize when they already asked for it.

---

### 2. Spark Suggestion

Spark may suggest visualization when it notices complexity.

Examples:

- Many related ideas
- Several steps
- Multiple options
- A system or process
- A project with many parts
- A decision with tradeoffs

Spark may say:

> “This might be easier to see visually. Would you like me to map it out?”

---

### 3. Visualize Button

Any major experience may include a **Visualize This** button.

Examples:

- Clear My Mind™
- Projects™
- Decision Compass™
- Journal
- Creative Studio™
- Destination Gallery™
- Evidence Vault™

---

## Visual Views

The Spark Visual Engine™ should support multiple views of the same underlying data.

### Thought Map
Best for raw thoughts, brain dumps, and idea clusters.

### Mind Map
Best for concepts, topics, and branching ideas.

### Project Map
Best for goals, milestones, tasks, and resources.

### Process Map
Best for workflows, systems, SOPs, and step-by-step operations.

### Relationship Map
Best for showing connections between people, ideas, projects, themes, or systems.

### Timeline
Best for dates, sequences, plans, phases, and order of events.

### Priority View
Best for urgency, importance, quick wins, energy, and effort.

### Decision View
Best for options, pros, cons, risks, unknowns, and next steps.

### Possibility View
Best for expansion, brainstorming, creative options, product ideas, offers, and future paths.

### Journey View
Best for customer journeys, member journeys, learning paths, and transformation paths.

---

## Alias Library

### Mind Map Aliases
- mind map
- mindmap
- mind mapping
- idea map
- brain map
- concept map
- topic map

### Process Map Aliases
- process map
- workflow
- flowchart
- SOP
- system map
- business process
- step-by-step map

### Timeline Aliases
- timeline
- roadmap
- schedule
- sequence
- order this
- phases
- plan over time

### Decision View Aliases
- decision tree
- decision map
- compare options
- pros and cons
- help me decide
- map the choices

### Relationship Map Aliases
- relationship map
- show connections
- how these connect
- network map
- connection map

### Possibility View Aliases
- possibilities
- expand this
- brainstorm
- explore ideas
- show opportunities
- what could this become

---

## Node Actions

Every visual item/node should support:

- Edit
- Move
- Connect
- Disconnect
- Add child item
- Add note
- Convert to project
- Convert to task
- Schedule
- Save to Google Docs
- Save to Google Drive
- Send to Destination Gallery™
- Save to Evidence Vault™
- Delete

---

## Context Sources

The Spark Visual Engine™ may receive data from:

- Clear My Mind™ captures
- Projects™
- Journal entries
- Decision Compass™
- Workshop creation
- Marketing plans
- Business systems
- Client journeys
- Evidence Vault™ discoveries
- Hall of Accomplishments™ entries
- Conversations
- Uploaded documents
- Notes

---

## Recommended View Logic

Spark may recommend a view based on content.

Examples:

- Raw mixed thoughts → Thought Map
- A central topic with branches → Mind Map
- Steps or operations → Process Map
- Options and tradeoffs → Decision View
- Dates or phases → Timeline
- Tasks and goals → Project Map
- Many connected themes → Relationship Map
- Future directions → Possibility View

The recommendation should help, not restrict.

The member may switch views at any time.

---

## Universal Access Rule

The Visual Engine must be callable from anywhere.

No room or experience may block access to visual mapping if the member asks for it.

Current location may affect the background or workspace framing, but not the capability.

---

## Member Experience

The experience should feel like Spark has laid the information out on a table so the member can finally see it clearly.

The member should not feel like they are using diagram software.

They should feel like Spark is helping them understand their own thinking.

---

## Success Criteria

The Spark Visual Engine™ is successful when:

- Members can request any visual view directly.
- Spark opens the requested view without unnecessary questions.
- The same data can be viewed in multiple ways.
- Visual nodes can become real actions.
- Visual Thinking™ works from any room or experience.
- Members leave with more clarity than they had before.

**Runtime:** `lib/sparkVisualEngine/` · studio views in `lib/visualThinkingStudio.ts` · Universal Access opens `visual-focus`

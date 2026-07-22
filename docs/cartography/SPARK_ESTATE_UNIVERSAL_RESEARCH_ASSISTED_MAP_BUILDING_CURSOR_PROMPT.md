# Spark Estate — Research-Assisted Map Building
## Universal Cartography Intelligence Prompt for Cursor / Claude

# Mission

Add a research-assisted building capability to every Spark Estate map type.

The user should not need to already know the steps, structure, categories, relationships, or best-practice framework required to create a useful map.

Spark Estate must be able to:

- understand what the user wants to map
- identify when the user lacks the necessary knowledge
- research the subject when appropriate
- build the map step by step
- explain each step in plain language
- adjust the amount of detail
- expand or simplify any branch
- preserve sources and confidence where research is used
- let the user edit, save, print, export, duplicate, archive, and delete the finished map

This capability must work across all approved map types.

---

# Core Experience

A user should be able to say:

> I want to create a process map for how to make a Loom video, but I do not know the steps.

Spark Estate should respond naturally:

> I can help with that. I can research the process, build the map step by step, and adjust the level of detail as we go. Would you like a simple overview, a practical working version, or a detailed process?

The user should not have to leave Cartography, search elsewhere, or know how the process works before starting.

---

# Supported Universal Behavior

Research-assisted building must work for:

- Mind Map
- Decision Map
- Relationship Map
- Process Map
- Journey Map
- Timeline Map
- Strategy Map
- Opportunity Map
- System Map
- Priority Map

The intelligence must adapt to the map type.

It must not use the same structure for every map.

---

# Research-Assisted Entry

When the user starts a map, ask one clear question:

> What would you like to map?

Then detect whether the user:

1. already knows the content
2. knows part of the content
3. wants Spark Estate to research it
4. is unsure how the map should be structured

If the user indicates uncertainty, offer:

- Research It for Me
- Build From What I Know
- Help Me Think It Through

Do not force the user to choose research terminology.

Natural statements such as these should trigger the research option:

- I do not know the steps.
- I am not sure how this works.
- Can you figure this out for me?
- I know the outcome but not the process.
- I need help researching this.
- Build the map for me.
- I only know part of it.

---

# Research Modes

Provide three simple levels.

## Simple Overview

Best for:

- getting oriented
- seeing major stages
- avoiding overwhelm

Typical result:

- 4–7 primary nodes
- minimal substeps
- plain-language summaries

## Practical Working Map

Best for:

- actually following the process
- planning execution
- assigning work

Typical result:

- stages
- action steps
- decisions
- dependencies
- checkpoints
- useful notes

## Detailed Map

Best for:

- implementation
- training
- SOP development
- delegation
- complex planning

Typical result:

- detailed steps
- substeps
- decision points
- tools
- prerequisites
- warnings
- quality checks
- exceptions
- source notes

The user can change detail level at any time.

---

# Example: Loom Video Process Map

## User request

> I want to create a process map for how to create a Loom video, but I do not know how.

## Recommended first response

> I can research that and build the process for you. Would you like:
>
> - a simple overview
> - a practical step-by-step version
> - a detailed version with setup, recording, editing, sharing, and troubleshooting

If the user says:

> Practical step-by-step.

The map may begin with:

1. Clarify the purpose of the video
2. Prepare what you want to show
3. Open Loom and choose recording settings
4. Test microphone, camera, and screen
5. Record the video
6. Review and trim the recording
7. Add title, description, or call to action
8. Set sharing permissions
9. Copy and send the link
10. Confirm the viewer can access it

The user can then say:

- Add more detail to recording settings.
- Make the preparation section simpler.
- Add troubleshooting.
- Turn this into an SOP.
- Show only the steps my VA needs.
- Add quality checks.
- Remove anything optional.
- Add estimated time to each step.

The system must update the map rather than creating a disconnected second version.

---

# Universal Research Workflow

For every map type, follow this sequence.

## 1. Understand the goal

Capture:

- what the user wants to map
- why they need it
- who will use it
- desired level of detail
- whether it is personal, business, educational, or operational
- whether the information may be time-sensitive

Do not ask every question upfront.

Ask only what is necessary to begin.

## 2. Determine what is known

Separate:

- user-provided facts
- assumptions
- missing information
- areas requiring research
- areas requiring user judgment

Never present assumptions as facts.

## 3. Research when appropriate

Use research when:

- the user asks for it
- the user says they do not know
- the subject depends on external facts
- the process may have changed
- tools, regulations, or software behavior may be current
- reliable structure is needed

Use primary or authoritative sources when available.

Preserve:

- source title
- source organization
- access date
- relevant link or citation
- confidence level
- notes about disagreement or uncertainty

## 4. Build the first useful version

Do not wait until every detail is known.

Build a usable first map with:

- clear structure
- logical order
- meaningful labels
- no placeholder branches
- no duplicate nodes
- no unexplained jargon

## 5. Invite refinement

Offer only a few relevant choices:

- Add More Detail
- Make This Simpler
- Research This Branch
- Add Examples
- Add Risks or Warnings
- Add Tools or Resources
- Turn Into Tasks
- Continue Building

Do not show every possible action at once.

---

# Map-Type-Specific Research Behavior

## Mind Map

Research should identify:

- major concepts
- subtopics
- themes
- examples
- supporting ideas
- related questions

Example:

> Create a mind map of ways to market a coaching business.

The system may research current channels, content types, referral methods, partnerships, and audience-building approaches.

## Decision Map

Research should identify:

- options
- evaluation criteria
- tradeoffs
- risks
- benefits
- costs
- uncertainties
- reversible vs. irreversible choices

The system must not make the decision for the user.

It may recommend a next step or summarize strongest options, but preserve user agency.

## Relationship Map

Research should identify:

- people
- roles
- organizations
- dependencies
- influence
- communication paths
- stakeholders
- missing relationships

For personal or private relationships, research should not invent facts.

## Process Map

Research should identify:

- start point
- end point
- stages
- actions
- decisions
- tools
- owners
- dependencies
- quality checks
- exceptions
- failure points

This is the primary example for researched step-by-step building.

## Journey Map

Research should identify:

- user stages
- goals
- actions
- thoughts
- emotions
- friction
- touchpoints
- opportunities
- moments that matter

The system should distinguish researched industry patterns from actual user evidence.

## Timeline Map

Research should identify:

- dates
- sequence
- milestones
- dependencies
- historical events
- future deadlines
- duration estimates

Time-sensitive facts must be researched rather than guessed.

## Strategy Map

Research should identify:

- goal
- strategic pillars
- capabilities
- initiatives
- assumptions
- measures
- risks
- dependencies
- sequencing

Do not confuse strategy with a task list.

## Opportunity Map

Research should identify:

- needs
- problems
- trends
- underserved audiences
- potential offers
- market gaps
- constraints
- validation questions
- evidence strength

Clearly label hypotheses vs. researched evidence.

## System Map

Research should identify:

- components
- inputs
- outputs
- flows
- feedback loops
- dependencies
- bottlenecks
- boundaries
- external influences

## Priority Map

Research should identify:

- items to compare
- criteria
- urgency
- importance
- effort
- impact
- dependencies
- risk
- user values

The system may help score options but should show how the score was formed.

---

# Branch-Level Research

Every node or branch should support:

- Research This
- Add More Detail
- Simplify
- Add Examples
- Add Sources
- Add Risks
- Add Tools
- Add Decision Points
- Add Quality Checks
- Turn Into Tasks
- Remove
- Rename
- Move

When the user selects `Research This`, research only that branch unless broader research is necessary.

Example:

The Loom process map contains:

`Prepare what you want to show`

The user selects:

`Research This`

The system may expand it into:

- define the viewer
- clarify the outcome
- outline key points
- open required tabs
- close private or distracting windows
- prepare files or links
- write a short opening and closing
- decide whether camera should be on

Do not rebuild the whole map unless requested.

---

# Detail Controls

Provide a simple detail control:

- Less Detail
- Current Detail
- More Detail

Or:

- Overview
- Working
- Detailed

The user should also be able to say naturally:

- Make this shorter.
- Add more detail.
- This is too much.
- Explain step four.
- Expand only the editing part.
- Make this suitable for a beginner.
- Make this suitable for my VA.
- Turn this into an expert-level process.

The map should update in place.

---

# Audience Adaptation

Allow the user to specify who the map is for.

Examples:

- beginner
- expert
- employee
- VA
- client
- student
- team
- founder
- personal use

Adapt:

- terminology
- amount of explanation
- examples
- step size
- assumptions
- warnings
- supporting notes

Do not change the map's core truth solely for tone.

---

# Research Transparency

When research is used, provide a discreet source area.

Suggested label:

`Research Used`

Allow the user to view:

- sources
- date researched
- which nodes use each source
- confidence
- unresolved questions

Do not clutter the main map with long citations.

Use node-level source indicators where appropriate.

---

# Confidence and Uncertainty

Each researched branch may have:

- High confidence
- Moderate confidence
- Needs confirmation

Use `Needs confirmation` when:

- sources conflict
- information is highly context-dependent
- the process depends on account settings, location, law, or version
- user-specific facts are missing

Never hide uncertainty.

---

# Freshness Rules

Research again when:

- software has changed
- regulations may have changed
- current market information is involved
- the user asks for the latest process
- the saved research is old enough to be unreliable

Store:

- researched_at
- source set
- freshness category
- refresh recommendation

---

# Research-to-Map Architecture

Suggested data model:

```ts
type ResearchSource = {
  id: string;
  title: string;
  organization?: string;
  url?: string;
  accessedAt: string;
  authorityLevel: "primary" | "authoritative" | "secondary" | "community";
};

type MapNodeResearch = {
  nodeId: string;
  sourceIds: string[];
  confidence: "high" | "moderate" | "needs-confirmation";
  researchedAt: string;
  notes?: string;
};

type MapDetailLevel = "overview" | "working" | "detailed";

type ResearchAssistedMap = {
  mapId: string;
  mapType: string;
  topic: string;
  audience?: string;
  detailLevel: MapDetailLevel;
  userKnownFacts: string[];
  researchedFacts: string[];
  assumptions: string[];
  unresolvedQuestions: string[];
  sources: ResearchSource[];
  nodeResearch: MapNodeResearch[];
};
```

Adapt to the current codebase.

---

# Conversational Behavior

Shari should sound calm, capable, and collaborative.

Good:

> You do not need to know all the steps. I can research the process and build a first version for you.

Good:

> I found enough to create a practical starting map. We can make any branch simpler or more detailed.

Good:

> This part depends on how your Loom account is set up, so I marked it for confirmation rather than guessing.

Avoid:

- dumping a research report before building the map
- asking ten questions at once
- pretending certainty
- using technical research jargon
- requiring the user to organize the information first
- sending the user away to research manually

---

# Progressive Disclosure

The default screen should remain simple.

Show:

- the map
- one clear next action
- a small `Research & Expand` control

Hide until needed:

- source lists
- confidence details
- advanced research options
- all branch actions
- technical metadata
- full intelligence panels

The power should be available without being visually overwhelming.

---

# Suggested Controls

Primary:

- Add a Branch
- Research & Build
- Add More Detail
- Make Simpler
- Save

Secondary under More:

- Sources
- Change Audience
- Change Detail Level
- Convert to Tasks
- Duplicate
- Print
- Export
- Archive
- Delete

Do not show all controls at once.

---

# Convert Research Into Execution

For maps that naturally lead to action, support:

- Turn Into Tasks
- Turn Into Project
- Create SOP
- Create Checklist
- Create Timeline
- Create Training Guide

Examples:

A detailed Loom Process Map may become:

- an SOP
- a checklist
- a VA training guide
- a linked project
- a printable reference

The original map remains the source of truth.

Do not duplicate content unnecessarily.

---

# Save and Edit Requirements

Every researched map must support:

- autosave
- manual save status
- edit
- rename
- branch editing
- branch deletion
- undo
- version history where available
- print
- export
- duplicate
- archive
- delete
- restore from Trash
- refresh research
- reopen later

Research results must not disappear after refresh.

---

# Failure Handling

If research fails:

- preserve the user's map
- explain what could not be confirmed
- build from known information where possible
- identify the branch needing more input
- do not invent steps

Example:

> I could build most of the process, but Loom's workspace permissions vary by plan. I left that branch marked for confirmation.

---

# Testing Scenarios

Test at least one scenario for each map type.

## Process Map

> Create a detailed process map for making and sharing a Loom video. I do not know the steps.

## Decision Map

> Help me research whether I should use Zoom, Teams, or Google Meet for client workshops.

## Journey Map

> Build a customer journey map for someone joining an online coaching program.

## Strategy Map

> Research and build a strategy map for launching a local workshop series.

## Timeline Map

> Build a timeline for preparing an online event in eight weeks.

## Mind Map

> Research and map the major areas involved in starting a podcast.

## Opportunity Map

> Research opportunities for serving ADHD entrepreneurs.

## System Map

> Map how leads move through a small consulting business.

## Relationship Map

> Map the roles and dependencies involved in producing a webinar.

## Priority Map

> Help me research and prioritize the first improvements to make to my website.

For each scenario, test:

- overview mode
- detailed mode
- branch-level expansion
- simplification
- source display
- save and reopen
- print
- export
- edit
- delete and restore
- conversion to tasks or project where appropriate

---

# Acceptance Criteria

- [ ] Every map type supports research-assisted creation.
- [ ] Users can begin without knowing the steps.
- [ ] The system detects uncertainty and offers help.
- [ ] Research builds a usable first map.
- [ ] Map structure adapts to map type.
- [ ] Users can request more or less detail.
- [ ] Individual branches can be researched or expanded.
- [ ] Sources and confidence are preserved.
- [ ] Assumptions are clearly separated from facts.
- [ ] Research does not overwhelm the default interface.
- [ ] Maps remain editable after research.
- [ ] Research survives save, refresh, and reopen.
- [ ] Users can convert appropriate maps into tasks, SOPs, checklists, or projects.
- [ ] The original map remains the source of truth.
- [ ] No step is invented when evidence is insufficient.

---

# Final Experience

The user does not have to know how to build the map or even understand the subject fully.

They can simply describe what they need.

Spark Estate researches the subject, creates the correct type of map, explains it step by step, and lets the user make it simpler, deeper, broader, or more practical through ordinary conversation.

The result should feel like:

> I do not have to know how to map this. Spark Estate can help me understand it, research it, and build it with me.

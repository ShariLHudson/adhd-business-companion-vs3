# Strategy Library — Friction Reduction, Guided Workflows, and Cross-Platform Integration

## Purpose

Transform the Strategy Library from a searchable collection into a guided, low-friction strategy companion that works with the rest of Spark Estate™.

The Strategy Library must:

- reduce decision fatigue
- explain what each mode is for
- make every strategy scrollable
- show exactly how a strategy applies to the user's situation
- guide the user through creating a new strategy
- connect strategies to Chamber members
- connect strategies to Board members
- connect strategies to Visual Thinking
- connect strategies to Projects
- connect strategies to Plan My Day
- connect strategies to Reminders and Rhythms
- preserve Shari as the single visible response owner

---

# Core Architectural Role

A strategy is not merely content.

A strategy is a reusable action plan that can be:

- recommended
- personalized
- reviewed
- applied
- visualized
- debated
- scheduled
- saved
- resumed
- adapted
- measured

The Strategy Library owns strategy records and strategy workflows.

Other platform areas contribute expertise, perspective, visualization, execution support, or follow-through.

---

# Ownership Boundaries

## Strategy Library Owns

- strategy catalog
- strategy metadata
- browse
- apply
- create
- resume
- personalization
- implementation steps
- progress
- saved strategies
- success measures
- adaptation history
- strategy lifecycle

## Chamber Members Own

- specialist knowledge
- domain-specific interpretation
- domain-specific recommendations
- questions relevant to their area
- warnings and considerations
- examples

A Chamber member may contribute to a strategy, but does not own the strategy record.

## Board Members Own

- governance-level perspective
- pros and cons
- risk
- trade-offs
- long-term implications
- challenge questions
- values and trust considerations
- devil's-advocate review

The Board reviews or stress-tests a strategy. It does not replace the Strategy Library.

## Visual Thinking Owns

- maps
- diagrams
- timelines
- decision trees
- relationship maps
- process visualizations
- system views

Visual Thinking represents a strategy visually when that genuinely improves clarity.

It does not become the default first step.

## Projects Own

- ongoing execution container
- tasks
- files
- milestones
- related work
- progress over time

A strategy may be attached to a Project, but creating a strategy does not automatically create a Project.

## Plan My Day Owns

- today's execution
- what to do first
- realistic sequencing
- fitting strategy steps into available time

A strategy may send one or more actions into today's plan.

## Reminders Own

- one specific future action
- date/time-based follow-up

A strategy may create reminders for specific actions.

## Rhythms Own

- recurring support
- repeated review
- maintenance cadence
- ongoing behavior

A strategy may create rhythms for recurring practice or review.

## Shari Owns

- the single visible conversation
- contextual guidance
- natural explanation
- orchestration across members and capabilities

---

# Simplified Strategy Home

Replace four equal, unexplained choices with guided choices that explain when each is useful.

## 1. I Have a Problem and Need Help

Maps to Apply.

Explanation:

> Tell Shari what is happening. She will help identify the best strategy, tailor it to your situation, and walk through it with you.

## 2. I Want to Explore Ideas

Maps to Browse.

Explanation:

> Browse strategies by topic or challenge, read how they work, and decide whether one fits.

## 3. I Want to Build My Own Strategy

Maps to Create.

Explanation:

> Build a strategy around your business, ADHD, available time, resources, and real situation.

## 4. Continue Where I Left Off

Maps to Resume.

Explanation:

> Return to a saved strategy with your previous decisions, notes, and progress intact.

Use progressive disclosure and explain each mode before requiring a choice.

---

# Strategy Detail Standard

Every opened strategy must be fully scrollable and follow a predictable structure.

Required sections:

1. What This Strategy Helps With
2. When to Use It
3. When Not to Use It
4. Why It Works
5. How It Applies to Your Situation
6. Your Best First Step
7. Step-by-Step Implementation
8. Chamber Expertise
9. Board Review, when useful
10. Visual View, when useful
11. Common Problems
12. How to Adapt It
13. How to Know It Is Working
14. Save, Add to Plan, Connect to Project, Create Reminder, Create Rhythm
15. Discuss With Shari

---

# Personalized Apply Workflow

## Goal

Turn a generic strategy into the user's version.

## Use Existing Context

Where available, consider:

- business stage
- current projects
- role
- audience
- available time
- energy
- motivation
- ADHD friction
- previous attempts
- resources
- constraints
- commitments
- known preferences

Do not ask for information the platform already knows.

## Apply Steps

1. Confirm the current problem.
2. Identify the desired outcome.
3. Identify constraints.
4. Select the best-fit strategy.
5. Explain why it fits.
6. Show what must change for this user.
7. Create the personalized steps.
8. Identify the first action.
9. Add execution supports.
10. Save and review.

## Output

The applied strategy must include:

- user's situation
- why the strategy fits
- customized steps
- what to ignore
- likely obstacles
- first action
- success signs
- review point

---

# Guided Create Strategy Workflow

Creating a strategy must not begin with a blank page.

## Stage 1 — Define the Problem

- What is happening?
- Who is affected?
- Why does it matter now?
- Is this recurring or one-time?

## Stage 2 — Define Success

- What would better look like?
- What outcome matters most?
- What must be protected?

## Stage 3 — Understand Constraints

- time
- energy
- motivation
- money
- skills
- people
- technology
- deadlines
- ADHD friction

## Stage 4 — Review Existing Knowledge

- relevant saved strategies
- relevant Chamber expertise
- similar past situations
- previous attempts
- existing research

## Stage 5 — Generate Options

Create a small number of viable approaches.

Do not create an overwhelming list.

## Stage 6 — Chamber Contribution

Route relevant domain questions to the appropriate Chamber member knowledge.

Examples:

- communication strategy → Client Relationships + Content
- pricing strategy → Finance + Sales
- AI strategy → AI & Technology
- delegation strategy → Team / Operations
- customer strategy → Client Intelligence

Chamber contribution is embedded into the strategy record.

Do not open multiple competing chats.

## Stage 7 — Board Review

Use the Board only when the strategy has meaningful:

- risk
- investment
- long-term consequences
- trade-offs
- values implications
- market consequences

Board output may include:

- pros
- cons
- risks
- assumptions
- alternatives
- what to watch
- best option and why

Board review is optional, not mandatory for every strategy.

## Stage 8 — Visual Thinking

Offer visualization only when it helps.

Examples:

- stakeholder map
- process map
- timeline
- decision tree
- system map
- customer journey
- implementation sequence

Explain why the visual would help.

Allow staying in chat.

## Stage 9 — Build the Strategy

Required strategy record:

- title
- purpose
- situation
- desired outcome
- assumptions
- constraints
- chosen approach
- steps
- owners
- timeline
- risks
- measures
- review date
- adaptation rules

## Stage 10 — Connect to Execution

Offer:

- Add first step to Plan My Day
- Add all steps to a Project
- Create a Reminder
- Create a Rhythm
- Save to Strategy Library
- Review with Board
- Visualize
- Discuss with Shari

## Stage 11 — Review and Save

Show the complete strategy in a scrollable review view.

Allow:

- edit
- save
- rename
- duplicate
- archive
- resume later

---

# Chamber Relationship

## How Chamber Members Participate

A strategy may request one or more Chamber knowledge contributions.

The system should:

1. identify relevant domain(s)
2. retrieve Chamber knowledge
3. add specialist guidance to the strategy
4. label the contribution clearly
5. keep Shari as the visible voice

Example:

For “communication strategy for my VA”:

- Client Relationships contributes relationship and communication principles
- Content contributes messaging clarity
- ADHD Strategies contributes working-memory and follow-through adaptations
- Shari combines them into one personalized strategy

Do not expose a confusing multi-member conversation unless the user explicitly enters Chamber.

---

# Board Relationship

## When to Use the Board

Offer Board review when:

- the decision is high-impact
- there are meaningful trade-offs
- the user wants multiple perspectives
- risk or resilience matters
- values or trust matters
- the user asks for Board review

## Board Output Inside Strategy

Store:

- perspectives requested
- directors consulted
- key concerns
- strongest arguments
- unresolved risks
- recommended adjustments

The Board review becomes part of the strategy history.

---

# Visual Thinking Relationship

## When to Offer

Offer Visual Thinking only when:

- complexity is hard to hold in working memory
- relationships need to be seen
- sequencing is unclear
- the strategy contains multiple dependencies
- the user explicitly asks for a visual

## Visual Types

- roadmap
- timeline
- process flow
- stakeholder map
- decision tree
- system map
- journey map

## Rule

Reason first, visualize second.

Do not suggest a map before understanding the problem.

---

# Projects Relationship

A strategy may be connected to a Project when execution is ongoing.

## Connect to Project

Allow:

- attach strategy to existing Project
- create a new Project only with explicit user approval
- send strategy steps to Project tasks
- keep the strategy as the governing plan
- update strategy status from Project progress

Do not automatically turn every strategy into a Project.

---

# Plan My Day Relationship

A strategy may send a realistic next action into today's plan.

Required:

- user chooses the step
- Plan My Day checks available time and energy
- step is sized appropriately
- strategy link is retained
- completion updates strategy progress

Example:

> Add “Draft the first communication agreement for my VA” to today.

---

# Reminders Relationship

Create a reminder when the strategy includes a specific future action.

Examples:

- follow up Friday
- review proposal Tuesday
- send survey next week

The reminder retains:

- strategy ID
- step ID
- purpose
- due date

---

# Rhythms Relationship

Create a rhythm when the strategy requires recurring support.

Examples:

- weekly VA check-in
- monthly pricing review
- Friday follow-up routine
- quarterly strategy review

The rhythm retains:

- strategy ID
- recurring action
- cadence
- review condition

---

# Strategy Lifecycle

Required statuses:

- draft
- ready
- active
- paused
- under review
- adapted
- completed
- archived

Required lifecycle actions:

- create
- apply
- save
- resume
- adapt
- review
- complete
- archive

---

# Decision-Fatigue Rules

- no more than four primary entrance choices
- recommend one likely best path
- use plain-language labels
- reveal detail progressively
- do not ask the user to understand platform architecture
- do not show every connector at once
- offer execution connections after the strategy is clear
- use one primary next step
- avoid repeated questions

---

# Scrolling

All strategy views must be scrollable:

- home
- detail
- apply
- create
- resume
- Board review
- Chamber contribution
- Visual Thinking preview
- final review

No content may be clipped behind fixed chrome.

---

# One How Do I…

The Strategy Library contains one shared How Do I… on the entrance view.

Strategy detail may include contextual inline help, but not duplicate global help controls.

---

# Single Response Ownership

Chamber, Board, Visual Thinking, Projects, Plan My Day, Reminders, and Rhythms contribute structured results.

Shari produces the single visible response.

No competing member messages.

No duplicated recommendations.

---

# Definition of Done

The Strategy Library:

- reduces choice overload
- explains each path
- personalizes strategies
- supports guided creation
- scrolls fully
- connects to Chamber
- connects to Board
- connects to Visual Thinking
- connects to Projects
- connects to Plan My Day
- connects to Reminders and Rhythms
- preserves clear ownership
- keeps Shari as the single visible guide

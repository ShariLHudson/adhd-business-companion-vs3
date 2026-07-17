# Cursor Implementation Prompt — Complete the Plan My Day Workflow

## Purpose

Expand Plan My Day from a simple task-entry list into a complete, supportive day-planning experience.

The current interface successfully lets the user enter tasks, but nothing meaningful happens afterward.

Plan My Day must help the user turn an unstructured list into a realistic, prioritized, sequenced plan for today.

This must be implemented as a guided workflow inside the existing Plan My Day experience.

Do not redesign the approved Plan My Day / Adapt My Day shared window.

---

# Confirmed Current Gap

The user can:

- enter one or more tasks
- see the tasks in Today's List
- mark an item complete
- edit or delete an item
- click “I'm Stuck”

But the platform does not then:

- separate multiple tasks entered in one line
- clarify vague tasks
- identify priorities
- estimate time
- consider appointments
- ask about available time
- consider energy
- sequence the day
- create a usable plan
- recommend a first step
- help when the list is too large
- adapt the plan when circumstances change

The current screen is therefore a task capture list, not a true Plan My Day experience.

---

# Governing Principle

Plan My Day must turn:

> “Here is everything I need to do today.”

into:

> “Here is a realistic plan for what to do, when to do it, and what to begin with.”

The workflow must reduce decision fatigue rather than create more decisions.

---

# Step 1 — Capture and Parse the List

The user may enter:

- one task
- several comma-separated tasks
- several tasks separated by semicolons
- natural language
- a pasted list
- a voice-dictated list

Example:

> work on adhd app, pick up groceries/meds, water plants

The system should identify these as separate candidate tasks:

- Work on ADHD platform
- Pick up groceries and medications
- Water plants

Do not leave multiple unrelated tasks combined in one list item unless the user deliberately wrote them as one task.

## Parsing Requirements

- preserve the user’s words where possible
- split only when confidence is high
- allow the user to merge or separate items
- do not silently lose text
- do not replace content with “Other”
- retain the original input for recovery
- avoid duplicate tasks

---

# Step 2 — Clarify Only What Matters

Do not ask a question about every task.

Clarify only when the answer changes the day plan.

Useful clarifications include:

- Is there a deadline today?
- Is this tied to an appointment?
- Does this require leaving the house?
- Is there a fixed time?
- Is it a quick task or a larger work block?
- Is another person waiting on it?

Avoid unnecessary discovery.

When the likely meaning is clear, make a reasonable planning assumption and allow the user to adjust it.

---

# Step 3 — Gather Today's Constraints

Plan My Day should use known calendar and context when available.

Required planning inputs:

- current date
- current time
- calendar appointments
- available work window
- fixed commitments
- user-entered tasks
- energy level
- motivation level
- deadlines
- errands or location dependencies
- breaks and transition time

Energy and motivation remain separate.

## Suggested User Inputs

Use calm progressive disclosure.

Ask only for missing information that materially affects the plan.

Examples:

- “How much usable time do you have today?”
- “What is your energy like right now?”
- “How motivated do you feel?”
- “Is anything on this list due today?”
- “Do you need to leave the house for any of these?”

Do not make the user complete a long form before receiving help.

---

# Step 4 — Categorize the Work

Classify tasks where useful:

- fixed-time commitment
- must do today
- should do today
- could do today
- errand
- quick task
- focus work
- maintenance
- personal
- business
- waiting on someone
- can delegate
- can defer

This classification supports planning but should not overwhelm the visible interface.

Show only the labels that help the user make a decision.

---

# Step 5 — Estimate Effort and Time

For each task, determine or estimate:

- likely duration
- focus demand
- energy demand
- transition cost
- location dependency
- preparation needed

Use broad estimates when precision is unnecessary:

- 5 minutes
- 15 minutes
- 30 minutes
- 60 minutes
- larger project block

Allow the user to adjust estimates.

Do not pretend estimates are exact.

---

# Step 6 — Identify Today's Real Priorities

The system should identify a small number of priority outcomes.

Recommended:

- one primary outcome
- up to two secondary outcomes
- quick wins where useful

Use:

- deadlines
- consequences
- commitments to others
- business impact
- personal necessity
- energy fit
- available time

Do not rank everything as equally important.

Do not create a ten-item “top priority” list.

---

# Step 7 — Fit the Plan to Reality

Compare:

- total estimated task time
- available time
- energy
- motivation
- fixed commitments

If the list does not fit, say so gently and help reduce it.

Example:

> “You have about four hours of tasks and roughly two usable hours. Let’s choose what truly needs today and move the rest without treating it as failure.”

Offer:

- do today
- move to another day
- delegate
- reduce the scope
- create a smaller first version
- combine errands
- park for later

Do not simply display an impossible schedule.

---

# Step 8 — Build the Day Plan

Create a readable sequence.

Recommended structure:

## Your Main Focus

One most meaningful item.

## Fixed Commitments

Calendar and time-specific items.

## Suggested Order

A realistic sequence based on:

- time
- energy
- location
- dependencies
- transitions

## Quick Wins

Small useful tasks that fit naturally.

## Later or Parked

Items intentionally moved out of today.

## First Step

One concrete action the user can begin now.

Example:

> “Open the ADHD platform project and choose the one issue you want to finish before lunch.”

Do not end with another broad question when a clear first action is available.

---

# Step 9 — Let the User Choose the Planning Style

Offer a small number of useful plan views, not a complex settings panel.

Recommended:

- Gentle Plan
- Balanced Plan
- Focused Plan

## Gentle Plan

- fewer priorities
- more transition time
- lower energy demand
- more flexibility

## Balanced Plan

- realistic mix of focus and maintenance
- moderate structure
- normal breaks

## Focused Plan

- protects one meaningful work block
- minimizes switching
- defers lower-value items

The user should not have to choose a style before the system can help.

A reasonable default may be suggested based on context.

---

# Step 10 — Start the Plan

After the plan is created, provide clear actions:

- Start My First Step
- Adjust This Plan
- Move Something
- Add Another Task
- Save Today's Plan

Do not leave the user with a static summary only.

When the user chooses Start My First Step:

- identify the immediate action
- optionally open the relevant project or destination
- preserve the day plan
- avoid unrelated routing

---

# Step 11 — Connect to Adapt My Day

Plan My Day creates the starting plan.

Adapt My Day changes it later.

From the completed plan, include a clear action:

**Adapt My Day**

Use it when:

- energy changes
- motivation drops
- an interruption occurs
- time is lost
- a new priority appears
- the user falls behind

Do not make the user rebuild the day from scratch.

---

# Step 12 — Improve “I'm Stuck”

The current “I'm Stuck” action must provide contextual help.

It should inspect:

- current task list
- current planning stage
- missing decisions
- task size
- ambiguity
- overwhelm
- available time

Then help with the next bottleneck.

Examples:

- split a large task
- choose the first task
- reduce the list
- clarify one vague item
- create a five-minute starting action
- switch to a Gentle Plan

Do not route automatically to a generic calming destination.

Do not replace task help with an unrelated emotional script.

---

# Step 13 — Save and Resume

The day plan should persist for the current day.

Required:

- save tasks
- save priority selections
- save sequence
- save moved or parked items
- save completion state
- save current first step
- resume later the same day
- avoid mixing yesterday’s plan into today without permission

At the start of a new day:

- offer to review unfinished items
- do not automatically carry everything forward
- let the user choose what still matters

---

# Step 14 — Visual Experience

Preserve the approved side-by-side Plan My Day / Adapt My Day cards at the top.

Below them, Plan My Day should progress through clear sections.

Recommended visible progression:

1. Today's List
2. What Matters Most
3. Time and Energy Fit
4. Your Plan
5. Start Here

Use progressive disclosure so the page does not show every planning control at once.

## Readability

- large text
- clear section headings
- strong contrast
- large buttons
- visible selected states
- enough spacing
- no tiny icons as the only action
- tooltips or labels for edit and delete icons

---

# Step 15 — Scrolling

The shared window must remain fully scrollable.

Required:

- top cards remain reachable
- task-entry area remains reachable
- planning sections remain reachable
- final actions remain reachable
- no clipped content
- no buttons hidden below the viewport
- no nested scroll traps
- scroll position behaves sensibly when a new planning section opens

When the user clicks Add or generates the plan, do not unexpectedly jump them to an unrelated page position.

---

# Step 16 — Shari's Role

Shari should guide the planning naturally.

She may:

- summarize the task list
- identify what appears most important
- explain when the list does not fit
- recommend a realistic sequence
- offer a smaller first step
- help adapt the plan

She should not:

- repeat generic greetings
- ask broad questions already answered by the task list
- restart discovery
- dominate the page with chat
- produce multiple competing responses
- treat every task as a project

Shari remains the single visible conversational response owner.

---

# Required State Model

Create or identify authoritative state for:

```ts
type PlanMyDayState = {
  date: string;
  sourceInputs: string[];
  tasks: PlannedTask[];
  fixedCommitments: CalendarCommitment[];
  availableMinutes?: number;
  energy?: "very-low" | "low" | "steady" | "high";
  motivation?: "very-low" | "low" | "steady" | "high";
  planningStyle?: "gentle" | "balanced" | "focused";
  primaryOutcomeId?: string;
  secondaryOutcomeIds: string[];
  orderedTaskIds: string[];
  parkedTaskIds: string[];
  currentTaskId?: string;
  stage:
    | "capture"
    | "clarify"
    | "prioritize"
    | "fit"
    | "planned"
    | "started"
    | "completed";
};
```

Do not create duplicate day-plan stores if an authoritative owner already exists.

---

# Required Automated Tests

## Task Capture

- comma-separated tasks become separate items
- semicolon-separated tasks become separate items
- pasted multi-line list parses correctly
- original input is preserved
- no characters are dropped
- no duplicate items are created

## Planning

- fixed commitments are included
- available time affects plan
- energy affects plan
- motivation affects plan separately
- deadlines affect priority
- impossible list triggers reduction help
- primary outcome is limited
- sequence is generated
- first step is concrete

## Interaction

- Add performs visible progression
- Generate Plan or equivalent produces a plan
- Start My First Step works
- Adjust This Plan opens Adapt My Day correctly
- I'm Stuck gives contextual task help
- no generic calming route occurs

## Persistence

- same-day plan resumes
- completed items remain complete
- parked items remain parked
- next day does not silently copy everything
- unfinished items may be reviewed intentionally

## UI

- side-by-side cards remain
- one How Do I… remains
- full scroll works
- no clipped controls
- edit and delete controls are accessible
- mobile layout remains usable

---

# Live Verification Scenario

Enter:

> work on adhd app, pick up groceries/meds, water plants

Verify the system:

1. creates three separate tasks
2. asks only essential questions
3. recognizes the errand
4. estimates time or invites adjustment
5. identifies what matters most
6. compares the list to available time
7. creates a realistic order
8. provides a concrete first step
9. allows the plan to be adjusted
10. saves the day plan
11. resumes it later
12. connects to Adapt My Day

---

# Constraints

- do not replace Plan My Day with a generic task list
- do not create a rigid minute-by-minute schedule by default
- do not ask the user to classify every task manually
- do not route “I'm Stuck” to generic calming content
- do not merge Plan My Day and Adapt My Day
- do not remove the current side-by-side design
- do not deploy production until authenticated preview passes

---

# Required Report

Return:

- exact files changed
- Plan My Day state owner
- task parsing owner
- priority owner
- scheduling/sequence owner
- calendar integration owner
- persistence owner
- Shari response owner
- “I'm Stuck” owner
- automated tests
- local result
- preview URL
- screenshots or video evidence
- remaining limitations
- deploy or do-not-deploy recommendation

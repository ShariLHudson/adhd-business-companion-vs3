# Spark Estate — Boardroom Simplification & Director Differentiation
## Cursor Implementation Prompt

# Mission

Redesign the Boardroom so it feels like a thoughtful decision conversation, not a complicated setup experience.

The current Boardroom has too many overlapping selection methods, duplicated controls, overly detailed profile layers, weak differentiation between Directors, repetitive output, and too many follow-up choices at the end.

The improved Boardroom must:

- reduce decision fatigue
- shorten the path from question to discussion
- make Director selection simple
- ensure each Director gives a genuinely different perspective
- remove duplicated response language
- simplify the finish line
- clarify the difference between the Boardroom and the Chamber
- preserve the immersive Round Table experience
- keep all existing valid Board history and saved decisions

---

# Core Experience Standard

The user should be able to:

1. enter the Boardroom
2. state a decision
3. accept recommended Directors
4. receive clearly different perspectives
5. review the Board's combined guidance
6. choose one simple next step

The user should not have to research the full Board before asking a question.

---

# PART 1 — Simplify Boardroom Entry

The current Boardroom home includes:

- Bring a Decision to the Board
- Meet the Directors
- Review Past Board Discussions
- How to Use the Boardroom

Keep these destinations only if they are still useful, but make the main action visually dominant.

## Primary Action

Use:

# Bring a Decision to the Board

This should be the clearest and most prominent action.

## Secondary Actions

Keep these visually quieter:

- Meet the Directors
- Past Discussions
- How the Boardroom Works

Rename `How to Use the Boardroom` to:

`How the Boardroom Works`

This wording is shorter and more inviting.

---

# PART 2 — Explain the Boardroom Immediately

Do not hide the Board-versus-Chamber explanation inside the least-used help item.

Add one short explanation near the primary Boardroom entry:

> The Board helps you evaluate important decisions from several perspectives. When you need deep subject-specific help, Spark Estate may suggest the right Chamber Intelligence—with your permission.

Keep this explanation brief.

Do not use a long comparison table on the main screen.

---

# PART 3 — Simplify Director Selection

## Current Problem

There are currently three overlapping ways to select Directors:

1. flat checkbox list
2. visual Round Table through `My Place at the Table`
3. conversational invitation chips

This is redundant and creates unnecessary cognitive load.

## New Selection Model

Use only two paths:

### Recommended Directors

Default path.

After the user states the decision, Spark Estate recommends the most relevant Directors automatically.

Example:

> These Directors are especially well suited to help with this decision.

Show the recommended Directors as selected.

Primary action:

`Use Recommended Directors`

Secondary action:

`Customize`

### Customize

When the user selects Customize, show one clear selection interface.

Use either:

- a readable Director list with portraits and roles
- or a visual Round Table with visible labels

Do not show both interfaces at the same time.

Do not show conversational chips above the same checkbox list.

---

# PART 4 — Fix Recommended vs. Core Board Duplication

## Current Problem

`Select Recommended Directors` and `Select Core Board` currently choose the exact same five Directors in the same order.

This makes the feature appear broken.

## Required Fix

The two options must have clearly different logic.

### Recommended Directors

Dynamic selection based on:

- decision topic
- keywords
- stakes
- business area
- risk
- people impact
- timing
- financial impact
- user history when appropriate

Recommended Directors should vary by decision.

### Core Board

A stable foundational group used only when the user wants broad general oversight.

If Core Board does not provide enough distinct value, remove the button entirely.

Preferred simplification:

- Keep `Use Recommended Directors`
- Put `Use Core Board` inside Customize or More
- Remove it from the primary quick-selection row

Never present two buttons that produce the same result.

---

# PART 5 — Improve the Round Table Selection View

The Round Table can remain because it supports the immersive Estate experience, but it must not create friction.

## Required Improvements

- show every Director's name without requiring hover
- use large clickable targets
- show the Director's role
- maintain keyboard accessibility
- clearly show selected and unselected states
- make the selected Director brighter
- dim unselected Directors
- do not use tiny unlabeled circles
- do not label this selection tool `My Place at the Table`

That phrase sounds like it refers to the user's own role.

Recommended names:

- `Choose Directors`
- `View the Round Table`
- `Customize the Board`

Use the simplest label that fits the current navigation.

---

# PART 6 — Simplify Director Profiles

## Current Problem

There are 12 Directors with seven expandable profile sections each, creating 84 possible expansions.

The user should not need to study the entire Board before bringing a decision.

## New Profile Structure

Keep full profiles available, but reduce the default burden.

### Director Card

Show only:

- name
- role
- one-sentence perspective
- `View Profile`

### Profile Overview

Show three sections first:

- How I Think
- What I Protect
- When You'll Want Me

Move the remaining material behind:

`More About This Director`

Optional deeper sections may include:

- Questions I'll Ask
- A Decision I Helped Guide
- How I Work With Founders
- You'll Enjoy Working With Me If

Do not display all seven expandable sections at the same level.

---

# PART 7 — Preserve the Four-Step Decision Flow

The current four-step wizard is a good foundation.

Keep:

1. State the decision
2. Why it matters now
3. Optional context
4. Review

Keep:

- one question at a time
- Skip Optional Details
- Back
- Continue
- save progress

Do not add more mandatory steps.

---

# PART 8 — Make Every Director Genuinely Different

## Highest-Priority Problem

Current Director responses use nearly identical boilerplate with role words swapped.

This breaks the promise of receiving several thoughtful perspectives.

## Required Standard

Each Director must have:

- a unique reasoning framework
- distinct priorities
- distinct questions
- distinct concerns
- distinct language patterns
- a different recommendation style
- a different definition of risk
- a different way of evaluating tradeoffs

The user should be able to hide the Director's name and still recognize who is speaking.

---

# Director Response Architecture

Create or strengthen a unique response contract for each Director.

Each response contract should include:

```ts
type DirectorResponseProfile = {
  directorId: string;
  role: string;
  coreLens: string[];
  primaryQuestions: string[];
  protectedInterests: string[];
  riskDefinition: string;
  tradeoffStyle: string;
  evidencePreference: string;
  recommendationStyle: string;
  languagePatterns: string[];
  prohibitedGenericPhrases: string[];
};
```

Adapt this to the existing Board intelligence files and runtime architecture.

---

# Required Director Response Shape

Do not force every Director into the same visible template.

Each Director should respond naturally, but the response should generally contain:

- what they notice first
- the most important concern from their role
- one or two questions
- their current view
- a useful next test or consideration

The order may vary by Director.

Do not use identical headings or identical concluding sentences for every person.

---

# Prohibited Shared Boilerplate

Remove repeated lines such as:

> Looking at this through my lens...

> Protect what matters in my domain...

> Choose the smallest honest next step that still moves the decision forward.

These may not be reused as a universal script.

A phrase may appear only when it authentically belongs to a specific Director.

---

# Example Differentiation

## Chair

Focus:

- strategic fit
- long-term direction
- alignment across the whole business
- timing and readiness

Natural style:

> Shari, before I look at whether this is a good hire, I want to ask whether this role solves the most important constraint in the business right now.

## Finance Director

Focus:

- cost
- cash flow
- return
- downside
- financial flexibility

Natural style:

> The first number I would want is the full monthly cost—not only wages, but tools, supervision time, and the cost of a slow ramp-up.

## Customer & Market Director

Focus:

- customer experience
- market need
- messaging
- demand
- relevance

Natural style:

> I would start with the customer-facing problem. What specifically is not getting done today that is limiting visibility, trust, or sales?

## System / Process Director (People or Talent)

Focus:

- role clarity
- capability
- supervision
- fit
- workload

Natural style:

> The risk is not simply hiring the wrong person. It is hiring before the role has been defined clearly enough for someone to succeed.

## Devil's Advocate

Focus:

- assumptions
- hidden risks
- opposing case
- failure conditions
- premature certainty

Natural style:

> Let us assume this hire does not improve marketing results. What is the most likely reason—and what evidence do you currently have that it will not happen?

These are examples only. Preserve the approved Director identities and role definitions.

---

# PART 9 — Personalize Each Response

Every selected Director should naturally acknowledge the current user by preferred name.

Example:

> We are evaluating Shari's question about whether to hire a part-time marketing assistant.

or:

> Shari, the part of this decision I would examine first is...

Do not hard-code `Shari`.

Use:

1. preferred name
2. first name
3. display name
4. neutral fallback

Do not use the literal visible word `user`.

Do not repeat the name excessively.

---

# PART 10 — Remove Repeated Summary Boilerplate

## Current Problem

The same generic recommendation is repeated:

- in multiple Director responses
- again in the Decision Record

## Required Fix

The Decision Record must synthesize the discussion.

It must not repeat one Director's wording verbatim.

## Decision Record Structure

Use:

### Decision

The exact question being considered.

### Strongest Points of Agreement

Where the Directors aligned.

### Important Differences

Where their perspectives diverged.

### Risks or Unknowns

What still needs attention.

### Current Direction

A concise synthesis, not a forced answer.

### Next Useful Step

One clear next action or experiment.

Do not repeat each full Director response.

Do not automatically state that the Board reached consensus if it did not.

---

# PART 11 — Simplify the Finish Line

## Current Problem

After the recommendation, users see six competing follow-up actions:

- Add to Current Project
- Add to Plan My Day
- Create a Task
- Create a Reminder
- Save to Evidence
- Record as a Decision

Several overlap.

## New Finish-Line Actions

Show no more than three visible choices.

Recommended:

### Primary

`Use This Next Step`

This opens a simple contextual choice only if needed:

- Add to Plan
- Add to Project

### Secondary

`Save Decision`

Only show this when the decision has not already been saved.

### More

Place less common actions inside a More menu:

- Create Reminder
- Save to Evidence
- Export
- Print
- Delete Discussion

Do not show `Record as a Decision` when the Decision Record has already been saved automatically.

---

# Action Routing Rules

Avoid asking the user to decide between overlapping concepts.

## Add to Plan

Use for work intended for today or a specific day.

## Add to Project

Use when the action belongs to an existing or new multi-step project.

## Reminder

Use only when the user needs to be reminded at a specific time or date.

## Evidence

Use only when the discussion contains proof, learning, progress, or confidence-building material worth preserving.

The platform should recommend the most appropriate destination instead of showing all possible destinations equally.

---

# PART 12 — Boardroom, Chamber, and Strategy History

## Current Problem

Boardroom history, Chamber advice, and research notes are separated even when they relate to the same topic.

This creates cross-platform fragmentation.

## Near-Term Requirement

Do not delete existing histories.

Preserve:

- Board discussions
- Chamber conversations
- Strategy Library or research records

Add shared topic or matter identifiers where possible so related items can be linked later.

Example:

```ts
type RelatedMatterReference = {
  matterId?: string;
  topic?: string;
  sourceType: "board" | "chamber" | "research" | "journal";
  sourceId: string;
};
```

## User-Facing Improvement

On a Board discussion record, add:

`Related Work`

This may show linked:

- Chamber advice
- research notes
- projects
- decisions

Do not force a full history architecture rewrite inside this Boardroom task unless the shared architecture already exists.

The immediate goal is to prevent deeper fragmentation and prepare for a future unified timeline.

---

# PART 13 — Past Discussions

Simplify Past Discussions.

Each discussion card should show:

- decision title
- date
- participating Directors
- current status or direction
- Open

Optional More menu:

- Rename
- Print
- Delete

Allow search only if there are enough records to justify it.

Do not display dense metadata by default.

---

# PART 14 — Visual Selection State

Selected Directors must be visually dominant.

## Selected

- bright
- full opacity
- checked
- stronger contrast
- gold border or glow
- active appearance

## Unselected

- slightly dimmed
- no check mark
- lower emphasis
- still readable and selectable

Do not make unselected cards look disabled.

Selection must be communicated by more than color alone.

---

# PART 15 — Accessibility

- all Director choices keyboard accessible
- selected state exposed through semantic attributes
- visible focus states
- profile expanders use correct ARIA behavior
- Round Table names visible without hover
- small targets replaced with accessible click areas
- response headings identify Director name and role
- dimming does not make text unreadable
- wizard works with keyboard and screen readers
- More menus are accessible

---

# PART 16 — Data Preservation

Preserve:

- Director profiles
- selected Director IDs
- Board histories
- saved discussions
- Decision Records
- existing user decisions
- profile name data
- Director portraits and seat assignments

Do not create duplicate Board data sources.

Do not erase historical responses when updating prompts.

Old discussions may remain in their original wording.

New discussions must use the improved response architecture.

---

# PART 17 — Testing

## Selection

Test:

- recommended selection varies by decision
- Core Board differs from Recommended
- Customize works
- one Director
- multiple Directors
- Select All
- Clear All
- Round Table selection
- list selection
- mobile
- keyboard

## Profiles

Test:

- default profile overview
- More About This Director
- all sections accessible
- profiles do not block the decision flow

## Responses

Run at least ten different decision types, including:

- hiring
- pricing
- partnership
- technology
- customer issue
- financial investment
- business direction
- ethical concern
- workload
- risk

For each decision:

- compare every selected Director response
- confirm different reasoning
- confirm different language
- confirm no repeated boilerplate
- confirm the user's preferred name appears naturally
- confirm the Decision Record is a synthesis

## Finish Line

Test:

- decision automatically saved
- decision not yet saved
- Add to Plan
- Add to Project
- Reminder through More
- Evidence through More
- no duplicate Record as a Decision option

## History

Test:

- old discussions preserved
- new discussions saved
- related work references
- opening and deleting a discussion

---

# Acceptance Criteria

## Entry and Selection

- [ ] Bring a Decision is the dominant entry action.
- [ ] The Board-versus-Chamber explanation is visible early.
- [ ] Recommended Directors are selected automatically.
- [ ] Customize is optional.
- [ ] Only one selection interface appears at a time.
- [ ] Conversational chips do not duplicate the list.
- [ ] Round Table names are visible without hover.
- [ ] `My Place at the Table` is renamed or removed.
- [ ] Core Board and Recommended do not select the same group by default.

## Profiles

- [ ] Director cards show a short useful overview.
- [ ] Only three primary profile sections appear first.
- [ ] Deeper profile content is grouped under More.
- [ ] Users do not need to vet the whole Board before asking a question.

## Responses

- [ ] Every Director has a genuinely distinct reasoning style.
- [ ] Shared generic boilerplate has been removed.
- [ ] The user could recognize the Director without seeing the name.
- [ ] Each Director naturally uses the user's preferred name.
- [ ] The Decision Record synthesizes rather than repeats.
- [ ] Differences and disagreements are preserved honestly.

## Finish Line

- [ ] No more than three visible actions appear.
- [ ] Overlapping actions are consolidated.
- [ ] Record as a Decision is not duplicated.
- [ ] The platform recommends the most appropriate next destination.
- [ ] Less common actions live under More.

## Preservation

- [ ] Existing Board history remains intact.
- [ ] Existing Director profiles remain available.
- [ ] Existing saved decisions remain available.
- [ ] New response behavior applies to future discussions.
- [ ] Related-work architecture is supported without breaking existing history.

---

# Final Experience Standard

The Boardroom should feel like this:

1. Shari brings a real decision.
2. Spark Estate recommends the right Directors.
3. Shari accepts or customizes the group.
4. Each Director responds from a clearly different perspective.
5. The Board Record shows where they agree, where they differ, and what matters next.
6. Shari sees one clear next step instead of six competing actions.

The Boardroom should feel like trusted people thinking around a table—not one generic answer repeated under different names.

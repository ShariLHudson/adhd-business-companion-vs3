# Cursor Implementation Prompt — Strategy Library Guided and Connected Experience

Implement the Strategy Library contract using the current estate-format Strategy Library as the visual foundation.

## Required Workstreams

1. Simplify the entrance experience.
2. Expand explanations for Browse, Apply, Create, and Resume.
3. Make all strategy views scrollable.
4. Add the standardized strategy-detail template.
5. Build personalized Apply workflow.
6. Build complete guided Create workflow.
7. Add Chamber contribution support.
8. Add optional Board review.
9. Add optional Visual Thinking.
10. Add Project, Plan My Day, Reminder, and Rhythm connections.
11. Preserve Shari as single visible response owner.
12. Preserve existing strategy data and modes.

## Architecture

Identify authoritative owners for:

- strategy record
- strategy mode
- active strategy
- strategy personalization
- Chamber contribution
- Board review
- visual representation
- Project attachment
- day-plan connection
- reminder connection
- rhythm connection
- progress
- saved/resume state

Do not create duplicate owners.

## Entrance

Replace unexplained equal-choice cards with plain-language guided choices:

- I Have a Problem and Need Help
- I Want to Explore Ideas
- I Want to Build My Own Strategy
- Continue Where I Left Off

Retain internal modes:

- apply
- browse
- create
- resume

Recommend the likely best path based on the user's request.

## Apply Workflow

Implement:

- problem confirmation
- outcome
- constraints
- strategy recommendation
- why it fits
- user-specific changes
- personalized steps
- first action
- success measures
- review point
- execution connections

## Create Workflow

Implement all stages in the contract.

Use progressive disclosure.

Do not show a blank strategy form.

## Chamber

Use relevant Chamber knowledge as structured contributions.

Do not open multiple chats.

Show a concise section such as:

**Specialist guidance used**

with relevant member roles.

## Board

Offer optional review only when useful.

Allow the user to choose:

- full Board
- selected directors
- skip for now

## Visual Thinking

Offer only after the strategy is understood.

Explain why a visual would help.

Allow staying in the strategy view.

## Execution Connections

Provide clear actions:

- Add to Plan My Day
- Connect to Project
- Create Reminder
- Create Rhythm
- Review with Board
- Visualize This
- Save Strategy

Do not show every action before the strategy is ready.

## Scrolling

Add one reliable scroll owner per view.

Test long strategy content.

Ensure final actions are reachable.

## Tests

Add tests for:

- simplified entrance
- explanations
- browse
- apply personalization
- create workflow stages
- resume
- strategy detail structure
- long-content scrolling
- Chamber contribution
- optional Board review
- optional Visual Thinking
- Project connection
- Plan My Day connection
- Reminder creation
- Rhythm creation
- one Shari response
- no premature tool recommendation
- stale workflow rejection

## Constraints

- do not delete existing strategies
- do not rewrite Chamber libraries
- do not duplicate Board architecture
- do not make Visual Thinking mandatory
- do not auto-create Projects
- do not auto-create Reminders or Rhythms
- preview only
- no production deployment

## Required Report

Return:

- exact files changed
- owners for every integration
- preserved capabilities
- new workflow stages
- automated tests
- preview URL
- screenshots
- remaining limitations
- deploy or do-not-deploy recommendation

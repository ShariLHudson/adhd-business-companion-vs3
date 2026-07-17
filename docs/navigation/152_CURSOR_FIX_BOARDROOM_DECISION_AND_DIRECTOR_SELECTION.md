# Cursor Implementation Prompt — Fix Boardroom Decision Intake and Director Selection Flow

## Purpose

Correct the Round Table Boardroom experience.

Two connected flows are currently broken:

1. **Bring a Decision to the Board**
   - does not ask the user what decision they want to discuss
   - jumps too quickly into member selection
   - shows a Chair requirement that cannot be meaningfully answered

2. **Meet the Directors**
   - allows the user to select directors
   - appears to offer Start Discussion
   - does not actually begin the discussion
   - returns to a blocking message that the Chair is required

The Boardroom must support a complete, natural consultation flow.

---

# Approved Boardroom Entry Paths

The Boardroom may have multiple entry points, but they must converge into one shared discussion session model.

Approved paths:

## Path A — Bring a Decision to the Board

1. Ask what decision, problem, question, or situation the user wants help with.
2. Capture enough context to begin.
3. Let the user choose Board members.
4. Start the discussion with the selected members.
5. Allow adding or removing members during the discussion where appropriate.
6. Produce a structured Board response.
7. Let the user continue, refine, compare options, or save the discussion.

## Path B — Meet the Directors

1. Let the user browse Director profiles.
2. Let the user select one or more Directors.
3. Let the user choose **Start a Discussion**.
4. Ask what they want to discuss if no topic has been entered yet.
5. Start the discussion with the selected Directors.
6. Do not redirect to a Chair-required error.

Both paths must use the same Board session owner.

---

# Part 1 — Bring a Decision to the Board

## Current Problem

The user selects **Bring a Decision to the Board**, but the platform does not provide a place to state the decision.

This makes the flow incomplete.

## Required Intake

Immediately ask a clear, natural question such as:

> What decision, situation, or question would you like to bring to the Board?

Provide a text area large enough for the user to explain the issue.

Optional supporting prompts may include:

- What are you deciding?
- What options are you considering?
- What matters most in this decision?
- What concerns or risks are you carrying?
- Is there a deadline?
- What have you already tried?

Do not force all supporting questions before the discussion can begin.

Use progressive disclosure.

## Intake Controls

Provide:

- Continue
- Save and Continue Later
- Cancel
- Add More Context
- Skip Optional Details

Do not continue with an empty decision unless the user explicitly chooses to start a general discussion.

---

# Part 2 — Director Selection

## Required Behavior

After the decision is captured, show the Board member selector.

The user must be able to:

- select one Director
- select multiple Directors
- select all Directors
- clear all
- view profiles
- continue with the selected members
- revise the selection before discussion starts

The selection must remain visible and preserved.

## Chair Rule

The Chair must not create a dead-end.

Preferred rule:

- the Chair is optional
- the user may include or exclude the Chair
- the selected Directors may begin the discussion without the Chair

If the product intentionally requires the Chair for a specific Board mode, then:

- auto-include the Chair
- explain why
- allow the user to continue
- do not show a yes/no requirement the user cannot resolve

Do not display:

> Chair is required

after the user has already selected valid Directors and chosen Start Discussion.

Do not silently replace the user’s selection.

---

# Part 3 — Start Discussion Must Work

## Current Problem

The user selects Directors and chooses **Start Discussion**, but the discussion does not begin.

## Required Behavior

Selecting Start Discussion must:

1. Validate that at least one Director is selected.
2. Validate that a discussion topic exists.
3. Create a Board session.
4. Preserve the selected Director IDs.
5. Preserve the decision or topic.
6. Open the Board discussion interface.
7. Show the selected Directors as active participants.
8. Begin with a natural opening response from Shari or the Board facilitator.
9. Invite the selected Directors to contribute in their distinct roles.

The button must not:

- return to the Chair-required screen
- clear the selected Directors
- lose the decision topic
- reopen Meet the Directors
- open only the Chair profile
- create a blank conversation

---

# Shared Board Session Model

Use one authoritative session model.

Suggested conceptual shape:

```ts
type BoardDiscussionSession = {
  id: string;
  userId: string;
  topic: string;
  context?: string;
  selectedDirectorIds: string[];
  chairIncluded: boolean;
  status: "draft" | "active" | "paused" | "completed" | "saved";
  currentRound?: number;
  createdAt: string;
  updatedAt: string;
};
```

Do not create separate incompatible state for:

- Bring a Decision
- Meet the Directors
- Director selection
- active discussion

These are steps in the same Board discussion lifecycle.

---

# Discussion Opening

Once the discussion starts, the user should see:

- the decision or topic
- the selected Directors
- a clear indication that the discussion has begun
- the first Board response
- a way to respond
- a way to ask a specific Director
- a way to invite another Director
- a way to remove a Director where appropriate
- a way to pause or save the discussion

Suggested opening:

> I’ve brought this to the Directors you selected. Let’s look at it from their different perspectives.

Then surface distinct contributions.

Do not make the Board sound like one generic voice.

---

# Board Response Structure

The Board may provide:

- key perspectives
- opportunities
- concerns
- trade-offs
- unanswered questions
- assumptions to test
- possible options
- risks
- recommended next steps
- areas of disagreement

The Board must not become prescriptive or pretend to make the final decision for the user.

---

# Meet the Directors Flow

## Required Behavior

From Meet the Directors:

1. User views Director profiles.
2. User selects Directors.
3. A visible selection summary appears.
4. User chooses Start Discussion.
5. If no topic exists, ask what they want to discuss.
6. Once entered, begin the discussion immediately.
7. Preserve the original Director selection.

Do not force the user to go back through Bring a Decision unless necessary.

---

# Selection Summary

Before starting, show something like:

**Selected Directors:**
- Finance Director
- Customer & Market Director
- Technology & Future Director

Actions:

- Start Discussion
- Add More Directors
- Clear Selection
- Cancel

If the Chair is included, show it normally.

If not included, do not show an error.

---

# Empty and Error States

## No Directors Selected

Show:

> Choose at least one Director to begin.

Provide a direct return to selection.

## No Topic Entered

Show:

> What would you like the selected Directors to discuss?

Provide the text area immediately.

## Session Creation Failure

Preserve:

- topic
- selected Directors
- entered context

Show:

- clear error
- Try Again
- Back to Selection

Do not clear progress.

---

# Navigation

Provide:

- Back to Boardroom
- Back to Director Selection
- Edit Decision
- Save and Exit
- Resume Discussion

The user must not be trapped.

---

# Saved Discussions

Where supported, saved Board discussions should retain:

- topic
- context
- selected Directors
- Board responses
- user replies
- current status
- last active point

Resuming should reopen the correct session.

---

# Required Root-Cause Audit

Investigate:

- Chair-required validation
- hard-coded Chair dependency
- selection state owner
- selected member persistence
- Start Discussion handler
- decision/topic state
- Board session creation
- route transition
- overlay state
- stale selection state
- Meet the Directors return behavior
- active Board member rendering
- incorrect fallback to Chair

Report the exact root cause.

---

# Required Automated Tests

## Bring a Decision

- opens decision intake
- decision text can be entered
- Continue preserves topic
- optional context can be skipped
- member selection opens
- selected Directors persist
- discussion starts

## Director Selection

- one Director can be selected
- multiple Directors can be selected
- Select All works
- Clear All works
- selection summary is correct
- Chair is optional
- valid selection does not trigger Chair-required error

## Start Discussion

- button invokes session creation
- topic is preserved
- selected Director IDs are preserved
- active discussion opens
- selected Directors appear
- first Board response appears
- no redirect to Chair-required state
- no blank session opens

## Meet the Directors

- selection works from profile gallery
- Start Discussion asks for a topic when needed
- entered topic starts discussion
- selected Directors remain selected
- no forced Chair redirect

## Error Handling

- no-selection state is clear
- no-topic state is clear
- failed session creation preserves state
- retry works

## Resume

- saved session reopens
- selected Directors persist
- topic persists
- discussion history persists

---

# Authenticated Live Verification

## Bring a Decision

1. Open the Boardroom.
2. Select Bring a Decision to the Board.
3. Confirm a decision text area appears.
4. Enter a real decision.
5. Continue.
6. Select two Directors without the Chair.
7. Select Start Discussion.
8. Confirm discussion begins.
9. Confirm both selected Directors contribute.
10. Confirm no Chair-required error appears.

## Meet the Directors

1. Return to Boardroom.
2. Open Meet the Directors.
3. Select three Directors.
4. Confirm the selection summary.
5. Select Start Discussion.
6. Confirm the platform asks for a topic if one is not present.
7. Enter a topic.
8. Start.
9. Confirm the selected Directors remain.
10. Confirm discussion begins immediately.

## Chair

1. Start one discussion without the Chair.
2. Start another with the Chair.
3. Confirm both work.
4. Confirm the Chair does not block either flow.
5. Confirm no false Chair-required warning appears.

---

# Constraints

- do not require the Chair by default
- do not clear valid selections
- do not send the user back to the Chair profile
- do not start a blank discussion
- do not create separate incompatible Board session flows
- do not deploy production
- stop after authenticated preview and report results

---

# Required Implementation Report

Return:

- exact root cause
- exact files changed
- Board session owner
- decision intake owner
- Director selection owner
- Chair rule owner
- Start Discussion handler owner
- active discussion owner
- saved discussion owner
- automated test results
- preview URL
- unrelated WIP included in preview
- remaining limitations
- deploy or do-not-deploy recommendation

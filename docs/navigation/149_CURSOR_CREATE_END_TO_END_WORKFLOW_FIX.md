# Cursor Implementation Prompt — Make Every Create Option Clickable and Complete the Full Creation Workflow

## Purpose

Correct and complete the Spark Estate Create experience.

The Create screen must not be a visual catalog of inactive options.

Every listed creation type must:

1. be clickable
2. open the correct creation workflow
3. guide the user through the required questions one at a time
4. preserve progress
5. allow adding, deleting, editing, reordering, and revising content
6. provide a complete review stage
7. require user approval before finalization
8. allow saving
9. allow printing where appropriate
10. allow the user to return and continue later

This is an end-to-end workflow requirement, not only a click-handler repair.

---

# Approved Create Entrance

The Create entrance should contain only:

## 1. What Do You Want to Create?

Use a categorized, alphabetical creation picker.

Requirements:

- categories collapsed by default
- categories sorted alphabetically
- creation types sorted alphabetically within each category
- search or type-to-filter
- keyboard accessible
- no full wall of options
- every visible item clickable
- every selection routes to its registered workflow

Remove:

- Browse Things I Can Create
- Start With What I Need
- inactive cards
- duplicate paths to the same creation type

## 2. Continue a Saved Creation

Below the picker, show:

- user-owned saved drafts
- title
- creation type
- category
- last edited date
- progress or status where available

Selecting one must resume the exact saved creation and exact step.

---

# Creation Type Registry

Create or use one authoritative registry for every supported creation type.

Suggested conceptual shape:

```ts
type CreationTypeDefinition = {
  id: string;
  label: string;
  category: string;
  alphabeticalLabel: string;
  description?: string;
  workflowId: string;
  outputSchemaId: string;
  promptSequenceId: string;
  supportsPrint: boolean;
  supportsSave: boolean;
  supportsExport?: boolean;
  status: "active" | "draft" | "unavailable";
};
```

Every option shown in the picker must have:

- a valid creation type ID
- a valid workflow ID
- a valid prompt sequence
- a valid output schema
- a valid click target
- a valid save path
- a valid resume path

Do not display any option whose workflow is unavailable.

Do not leave visible placeholders.

---

# Clickability Requirement

Every item must be tested from the actual rendered UI.

Audit:

- button semantics
- pointer events
- disabled states
- overlays
- z-index
- nested click targets
- stale route handlers
- missing workflow IDs
- malformed registry entries
- scroll clipping
- keyboard activation
- touch activation

Each option must work with:

- mouse click
- keyboard Enter
- keyboard Space where applicable
- touch
- screen reader activation

Selecting an item should immediately open its correct workflow.

Do not require an unnecessary second confirmation screen unless the workflow genuinely needs one.

---

# Guided Question Flow

Each creation type must have a complete guided question sequence.

The platform should ask:

- one question at a time
- only questions relevant to that creation type
- in a logical order
- without repeating known information
- with the ability to skip optional questions
- with clear examples where helpful
- using Shari's warm, natural voice

The workflow must not present a giant form all at once.

## Required Question Behavior

Each step should support:

- answer
- back
- next
- skip when optional
- edit previous answer
- save and continue later
- progress indicator
- clear section title
- explanation of why the question matters when helpful

Do not force users to answer irrelevant questions.

Do not restart the workflow when they navigate backward.

---

# Prompt Sequence Ownership

Every creation type must have an owned prompt sequence.

Suggested conceptual shape:

```ts
type CreationPromptStep = {
  id: string;
  creationTypeId: string;
  section: string;
  order: number;
  question: string;
  helperText?: string;
  example?: string;
  responseType:
    | "short_text"
    | "long_text"
    | "single_select"
    | "multi_select"
    | "date"
    | "number"
    | "upload"
    | "confirm";
  required: boolean;
  condition?: PromptCondition;
};
```

Use conditional branching where appropriate.

Example:

If the user selects an email:

- purpose
- recipient
- relationship
- desired outcome
- tone
- key points
- call to action
- deadline or timing
- signature preference

If the user selects a business plan:

- purpose
- business overview
- audience
- problem
- offer
- market
- revenue
- operations
- goals
- risks
- milestones

Each type needs its own complete sequence.

Generic questions alone are insufficient.

---

# One Complete Creation Workflow

The workflow lifecycle must be:

Select Type
→ Guided Questions
→ Draft Generation
→ Edit and Organize
→ Review
→ User Approval
→ Save
→ Print or Export where appropriate
→ Reopen Later

---

# Draft Generation

After enough information has been collected:

- create a structured draft
- use the correct output schema for that creation type
- preserve the user's language and intent
- apply Spark Estate expert knowledge invisibly
- do not name outside experts unless required
- clearly distinguish user-provided facts from generated suggestions
- never invent missing facts without labeling them as suggestions

---

# Editing Controls

The user must be able to:

- add a section
- delete a section
- edit a section
- rename a section
- reorder sections
- add an item
- delete an item
- edit an item
- reorder items
- revise wording
- regenerate only a selected section
- undo or cancel a destructive change where practical

Do not force regeneration of the entire creation for a small change.

## Destructive Actions

For delete, replace, or start-over actions:

- require confirmation
- preserve an undo path where practical
- do not silently remove content

---

# Review Stage

Before final save or print, provide a complete Review stage.

The Review view should show:

- all sections
- all content
- missing required items
- unresolved suggestions
- spelling or clarity concerns where appropriate
- any user decisions still needed
- page or document structure
- print preview where supported

The user must be able to jump directly from Review to any section to edit it.

---

# Approval Requirement

The user must explicitly approve the creation before it is treated as final.

Suggested actions:

- Approve and Save
- Keep Editing
- Save as Draft
- Print Preview
- Start Over

Do not assume approval merely because a draft was generated.

Do not automatically print or finalize.

---

# Save Behavior

Support:

- Save as Draft
- Save Changes
- Approve and Save
- autosave where safe
- visible saved status
- last saved time
- save failure handling
- resume later

On save failure:

- preserve all content
- show a clear error
- allow retry
- do not falsely show Saved

Saved creations must belong to the authenticated user.

---

# Print Behavior

After review and approval, allow printing for appropriate creation types.

Requirements:

- printable layout
- no navigation chrome
- no hidden or clipped content
- readable page breaks
- headings kept with related content where practical
- browser print compatibility
- print preview
- cancel without losing work

Do not show Print for creation types where printing is not useful.

Use the creation type registry to control print support.

---

# Continue a Saved Creation

The Continue area must:

- show only the authenticated user's creations
- reopen the exact creation
- restore the exact workflow stage
- restore the last active section
- preserve all edits
- preserve approval status
- preserve completion status
- preserve print eligibility

Do not open a new blank creation.

---

# Status Model

Use clear statuses such as:

- Draft
- In Progress
- Ready for Review
- Needs Changes
- Approved
- Completed
- Archived

Do not label incomplete work as completed.

---

# Global Return and Navigation

While creating, provide:

- Back to Create
- Save and Exit
- Continue Later
- Return to Review
- Return to My Work where appropriate

The user must never be trapped in a workflow.

Leaving should not erase progress.

---

# Required Audit

Audit every currently visible creation option.

For each option, report:

- label
- category
- registry ID
- workflow ID
- click works
- prompt sequence exists
- save works
- resume works
- review works
- approval works
- print support
- current status

Do not report the Create experience complete while any visible option is inactive.

---

# Required Automated Tests

## Picker

- categories sort alphabetically
- items sort alphabetically
- search filters correctly
- collapsed categories work
- every visible item has a valid workflow
- unavailable items are hidden
- keyboard activation works
- mouse activation works

## Workflow

- selecting each type opens correct workflow
- first question appears
- questions appear one at a time
- required and optional logic works
- conditional questions work
- Back preserves answers
- edit previous answer works
- save and continue later works
- progress indicator is accurate

## Draft and Editing

- draft uses correct output schema
- add works
- delete works
- edit works
- reorder works
- section-only regeneration works
- destructive actions require confirmation
- changes persist

## Review and Approval

- review contains all content
- missing required items are identified
- jump-to-edit works
- Keep Editing returns correctly
- explicit approval is required
- Approve and Save works
- Save as Draft works

## Print

- Print appears only when supported
- print preview works
- print layout has no platform chrome
- canceling print preserves work
- page content is not clipped

## Resume

- saved creation appears in Continue
- exact creation reopens
- exact stage restores
- exact section restores
- user ownership is enforced
- no duplicate draft is created

---

# Authenticated Live Verification

## Entrance

1. Open My Work → Create.
2. Confirm Browse Things I Can Create is gone.
3. Confirm What Do You Want to Create appears.
4. Confirm categories are collapsed.
5. Confirm categories sort alphabetically.
6. Open several categories.
7. Confirm items sort alphabetically.
8. Search for several creation types.
9. Click every visible option.
10. Confirm every one opens the correct workflow.

## Guided Creation

For at least one simple and one complex creation type:

1. Start the workflow.
2. Confirm one question appears at a time.
3. Answer several questions.
4. Go back and edit an earlier answer.
5. Skip an optional question.
6. Save and exit.
7. Reopen from Continue a Saved Creation.
8. Confirm the exact step and answers return.
9. Finish the questions.
10. Generate the draft.

## Editing and Review

1. Add content.
2. Edit content.
3. Delete content.
4. Reorder content.
5. Regenerate one section only.
6. Open Review.
7. Jump back to edit.
8. Return to Review.
9. Save as Draft.
10. Approve and Save.

## Print

1. Open an approved printable creation.
2. Open Print Preview.
3. Confirm complete content is visible.
4. Confirm no platform navigation prints.
5. Cancel print.
6. Confirm work remains.
7. Print or save through the browser print workflow.

---

# Constraints

- do not display inactive options
- do not leave dead cards
- do not use one generic prompt sequence for all creation types
- do not ask all questions at once
- do not lose progress when navigating
- do not regenerate the whole creation for a small edit
- do not finalize without approval
- do not falsely confirm a save
- do not print before review and approval
- do not deploy production
- stop after authenticated preview and report results

---

# Required Implementation Report

Return:

- exact root cause of inactive Create options
- exact files changed
- creation type registry owner
- picker owner
- workflow routing owner
- prompt sequence owner
- draft generation owner
- editing-state owner
- review owner
- approval owner
- save owner
- resume owner
- print owner
- per-option audit table
- automated test results
- preview URL
- unrelated WIP included in preview
- remaining limitations
- deploy or do-not-deploy recommendation

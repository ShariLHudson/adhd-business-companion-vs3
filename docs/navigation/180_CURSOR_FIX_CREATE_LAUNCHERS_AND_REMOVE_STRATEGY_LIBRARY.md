# 180_CURSOR_FIX_CREATE_LAUNCHERS_AND_REMOVE_STRATEGY_LIBRARY.md

# Cursor Implementation Prompt — Fix Create Launchers and Remove Strategy Library

## Purpose

Correct two immediate problems in the Spark Estate Create experience:

1. The user cannot click Create options to open and work on the selected item.
2. The Strategy Library must be removed from Create.

This is an implementation correction, not another informational audit.

---

# 1. Every Create Option Must Open

## Required Behavior

Every visible option in Create must be clickable.

When the user selects an item, Spark Estate must immediately:

1. identify the selected creation type
2. open the correct guided workflow
3. explain briefly what will be created
4. begin with the first necessary question
5. walk the user through the entire creation process
6. save progress
7. allow pause and resume
8. allow review and editing
9. produce a finished result

The user must never click an option and have nothing happen.

## Example

Create  
→ Email  
→ Welcome Email  
→ guided questions begin

Create  
→ Marketing Strategy  
→ Launch Plan  
→ guided questions begin

Create  
→ Presentation  
→ Workshop Presentation  
→ guided questions begin

---

# Click Contract

Every visible Create item must have:

- a registered creation ID
- an approved category
- a workflow owner
- a route or panel target
- a creation schema
- a question sequence or adaptive question engine
- save/resume support
- completion behavior
- output behavior

If an item does not have a complete workflow, do not show it as available.

Do not leave:

- placeholder cards
- disabled-looking cards without explanation
- informational-only options
- options with missing handlers
- cards wired only to selection state
- options that close a dropdown but do not launch anything

---

# Selection Behavior

When the user chooses an option from a dropdown:

- close the dropdown
- open that exact creation workflow
- preserve the selected item
- place focus at the beginning of the workflow
- show a contextual Previous Screen control
- do not return the user to the Create catalog
- do not require a second click on another button unless the first click is explicitly a preview action

The option itself is the launch action.

---

# Guided Workflow Standard

Each creation workflow must guide the user one step at a time.

Required capabilities:

- one question at a time
- skip questions that are not relevant
- use information the user already provided
- edit previous answers
- add, delete, and reorder sections where appropriate
- regenerate one section without replacing the entire creation
- save automatically
- pause and continue later
- review before finalizing
- approve the finished result
- export, print, or copy where appropriate

Do not present a long intake form unless the creation type genuinely requires it.

---

# Workflow Failure Handling

If a selected option is not yet production-ready:

Do not silently fail.

Instead:

- remove it from the visible Create options until complete, or
- show a clear unavailable status only if explicitly approved

Preferred rule:

> No complete workflow = no visible Create option.

---

# 2. Remove Strategy Library from Create

## Required Removal

Remove all Strategy Library entries from the Create experience.

This includes any item or label such as:

- Strategy Library
- ADHD Entrepreneur Strategy Library
- Browse Strategies
- Find a Strategy
- Build a Strategy
- Strategy Guide
- Strategy Concierge
- Recommended Strategies
- Saved Strategies

where these appear as Create options.

The Strategy experience is for finding, tailoring, and applying strategies. It is not a creation type and does not belong inside Create.

## Preserve the Strategy Experience Elsewhere

Do not delete the Strategy Library or its data.

Keep it available only from its approved strategy/support destination, such as:

- Strategy Guide
- Help Me Think
- I’m Stuck
- relevant My Work or advice navigation
- another approved permanent destination

Report its actual remaining navigation path.

Do not create a new placement without documenting it.

---

# Create Taxonomy Boundary

Create should contain things the user is creating, such as:

- business documents
- marketing plans and campaigns
- social media content
- written content
- branding assets
- sales materials
- client materials
- operations documents
- event materials
- training and course materials
- presentations
- communications
- forms and templates

Create should not contain:

- knowledge libraries
- advice destinations
- strategy browsing
- Chamber
- Boardroom
- Talk It Out
- Decision Compass
- Journal
- Evidence Vault
- settings

---

# Duplicate and Misplaced Item Check

While correcting the click behavior, identify:

- duplicate Create options
- options that launch the same workflow
- options placed under the wrong category
- options that are not true creation types
- options with no workflow owner

Do not perform a full taxonomy redesign in this pass unless already approved.

Return the findings separately so they can inform the existing Create taxonomy audit.

---

# Universal Navigation

Every launched creation workflow must participate in Universal Navigation Context & Return.

Verify:

- Previous Screen returns to the exact Create category and selection context
- search text is restored
- selected category is restored
- scroll position is restored
- saved draft remains intact
- closing the workflow does not lose work

---

# Required Automated Tests

Test every visible Create option.

For each option verify:

- it is clickable
- dropdown closes
- correct workflow opens
- first question appears
- selected creation type is correct
- progress saves
- pause/resume works
- Previous Screen restores Create context
- no console error occurs
- no dead-end screen appears

Also verify:

- Strategy Library is absent from Create
- no Strategy Library aliases remain in Create data
- Strategy Library still works from its approved destination
- removing it from Create does not delete saved strategies
- no orphaned Create route remains

---

# Authenticated Verification

In the authenticated preview:

1. Open Create.
2. Select one option from every visible category.
3. Confirm each option immediately opens the correct workflow.
4. Complete at least one workflow from beginning to finished result.
5. Pause and resume at least one workflow.
6. Return to Create and confirm context restoration.
7. Confirm Strategy Library is no longer visible anywhere in Create.
8. Navigate to the approved Strategy destination and confirm it still works.
9. Test desktop and mobile.
10. Capture screenshots and record pass/fail for every visible option.

---

# Required Report

Return:

- all visible Create options
- click result for each option
- workflow owner for each option
- options removed because no workflow exists
- exact Strategy Library entries removed from Create
- remaining approved Strategy navigation path
- files changed
- creation registry owner
- launch-handler owner
- save/resume owner
- automated test results
- authenticated preview URL
- screenshots
- remaining defects
- deploy or do-not-deploy recommendation

Do not deploy production until every visible Create option launches a complete, authenticated workflow and Strategy Library is confirmed absent from Create.

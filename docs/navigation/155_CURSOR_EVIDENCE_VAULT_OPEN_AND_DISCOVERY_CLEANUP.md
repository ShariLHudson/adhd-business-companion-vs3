# Cursor Implementation Prompt — Simplify Evidence Vault Opening and Today’s Discovery

## Purpose

Correct the Evidence Vault experience shown in the authenticated preview.

The current interface contains overlapping layers, unnecessary controls, duplicate ghosted content, and an unnecessary Discovery File image.

The Vault should feel intentional, readable, and simple.

Do not redesign the background artwork.

Do not change the six-question Evidence Discovery concept unless required for readability or completion.

---

# Approved Locked-Vault Experience

Before the Vault opens, the interface should contain only:

- the locked Vault doors
- the moving key
- one clear instruction:

> Click the moving key to open the Vault.

Remove all other visible interaction clutter from this locked state.

## Remove from Locked State

Remove:

- Show Conversation
- Learn Why This Helps
- Begin Evidence Discovery button
- duplicate explanation blocks
- unnecessary locked-state action buttons
- any text that competes with the moving key

The moving key is the opening action.

The user should not need to choose a second button after seeing the key.

---

# Key Interaction

The moving key must be:

- clearly visible
- obviously interactive
- clickable
- keyboard accessible
- touch accessible
- accompanied by the single instruction
- large enough to activate reliably
- not blocked by overlays

On activation:

1. animate or trigger the Vault opening
2. transition to the open-Vault experience
3. remove the locked-state instruction
4. remove the moving key if it no longer serves a purpose
5. focus the open content appropriately

Do not require a second click.

---

# Approved Open-Vault Experience

Once the Vault opens:

Remove the Discovery File image entirely.

Remove all ghosted or duplicate background interface content.

The visible foreground content should contain only:

- **Today’s Discovery**
- the current discovery prompt/question
- the user response field
- navigation for the discovery flow
- progress, if useful
- **How Do I…**
- save or continue behavior where already approved

The old Evidence Vault title, description, creation cards, attachment cards, browse cards, and other inactive interface elements must not remain visible underneath the discovery panel.

---

# Remove Discovery File Image

The Discovery File cover shown after opening is unnecessary.

Remove:

- Discovery File book/cover image
- A Private Archive cover text
- Evidence Vault cover text
- any transitional overlay that obscures the actual discovery content

The open state should move directly into Today’s Discovery.

---

# Remove Ghosted Duplicate Interface

The screenshots show the previous Evidence Vault interface ghosted underneath the Today’s Discovery panel.

This must be removed.

Audit:

- opacity layers
- duplicated mounted components
- stale overlay panels
- backdrop transparency
- z-index
- room shell persistence
- old content remaining mounted under modal content
- CSS translucency
- inherited opacity
- background cards
- duplicate title rendering

The Today’s Discovery panel must not be transparent enough to expose competing text and controls beneath it.

Use an opaque or sufficiently solid readable surface.

Do not solve this by making all content darker while leaving duplicate interfaces mounted.

Unmount or hide the obsolete content correctly.

---

# Today’s Discovery Layout

## Required Visible Content

Show:

### Today’s Discovery

Supporting prompt:

> What would you like to preserve today?

Then present the discovery questions one at a time, or in the already approved guided flow.

Examples include:

- What happened?
- What did you learn?
- What problem did you solve?
- Who did you help?
- What did you create?
- What progress, strength, result, or accomplishment would you like to remember?

Do not show all questions in a cramped transparent panel if the approved flow is one at a time.

## Readability

The panel must:

- use a solid readable background
- have sufficient contrast
- avoid background text showing through
- fit within the viewport
- scroll internally only when needed
- keep buttons visible
- use large readable typography
- preserve user-entered text while moving between questions

---

# Add How Do I…

Add a clear **How Do I…** control within the open Evidence Vault experience.

It should explain:

- what evidence means
- what kinds of things belong here
- how to answer the discovery questions
- how attachments and links work, if supported
- how to save
- how to return later
- how evidence may help the user notice progress

The help content should be collapsible or open in a readable panel.

It must not cover or erase current discovery answers.

The control should be easy to find without dominating the page.

Suggested placement:

- near the Today’s Discovery heading
- top-right of the discovery panel
- beneath the heading as a secondary action

---

# Remove Show Conversation

Remove **Show Conversation** from:

- locked Vault
- open Vault
- discovery panel
- bottom fixed controls
- all Evidence Vault states

The Vault experience is not a chat-first destination.

Do not leave an empty conversation panel or hidden toggle behind.

---

# State Model

Use clear state ownership:

```ts
type EvidenceVaultExperienceState =
  | "locked"
  | "opening"
  | "discovery"
  | "open";
```

Expected behavior:

- locked → instruction + moving key
- opening → door transition only
- discovery → Today’s Discovery
- open → Vault contents after discovery is complete, if applicable

Do not simultaneously mount multiple major states.

---

# Completion Behavior

After the six discovery questions are completed:

- save the discovery responses
- open or unlock the Evidence Vault as designed
- confirm completion
- show the user where their evidence lives
- do not return to the Discovery File cover
- do not restore the ghosted duplicate interface

If the Vault should remain on Today’s Discovery after completion, make that behavior explicit and consistent.

---

# Navigation

Provide only the navigation needed for this experience:

- Back
- Next
- Save and Continue Later
- Finish Discovery
- How Do I…
- Return to Estate, where already approved

Do not add Show Conversation.

---

# Required Root-Cause Audit

Investigate:

- why Show Conversation is mounted in the Vault
- why multiple Evidence Vault layers remain visible
- why the Discovery File cover appears
- why the Today’s Discovery panel is translucent
- whether locked and open states are mounted simultaneously
- whether the old Vault dashboard remains underneath
- which component owns the discovery panel
- which component owns the room background
- which component owns Vault state
- whether stale overlay state persists

Report the exact root cause.

---

# Required Automated Tests

## Locked State

- only the moving-key instruction is shown
- moving key is clickable
- keyboard activation works
- Show Conversation is absent
- Begin Evidence Discovery button is absent
- Learn Why This Helps is absent

## Opening

- key activation opens the Vault
- no second click is required
- locked instruction disappears
- correct open state appears

## Discovery

- Discovery File image is absent
- Today’s Discovery appears
- duplicate Evidence Vault title is absent
- duplicate description is absent
- old cards are absent
- ghosted controls are absent
- panel is readable
- user answers persist
- How Do I… appears
- How Do I… opens and closes safely

## State Isolation

- locked and discovery states are not mounted together
- obsolete dashboard is not visible under discovery
- no duplicate titles
- no duplicate action cards
- no stale conversation toggle

## Completion

- six-question completion saves correctly
- completion does not restore Discovery File image
- open Vault state is correct
- saved discovery can be found later

---

# Authenticated Live Verification

## Locked Vault

1. Open Evidence Vault.
2. Confirm the doors are shown.
3. Confirm the instruction says only:
   - Click the moving key to open the Vault.
4. Confirm Show Conversation is gone.
5. Confirm Begin Evidence Discovery is gone.
6. Confirm Learn Why This Helps is gone.
7. Click the moving key.
8. Confirm the Vault opens immediately.

## Open Vault

1. Confirm the Discovery File image is gone.
2. Confirm Today’s Discovery appears directly.
3. Confirm no ghosted Evidence Vault title appears underneath.
4. Confirm no background action cards appear underneath.
5. Confirm the panel is readable.
6. Confirm the page does not contain overlapping text.
7. Open How Do I….
8. Confirm help is readable and closes correctly.
9. Enter discovery answers.
10. Move backward and forward.
11. Confirm answers remain.
12. Complete the discovery.
13. Confirm the result saves.
14. Confirm the user can later find the saved evidence.

---

# Constraints

- do not keep Show Conversation
- do not keep the Discovery File image
- do not mount multiple major Vault states together
- do not leave ghosted cards or titles underneath
- do not make the discovery panel transparent
- do not add new decorative overlays
- do not deploy production
- stop after authenticated preview and report results

---

# Required Implementation Report

Return:

- exact root cause
- exact files changed
- Vault state owner
- locked-state owner
- moving-key interaction owner
- opening animation owner
- discovery panel owner
- How Do I… owner
- saved discovery owner
- automated test results
- preview URL
- screenshots
- unrelated WIP included in preview
- remaining limitations
- deploy or do-not-deploy recommendation

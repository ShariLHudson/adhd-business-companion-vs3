# Cursor Implementation Prompt — Fix My Business Estate and My Profile Opening + Profile Dark Text

## Purpose

Fix two current local failures:

1. My Business Estate does not open.
2. My Profile does not open.

Also correct the My Profile readability problem by changing all profile text to a dark, readable font color.

This is a focused navigation, state, and accessibility fix.

Do not redesign the Business Estate or Profile.

---

# Confirmed Problems

## Navigation Failure

From the profile/user menu, the user cannot currently open:

- My Business Estate
- My Profile

These destinations previously opened and must be restored.

## Profile Readability Failure

When My Profile did open, much of the text was too light to read.

All Profile text must use dark readable colors against its light surfaces.

---

# Part 1 — Restore My Business Estate Opening

## Required Behavior

Clicking:

**SH/Profile Menu → My Business Estate**

must:

- close the dropdown
- open the existing My Business Estate destination
- mount the correct Business Estate shell and panel
- show the approved Business Estate content
- avoid duplicate shell/overlay mounting
- avoid returning to Welcome Home without opening
- avoid opening People I Help or another profile destination
- work on first click
- work after closing and reopening the menu
- work after visiting another estate destination

## Audit Required

Trace the full click path through:

- profile menu item configuration
- click handler
- destination ID
- route/action resolver
- overlay state
- shell selection
- direct-overlay flags
- Business Estate panel mount conditions
- dropdown close behavior
- stale state guards

Confirm whether the failure is caused by:

- wrong destination ID
- missing handler
- event propagation
- dropdown closing before action executes
- stale overlay state
- conflicting shell and panel conditions
- hidden pointer blocker
- z-index issue
- route reset
- React render-time state mutation
- feature flag or local-only condition

Do not guess. Identify and report the exact cause.

---

# Part 2 — Restore My Profile Opening

## Required Behavior

Clicking:

**SH/Profile Menu → My Profile**

must:

- close the dropdown
- open the existing My Profile destination
- mount the Profile panel once
- preserve existing profile information and sections
- work on first click
- work after another menu destination
- not route to My Business Estate
- not reopen stale chat or old overlay state
- not silently fail

## Audit Required

Trace:

- profile menu item
- destination ID
- openMyProfileCore or equivalent
- profile overlay state
- panel mount gate
- shell selection
- visibility and z-index
- dropdown event handling
- stale profile state
- any recent menu/navigation refactor

Report the exact failing owner and line.

---

# Part 3 — Profile Dark Text Readability

## Global Profile Requirement

All text shown inside My Profile must use a dark readable font color on light backgrounds.

This includes:

- page title
- section headings
- subsection headings
- field labels
- field values
- helper text
- descriptions
- placeholders
- dropdown labels
- selected values
- button labels
- accordion labels
- How Do I… text
- progress text
- badges
- tabs
- empty states
- validation messages
- links
- edit and save controls
- profile-menu text shown inside the Profile destination
- modal or confirmation text launched from Profile

Do not fix only the main title.

## Recommended Color Ownership

Use existing approved dark tokens where available.

Preferred examples:

- charcoal: `#2E2E2E`
- deep teal for emphasized headings: `#0F6F7C`

Do not hard-code many unrelated dark shades if design tokens already exist.

Create or use one Profile text token hierarchy such as:

```css
--profile-text-primary: #2E2E2E;
--profile-text-secondary: #454545;
--profile-text-heading: #0F6F7C;
--profile-text-muted: #5F5F5F;
```

All colors must meet accessible contrast against their actual backgrounds.

## Prohibited

Do not leave:

- white text on cream
- pale gray text on white
- low-opacity text
- inherited lavender text
- transparent text
- disabled-looking labels for active content
- placeholder text that is nearly invisible

## Buttons

Buttons must remain readable in every state:

- normal
- hover
- focus
- active
- disabled

Dark text is required on light buttons.

Light text may remain on genuinely dark filled buttons if contrast passes.

## Inputs

Verify:

- entered text
- placeholder text
- labels
- selected dropdown values
- date fields
- textareas
- validation messages

---

# Part 4 — Click and Layer Reliability

Because both destinations fail to open, inspect global menu layering.

Verify:

- SH dropdown is above the estate scene
- menu items receive pointer events
- invisible overlays do not block clicks
- outside-click handler does not cancel child actions
- pointer-down/click ordering is safe
- opening action executes before dropdown unmount where necessary
- no click-through activates the background
- only one destination opens per click

---

# Part 5 — State Requirements

My Business Estate and My Profile must have independent state.

Do not allow:

- shared open flag
- one destination clearing the other before mount
- profileEstateRoomOverlayId conflicting with direct overlay state
- duplicate shell selection
- stale destination reopening
- menu state becoming the destination state

Use one authoritative destination-open action for each.

---

# Part 6 — Required Automated Tests

## My Business Estate

- clicking menu item opens Business Estate
- opens on first click
- dropdown closes
- correct panel mounts
- no duplicate shell
- no wrong destination
- closes and reopens
- works after visiting My Profile

## My Profile

- clicking menu item opens Profile
- opens on first click
- dropdown closes
- correct panel mounts once
- no wrong destination
- closes and reopens
- works after visiting My Business Estate

## Menu Events

- outside-click handler does not cancel item selection
- no invisible overlay blocks menu items
- keyboard Enter opens both destinations
- keyboard Space opens both destinations where appropriate
- focus returns sensibly after close

## Profile Readability

Test computed styles or token ownership for:

- title
- headings
- labels
- values
- helper text
- buttons
- inputs
- placeholders
- tabs
- accordions
- validation text

Add a contrast/accessibility test where supported.

---

# Part 7 — Live Verification

Verify locally and in preview:

1. Open SH menu.
2. Click My Business Estate.
3. Confirm it opens on the first click.
4. Close it.
5. Open SH menu.
6. Click My Profile.
7. Confirm it opens on the first click.
8. Inspect every visible Profile section.
9. Scroll through the entire Profile.
10. Open every accordion, tab, dropdown, or editable field.
11. Confirm all text is dark and readable.
12. Repeat after navigating to another estate room.
13. Repeat with keyboard navigation.
14. Confirm Welcome Home still works.
15. Confirm click-outside and Escape behavior still work.

---

# Constraints

- do not redesign My Business Estate
- do not redesign My Profile
- do not remove profile sections
- do not replace dark text with bold white text
- do not patch only one visible Profile section
- do not add a route-specific phrase workaround
- do not deploy production until authenticated preview passes

---

# Required Report

Return:

- exact root cause for My Business Estate failure
- exact root cause for My Profile failure
- exact files changed
- profile-menu owner
- Business Estate route/open owner
- Profile route/open owner
- shell/overlay owner
- pointer-event or outside-click changes
- Profile text-token owner
- contrast verification
- automated tests
- local result
- preview URL
- screenshots
- remaining limitations
- deploy or do-not-deploy recommendation

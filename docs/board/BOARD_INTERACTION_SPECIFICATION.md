# Spark Estate™ Board of Directors — Interaction Specification

**Source of truth** for Board Director card interaction behavior.

**Do NOT redesign the cards.**  
**Do NOT change spacing, colors, typography, images, or layout.**  

Your task is to make the existing UI behave correctly.

---

## GLOBAL RULE

If it looks clickable, it should be clickable.  
If it is not clickable, it should not show hover states or pointer cursors.

---

## INTERACTIVE ELEMENTS

### Portrait

- hover state
- pointer cursor
- click opens Director Profile
- if already open, enlarge portrait

### Director Name

- click opens Director Profile

### Meet This Director

- click opens private Director conversation as an **overlay**
- does **not** leave the profile
- profile stays mounted underneath (faded)

### Include in Board Review

- click toggles Director selection
- change button state to Included
- allow Remove from Review

### Accordion Panels

Clickable:

- How I Think
- What I Protect
- Questions I'll Ask
- When You'll Want Me
- A Decision I Helped Guide
- How I Work With Founders
- You'll Enjoy Working With Me If...

Each panel:

- expands smoothly
- collapses smoothly
- keyboard accessible
- only one panel open at a time
- remember last opened panel during the session

### My Place at the Table

- navigates to the interactive Round Table overlay
- seats map to Directors from the Board registry
- selecting a chair opens that Director’s profile
- Board Review selection is preserved

---

## NON-CLICKABLE

Do NOT make these interactive:

- philosophy
- signature
- Board role
- Core Director badge
- Welcome panel

---

## HOVER / FOCUS / TOUCH STATES

All clickable elements should have:

- pointer cursor
- soft elevation
- subtle gold glow
- accessible keyboard focus (`:focus-visible`)
- soft `:active` / touch press feedback

No dramatic animations.

---

## STATE PRESERVATION

When returning to a Director within the session:

- restore last open accordion panel
- restore portrait enlarge state
- restore Meet conversation history (re-open continues, does not wipe)

Board Review include/remove state persists across gallery, profile, and Round Table.

---

## REUSABLE COMPONENTS

Every Director uses the same implementation:

- gallery card
- profile card
- accordion
- Include in Board Review control
- Meet overlay
- Round Table seats

**Do not hardcode a Director by name** (including Chair). Everything comes from the Board Director registry.

---

## Implementation constraint

Behavior and wiring only — no visual redesign.

---

## Source of truth

This document governs **interaction behavior** for Spark Estate™ Board Director cards. **UI redesign is forbidden** — do not change spacing, colors, typography, images, or layout. Implement behavior only.

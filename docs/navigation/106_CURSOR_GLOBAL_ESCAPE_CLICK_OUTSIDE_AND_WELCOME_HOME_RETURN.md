# Cursor Implementation Prompt — Global Escape, Return to Welcome Home, and Click-Outside Close

## Purpose

Restore and standardize three global navigation behaviors across Spark Estate™:

1. Escape closes the active window or overlay.
2. Clicking outside a window closes it.
3. A persistent top-left control always returns the user to Welcome Home.

This must be implemented globally, not as a Spark Estate Guide-only patch.

---

# 1. Escape Key Closes the Active Window

## Required Behavior

When a modal, overlay, flipbook, panel, guide, chooser, or focused window is open:

- pressing `Escape` closes the topmost active dismissible layer
- only one layer closes per key press
- focus returns to the control that opened it when practical
- stale open-state flags are cleared
- no background route change occurs unless that layer owns the route

## Spark Estate Guide

The Spark Estate Guide must close when the user presses `Escape`.

Required:

- flipbook closes
- guide overlay unmounts
- focus returns to Spark Estate Guide menu item or nearest valid prior control
- user remains in Welcome Home unless they explicitly navigated elsewhere
- no hidden guide shell remains mounted

## Layer Priority

If multiple layers are open, close in this order:

1. active dialog or confirmation
2. nested help or submenu overlay
3. active window or flipbook
4. current room overlay

Do not close the full estate or navigate away when a smaller dismissible layer is open.

## Exceptions

Escape must not silently discard unsaved work.

When a window contains unsaved user content:

- preserve existing save/discard confirmation behavior
- if no confirmation behavior exists, add a minimal safe guard
- do not auto-delete user input

---

# 2. Click Outside to Close

## Required Behavior

Restore backdrop or outside-click dismissal for dismissible windows.

Clicking:

- the backdrop
- empty space outside the window
- the non-interactive overlay area

must close the topmost dismissible window.

## Do Not Close When

The user clicks:

- inside the window
- a scrollbar belonging to the window
- an internal dropdown
- a tooltip or popover owned by the window
- a date picker, select menu, or portal owned by the active window
- a drag target inside the guide or flipbook
- an accessibility focus indicator

## Event Requirements

Prevent accidental double actions.

Use appropriate:

- event propagation boundaries
- pointer-down versus click handling
- portal ownership checks
- topmost-layer checks

Do not allow one outside click to:

- close the current window
- and activate a destination underneath it

The first click should dismiss only.

## Unsaved Content

Outside click must follow the same unsaved-content guard as Escape.

---

# 3. Persistent Top-Left Return to Welcome Home

## Required Control

Add a persistent clickable item in the top-left corner of the Spark Estate experience.

Recommended label:

**Welcome Home**

Optional supporting icon:

- home
- estate
- subtle left-arrow plus home

The text label must remain visible; do not rely on icon-only navigation.

## Required Behavior

Clicking the control always returns to:

**Spark Estate → Welcome Home lobby**

It must:

- close active dismissible windows
- close the Spark Estate Guide
- clear room overlays
- clear stale direct-overlay flags
- stop nested menu open states
- preserve saved user work
- follow existing confirmation rules for unsaved work
- reset the visible estate destination to Welcome Home
- not return to a prior chat or yesterday’s state
- not return to an old room shell

## Availability

The control must be present from:

- Spark Estate Guide
- Chamber of Momentum
- Boardroom
- Journal Gazebo
- Business Estate
- Evidence Vault
- Plan/Adapt window
- Reminders/Rhythms window
- Visual Thinking
- Projects
- other estate overlays and rooms

It may be hidden only when:

- a full-screen safety-critical confirmation requires exclusive focus
- an authentication screen owns the entire page
- a technical loading state cannot safely render navigation

## Top-Left Placement

Required:

- fixed or consistently anchored in the top-left
- readable over all backgrounds
- does not overlap window titles or browser controls
- respects safe-area insets
- remains keyboard accessible
- visible focus state
- minimum accessible target size
- does not become hidden behind overlays

## Label Consistency

Use one global label and action.

Do not create different competing controls such as:

- Return to Estate
- Back to Lobby
- Home
- Welcome Hall

unless they all call the same authoritative navigation action.

Preferred visible label:

**Welcome Home**

---

# 4. Authoritative Global Owners

Create or identify one authoritative owner for each concern.

## Dismissal Owner

One global dismissal controller should own:

- Escape handling
- click-outside handling
- topmost dismissible layer
- focus restoration
- unsaved-content guard

Equivalent concept:

```ts
type DismissibleLayer = {
  id: string;
  priority: number;
  isOpen: boolean;
  canDismiss: boolean;
  hasUnsavedChanges: boolean;
  restoreFocusTo?: HTMLElement | null;
  onDismiss: (reason: "escape" | "backdrop" | "welcome-home") => void;
};
```

## Welcome Home Navigation Owner

One authoritative action should own:

```ts
returnToWelcomeHome()
```

It must clear all estate overlay and room state needed to guarantee the Welcome Home lobby.

Do not duplicate this logic across individual rooms.

---

# 5. Window Contract

Every dismissible estate window should support:

- visible close button where appropriate
- Escape
- click outside
- one topmost-layer registration
- focus restoration
- unsaved-content protection
- scrolling
- keyboard access

The Spark Estate Guide must also have a visible close control in addition to Escape.

Recommended:

- clear `Close` or `×` button in the upper-right of the guide window
- accessible label: `Close Spark Estate Guide`

Do not require Escape as the only way out.

---

# 6. Scrolling and Outside Click

Clicking or dragging a scrollbar must not be interpreted as an outside click.

Verify:

- menu scrollbars
- guide scrollbars
- shared Plan/Adapt window
- shared Reminders/Rhythms window
- long panels
- nested portal controls

Scrolling must not dismiss the window.

---

# 7. State Cleanup

On close:

- clear only the active layer’s state
- do not erase saved user content
- do not leave hidden mounted overlays
- do not retain invisible pointer blockers
- restore body scrolling if it was locked
- restore focus when practical

On Welcome Home return:

- clear all room and overlay state required for a clean lobby
- prevent stale state from reopening after render
- preserve intentional persisted data, drafts, and completed work
- do not import an old conversation into a New Day or New Chat path

---

# 8. Required Automated Tests

## Spark Estate Guide

- opens from Welcome Home menu
- visible close button closes it
- Escape closes it
- backdrop click closes it
- inside click does not close it
- scrollbar interaction does not close it
- no hidden guide mount remains

## Global Window

- Escape closes only topmost layer
- second Escape closes next layer
- outside click closes only topmost layer
- underlying destination is not accidentally activated
- focus returns to opener
- unsaved-content guard appears when required

## Welcome Home Control

From each representative destination:

- Guide
- Chamber
- Journal
- Business Estate
- Plan/Adapt
- Reminders/Rhythms

clicking Welcome Home:

- returns to lobby
- closes overlays
- clears stale room state
- does not reopen the prior overlay
- preserves saved work

## Accessibility

- top-left control reachable by keyboard
- visible focus
- Escape listener does not interfere with text editing or native controls
- screen-reader label is present
- close button has accessible name

---

# 9. Constraints

- do not patch only the Spark Estate Guide
- do not add multiple competing Home actions
- do not remove unsaved-work protections
- do not make every click on the page dismiss windows
- do not let backdrop clicks pass through
- do not redesign unrelated navigation
- do not deploy production until authenticated verification passes

---

# Required Report

Return:

- exact files changed
- global dismissal owner
- topmost-layer owner
- Welcome Home navigation owner
- guide close owner
- focus-restoration behavior
- unsaved-content behavior
- outside-click implementation
- automated tests
- preview URL
- screenshots or video evidence
- remaining limitations
- deploy or do-not-deploy recommendation

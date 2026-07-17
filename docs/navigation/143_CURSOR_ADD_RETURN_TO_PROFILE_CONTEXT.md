# Cursor Implementation Prompt — Add Return-to-Profile Context Preservation

## Purpose

Fix a navigation problem in My Profile.

When a user is setting up or reviewing their Profile and clicks an option that opens another destination, they currently lose their place and must navigate back to Profile manually.

The platform must preserve the originating Profile context and provide a clear way to return to the exact Profile screen, tab, section, and scroll position the user came from.

Do not solve this with a generic browser-back dependency alone.

---

# Required Experience

When a user opens another destination from Profile, the destination must show a clear action such as:

- **Return to My Profile**
- **Back to Profile**
- **Continue Profile Setup**

Use the label that best matches the current context.

The user should return to:

- My Profile
- the same Profile tab
- the same Profile subsection
- the same setup step
- the same expanded accordion, if applicable
- the same scroll position, where practical
- unsaved draft values still intact

The user must not have to:

- reopen the SH menu
- find My Profile again
- restart Profile setup
- remember which section they were editing
- lose entered information

---

# Origin Context Model

Create or use one authoritative navigation-origin context.

Suggested shape:

```ts
type NavigationOriginContext = {
  originDestination: "profile";
  originRoute: string;
  originTab?: string;
  originSection?: string;
  originStep?: string;
  originScrollY?: number;
  returnLabel?: string;
  openedDestination: string;
  createdAt: string;
};
```

Do not create separate ad hoc return-state logic for each Profile link.

---

# Profile Navigation Behavior

Before leaving Profile for another destination:

1. Save Profile navigation state.
2. Preserve current form/draft state.
3. Record which destination is being opened.
4. Open the destination.
5. Show a visible Return-to-Profile action.

On return:

1. Reopen Profile.
2. Restore the exact originating tab/section/step.
3. Restore scroll position where feasible.
4. Preserve unsaved form values.
5. Clear or update the origin context only after successful return.

---

# Where Return Control Should Appear

The Return-to-Profile control must be easy to find.

Preferred locations:

- top-left of the opened destination panel
- destination header
- persistent contextual breadcrumb or return bar

Do not hide it in:

- a kebab menu
- Settings
- a secondary dropdown
- Help
- browser history only

The control should remain visible while scrolling whenever practical.

---

# Scope

Apply this behavior to every destination opened from Profile, including current and future links such as:

- My Business Estate
- People I Help
- Identity or values areas
- Preferences
- Working style
- Client or audience setup
- Business setup
- connected profile destinations

The implementation must be reusable.

---

# Multiple-Level Navigation

If the user opens another destination from the first destination, preserve the Profile origin unless a newer explicit origin replaces it.

Example:

Profile
→ My Business Estate
→ People I Help

The user should still be able to return to the original Profile context.

Do not create a confusing infinite back stack.

Use one clear contextual origin with safe replacement rules.

---

# Unsaved Data Protection

If Profile contains unsaved changes:

- preserve local draft state before leaving
- do not discard fields
- do not force save unless required by existing architecture
- warn only if the platform truly cannot preserve the draft

Returning must restore the draft.

---

# Interaction Rules

- Escape should close only the current top layer.
- Return to Profile should restore Profile context.
- Welcome Home should still return to the lobby.
- Browser Back may work, but is not the primary solution.
- Outside click must not silently discard origin context.
- Keyboard access must work.
- Focus should move to a sensible Profile heading or restored control after return.

---

# Ownership Requirements

Identify authoritative owners for:

- Profile current tab
- Profile current section
- Profile setup step
- Profile draft state
- origin-context state
- return-control UI
- return routing
- scroll restoration
- focus restoration

Do not duplicate owners.

---

# Required Automated Tests

Add tests for:

- opening destination from Profile stores origin context
- Return to Profile appears
- Return to Profile restores Profile
- original tab restores
- original section restores
- original step restores
- unsaved draft values persist
- scroll position restores where supported
- nested destination preserves Profile origin
- Escape does not erase origin unexpectedly
- Welcome Home clears context safely
- keyboard activation works
- stale origin context expires or clears safely

---

# Authenticated Live Verification

1. Open My Profile.
2. Enter or edit information without saving.
3. Open a linked destination.
4. Confirm Return to My Profile is clearly visible.
5. Navigate within the destination.
6. Select Return to My Profile.
7. Confirm Profile reopens.
8. Confirm the same tab is active.
9. Confirm the same section is open.
10. Confirm entered information remains.
11. Confirm scroll position is restored where practical.
12. Repeat from several Profile-linked destinations.
13. Test Escape, outside click, keyboard, and Welcome Home.
14. Confirm no stale return control appears after intentionally leaving the flow.

---

# Constraints

- do not rely only on browser Back
- do not make the user reopen Profile manually
- do not discard unsaved Profile state
- do not create one-off return logic per destination
- do not create an infinite navigation stack
- do not deploy production
- stop after authenticated preview and report results

---

# Required Report

Return:

- exact root cause of lost Profile context
- exact files changed
- Profile state owner
- origin-context owner
- return-control owner
- return-routing owner
- draft preservation owner
- scroll restoration owner
- automated test results
- preview URL
- unrelated WIP included in preview
- remaining limitations
- deploy or do-not-deploy recommendation

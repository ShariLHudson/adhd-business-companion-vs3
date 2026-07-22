# Spark Estate — Reflection Navigation Routing Fix
## Corrected Cursor Implementation Prompt

# Mission

Fix the routing for the Reflection area without placing Clear My Mind inside Reflection.

The following destinations currently route incorrectly to Clear My Mind:

- Journal
- Hall of Achievements
- Evidence Vault

They must each open their own correct experience and live under the Reflection menu.

Clear My Mind must remain separate from Reflection and keep its own existing approved menu location.

---

# Correct Reflection Menu Structure

## Reflection

- Journal
- Evidence Vault
- Hall of Achievements

Optional Reflection destinations may remain only if already approved, such as:

- Talk It Out
- Reflection Pond

Do not add Clear My Mind to Reflection.

Do not create duplicate entries.

---

# Clear My Mind Placement

Clear My Mind must remain in its own approved menu location outside Reflection.

Preserve the current intended placement or move it to the separately approved group used for immediate mental unloading, such as Today or another existing quick-support area.

Do not move Clear My Mind into Reflection as part of this task.

Its purpose is immediate thought capture and mental unloading, not reflective review.

---

# Correct Routing

## Journal

Menu label:

`Journal`

Must open:

- the Journal or Journal Gazebo experience
- saved journal entries
- Create New and Continue options
- editable journal content
- save, print, rename, archive, and delete actions where supported

It must not open Clear My Mind.

## Evidence Vault

Menu label:

`Evidence Vault`

Must open:

- the Evidence Vault experience
- saved evidence, proof of progress, strengths, learning, and confidence-building records
- editable saved evidence
- save, print, rename, archive, and delete actions where supported

It must not open Clear My Mind.

## Hall of Achievements

Menu label:

`Hall of Achievements`

Must open:

- the Hall of Achievements experience
- accomplishments, milestones, completed work, and recognized progress
- editable saved achievements
- save, print, rename, archive, and delete actions where supported

It must not open Clear My Mind.

## Clear My Mind

Menu label:

`Clear My Mind`

Must open only:

- the Clear My Mind thought-capture experience
- thought entry
- clustering or organization features when available
- Parking Lot handoff when appropriate

It must not appear under Reflection.

It must not act as the fallback route for Journal, Evidence Vault, or Hall of Achievements.

---

# Route Audit

Before changing the menu:

1. Locate the current Reflection menu definition.
2. Locate the current approved menu location for Clear My Mind.
3. Locate the route or component used by each destination.
4. Identify why Journal, Evidence Vault, and Hall of Achievements resolve to Clear My Mind.
5. Remove shared fallback logic that redirects them incorrectly.
6. Confirm every destination has its own canonical route and component.
7. Preserve existing user data.
8. Confirm Clear My Mind remains outside Reflection.

Do not create duplicate routes if the correct routes already exist.

---

# Canonical Reflection Registry

Create or update one source of truth for Reflection destinations.

```ts
const reflectionDestinations = [
  {
    id: "journal",
    name: "Journal",
    route: "/reflection/journal",
    componentKey: "journal",
    description: "Write, reflect, and return to saved journal entries.",
    isActive: true,
  },
  {
    id: "evidence-vault",
    name: "Evidence Vault",
    route: "/reflection/evidence-vault",
    componentKey: "evidence-vault",
    description: "Keep proof of progress, strengths, learning, and growth.",
    isActive: true,
  },
  {
    id: "hall-of-achievements",
    name: "Hall of Achievements",
    route: "/reflection/hall-of-achievements",
    componentKey: "hall-of-achievements",
    description: "Recognize accomplishments, milestones, and completed work.",
    isActive: true,
  },
];
```

Clear My Mind must not be included in this Reflection registry.

Maintain Clear My Mind in its own existing destination registry or menu group.

---

# Navigation Behavior

When the user selects a Reflection item:

- navigate directly to that destination
- do not route through Clear My Mind
- do not reuse the Clear My Mind component
- preserve browser Back behavior
- preserve Return to Estate behavior

Each Reflection destination must work from:

- the Reflection menu
- Welcome Home recommendations
- direct links
- search
- Shari navigation commands
- recent activity
- saved-item links

Clear My Mind must continue working from its own approved entry point outside Reflection.

---

# Voice Command Routing

Test:

- Take me to my Journal
- Open the Evidence Vault
- Show me the Hall of Achievements
- I need to Clear My Mind

Each command must open the exact correct destination.

Use destination-specific matching first.

Do not let broad terms such as `thoughts`, `mind`, or `reflection` send unrelated requests to Clear My Mind.

---

# Purpose Distinctions

## Journal

For writing, reflection, and returning to longer-form entries.

## Evidence Vault

For saving proof of progress, learning, strengths, and confidence.

## Hall of Achievements

For recognizing accomplishments, milestones, completed work, and wins.

## Clear My Mind

For quickly unloading thoughts and reducing mental clutter.

Clear My Mind is related to immediate support, but it is not part of the Reflection menu.

---

# User-Created Item Actions

Saved Journal, Evidence Vault, and Hall of Achievements items should support applicable universal actions:

- Open
- Edit
- Save
- Rename
- Print
- Duplicate when appropriate
- Archive
- Delete
- Restore from Trash when supported

Recommended visible actions:

- Open or Continue
- Edit

More menu:

- Rename
- Print
- Duplicate
- Archive
- Delete

---

# Empty States

## Journal

> Your journal entries will appear here.

Primary action:

`Create New Entry`

## Evidence Vault

> Your saved evidence and progress will appear here.

Primary action:

`Add Evidence`

## Hall of Achievements

> Your accomplishments and milestones will appear here.

Primary action:

`Add an Achievement`

Do not display Clear My Mind content or empty states in any of these destinations.

---

# Testing Requirements

Test each Reflection destination from:

1. Reflection menu
2. direct URL
3. Welcome Home recommendation
4. Shari navigation command
5. recent activity
6. saved-item link
7. browser refresh
8. browser Back
9. mobile navigation
10. keyboard navigation

Also test Clear My Mind from its separate approved menu location.

Confirm:

- Journal opens Journal
- Evidence Vault opens Evidence Vault
- Hall of Achievements opens Hall of Achievements
- Clear My Mind opens Clear My Mind from outside Reflection
- Clear My Mind does not appear in Reflection
- no route falls back incorrectly
- saved data remains intact
- page titles match destinations
- Return to Estate works correctly

---

# Acceptance Criteria

- [ ] Journal is under Reflection.
- [ ] Evidence Vault is under Reflection.
- [ ] Hall of Achievements is under Reflection.
- [ ] Clear My Mind is not under Reflection.
- [ ] Clear My Mind remains in its separate approved menu location.
- [ ] Journal no longer routes to Clear My Mind.
- [ ] Evidence Vault no longer routes to Clear My Mind.
- [ ] Hall of Achievements no longer routes to Clear My Mind.
- [ ] Each destination has its own canonical route and component.
- [ ] Direct links and voice navigation open the correct experiences.
- [ ] Existing saved data is preserved.
- [ ] Universal edit, save, print, archive, and delete actions are supported where appropriate.

---

# Final Experience

The Reflection menu contains:

- Journal
- Evidence Vault
- Hall of Achievements

Clear My Mind remains separate and opens only from its own approved location.

Every choice opens the correct experience immediately.

# Contextual Workspace pattern

A reusable way to build a **single-room builder**: one focused workspace where a
member answers questions, thinks a question through with inline research, and
saves as they go — without ever leaving the room (no split screen, no
navigation away, no Chamber / Board).

First adopter: the **Client Avatar** builder (`IdealClientBuilder`). Designed so
**My Business Estate, Projects, Marketing, Decision Compass** and other builders
can adopt it later without rebuilding the workflow.

## Pieces

| Component | Responsibility | Reusable? |
|-----------|----------------|-----------|
| `ContextualWorkspaceShell` | The transparent single-column scroll container that lets the room background fill the workspace. | Yes — any builder |
| `WorkspaceStepControls` | The save/navigation bar: **Back · Skip for Now · Save Progress · Save and Continue**, plus the calm "Progress saved." confirmation. Never forces sequential completion. | Yes — any builder |
| `ContextualResearchPanel` | An expandable, per-question research conversation that appears **beneath** the active question. Scoped to `(questionKey, questionLabel, systemPrompt)`. The member copies wording into their own answer; no automatic insertion. | Yes — any builder |

## Contract for a host builder

1. Render inside a room shell that paints the background (e.g. `WorkspaceShell`
   or `MyBusinessEstateRoomShell`) — **not** inside an opaque frosted panel.
2. Wrap the active step in `ContextualWorkspaceShell`.
3. Show the current question, its answer field, then `WorkspaceStepControls`,
   then (optionally) `ContextualResearchPanel` for free-text questions.
4. Persist on every control action so nothing is lost; store a draft-step
   pointer so re-entry resumes exactly where the member left off.

## Deliberately out of scope (this phase)

- No automatic "Add to Answer" / AI answer replacement.
- No report generation.
- No cross-builder intelligence.

The purpose of this phase is **workflow**, not intelligence. Smarter research
builds on top of these pieces later.

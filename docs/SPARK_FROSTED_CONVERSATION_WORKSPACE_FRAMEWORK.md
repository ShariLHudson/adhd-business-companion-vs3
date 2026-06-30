# SPEC 109 — Spark Frosted Conversation Workspace™

## The Universal Conversation Surface for Every Room, Tool, and Business Experience

| Field | Value |
|-------|-------|
| **Spec ID** | 109 |
| **Title** | Spark Frosted Conversation Workspace™ |
| **Version** | 1.0 |
| **Status** | Foundational UX Specification |
| **Priority** | Critical |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **Applies to** | Every room, tool, and business experience inside Spark |
| **Related** | **[Spec 105 — Conversation Engine](./SPARK_CONVERSATION_ENGINE_FRAMEWORK.md)** · **[Spec 106 — Conversation Guardrails](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md)** · **[Spec 107 — Conversation State Machine](./SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md)** · **[Spec 108 — Environment Integration](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md)** · [Spec 103 — Universal Experience](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) · [T-017 — Estate Rooms](./ESTATE_ROOMS_FRAMEWORK.md) · `lib/workspaceLayoutTokens.ts` · `lib/companionDesk/workspaceLayout.ts` · `.cursor/rules/workspace-layout.mdc` |

---

## Purpose

Define the **single conversation/work surface** that appears inside any Spark environment.

**Types:** `lib/sparkFrostedConversationWorkspace/types.ts`

---

## Core Idea

Spark does not use traditional pages, dashboards, or feature screens as the primary experience.

Spark uses **one calm, readable, frosted-glass conversation workspace**.

- The room remains present.
- The conversation remains primary.
- The work appears only when needed.

---

## Primary Rule

**The user should always know what to do next.**

If the user has to search, scroll, guess, or wonder where to type, the workspace has failed.

**Type:** `SPARK_FROSTED_WORKSPACE_PRIMARY_RULE`

---

## Workspace Purpose

The Frosted Conversation Workspace exists to support:

- normal conversation
- one question / one answer flow
- research help
- brainstorming
- journaling
- focus support
- Momentum Builder™ prompts
- Spark Card™ guidance
- draft review
- document creation
- saving / printing / exporting

**One workspace supports all of it.**

**Type:** `SPARK_FROSTED_WORKSPACE_PURPOSES`

---

## Visual Style

Use the **frosted glass** effect.

Requirements:

- soft translucent glass
- strong enough contrast for readability
- warm blur behind panel
- rounded corners
- subtle shadow
- no harsh borders
- no busy UI
- no tiny text

The room should still be **visible around the edges**.

Implementation: `companion-workspace-frosted` · `workspaceFloatingCardShellClass()` in `lib/workspaceLayoutTokens.ts`

**Type:** `SPARK_FROSTED_WORKSPACE_VISUAL_REQUIREMENTS`

---

## Readability Requirements

This is critical.

Minimum desktop sizes:

| Element | Size |
|---------|------|
| Main Shari message | 30–36px |
| User message | 26–30px |
| Button text | 24–26px |
| Input text | 26–30px |
| Supporting text | 22–24px |

- No pale gray text on glass.
- No low contrast.
- No thin fonts.

**Type:** `SPARK_FROSTED_WORKSPACE_TYPOGRAPHY`

---

## Default Layout

The workspace should appear as **one centered frosted-glass conversation panel**.

Not three columns. Not a dashboard. Not sidebars.

Default structure:

1. Current conversation area
2. Current question
3. Numbered response choices when helpful
4. Always-visible input box
5. Microphone button
6. Send button

**Type:** `SPARK_FROSTED_WORKSPACE_LAYOUT_ELEMENTS`

---

## Conversation Rules

### One Question at a Time

Shari asks one question. The user answers. Shari responds. Then Shari asks the next question.

Never show a full form unless the user asks to review the document.

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 3.

---

### Numbered Choices

Whenever Shari offers options, number them.

Example:

1. Help people discover it
2. Explain it more clearly
3. Create a simple launch plan
4. I'm not sure yet

The user can click the option or type the number.

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 4.

---

### Input Always Visible

The chat input must **never disappear**.

Even if choices are shown, the user can still type freely.

---

### No Scroll Chasing

After the user answers, the next Shari message should appear in view.

The user should not have to scroll down to continue.

Older messages may gently collapse into "Earlier" if needed.

---

## States of the Workspace

**Type:** `SparkFrostedWorkspaceState` · `SPARK_FROSTED_WORKSPACE_STATES`

---

### State 1 — Conversation

**Default state.**

Used for: talking · thinking · clarifying · emotional support · planning

Only the current exchange and immediate previous context are visible.

Aligns with [Spec 107](./SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md) — Listening through Exploring.

---

### State 2 — Help Options

Triggered when user says: *I don't know* · *I'm stuck* · *I'm not sure* · *help me* · *can you research this?*

Shari offers:

1. Ask me another way
2. Show me examples
3. Research this
4. Brainstorm together

**Type:** `SparkFrostedWorkspaceHelpChoice`

---

### State 3 — Research

Research appears **inside the same frosted panel**. Not a separate page.

Shari says:

> I found a few things that may help.

Then shows 3–5 short findings.

After research:

> Would you like to use this, keep talking, or research more?

**Type:** `SparkFrostedWorkspaceResearchFollowUpChoice`

---

### State 4 — Draft Ready

Only after enough conversation.

Shari says:

> I think we have enough to prepare a first draft.

Options:

1. Yes, show me
2. Not yet, keep talking
3. Save these ideas for later

Aligns with [Spec 107](./SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md) — Permission state · [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 5.

**Type:** `SparkFrostedWorkspaceDraftReadyChoice`

---

### State 5 — Review

When the user chooses to see a draft:

- conversation fades back
- draft becomes the main focus
- old chat is **not** visible behind the draft
- text is large and readable

User can:

1. Make changes
2. Keep talking
3. Save it
4. Print / Export
5. Leave it for later

Aligns with [Spec 105](./SPARK_CONVERSATION_ENGINE_FRAMEWORK.md) Stage 8 — Review.

**Type:** `SparkFrostedWorkspaceReviewChoice`

---

### State 6 — Completion

When user finishes, Shari says:

> Before we stop, I prepared a few things for you.

Only show items that are **true**.

Example:

- Draft ready for review
- Notes organized
- Research saved for approval
- Suggested next step prepared

Then ask permission:

1. Review
2. Save
3. Ignore for now
4. Keep talking

**Type:** `SparkFrostedWorkspaceCompletionChoice`

**Full behavior:** [Spec 110 — Conversation Completion](./SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md)

---

## Permission Rule

Spark may prepare.

Spark may **not** act without permission.

Never automatically:

- save finalized documents
- overwrite existing work
- publish
- send
- delete
- export
- contact anyone
- launch anything

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 13 — Ask Before Acting.

**Type:** `SPARK_FROSTED_WORKSPACE_PERMISSION_REQUIRED`

---

## Environment Integration

The workspace can appear in **any room**.

Same behavior everywhere.

The room changes the feeling. The workspace behavior **never** changes.

Examples:

- Conservatory + marketing conversation
- Coffee House + brainstorming
- Pond + reflection
- Library + research
- Stable + thinking walk
- Journal page + emotional processing

See [Spec 108](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md) — capability identical across work-capable environments.

---

## Map Integration

A small folded map may live in the bottom-right corner.

It should not compete with the conversation.

Clicking it opens the full Estate Map.

The current conversation should **pause**, not disappear.

Returning from the map resumes exactly where the user left off.

Aligns with [Spec 108](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md) Rule 9.

---

## Mobile Requirements

On mobile:

- one column only
- large text
- input fixed at bottom
- microphone always available
- choices stacked vertically
- no tiny icons
- no hidden critical actions

**Type:** `SPARK_FROSTED_WORKSPACE_MOBILE_REQUIREMENTS`

---

## Failure Conditions

This design fails if:

- text is hard to read
- user has to scroll to continue
- input disappears
- too many options appear
- Shari jumps to the wrong deliverable
- old chat competes with draft view
- workspace feels like a dashboard
- user wonders what to do next

**Type:** `SPARK_FROSTED_WORKSPACE_FAILURE_CONDITIONS`

---

## Success Criteria

The workspace succeeds when:

- the user can simply talk
- Shari asks one clear question
- the next step is obvious
- the room still feels present
- the frosted glass feels calm and premium
- documents appear only when ready
- everything feels easier than expected

**Type:** `SPARK_FROSTED_WORKSPACE_SUCCESS_CRITERIA`

---

## Relationship to Conversation Specs

| Layer | Spec | Role |
|-------|------|------|
| Interaction model | 105 | Nine-stage member-facing flow |
| Rules | 106 | Wins on conflict — one question, permission |
| Internal states | 107 | When workspace states may activate |
| Environment | 108 | Room visible; workspace behavior identical |
| **Surface UX** | **109 (this)** | How the frosted panel looks and behaves |
| **Completion** | **110** | STATE 9 Complete — member decides next step |

---

## Final Principle

The Frosted Conversation Workspace is not where the user manages Spark.

It is where the user talks with Shari, gets help, and lets Spark quietly prepare what is needed.

- The conversation leads.
- The workspace supports.
- The room holds the experience.

**Type:** `SPARK_FROSTED_WORKSPACE_FINAL_PRINCIPLE`

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/frosted-conversation-workspace.mdc` (**always apply**)

**Types:** `lib/sparkFrostedConversationWorkspace/types.ts`

**Layout authority:** `.cursor/rules/workspace-layout.mdc` · `lib/companionDesk/workspaceLayout.ts`

Before shipping any conversational UI surface, verify typography, input visibility, and workspace state transitions.

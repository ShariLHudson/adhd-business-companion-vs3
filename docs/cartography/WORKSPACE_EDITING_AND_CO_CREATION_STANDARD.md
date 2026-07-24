# Workspace Editing & Co-Creation Intelligence Standard™

**Status:** Binding for Visual Thinking Studio collaborative workspace  
**Date:** 2026-07-24  
**Runtime:** `lib/cartographersStudio/visualThinkingWorkspaceEditing.ts`  
**UI:** `components/companion/cartographersStudio/ThinkingWorkspace.tsx`  
**Related:** [Workspace Experience](./VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md) · [Workspace Foundation](./VISUAL_THINKING_WORKSPACE_FOUNDATION_STANDARD.md) · [Presentation](./VISUAL_THINKING_PRESENTATION_INTELLIGENCE_STANDARD.md) · [Generate-First](./VISUAL_THINKING_GENERATE_FIRST_STANDARD.md) · [Integration](./VISUAL_THINKING_INTEGRATION_STANDARD.md) · [Recommendation](./VISUAL_THINKING_RECOMMENDATION_INTELLIGENCE_STANDARD.md)

---

## Mission

Transform Visual Thinking Studio from a one-time generation experience into a collaborative thinking workspace where the member and Shari think, explore, organize, refine, and evolve ideas together over time.

A generated result is never the end. It is the beginning.

## Non-negotiable principle

Every edit should be as small as possible. Modify only what the member intends. Never regenerate an entire workspace when only one section requires change.

## Architecture

```
Generation → Presentation → Workspace
→ Selection-scoped Co-Creation
→ Deliverable block mutation (generation engine)
→ Projection sync (affected objects only)
→ Optional representation sync preview
→ Autosave + content history
→ Return context preserved
```

Layers stay separate:

| Layer | Owner |
|-------|--------|
| Knowledge | Knowledge Intelligence |
| Content blocks | Generation Engine |
| Presentation layout | Presentation / Layout engines |
| Organization | Workspace Foundation |
| Scoped co-creation | **This module** |

Do not invent a second generation or research pipeline.

## Thinking Object model

Workspace objects remain projections (`ThinkingObject` in Foundation).  
Content/provenance uses `ThinkingObjectKnowledge` — no layout coordinates.

Origins: platform_generated · research_generated · user_created · user_edited · imported · external_reference · suggested · verified · pending_review

Protection: unprotected · protected · suggested_replacement · merge · ignore · review_later

## Selection model

Single · Multiple · Group · Area · Filtered  

`resolveSelectionScope` yields selected, affected, protected, locked, and representation dependencies.  
Actions mutate only affected (unlocked) objects.

## Inspector

Progressive disclosure: basics → actions → evidence → relations → history.  
Suggested actions include Expand, Simplify, Research this, Find missing pieces, Generate alternatives, Ask Board, Lock, Annotate.

## Co-creation actions

Expand · Simplify · Explain / Teach · Research selected · Find missing pieces · Generate alternatives · Ask Board · Ask Chamber Member · Lock · Annotate · Protect · Merge decisions  

Each action targets the selection only.

## Expansion / simplification

- **Expand:** deepen selected blocks via generation `transformBlock(..., "deepen")`  
- **Simplify:** shorten selected blocks; preserve meaning, evidence, and user edits  

## Research selected area

Research merges only into selected objects.  
User-edited / protected content receives merge suggestions — never silent overwrite.

## Merge intelligence

Detect conflicts, duplicates, complementary info, user overrides, research updates.  
Present choices. Never silently discard user work.

## Representation synchronization

Changes update shared content. Layouts rebuild only where necessary.  
Before surprising the member, show preview:

- Update all  
- Choose representations  
- Keep current versions  

## User edit protection

User edits are authoritative. Regeneration cannot overwrite protected / user-edited content without an explicit merge decision. Locked objects cannot regenerate; annotations still allowed.

## History and undo

Organization undo remains in Foundation.  
Content undo/redo lives in the editing session (`contentUndoStack` / `contentRedoStack`) and restores deliverable + projections.

Workspace history records creation, edits, research, merge, representation choices, notes, approvals.

## Autosave

Incremental session autosave for editing session + workspace + generation bundle.  
Recovery restores after interruption.

## Writeback boundaries

Workspace edits never silently modify Projects, Business Estate, Learning, Marketing, Board records, or Strategy. Approval required for those targets.

## Accessibility

Keyboard selection and actions · semantic inspector · status notices · no color-only meaning · large targets · narrow-screen drawer/overflow pattern (inspector remains usable).

## Failure recovery

If one object fails: preserve workspace; retry only affected objects; never discard user edits.  
Research failure: keep current knowledge; mark incomplete locally.  
Layout failure: rebuild layout only.

## Observability

Internal events for edits, expand/simplify, research, alternatives, undo/redo, merge, sync, lock, annotate, board/chamber prepare, autosave, recovery. Not exposed in member UI.

## Future collaboration

Architecture hooks only: shared workspaces, multiple editors, review mode, comment-only, suggestion mode — **not implemented**.

## Exclusions

No full multi-user collaboration · no second map engine · no silent Estate writebacks · no whole-workspace regenerate for section edits · no permanent “visual learner” labels.

## Core belief

The first generation is not the finished product. The workspace is where people and Shari think together until the work reflects the member’s understanding, goals, and decisions.

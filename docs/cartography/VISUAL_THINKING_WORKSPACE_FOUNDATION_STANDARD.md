# Visual Thinking — Thinking Workspace Foundation Standard

**Status:** Binding implementation standard (Build 7)  
**Date:** 2026-07-24  
**Scope:** First interactive Thinking Workspace over approved presentation, knowledge, and deliverables  
**Experience authority:** [VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md](./VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md)

**Runtime:** `lib/cartographersStudio/visualThinkingWorkspaceFoundation.ts`  
**UI:** `components/companion/cartographersStudio/ThinkingWorkspace.tsx`  
**Session key:** `companion-visual-thinking-workspace-v1`

---

## Mission

Build the first interactive Thinking Workspace so members can understand, organize, explore, and interact with **already generated** knowledge in a calm, ADHD-friendly surface.

This is **not**:

- a diagram editor  
- a whiteboard  
- a node editor  

It is the first implementation of the Thinking Workspace Experience Standard.

Members should leave feeling: **“I understand this.”**  
Not: “I learned another diagramming tool.”

---

## Pipeline position

```
Request
→ Understanding
→ Experience
→ Knowledge
→ Automatic Gap Resolution
→ Generation + Result Substance Validation
→ Presentation
→ VisualThinkingWorkspacePlan
→ Thinking Workspace   ← primary presentation surface (Build 7)
```

Depends on: [Experience Standard](./VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md) · [Generate-First](./VISUAL_THINKING_GENERATE_FIRST_STANDARD.md) · [Presentation Intelligence](./VISUAL_THINKING_PRESENTATION_INTELLIGENCE_STANDARD.md)

The workspace **consumes**:

- `VisualThinkingPresentationPlan`  
- `VisualThinkingKnowledgePackage`  
- `VisualThinkingGeneratedDeliverables` (via generation bundle)  
- `VisualThinkingWorkspacePlan` (entry contract)

The workspace **does not**:

- reinterpret requests  
- regenerate knowledge  
- perform research  
- change deliverables  
- modify Understanding  
- modify Experience Plans  

It presents existing information interactively and allows **organization-only** changes.

---

## Substantive-result guard (non-negotiable)

Before opening a `build_for_me` workspace, `assessWorkspaceEntryEligibility` requires:

- substance validation passed  
- meaningful instructional content (not request-echo)  
- an approved Presentation Plan  
- honest incomplete-area notices when partial  

`createThinkingWorkspace` returns `null` when the guard rejects.  
User-led (`let_me_build` / `build_myself`) is exempt and opens a calm starter surface.

Partial useful results may open with `status: "partial"` and localized `completenessNotice` — never a blank impressive canvas.

---

## Workspace architecture

| Concern | Responsibility |
|--------|----------------|
| **ThinkingWorkspace** | React shell — toolbar, surface, inspector, Ask Shari, Add Idea |
| **ThinkingSurface / Viewport** | Pan, zoom, fit, reset, center selection |
| **ThinkingObject** | One meaningful unit; references upstream content |
| **ThinkingGroup** | Logical container; collapse/expand; never rewrites knowledge |
| **Connectors** | Semantic relationships only (knowledge / presentation / visual shell) |
| **WorkspaceSelection** | Single primary selection; highlight + inspector; never immediate edit |
| **WorkspaceInspector** | Title, details, related, source note — no engine internals |
| **WorkspaceInteractionController** | `applyWorkspaceAction` — pure state transitions |
| **WorkspacePersistence** | Session storage of organization + view state |
| **WorkspaceAccessibility** | Keyboard-first, visible focus, reduced motion, large targets |

Pure logic lives outside React. UI dispatches actions; state remains serializable.

---

## Thinking Object model

Each object is one meaningful unit:

`title` · `concept` · `step` · `section` · `process` · `relationship` · `comparison` · `decision` · `warning` · `note` · `summary` · `action` · `checklist_item` · `glossary_term` · `supporting_resource` · `question` · `placeholder` · `group`

**Source kinds:**

- `generated_block` — references deliverable block id  
- `knowledge_item` — references knowledge package item id  
- `user_note` — member-created idea/note/question/placeholder/task  
- `group_shell` — surface stand-in for a collapsed/expanded group  

**Rules:**

- Do **not** duplicate full content as a second source of truth.  
- Inspector resolves details from deliverables when a block id exists.  
- Generated objects are `immutable: true`.  
- User notes are visually distinct (`userCreated: true`, dashed treatment).

---

## Layout

Initial placement and Auto Organize are owned by the [Intelligent Layout Engine](./VISUAL_THINKING_LAYOUT_ENGINE_STANDARD.md) (Build 8).

Intents include: `process` · `hierarchy` · `relationship` · `grouped_ideas` · `comparison` · `timeline` · `decision` · `learning_progression` · `journey` · `free_workspace`

**Auto Organize** proposes an arrangement (accept/reject). Pins and user notes are preserved.  
Layout never regenerates or rewrites knowledge.

---

## Selection model

Selecting an object:

1. Highlights it  
2. Focuses it for keyboard/context  
3. Opens contextual inspector  
4. **Never** immediately edits content  

Only one primary selection at a time.

---

## Grouping & collapsing

Allowed: group · ungroup · collapse · expand.

Groups are logical containers. They never rewrite knowledge.

Collapsed groups show: title · summary · count. Expand on demand.

Large collections may start collapsed (density + Adaptive Companion influence).

---

## Movement

Members may move, reposition, organize, and cluster objects.

Movement changes **workspace organization only**.  
It never modifies knowledge, deliverables, Understanding, or Experience Plans.

Guard: `workspacePreservesKnowledgeImmutability(before, after)`.

---

## Connectors

Display semantic relationships already known from:

- Knowledge Package relationships  
- Process/timeline sequence among steps  
- Generated visual shell edges when labels match  

No arbitrary decorative connections.

---

## Viewport

Supported: pan · zoom · fit to content · reset view · center selection.

Smooth interaction. No excessive animation. Honor `prefers-reduced-motion`.

---

## Focus mode

Focus dims unrelated objects, keeps context, centers current work. Easy exit (toolbar or Escape).

Adaptive Companion may recommend focus density; it must **not** move user content without permission.

---

## Ask Shari

Every workspace includes Ask Shari — context-aware, selection-aware, workspace-aware.

Examples: Explain this · Simplify this · Expand this · Compare these · Find missing steps · What am I missing?

Suggestions never modify content automatically. Prompts are limited via Adaptive Companion choice load.

---

## User notes (Add Idea)

Members may create: idea · note · question · placeholder · future task (`action`).

These remain visually distinct from generated knowledge.  
Delete (keyboard) applies to **user notes only**.

---

## Undo

Workspace operations may undo: move · group · collapse/expand · add/delete user notes · auto organize.

Do **not** undo knowledge or deliverable edits (those remain outside this engine).

---

## Persistence

Persist in session conventions:

- zoom · pan  
- collapsed groups  
- selected object  
- workspace organization (positions, groups, user notes)  
- focus mode  

Key: `companion-visual-thinking-workspace-v1`.

---

## Accessibility

- Keyboard-first: Tab, arrows, Enter, Escape, Space, Delete (user notes), Ctrl/Cmd+F, Ctrl/Cmd+0, Ctrl/Cmd±  
- Visible focus rings  
- Large targets  
- Readable typography  
- Screen reader labels on workspace and inspector  
- No hover-only interactions  
- Reduced motion respected  

Touch: pinch/zoom via ctrl-wheel pattern; pan; tap select; double-tap group toggle; long-press reserved for later polish.

---

## Performance

| Scale | Target |
|------|--------|
| 20 objects | Instant |
| 100 | Smooth |
| 500 | Responsive |
| 1000+ | Virtualize (future) |

Avoid unnecessary React rerenders; keep projections cheap (`projectVisibleWorkspaceObjects`).

---

## Adaptive Companion

May influence:

- initial zoom  
- density / collapse thresholds  
- Ask Shari choice count  
- focus recommendations  

Never moves user content without permission.

---

## Workspace Plan model

`VisualThinkingWorkspacePlan` records mode, presentations, incomplete state, density, and organization editability before the interactive state is created.

Modes: `reading` · `visual` · `split` · `user_led` · `comparison` · `process` · `training` · `execution`

## Ask Shari context

`AskShariWorkspaceContext` scopes to selected objects/groups, visible ids, incomplete areas, and a user question. Shari proposes — she does not auto-modify the workspace.

## Future compatibility

**Platform integration:** [Visual Thinking Integration Standard](./VISUAL_THINKING_INTEGRATION_STANDARD.md) — Estate experiences request Visual Thinking via `VisualThinkingService`; they do not implement local map engines.

**Layout engine:** [Intelligent Layout Engine](./VISUAL_THINKING_LAYOUT_ENGINE_STANDARD.md) organizes workspace objects after a substantive handoff.

**Research:** [Research Acquisition](./VISUAL_THINKING_RESEARCH_ACQUISITION_STANDARD.md) — may notify the workspace; never auto-replaces organization.

Still later:

- Dynamic Representation Switching  
- Cross-Estate Integration  

Those builds must still conform to the Experience Standard and this foundation’s immutability rules.

---

## Certification checklist

- [ ] Workspace opens from Presentation + Knowledge + Deliverables  
- [ ] Selection + inspector work  
- [ ] Group collapse/expand  
- [ ] Pan / zoom / fit / reset  
- [ ] Focus mode  
- [ ] Search  
- [ ] Keyboard navigation  
- [ ] Ask Shari receives correct context  
- [ ] Add Idea creates user objects  
- [ ] Generated objects remain immutable  
- [ ] Organization never changes knowledge  
- [ ] Workspace persists  
- [ ] Existing Builds 1–6 tests remain passing  

# Visual Thinking — Intelligent Layout Engine Standard

**Status:** Binding implementation standard (Build 8)  
**Date:** 2026-07-24  
**Scope:** Intentional layout of Thinking Workspace objects for human understanding  
**Experience authority:** [VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md](./VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md)  
**Workspace foundation:** [VISUAL_THINKING_WORKSPACE_FOUNDATION_STANDARD.md](./VISUAL_THINKING_WORKSPACE_FOUNDATION_STANDARD.md)

**Runtime:** `lib/cartographersStudio/visualThinkingLayoutEngine.ts`  
**Integration:** `visualThinkingWorkspaceFoundation.ts` · `ThinkingWorkspace.tsx`

---

## Mission

Transform approved visual recommendations into calm, organized workspace layouts.

This is **not**:

- a graph layout algorithm  
- a force-directed visualization  
- a generic diagram engine  

Its purpose is to arrange information in the way that best supports human thinking while preserving the Thinking Workspace Experience Standard.

**Core belief:** People should never spend their energy arranging information. They should spend their energy understanding it.

---

## Consumes / does not

**Consumes:** Presentation Plan · Knowledge Package · Generated Deliverables · Thinking Workspace objects

**Does not:**

- reinterpret user intent  
- regenerate knowledge  
- perform research  
- change deliverables  
- modify generated content  
- rewrite user organization without permission  

---

## Layout intents

Each intent has independent rules:

| Intent | Arrangement idea |
|--------|------------------|
| **process** | Start → ordered steps → completion; parallel/optional lanes |
| **hierarchy** | Parent → children → supporting detail; clear levels |
| **relationship** | Central concept; related concepts around it |
| **comparison** | Criteria beside options; differences visible without long scroll |
| **timeline** | Chronological; phases/milestones; eras when grouped |
| **decision** | Decision → criteria → options → outcomes → unknowns (no implied answer) |
| **grouped ideas** | Clusters by topic/theme/function/phase/audience/purpose; collapsible |
| **learning progression** | Overview → foundations → intermediate → advanced → practice → review |
| **journey** | Staged path with parallel lanes |
| **free workspace** | Soft calm grid — intentional, never random |

---

## Visual hierarchy

Every layout communicates:

1. **primary**  
2. **secondary**  
3. **supporting**  
4. **optional**  

Nothing should compete equally for attention. Roles are stored on Thinking Objects as `visualRole` and may style the surface — meaning is also available via inspector/title (accessibility).

---

## Spacing

Spacing communicates meaning:

- Related objects → closer  
- Different groups → farther  
- Whitespace is intentional  

Profiles:

- **Desktop** — full workspace spacing  
- **Tablet** — reduced gaps  
- **Mobile** — single-focus / vertical-friendly; readable object sizes (no tiny diagrams)

---

## Connectors

Render only meaningful relationships. Classified kinds:

`sequence` · `dependency` · `association` · `comparison` · `containment` · `reference`

No decorative connections. Sources remain Knowledge Package, Presentation Plan, and Generated Deliverable shells.

---

## Auto Organize

**Auto Organize** uses the current layout intent and creates a **proposal**.

Preserves:

- user notes  
- collapsed group state  
- pinned objects  
- focus state  

Member may **Accept arrangement** or **Keep mine**.  
Nothing rearranges until accept.

---

## Pinning

Members may pin objects.  
Pinned objects **never** move automatically (Auto Organize, intent switch proposals, Adaptive Companion).

---

## Layout suggestions

Instead of changing layouts automatically — **suggest**.

Examples:

- “This process may be easier to understand vertically.”  
- “These concepts appear to form three natural groups.”  
- “A timeline may clarify this information.”  

Choosing a suggestion creates a proposal for the suggested intent; the member still accepts or rejects.

---

## Manual overrides

Tracked:

- manual movement (`manuallyMoved`)  
- manual grouping  
- manual expand/collapse  
- pins  

Manual movement clears a pending proposal so the engine does not fight the member.

---

## Focus layout

When focus mode is active:

- selected object remains central (viewport)  
- unrelated objects dim (workspace foundation)  
- layout may gently bias unpinned objects toward the focus without moving pins/notes  

---

## Adaptive Companion

May recommend:

- simpler spacing  
- collapsed-friendly density  
- focused views  
- learning progression / comparison suggestions  

Never rearranges pinned objects without permission.

---

## Performance

| Scale | Target |
|------|--------|
| 20 | Instant |
| 100 | Instant |
| 500 | Smooth |
| 1000+ | Virtualize (future) |

Incremental updates: recompute only when intent, organize, or profile changes — not every pointer move.

---

## Accessibility

Layout remains understandable through:

- keyboard navigation (workspace)  
- screen reader labels / inspector details  
- reduced motion  
- high-contrast selection  
- logical `readingOrder`  

Never rely on position alone to communicate meaning.

---

## Future compatibility (out of scope)

Do **not** begin here:

- Research Acquisition Intelligence  
- Dynamic Representation Switching  
- Estate-wide Integration  

Those builds must still honor pinning, proposals, and content immutability.

---

## Certification checklist

- [ ] Each layout intent produces intentional placement  
- [ ] Group spacing / hierarchy / timeline / comparison / decision / process / relationship  
- [ ] Pinned objects preserved  
- [ ] Auto Organize propose → accept / reject  
- [ ] Manual overrides respected  
- [ ] Responsive profiles  
- [ ] Focus mode viewport  
- [ ] Suggestions do not auto-apply  
- [ ] Content immutability preserved  
- [ ] Builds 1–7 tests remain passing  

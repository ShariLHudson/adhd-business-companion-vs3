# Cartographer's Studio — Progressive Disclosure Redesign

**Date:** 2026-07-22
**Branch:** `deploy/companion-app-v3`
**Scope:** Visual Focus / Cartographer's Studio map workspace
**Status:** Implemented (not committed). Tests written; automated run pending (local shell backend was unavailable during the session — see *Verify steps*).

---

## Why

Founder feedback: the generated map "screamed." On arrival a member was met with a nine-section intelligence panel (Business Summary / Relationships / Patterns / Risks / Opportunities / Recommendations / Board Observations / What-If / Next Steps) plus a seven-control toolbar (Edit · Print · More · Update · Canvas+Intelligence · Canvas Only · Intelligence Only) and a full mirror of every canvas node on the left. That is a dashboard, not a calm place to think.

The redesign hides intelligence until it's wanted, reveals it one insight at a time, and reduces the toolbar to three plain choices — without removing any capability. Intelligence is now **earned/opt-in**, never removed.

---

## What shipped

### 1. Intelligence is hidden until wanted (goals 2, 3)
On a freshly generated map the right side shows a calm invite instead of the panel:

> Here's your map. Would you like me to help analyze it? **[Yes] [Not yet]**

- **Yes** → insights reveal (sequentially).
- **Not yet** → collapses to a one-line teaser: *"✨ Companion Insights · I've found N things that might help. [Show insights]"*.

The full nine-section panel only renders after the member explicitly chooses **Show all together**.

### 2. Insights reveal one at a time (goal 7)
`CompanionInsightsReveal` walks the member through insights in order (Summary → Relationships → Patterns → Risks → Opportunities → …), one card at a time with *"Show me the next one"* and an *"N of total"* indicator, plus a *"Show all together"* escape to the full panel. Capability preserved — the original `VisualFocusIntelligencePanel` is what renders in the "all" phase.

### 3. Simplified toolbar (goal 5)
`Canvas · Analyze · More`:
- **Canvas** — just the map, intelligence hidden (`canvas-only`).
- **Analyze** — dropdown offering *Canvas + Intelligence · Canvas Only · Intelligence Only*; choosing an intelligence layout reveals insights on opt-in.
- **More** — the quieter map management: Edit Map, Rename, Print, Update Map, Delete.

### 4. Simplified left side (goal 4)
The left column is now a collapsed summary — **Nodes (N)** with the first few branch labels and **+ Add Another**. The full editable tree/kanban only appears after **Edit** (Done to collapse). No more mirroring every node on arrival.

### 5. Decision Summary (goal 10)
A permission-gated **Decision Summary** button (shown once analysis exists) opens a sheet that first asks:

> Would you like me to pull this together into a calm one-page summary…? **[Yes, create it] [Not now]**

Only after **Yes** does it render five plain lines: *What you're deciding / What matters most / Strongest opportunity / Biggest risk / Suggested next step*, with a Print option. Pure derivation from existing analysis — no new engine, no persistence.

### 6. Map feel (goal 8)
`VisualFocusVisualCanvas`: slightly larger nodes, softer/rounded edges (lower opacity), a subtle node-appear animation, and a gentle hover/focus highlight — all disabled under `prefers-reduced-motion`.

### 7. Estate plain language (goal 9)
Cartographer's Studio subtitle is now **"Think through ideas visually."** (room tagline + arrival motto), replacing the poetic "Every map tells a story…".

### Primary Action Feedback
Every new primary control produces immediate visible feedback: Create/guided flow → generated map + invite; Yes/Show insights → insights appear; Analyze options → layout changes + insights; Decision Summary → permission then summary; Canvas → map-only view.

---

## What was already satisfied (deferred / no change needed)

- **Goal 1 (calm first visit)** — the active entry is the immersive Studio room + the one-question-at-a-time Mind Map Discovery Interview. Intelligence is never dumped on arrival (it only exists on a *generated* map, which is now gated). The literal single-input "What are you trying to think through?" landing would replace the canonical immersive Estate room; left as-is per "fit existing architecture."
- **Goal 6 (conversational entry, not six cards)** — the six colored cards live in the **legacy, unwired** `VisualFocusStudioHub`. The production path already uses the conversational `MindMapDiscoveryInterview` / immersive room. No change.

---

## Files changed

**New**
- `lib/visualFocus/intelligence/insightSequence.ts` — ordered insight sequence + count + invite phrasing.
- `lib/visualFocus/decisionSummary.ts` — `buildDecisionSummary` / `canBuildDecisionSummary`.
- `components/companion/visualFocus/CompanionInsightsReveal.tsx` — invite → teaser → sequential → all.
- `components/companion/visualFocus/DecisionSummarySheet.tsx` — permission-gated one-page summary.
- Tests: `lib/visualFocus/intelligence/insightSequence.test.ts`, `lib/visualFocus/decisionSummary.test.ts`, `components/companion/visualFocus/CompanionInsightsReveal.test.tsx`, `components/companion/VisualFocusWorkspacePanel.progressiveDisclosure.test.tsx`.

**Modified**
- `components/companion/VisualFocusWorkspacePanel.tsx` — gated intelligence, simplified toolbar, collapsed left side, Decision Summary wiring, per-map disclosure reset.
- `components/companion/visualFocus/VisualFocusVisualCanvas.tsx` — node/edge feel.
- `lib/visualFocus/intelligence/index.ts`, `lib/visualFocus/index.ts` — barrel exports.
- `app/companion/cartographers-studio.css` — map-node motion + Decision Summary styles.
- `lib/cartographersStudio/framedMaps.ts` — plain tagline.
- `lib/estate/estateArrivalExperience.ts` — plain arrival motto (focus-studio + cartographers-studio).

**Preserved unchanged:** map builders, save, print, rename, `onSelectWallMap` wiring, existing saved maps, and the intelligence engine itself.

---

## Verify steps

The local shell backend was unavailable during implementation, so run these:

```bash
# focused new tests
npx vitest run \
  lib/visualFocus/intelligence/insightSequence.test.ts \
  lib/visualFocus/decisionSummary.test.ts \
  components/companion/visualFocus/CompanionInsightsReveal.test.tsx \
  components/companion/VisualFocusWorkspacePanel.progressiveDisclosure.test.tsx

# regression guards for the studio
npx vitest run \
  components/companion/VisualFocusWorkspacePanel.wallMapClick.test.tsx \
  lib/visualFocus/intelligence/intelligencePanel.test.ts \
  lib/cartographersStudio/cartographersStudioUx.test.ts \
  lib/visualFocus/studioCards.test.ts

# types
npx tsc --noEmit
```

Manual: open a map → confirm the invite (not the panel) appears; Not yet → teaser with count; Yes → one insight, then Next, then Show all together; toolbar shows only Canvas/Analyze/More; Analyze lists the three layouts; left side is "Nodes (N)" until Edit; Decision Summary asks before generating.

---

## Gaps / follow-ups

- **Automated test run not performed** (shell backend down). Tests are written to existing patterns but should be executed before merge.
- **Goal 1 literal single-input landing** not implemented (would displace the canonical immersive room). Revisit if founder wants the room replaced rather than complemented.
- **Business Canvas** keeps its own health-overview + change-panel flow; the invite/teaser gate wraps its intelligence too, but sequential reveal was tuned for tree/kanban analyses — worth a design pass for canvas-specific insights.
- **`IntelligenceViewModeToggle`** is now unused by the production panel (still referenced by the unwired `head_vfwp.tsx` duplicate). Safe to remove in a later cleanup.
- **Add-branch animation** is applied to generated canvas nodes on (re)layout; a per-branch animation inside the editable outline was left out to keep scope contained.
```

## Suggested commit message

```
feat(cartographers): progressive-disclosure redesign of Visual Focus workspace

Hide intelligence until wanted (invite → teaser → one-at-a-time reveal),
simplify toolbar to Canvas · Analyze · More, collapse the left node list to
"Nodes (N)" until editing, add a permission-gated Decision Summary, soften
the map feel, and use plain-language studio subtitle. Capability preserved;
intelligence is now earned/opt-in.
```

# Focus Landscape™
## Focus My Brain™ — Six-Space Cognitive Countryside

**Version:** 1.0  
**Status:** Constitutional — Focus My Brain™ routing and environments  
**Code:** `lib/focusLandscape/` · Scene Render Contract™ · Living Border™  
**Sibling:** [SUNROOM_OVER_THE_POND.md](./SUNROOM_OVER_THE_POND.md) (Meadow/Lake anchor) · [LIVING_BORDER.md](./LIVING_BORDER.md)

---

## Master Insight

> You are building a cognitive landscape where ADHD attention can move safely between states of mind.

Each space is **not a screen**. Each space is a **place the brain enters** depending on what it needs.

No menus. Only movement through land.

---

## The Focus Landscape™ Map

```
                 (Deep Forest)
               Sensory Reset
                     |
      (Forest Pavilion / Rain Shelter)
               Audio + Calm Sound
                     |
 (Garden Path) —— CENTER HUB —— (Meadow / Lake)
     I'm Stuck              I Need a Break
                     |
              (Horizon Trail)
                Walk Reminder
                     |
        (Meadow Objects Field)
             Recharge Zone
```

---

## Six Spaces

| Space | Feeling / Tool | Homestead place | Purpose |
|-------|----------------|-----------------|---------|
| **Garden Path™** | I'm Stuck | `garden-path` | One visible next action |
| **Meadow / Lake™** | I Need a Break (hub) | `sunroom-over-pond` | Downshift overload |
| **Forest Clearing™** | Stretch, Calm Moment | `garden` | Physical release |
| **Forest Pavilion™** | All audio tools | `greenhouse` | Sound without visual stimulation |
| **Meadow Object Field™** | Brain break games | `garden` | Gentle dopamine reset |
| **Horizon Trail™** | Walk reminder | `outlook-point` | Real-world motion |
| **Deep Forest™** | Sensory reset | `garden-path` (fog profile) | Complete downshift |

---

## Tool Routing

Every Focus hub tool maps to a landscape space via `FOCUS_TOOL_TO_SPACE` in `lib/focusLandscape/toolRouting.ts`. Components never hardcode destinations.

---

## Global Rules

1. **Environment first, interface second**
2. **Living Border™** — all meaningful motion at edges
3. **No competing motion behind text**
4. **Shari Nearby™ or ambient** — never central in Focus
5. **Transitions = movement through land** — walk, terrain shift, weather — never modal or load screen

Enforced: `FOCUS_LANDSCAPE_GLOBAL_RULES` · `FOCUS_LANDSCAPE_FORBIDDEN`

---

## Pipeline

```
FocusAreaPanel
  → evaluateFocusLandscape({ workspaceId, focusCategoryId, toolId })
  → placeId + css vars + data-focus-landscape-space
  → SceneRenderer → LivingBorderFrame
```

`focus-hub` → Meadow/Lake center  
`focus-category` + `stuck` → Garden Path  
`focus-category` + `need-break` → Meadow/Lake  
Individual tools → subspaces per routing table

---

## Relationship to Sunroom Over The Pond™

Meadow/Lake uses `sunroom-over-pond` as its homestead place — the pond/lake horizon is the emotional anchor for break and regulation. Garden Path and other spaces use their own place compositions.

---

## Code Map

| Module | Role |
|--------|------|
| `lib/focusLandscape/spaceCatalog.ts` | Six spaces — emotion, environment, motion language |
| `lib/focusLandscape/toolRouting.ts` | Tool → space routing |
| `lib/focusLandscape/transitions.ts` | Spatial transition state machine |
| `lib/focusLandscape/evaluateFocusLandscape.ts` | Pre-render verdict |
| `components/companion/FocusAreaPanel.tsx` | Hub UI with landscape data attrs |

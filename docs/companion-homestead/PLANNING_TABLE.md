# Planning Table
## The Kitchen Planning Nook — Plan My Day

**Version:** 1.0  
**Status:** Constitutional — Plan My Day workspace  
**Code:** `lib/planningTableRoom/` · Scene Render Contract · Living Border  
**Sibling:** [ROOM_COMPOSITION_RULE.md](./ROOM_COMPOSITION_RULE.md) · [SHARIS_PRESENCE.md](./SHARIS_PRESENCE.md) · [LIVING_BORDER.md](./LIVING_BORDER.md)

---

## What This Room Is

The Planning Table is **not** an office, conference room, or productivity workspace.

It is the place in the Homestead where mornings begin — where Shari naturally sits with coffee, opens her planner, and gently thinks through the day ahead.

The room should immediately communicate:

- There is enough time.
- There is no pressure.
- We'll figure it out together.

---

## Emotional Promise

> My day suddenly feels more manageable.

Not because everything changed. Because everything became clearer.

**Success test:** Within thirty seconds the guest's shoulders relax — not because the room planned their day, but because it quietly reminds them:

> You don't have to solve everything right now. We're just going to decide what today needs.

It is not where productivity begins. **It is where clarity begins.**

---

## Room Layout

| Zone | Life |
|------|------|
| **Left Border** | Built-in shelves, planner collection, leather notebooks, sticky notes, pen cup, table lamp, fresh flowers, Companion logo (lower left) |
| **Center** | Protected Workspace Zone — today's plan, tasks, calendar, conversation. Nothing decorative. Nothing distracting. |
| **Right Border** | Large open window, linen curtains, summer trees, bird feeder, garden flowers, hummingbird, morning breeze |
| **Lower Right** | Fresh coffee, planner open, reading glasses, woven basket, comfortable chair |

**Signature Companion Object:** Planning Notebook (`sig-planning-notebook`) — worn leather edges; appears in navigation, recommendations, cards, workspace, and environmental form on the table.

---

## Movement

Movement belongs only in the **Living Border**:

- Curtains gently moving
- Leaves rustling, branches swaying
- Birds at the feeder
- Coffee steam rising
- Sunlight gradually changing
- Cloud shadows crossing the garden

**Nothing moves behind the planning workspace.**

---

## Time Of Day

| Profile | Border life |
|---------|-------------|
| **Morning** | Golden sunlight, fresh coffee, long shadows, bird activity |
| **Afternoon** | Brighter light, open windows, garden in full color |
| **Evening** | Warm lamp, golden interior light, tea replaces coffee |
| **Rain** | Raindrops on glass, soft gray skies, cozy interior |
| **Winter** | Snow outside, warm lamp, steam from hot mug, evergreen |

Resolved by `evaluatePlanningTableRoom()` → `resolvePlanningTimeProfile()`.

---

## Shari's Presence

**State:** Beside You

Shari is not physically sitting across the table. She has already prepared the space:

- The planner is open
- The coffee is ready
- The chair is waiting
- The conversation anchor is always available

The guest never feels watched. They always feel supported.

Enforced: `sharisPresence` room assignment + `companionPresenceEngine` (no portrait).

---

## ADHD Design Rules

Never in this room:

- Visual clutter
- Dashboards
- Dense statistics
- Countdown timers
- Productivity pressure
- Streak counters

Catalog: `PLANNING_TABLE_ADHD_FORBIDDEN` in `lib/planningTableRoom/rules.ts`

---

## Pipeline Integration

```
SceneState (plan-my-day)
  → SceneResolver (homestead-room, sig-planning-notebook)
  → evaluatePlanningTableRoom() (time profile, css vars, data attrs)
  → SceneLayoutEngine (Living Frame, protected center)
  → SceneRenderer + LivingBorderFrame
  → PlanDayJourneyShell (chapter journey UI)
```

**UI entry:** `PlanMyDayPanel` → `CompanionWorkspaceShell` workspaceId `plan-my-day`

---

## Code Map

| Module | Role |
|--------|------|
| `lib/planningTableRoom/` | Constitutional evaluator — layout zones, time profiles, ADHD rules |
| `lib/sceneRenderContract/` | Workspace id `plan-my-day`, copy, background crop |
| `lib/roomCompositionRule/roomCatalog.ts` | Signature feature: open window right |
| `lib/livingBorder/borderCatalog.ts` | Planning table border elements |
| `lib/sharisPresence/roomAssignments.ts` | Beside You |
| `components/companion/PlanMyDayPanel.tsx` | Scene-wrapped journey shell |

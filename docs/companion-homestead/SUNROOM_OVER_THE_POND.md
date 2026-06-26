# Sunroom Over The Pond™
## Focus My Brain™ — A Reconstructed Lived Environment

**Version:** 1.0  
**Status:** Constitutional — Focus My Brain™ workspace  
**Code:** `lib/sunroomOverThePond/` · Scene Render Contract™ · Living Border™  
**Sibling:** [PLANNING_TABLE.md](./PLANNING_TABLE.md) · [SHARIS_PRESENCE.md](./SHARIS_PRESENCE.md) · [LIVING_BORDER.md](./LIVING_BORDER.md)

---

## Core Design Truth

This room is defined by three forces:

- **Water** — movement without urgency
- **Plants** — life without demand
- **Enclosure** — safety without isolation

> My mind slows down here without trying.

This is not decoration. It is a **memory of regulated attention** — Shari's real sunroom overlooking a pond.

---

## Physical Structure

| Element | Role |
|---------|------|
| **Sunroom** | Warm glass enclosure, wood framing, simple workspace — everything secondary to the view |
| **Pergola** | Half-circle wrapping the back of the pond — vines, filtered light, shifting shadows |
| **Pond** | Emotional center — flowing water, goldfish, lilies, reflections, subtle ripples |
| **Nature layer** | Dense plants at edges — guest feels inside nature, not looking at it |

Water sound is always present: soft, continuous, never rhythmic like music, never attention-demanding.

---

## Living Border™ Behavior

**Allowed:** water flow · goldfish gliding · lily drift · leaf sway · light on water · pergola shadows · brief birds · peripheral butterflies

**Forbidden:** sudden motion near workspace · repetitive animations · center-screen movement behind text · anything that pulls cognitive attention from thinking

Catalog: `SUNROOM_COGNITIVE_FORBIDDEN` in `lib/sunroomOverThePond/rules.ts`

---

## Workspace Integration Rule

The workspace must:

- Never block the pond entirely
- Never obscure water movement completely
- Feel embedded inside the sunroom — not on top of the environment
- Remain visually subordinate to the Living Border™

Enforced: lighter frosted panel (`0.42`), pond-forward crop (`50% 68%`), signature zone `bottom`.

---

## Shari's Presence™

**State:** Nearby™

Shari is not visually centered or supervising. Evidence only:

- Coffee mug at the edge
- Journal left open on a side surface

The **pond remains the emotional center**.

---

## Emotional Outcome

After time in this space, the guest should feel:

- Mentally slower in a good way
- Less reactive
- More able to sustain attention
- Naturally grounded

Not because they were told to calm down. Because the environment supports it.

**Success test:** *"I can finally stay with one thought."*

---

## Pipeline Integration

```
SceneState (focus-hub | focus-category)
  → SceneResolver (homestead-room, sig-pond-anchor)
  → evaluateSunroomOverThePond() (time profile, css vars, data attrs)
  → SceneLayoutEngine (Living Frame™, pond-visible center mask)
  → SceneRenderer + LivingBorderFrame (pond-water, goldfish, lilies)
  → FocusAreaPanel
```

---

## Code Map

| Module | Role |
|--------|------|
| `lib/sunroomOverThePond/` | Constitutional evaluator — layout, sensory memory, cognitive rules |
| `lib/sceneRenderContract/` | Homestead background for focus-hub / focus-category |
| `lib/roomCompositionRule/roomCatalog.ts` | Pond anchor signature at bottom |
| `lib/livingBorder/` | Pond water, goldfish, lilies, pergola vines |
| `lib/sharisPresence/roomAssignments.ts` | Nearby™ |
| `components/companion/FocusAreaPanel.tsx` | Scene-wrapped focus feelings hub |

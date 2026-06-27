# Life Area Intelligence

Category Intelligence lives in **Companion Brain** — not inside Plan My Day or any single workspace. Plan My Day is the first consumer; Clear My Mind, My Thoughts, and Founder Intelligence can reuse the same service.

## Architecture

```
Task text + ecosystem context
        ↓
Companion Brain — classifyLifeArea()
        ↓
LifeAreaClassificationResult (confidence, signals, alternates)
        ↓
Experience adapter — lib/planMyDay/lifeAreaBridge.ts
        ↓
UI — PlanDayLifeAreaSelector (presentation only)
```

**Memory remembers. The Brain understands. Pages express.**

## Three levels of Life Areas

| Level | Source | Storage |
|-------|--------|---------|
| **System Life Areas** | Ship with product | `lib/companionBrain/lifeAreas/systemLifeAreas.ts` |
| **User Life Areas** | User-created | `localStorage` → `companion-user-life-areas-v1` (Supabase-ready shape) |
| **Smart Life Areas** | Companion Brain suggests from patterns | Created via `createUserLifeArea` after user accepts |

## Companion Brain service

**`classifyLifeArea(input, lifeAreas)`** — pure function, no UI imports.

**Input:** task text, projects, contacts, companies, offers, calendar context, previous corrections.

**Output:**

- `primaryLifeAreaId` / `primaryLifeAreaName`
- `secondaryLifeAreaIds`
- `confidence` (0–1)
- `matchedSignals`
- `alternateSuggestions`
- `needsConfirmation` (true when confidence &lt; 0.72)

## Learning layer

**`recordLifeAreaCorrection(taskText, lifeAreaId)`** stores phrase → Life Area mappings in `companion-life-area-learning-v1`. Repeated confirmations increase confidence. Future classifications check corrections first.

## Smart Life Area suggestions

**`detectSmartLifeAreaSuggestions(items)`** finds repeated phrases across unassigned tasks. When threshold is met, `SmartLifeAreaSuggestionCard` offers:

- Yes → creates User Life Area
- Not now → dismiss for session
- Never suggest again → suppress phrase

## Plan My Day integration

- `PlanDayItem.lifeAreaId` — persisted Life Area reference
- `PlanDayItem.category` — deprecated; migrated on read via `migratePlanItemLifeArea`
- `mapMemoryFromEcosystem.ts` — resolves legacy brain themes from Life Area
- Auto-apply when confidence ≥ threshold on add; polite ask when uncertain

## Future ecosystem connections

Life Areas are designed as **connectors**, not labels. A Life Area workspace will eventually surface tasks, projects, notes, Clear My Mind captures, calendar, Founder insights, and related conversations. IDs are stable for cross-workspace linking.

## Constitutional alignment

- **Carry what should be carried** — companion organizes so the user doesn't
- **Companion Judgment** — recommends Life Area; user confirms or reshapes
- **Lifetime Capability Model** — corrections teach judgment over time
- **Human Reality Test** — "Shari usually knows where things belong"

## Key files

| File | Role |
|------|------|
| `lib/companionBrain/classifyLifeArea.ts` | Intelligence service |
| `lib/companionBrain/lifeAreas/` | Types, system areas, user store, learning, smart suggestions |
| `lib/planMyDay/lifeAreaBridge.ts` | Plan My Day adapter |
| `components/companion/PlanDayLifeAreaSelector.tsx` | Gateway selector UX |
| `components/companion/SmartLifeAreaSuggestionCard.tsx` | Smart Life Area offer |

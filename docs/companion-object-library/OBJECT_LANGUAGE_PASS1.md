# Companion Object Language™ — Pass 1 Report

**Branch:** `design/companion-object-language`  
**Date:** 2026-06-26  
**Registry:** `lib/companionObjects/companionObjectRegistry.ts`

## Emoji audit (production UI)

Scanned `app/`, `components/`, `lib/` (excludes `*.test.ts`).  
Full machine output: `docs/companion-object-library/emoji-audit.json`

| Metric | Before pass | After pass (cards) |
|--------|-------------|-------------------|
| Files with emoji | 161 | 158 |
| Unique emoji glyphs | 205 | 205 |

### Grouped by area

| Area | Primary emoji debt | Pass 1 status |
|------|-------------------|---------------|
| **Navigation** | Sidebar/top bar largely migrated in stabilization | ✅ Uses `CompanionObjectVisual` + registry |
| **Workspace cards** | Active bar, create/projects pickers | ✅ Active bar + project source cards |
| **Plan My Day** | Plan panels (text headers) | ⏳ Headers text-only; no emoji-primary cards |
| **Clear My Mind** | Thought emoji heuristics | ⏳ Data layer still uses `thoughtEmoji.ts` |
| **Focus / Games / Breathing / Audio** | Games meta, Focus Audio categories | ✅ Games, Focus Audio headers/categories |
| **Create** | Create catalog picker | ✅ Catalog cards use objects |
| **Business** | Email generator title, strategies | ✅ Email generator; strategies group header |
| **Learn / Help** | How Do I articles (105 lines in data) | ✅ Workflow + search cards; article data still has emoji |
| **Settings / utility** | Settings tone picker, profile links | ⏳ Utility panels pending |

## Objects mapped (initial registry)

All 22 primary features from the spec plus momentum, templates, snippets, celebration, and focus-hub variants.  
See `COMPANION_OBJECT_REGISTRY` in `lib/companionObjects/companionObjectRegistry.ts`.

## Placeholder system

- **Component:** `components/companion/CompanionObjectVisual.tsx`
- **Card shell:** `components/companion/CompanionNavCard.tsx`
- **CSS:** `app/companion/companion-object.css` — warm mini-scenes per `data-companion-object` + room gradient
- **No emoji, no clip art** — text labels always visible beside objects

## Files changed (pass 1)

- `lib/companionObjects/companionObjectRegistry.ts` (new)
- `lib/companionObjects/companionObjectRegistry.test.ts` (new)
- `lib/companionObjects/index.ts` (new)
- `components/companion/CompanionObjectVisual.tsx`
- `components/companion/GamesPanel.tsx`
- `components/companion/FocusAudioPanel.tsx`
- `components/companion/StrategiesPanel.tsx`
- `components/companion/HowDoIWorkflowCard.tsx`
- `components/companion/HowDoIPanel.tsx`
- `components/companion/ProjectsPanel.tsx`
- `components/companion/PlaceholderPanel.tsx`
- `components/companion/GrowthSectionHeader.tsx`
- `components/companion/CreateCatalogPicker.tsx`
- `components/companion/SavedWorkLibrary.tsx`
- `components/companion/EmailGeneratorPanel.tsx`
- `components/companion/ActiveWorkspaceBar.tsx`
- `app/companion/CompanionPageClient.tsx` (active workspace bar items only)
- `app/companion/companion-object.css`

## Screenshots needed (for art direction)

1. Sidebar + top bar — object icons at `sm` / `xs`
2. `CompanionNavCard` grid — Games, Focus, Growth entry points
3. Create catalog picker — object + label cards
4. How Do I workflow cards — icon column
5. New Project source picker
6. Focus Audio — header + saved category groups
7. Games — category cards + celebration done state

## Remaining emoji debt (next passes)

- `lib/howDoIHelpArticles.ts` — 105 emoji fields (data; cards already visual)
- `lib/createCatalogData.ts` — catalog metadata emoji (cards migrated)
- `lib/strategySystem.ts` — category emoji in data
- Thought/companion box emoji (`lib/thinkingSpace/thoughtEmoji.ts`)
- Celebration effects, spin wheel, ideal client avatars
- Hospitality prototype / director studio (out of production path)
- Settings tone picker, profile quick links
- Visual thinking studio card emoji

## Gate results

| Gate | Result |
|------|--------|
| `npm run build` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run test` | PASS — 3178/3178 |
| `npm run audit:companion` | PASS — 90/90 |
| `npm run audit:companion:record` | Recorded (post-pass) |

## Commit recommendation

**Safe to commit locally** on `design/companion-object-language` as:

`feat(object-language): add companion object registry and migrate feature cards`

Re-run `npm run audit:companion:record` after commit so `audit:companion:check` keys off HEAD.

Do not merge to main until art placeholders are reviewed and remaining card surfaces are migrated.

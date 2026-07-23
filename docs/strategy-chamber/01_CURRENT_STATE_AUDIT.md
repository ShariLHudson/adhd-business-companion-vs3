# Strategy Chamber — Current-State Audit

**Date:** 2026-07-23  
**Scope:** Companion Strategies / Strategy Library → Strategy Chamber foundation  
**Rule:** Do not delete working functionality until the replacement path is verified.

## 1. What currently exists

| Layer | Reality |
|-------|---------|
| Destination | Welcome Home Guidance → **Strategies** (`strategy-library`) |
| Runtime section | `AppSection` **`playbook`** |
| Main UI | `StrategiesPanel` + `StrategyLibraryEstatePanel` + room shell |
| Catalog | Hard-coded ADHD + business strategies (`strategySystem`, `strategyCatalog`) |
| Saved work | `userStrategies` localStorage |
| Apply / build | Apply coach, guided create, business strategy builder (in-memory) |
| Connections | Plan My Day, Projects, Reminders, Rhythms, Board (permissioned) |
| Related (not same) | Chamber member `strategy`, Board `strategy-director`, `strategy-studio`→Create, TIO moves, Founder Strategy Center |

There is **no** standalone Strategy Chamber room today. “Strategy Chamber” in code usually means Chamber Strategy Intelligence.

## 2. What is working

- End-to-end library open from Guidance / hard-nav / chat
- ADHD apply sessions and business builder coaching
- Guided create with optional Chamber / Board offers
- Execution connections with permission (no silent Project create)
- Estate full-bleed presentation + How Do I + mode cards
- Substantial automated tests (128–143)

## 3. What is incomplete

- No durable shared `strategy_work_item` across destinations
- Business builder session not persisted across reload
- Project Homes Strategies tab partially wired
- Estate Brain / registry still map Strategies under Business
- No universal Continue Your Journey component
- No concise Strategy Decision Record as default outcome

## 4. What is confusing

- playbook vs Strategies vs Strategy Library vs Strategy Chamber vs Strategy Studio
- Opening shows hubs / recommended galleries after mode cards (cognitive load)
- How Do I still mentions Create / My Work in some articles
- Same word “strategy” across library, Chamber advisor, Board director, Create docs

## 5. What creates friction

- Large category / hub wall once Browse opens
- Members may need to know ADHD vs Business before thinking
- Sticky naming (“ADHD Entrepreneur Strategy Library”) frames a document library, not guided decisions
- Asking for “Strategy Studio” opens Create

## 6. What should be retained

- `StrategiesPanel` runtime + catalog + apply/create/connections
- Destination id `strategy-library` / section `playbook` (compatibility)
- Chamber / Board as advisory — not replacement decision owners
- Package 180: Strategies out of Create launchers

## 7. What should be updated

- Member-facing name → **Strategy Chamber**
- Opening → three primary choices + Help Me Choose
- Help copy → purpose / why / what happens afterward
- Shared work item + decision record + Continue Your Journey
- Nav / orientation labels under Guidance

## 8. What should be removed (later, not yet)

- Framing as a document library on first paint
- Stale How Do I Create/My Work paths (after replacements verified)
- Do **not** remove catalog or apply flows yet

## 9. What needs migration

- Saved `userStrategies` → linkable from `strategy_work_item` (preserve localStorage)
- Mode ids `apply|browse|create|resume` → entry reasons + stages (compat map)
- Registry home Business → Guidance alignment
- Fix Estate Brain `business.strategy` / `business.funnel` toolIds (follow-up)

## 10. What connections are missing

- Typed handoff contracts (Chamber, Board, TIO, Create, Projects, Execution, Calendar, PMD, Rhythms, Journal, Evidence, Business Estate, Celebration)
- Single graph preventing duplicate strategy records
- Talk It Out ↔ Strategy Chamber gentle return
- Cloud sync (future)

## Audit verdict

**Retain and evolve in place.** Rename and simplify the opening; add shared work-item foundation and connection contracts. Do not replace the catalog or execution connectors in this phase.

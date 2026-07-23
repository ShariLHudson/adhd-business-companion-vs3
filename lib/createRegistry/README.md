# Create Registry Foundation

**Status:** Phase 2 foundation — canonical types beside legacy Create.

## What this is

`lib/createRegistry/` is the **future canonical creation registry** for Spark Estate Create.

It establishes:

- Lifecycle / readiness states
- Nine master categories
- Verification flags
- Computed visibility (`computeIsUserVisible`)
- Seed entries for the four guided Universal Work Engine types
- A dual-read adapter seam for legacy catalog / parent types

Product source of truth:

- `docs/create-experience/CREATE_MASTER_INVENTORY_AND_REGISTRY.md`
- `docs/create-experience/create-registry-audit/*`

## What this is not (yet)

- Not the live Browse menu driver (still seven categories via `createParentTypes`)
- Not a Create home redesign
- Not Based on Your Business / avatar selection
- Not an expansion of the Create catalog

## Dual-read migration

During migration:

| Layer | Role |
|---|---|
| `CREATE_CATALOG` / `CREATE_PARENT_TYPES` | Current UI + Begin matching (unchanged) |
| `lib/createRegistry` | Canonical readiness + future menus |
| `adapters.ts` | Bridge only — never blesses launchability as readiness |

**Readiness ≠ launchability.** A type may open in today’s Create UI and still compute `isUserVisible === false` under the master gate until browser/founder certification sets verification flags and `lifecycleStatus: "ready"`.

## Visibility rule (do not loosen)

```ts
computeIsUserVisible(item) ===
  item.lifecycleStatus === "ready" &&
  item.routeVerified &&
  item.saveVerified &&
  item.reopenVerified &&
  item.requiredActionsVerified
```

Print, export, and project handoff verification remain separate.

## Create ↔ Projects

- **Create** = source of truth for the creation
- **Projects** = execution (timeline, tasks, follow-through)

Do not invert that relationship when wiring handoff later.

## UI migration

Happens in later PRs (Browse 7→9, Help Me Choose, Begin matching, Based on Your Business). This module may stay unused by UI until those PRs land.

## Guided certification

Four UWE seeds use lifecycle `testing` after the jsdom integration pack. Verification flags stay `false` until authenticated founder/browser journeys pass. See:

- `certification/guidedCreateCertification.ts`
- `__tests__/guidedCreateCertification.integration.test.ts`
- `docs/create-experience/create-registry-audit/guided-create-certification-report.md`

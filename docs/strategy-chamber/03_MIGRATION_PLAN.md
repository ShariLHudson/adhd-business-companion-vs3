# Strategy Chamber — Migration Plan

## Principles

- No data loss for saved strategies or apply sessions
- Keep destination id `strategy-library` and section `playbook`
- Map old entrance modes to new entry reasons
- Do not auto-migrate catalog content into work items until a conversation starts

## Compatibility map

| Legacy mode | New entry reason | Default view |
|-------------|------------------|--------------|
| `apply` | `need_direction` | recommended / apply |
| `browse` | (secondary) explore library | home + browseAll |
| `create` | `important_decision` | guided create (`new`) |
| `resume` | resume active work item or saved | saved / apply session |

## Storage

| Store | Action |
|-------|--------|
| `companion-user-strategies-v1` | Keep; readable from Strategy Chamber |
| `companion-strategy-apply-v1` | Keep; resume path |
| `spark:strategy-work-items:v1` **(new)** | Primary work items |
| `spark:strategy-connections:v1` **(new)** | Links |

## Navigation copy

| Surface | Change |
|---------|--------|
| Welcome Home Guidance | Strategies → Strategy Chamber |
| `workspaceMode` playbook label | Strategies → Strategy Chamber |
| Orientation “How Spark Estate Works” | Strategies → Strategy Chamber |
| Hard-nav “open strategies” | Still opens `playbook` |

## Registry follow-ups (not blocking foundation)

1. Align `ESTATE_REGISTRY` Playbook / Strategies under Guidance
2. Fix Estate Brain `business.strategy` toolId → playbook / strategy-library
3. Clarify Strategy Studio (Create) vs Strategy Chamber in alias copy

## Rollback

If entrance regresses: restore prior `STRATEGY_LIBRARY_MODE_CHOICES` rendering; work-item store is additive and can remain unused.

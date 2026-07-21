# 088_007 — Workspace Environment Personalization (Preferences)

**Status:** Preferences extension  
**Governing product rule:** [091 Workspace Environment Personalization Standard](../091_WORKSPACE_ENVIRONMENT_PERSONALIZATION_STANDARD.md)  
**Accessibility partner:** [088_004](./088_004_ACCESSIBILITY_AND_ENERGY_MODES.md)

## Preference scope

Members may set, per Work Type:

- preferred workspace environment
- optional atmosphere theme
- imagery on/off
- background blur strength
- work surface opacity
- reduced motion / high contrast (shared with 088_004)

## Rules

- Preferences change **environment only** — never navigation, layout, workflow, or controls.
- Preferences persist automatically once chosen.
- Defaults come from the Work Type assignment in 091 until the member chooses otherwise.
- Shari may suggest a preview; never auto-apply.

## Runtime

`lib/workspaceEnvironment/` — types, defaults, preference contract (UI wiring follows).

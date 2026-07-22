# 053 — Event Capability Registry and Dynamic Section Runtime

**Status:** Production architecture and runtime standard  
**Extends:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md)–[052A](./052A_DYNAMIC_SECTION_ASSET_REGISTRY_STANDARD.md)  
**Editors:** [054 Connected Asset Editor](./054_CONNECTED_ASSET_EDITOR_FRAMEWORK.md)  
**Authority library:** Events Intelligence / Event Architect Studio knowledge (`docs/visual-spark-studios/Events-Intelligence/`)  
**Runtime:** `lib/eventsIntelligence/eventCapabilityRegistry/` · `lib/eventsIntelligence/eventAssetRegistry/` · `lib/connectedAssetEditor/`

## Mission

Create the canonical **Event Capability Registry** using the Event Architect Studio capability library as the source of truth.

- Separate **capabilities** from **asset definitions**
- Allow every workspace section to dynamically load assets from the registry
- Implement **+ Add Asset** for every section
- Deterministic recommendations from event type, format, lifecycle phase, audience, goals, dependencies, and existing assets
- Ensure every created asset connects to Event Record · Creation Workspace · Relationship Registry · Project Home · Cartography · readiness · conversation context
- Keep the workspace clean — never hardcode long asset lists into the UI

## Three Layers (binding)

| Layer | Meaning | Examples |
|-------|---------|----------|
| **Capabilities** | What the platform knows how to help with | Budgeting, sponsorships, accessibility, ECHO (event-day command), risk management |
| **Asset Types** | Things users can create | Agenda, workbook, landing page, sponsor kit, budget, survey, run of show |
| **Templates** | Optional starting content/layouts for an asset type | One-day workshop agenda · multi-day conference agenda |

The Event Architect Studio guide is the **authoritative Capability Registry for Events**, not a single event template. The workspace stays focused; the registry grows as expertise expands.

## Dynamic Section Runtime

Every section panel provides:

1. Planning notes (from Event Record)
2. Created assets (instances)
3. Recommended assets (focused bands)
4. Capability scope for this section
5. Searchable Add Asset picker (registry-backed)
6. Archived / existing without clutter

## + Add Asset Rule

Selecting an asset from the picker:

1. Resolves the asset type (and optional template)
2. Checks for existing instance (no duplicate orphans)
3. Creates a connected instance
4. Registers Relationship Registry edges
5. Syncs Project Home references when appropriate
6. Updates readiness
7. Preserves conversation / Creation Context

## Platform Principle

> The workspace remains simple. The registry carries the depth of Event Architect Studio.

# 052A — Dynamic Section Asset Registry Standard

**Status:** Production Implementation Standard  
**Applies to:** Every Creation Workspace in Spark Estate  
**Extends:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md) · [046](./046_CREATE_BLUEPRINT_STANDARD.md) · [047](./047_CREATE_ECOSYSTEM_AND_ASSET_GENERATION_STANDARD.md) · [048](./048_CREATION_WORKSPACE_STANDARD.md) · [049](./049_CREATION_ECOSYSTEM_CONNECTION_STANDARD.md) · [050](./050_CREATION_OWNERSHIP_AND_COLLABORATION_STANDARD.md) · [051](./051_UNIVERSAL_CREATION_ENGINE_STANDARD.md)  
**Superseded in depth by:** [053 Event Capability Registry](./053_EVENT_CAPABILITY_REGISTRY_AND_DYNAMIC_SECTION_RUNTIME.md) (Capabilities · Asset Types · Templates)  
**Runtime:** `lib/eventsIntelligence/eventAssetRegistry/` · `lib/eventsIntelligence/eventCapabilityRegistry/` · `lib/eventCreationWorkspace/` · section capability panels

## Mission

A Creation Workspace must never become an infinitely growing template.

Every Workspace consists of:

- Major **Sections** (stable)
- Dynamic **Assets** inside each Section (from the Registry)
- Intelligent **Asset Recommendations**
- Connected **Asset Registry** / Creation Ecosystem

Users see what they need. Spark Estate scales by adding registry capabilities—not by enlarging templates.

## Core Principle

```
Workspace → Sections → Assets → Relationships → Creation Ecosystem
```

The Workspace remains stable. The Assets are dynamic.

## Universal Rule

Every major Workspace section supports unlimited connected assets.

Each section owns:

1. Planning information (notes / Event Record fields)
2. Dynamic Assets (created, recommended, searchable)

## Dynamic Asset Panel (per section)

| Area | Purpose |
|------|---------|
| Planning Notes | Section content from the Creation Record |
| Created Assets | Instances linked to this section |
| Recommended Assets | Contextual, focused — never hundreds |
| Search Assets | Registry search within section scope |
| Add Asset | Picker → create connected instance |
| Existing / Archived | Full history without cluttering focus |

## Never Hardcode Assets

Do **not** hardcode Landing Page, Email, Workbook, Budget, etc. into the Workspace template.

Load all possible assets from the **Capability / Asset Registry**. The Registry is the source of truth.

## Event Capability Registry

See **[053](./053_EVENT_CAPABILITY_REGISTRY_AND_DYNAMIC_SECTION_RUNTIME.md)** for the three-layer model:

1. **Capabilities** — `EVENT_CAPABILITY_DEFINITIONS`
2. **Asset Types** — `EVENT_ASSET_DEFINITIONS`
3. **Templates** — `EVENT_ASSET_TEMPLATES`

It is **not** the Event Workspace. The Workspace loads from the registry when needed.

## Intelligent Recommendations

Recommend from:

- Event type · format · phase · completed sections · audience · goals · venue · dependencies · existing assets

Classify: `required_now` · `recommended_now` · `recommended_later` · `optional` · `not_applicable` · `already_created`

Do not expose the full asset list by default.

## Asset Creation

Every created asset automatically receives Creation Record · Workspace · Blueprint · Owner · Contributors · Relationship Registry · Project · Conversation · Readiness · Cartography links.

No manual linking. Never orphan.

## Variants & Multiples

Sections may hold many assets (e.g. Marketing: landing page, VIP landing page, email campaign…). Variants stay connected to the same creation.

## Change Detection

When audience (or similar) changes → recommend review of related assets. Do not auto-overwrite.

## Future Workspaces

Books · Courses · Memberships · Business Planning · Marketing · Learning · Client Experience — all follow:

```
Stable Workspace → Dynamic Sections → Connected Assets → Registry → Relationship Engine
```

## Platform Principle

Spark Estate does not grow by making templates larger. It grows by expanding intelligent capabilities while keeping every Workspace simple, focused, and adaptive.

## Completion Criteria

- Event Workspace does not hardcode asset lists in section templates
- Event Capability Registry is the source of truth
- Assets are dynamically resolved per section
- Recommendations are contextual and focused
- Unlimited assets per section are supported in the model
- Connections flow through the Creation Ecosystem (049)

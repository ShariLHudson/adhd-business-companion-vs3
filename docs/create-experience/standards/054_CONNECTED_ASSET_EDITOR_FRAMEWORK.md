# 054 — Connected Asset Editor Framework

**Status:** Production architecture and runtime standard  
**Extends:** [049](./049_CREATION_ECOSYSTEM_CONNECTION_STANDARD.md) · [050](./050_CREATION_OWNERSHIP_AND_COLLABORATION_STANDARD.md) · [051](./051_UNIVERSAL_CREATION_ENGINE_STANDARD.md) · [053](./053_EVENT_CAPABILITY_REGISTRY_AND_DYNAMIC_SECTION_RUNTIME.md) · [055 Entrypoint](./055_UNIVERSAL_CREATION_ENTRYPOINT_STANDARD.md)  
**Reference asset:** Event Agenda  
**Runtime:** `lib/connectedAssetEditor/`

## Mission

Extract the proven Agenda pattern into a reusable editor framework so every future asset inherits the same capabilities:

| Capability | Meaning |
|------------|---------|
| Connected | Bound to one Creation Record / Event Record / Workspace |
| Versioned | Every save preserves history; never silent overwrite |
| Relationship-aware | Relationship Registry edges stay current |
| Project-aware | Confirmed execution stays on Project Home |
| Conversation-aware | Creation Context + do-not-reask travel with the editor |
| Editable | Native structured / rich editing inside Spark Estate |
| Resumable | Leave and return to the same document state |
| Recommendation-enabled | Focused next assets / related reviews from the registry |

At that point Spark Estate is no longer building individual documents. It is building a **connected knowledge workspace**. Each new asset is another implementation of the same pattern — not a one-off feature.

## Core Principle

**One pattern. Many asset types. One connected result.**

Budgets · landing pages · workbooks · surveys · speaker packets · run-of-show · marketing plans — all open through the same Connected Asset Editor Framework.

## Editor Lifecycle

```text
Open or resume instance
  → Load Connected Document + versions
  → Assemble Connection Bundle (Creation · Project · Relationships · Conversation)
  → Load focused recommendations
  → Edit (blocks / fields / outline)
  → Save version
  → Sync readiness · relationships · optional project tasks
  → Resume later from return state
```

## Non-Negotiables

- Never create an orphan document outside a Creation Record
- Never discard prior versions on save
- Never re-ask known Creation Context
- Never expose internal architecture in member copy
- Recommendations stay focused — never dump the registry

## Platform Principle

> Every asset is editable knowledge in one living creation — not a file dropped beside the work.

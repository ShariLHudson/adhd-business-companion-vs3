# 049 — Creation Ecosystem Connection Standard

**Status:** Binding  
**Parents:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md) · [046](./046_CREATE_BLUEPRINT_STANDARD.md) · [047](./047_CREATE_ECOSYSTEM_AND_ASSET_GENERATION_STANDARD.md) · [048](./048_CREATION_WORKSPACE_STANDARD.md)  
**Companion:** [050 Ownership](./050_CREATION_OWNERSHIP_AND_COLLABORATION_STANDARD.md) · [052A Dynamic Section Asset Registry](./052A_DYNAMIC_SECTION_ASSET_REGISTRY_STANDARD.md) · [051 Universal Creation Engine](./051_UNIVERSAL_CREATION_ENGINE_STANDARD.md)  
**Runtime:** `lib/creationEcosystem/` · `lib/universalCreationEngine/` · Relationship Registry · links Canonical Work / Event Record / Create Assets

## Mission

Every creation in Spark Estate belongs to a living **Creation Ecosystem**.

Spark Estate never creates isolated documents, projects, conversations, or assets. Everything belongs to one connected **Creation Record**.

Regardless of where creation begins — Chamber member, Shari, Create, Projects, Board, or Cartography — all work connects to the same ecosystem.

## Core Principle

```
One Creation
  → One Canonical Creation Record
  → Many Connected Assets
  → Many Connected Conversations
  → Many Connected Experts
  → One User Experience
```

## Universal Rule

Whenever any Chamber member, Board member, Shari, Create, or Projects creates something, Spark must determine:

> What larger creation does this belong to?

If one exists: **Connect. Never duplicate. Never orphan.**

## Canonical Creation Record

Every ecosystem owns **one** master record. Everything references it. Nothing copies it.

Fields include: Creation ID · Type · Name · Purpose · Owner · Status · Current Phase · Blueprint · Project Home · Cartography Map · Assets · Conversations · Tasks · Milestones · Decisions · Knowledge Sources · History · Relationships.

Runtime anchors: Canonical Work Record + Event Record (when event) + Creation Ecosystem Record (047).

## Relationship Registry (platform service)

Every asset automatically records relationships such as:

| Relation | Example |
|----------|---------|
| Parent | Workshop / Retreat |
| Created by | Events Intelligence |
| Contributors | Content, Marketing |
| Supports | Registration, Attendee Experience |
| Feeds | Follow-up Campaign |
| Referenced by | Project Tasks, Cartography, Workbook |
| Depends on | Agenda, Audience Definition |
| Status | Draft · In Review · Approved · Archived |

A single change (e.g. updating workshop audience) can identify every related asset that may need review. Spark maintains one living knowledge graph — not dozens of disconnected documents.

## Connection Rules

### Assets

Every generated asset links to: Creation Record · Blueprint · Project Home · Cartography · Chamber members · Conversation history. The user never manually links anything.

### Documents

Every document knows: who created it · why · which creation · which project · Chamber owner · Blueprint · related assets · version history · dependencies.

### Conversations

Inside a Creation Workspace, every conversation receives **Creation Context**. Never re-ask event type, audience, purpose, goals, known decisions, already-created assets, or completed phases.

### Chamber

Chamber members may create. No Chamber member creates isolated work. Marketing emails, Finance budgets, Leadership volunteer plans — all connect automatically.

### Board

Board members advise. If recommendations produce assets, those assets connect. Never create separate projects for Board output.

### Create

Every Blueprint declares possible / required / optional / suggested assets and a relationship graph. Spark recommends the next asset. Never loses context.

### Workspace vs Projects

| Creation Workspace owns | Projects own |
|-------------------------|--------------|
| Purpose · Assets · Documents · Knowledge · Conversations | Tasks · Dates · Assignments · Completion · Dependencies |

Projects manage execution. They never own the work.

### Cartography

Visualizes Creation → Assets → Relationships → Dependencies → Decisions → People → Timeline → Knowledge. Every node opens the real asset — not a copy.

### Create Asset (“I can create…”)

Resulting asset: opens in the workspace · editable · inherits creation context · connects automatically · updates Project Home · Cartography · readiness.

## Readiness Engine

Every new or completed asset updates readiness (section readiness and overall creation readiness).

## Navigation Rule

Users never browse folders. They open the creation (Workshop, Book, Course, Membership, Conference). Everything appears automatically.

## Universal Prompt Rule (internal)

Before creating anything, Spark asks internally:

1. Does this belong to an existing Creation Workspace?
2. Does a similar asset already exist?
3. Should this become a new asset?
4. Which Blueprint owns it?
5. Which Chamber member owns it?
6. Which Project should track execution?
7. Should Cartography update?
8. Should readiness update?
9. Should related conversations receive this context?

If yes — connect automatically. **Never ask the user to organize Spark Estate. Spark Estate organizes itself.**

## Platform Principle

Every creation is part of something larger.

Spark Estate’s responsibility is not merely to help members create documents. It is to maintain a living, connected ecosystem where every conversation, asset, project, visual map, and expert contribution stays synchronized around one canonical source of truth.

## Architecture Stack

| Layer | Role |
|-------|------|
| **045 Intent Routing** | What the user is trying to accomplish |
| **046 Blueprints** | How that type of creation is built |
| **047 Asset Registry / Ecosystems** | Reusable assets belonging to a creation |
| **048 Creation Workspace** | Purpose-built surface for that creation |
| **049 Connection + Relationship Registry** | One living graph — connect, never orphan |
| **Projects** | Execution only |
| **Cartography** | Visualization of the same graph |
| **Chamber / Board** | Expertise and advice inside the ecosystem |

# 048 — Creation Workspace Standard

**Status:** Binding for Events (V1); pattern for Book / Course / Launch later  
**Parents:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md) · [046](./046_CREATE_BLUEPRINT_STANDARD.md) · [047](./047_CREATE_ECOSYSTEM_AND_ASSET_GENERATION_STANDARD.md)  
**Companion:** [049 Creation Ecosystem Connection](./049_CREATION_ECOSYSTEM_CONNECTION_STANDARD.md) · [052A Dynamic Section Assets](./052A_DYNAMIC_SECTION_ASSET_REGISTRY_STANDARD.md)  
**Runtime:** `lib/eventCreationWorkspace/` · Events: `lib/eventsIntelligence/` · Connections: `lib/creationEcosystem/`

## Mission

Complex work should not feel like a generic Project Home.

When a member creates an event (or later a book, course, or launch), they enter a **purpose-built Creation Workspace** designed for that kind of work.

Inside that workspace, Create, Projects, Chamber, Board, and Cartography are capabilities working from the **same shared record** — not separate destinations.

## Event Creation Workspace (V1)

After event type is identified:

1. Build a complete Event Workspace automatically
2. Pre-populate every major planning section for that event type
3. Show focus sections now; keep the full map available
4. Every section is editable, reorderable, and expandable
5. Every section can generate related Create assets (047)
6. Every asset stays linked to the same canonical Event Record
7. Conversation acknowledges what is already known before the next decision

## Forbidden (Events)

- Asking the member to invent arbitrary “pieces”
- “What pieces can you already see?”
- “What’s actually on your mind right now?” when context already exists
- Restarting conversation to involve Chamber expertise

## Architecture

| Layer | Role |
|-------|------|
| Creation Workspace | Purpose-built surface for this work type |
| Event Record | Canonical shared record |
| Create | Editable sections + asset generation |
| Projects | Execution home (optional carry-forward) |
| Chamber / Board | Expertise and advice without taking over |
| Cartography | Visual relationships (when surfaced) |

## Broader pattern

“Projects” remains valuable for execution. It must not be the default onboarding metaphor for complex creations. Creation Workspaces own shaping; Projects carry delivery forward.

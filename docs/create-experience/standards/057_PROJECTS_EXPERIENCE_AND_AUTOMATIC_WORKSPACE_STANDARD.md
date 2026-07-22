# 057 — Projects Experience and Automatic Workspace Standard

**Status:** Production Implementation Standard  
**Applies to:** The Projects experience and every Creation Workspace in Spark Estate  
**Extends:** [051](./051_UNIVERSAL_CREATION_ENGINE_STANDARD.md) · [055](./055_UNIVERSAL_CREATION_ENTRYPOINT_STANDARD.md) · [056 Create Redesign](./056_CREATE_EXPERIENCE_REDESIGN_STANDARD.md)  
**Runtime:** `lib/projects/activeWork/` · `components/companion/projectHomes/`  
**Note:** Document ID is **057** (Create Experience Redesign is **056**). Content matches the Projects Experience standard.

This standard replaces the old "Project Home" user experience.

Project Homes continue to exist internally, but they become infrastructure managed automatically by Spark Estate.

Users should work with their creations — not with Project Homes.

---

## Mission

Projects exists to help users continue meaningful work.

It is NOT a folder manager.  
It is NOT a document manager.  
It is NOT a place where users manually create Project Homes.

Spark Estate manages infrastructure automatically.  
Users manage their goals.

---

## Core Principle

Users create work.  
Spark Estate creates infrastructure.

Users should never have to understand:

- Project Homes
- Creation Records
- Relationship Registries
- Workspace IDs
- Asset Registries
- Cartography Maps
- Readiness Records

These are implementation details.

---

## Universal Rule

Every creation automatically receives the infrastructure it needs.

Whenever appropriate Spark Estate automatically creates:

- Creation Record
- Creation Workspace
- Project Home (internal)
- Relationship Registry
- Asset Connections
- Readiness Record
- Cartography Record
- Conversation Context

without asking the user.

---

## Project Philosophy

Projects is not where work begins.  
Projects is where work continues.

Every Project represents an active Creation Workspace.  
Users should feel like they are walking back into work already in progress.

---

## Rename the Mental Model

| Internally | Externally |
|------------|------------|
| Project Home | Active Work · Continue Working · Recent Work · Your Work |

Never expose "Project Home" unless in developer or advanced administrative tools.

---

## Landing Page

The Projects landing page must never show:

- Create Project Home
- No Projects
- You have no saved projects
- Project folders

Instead it should say:

**Continue Your Work**

If there is existing work: display cards.  
If there is no work: display encouragement.

Example empty state:

> You don't have any active work yet.  
> Whenever you start creating something, I'll organize everything automatically and you'll always be able to continue right where you left off.

Buttons:

1. Start Something New  
2. Browse Examples  
3. Recent Inspirations  

Nothing else.

---

## Automatic Project Creation

Users never manually create Project Homes.  
Project infrastructure is created automatically whenever a new Creation Workspace begins.

Spark Estate decides whether execution tracking is appropriate.

---

## Automatic Project Linking

Whenever assets are created they automatically connect to:

Creation Record → Workspace → Project → Relationship Registry → Cartography → Readiness → Conversation

No manual linking.

---

## Continue Working

Projects should primarily display **Continue Your Work**.

Cards contain: Name · Type · Current Phase · Current Focus · Progress · Last Worked On · Next Recommended Step · Important Waiting Items.

Primary action: **Continue**

---

## Views

Projects supports: Current Work · Recently Active · Completed · Archived · Templates · Favorites  

Nothing is displayed as folders.

---

## Search

Users search naturally. Spark Estate returns Workspace · Relevant Assets · Related Conversations · Tasks — everything connected.

---

## Entry Rule

Users may enter Projects from: Shari · Create · Chamber · Board · Cartography · Notifications · Dashboard · Search · Existing Conversation.

Every path opens the same Creation Workspace.  
Projects never creates a competing workspace.

---

## Automatic Resume

Selecting any Project always restores: Workspace · Current Phase · Current Section · Current Asset · Conversation Context · Known Facts · Relationships · Current Recommendation.

The user should feel like they never left.

---

## Project Responsibility

**Projects owns:** Tasks · Milestones · Schedules · Assignments · Dependencies · Execution · Deadlines · Completion

**Projects does NOT own:** Purpose · Knowledge · Assets · Blueprint · Workspace · Relationships  

Those belong to the Creation Workspace.

---

## Failure Conditions

This standard fails if the user is asked to:

- Create a Project Home
- Link assets manually
- Create a workspace manually
- Choose where work belongs
- Manage infrastructure
- Duplicate projects because they entered from another location

---

## Platform Principle

Users work on meaningful goals.  
Spark Estate quietly builds and maintains everything required behind the scenes.  
The user never manages the architecture. Spark Estate does.

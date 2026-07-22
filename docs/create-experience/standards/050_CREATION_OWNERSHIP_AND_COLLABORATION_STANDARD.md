# 050 — Creation Ownership and Collaboration Standard

**Status:** Production standard  
**Extends:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md)–[049](./049_CREATION_ECOSYSTEM_CONNECTION_STANDARD.md)  
**Consumed by:** [051 Universal Creation Engine](./051_UNIVERSAL_CREATION_ENGINE_STANDARD.md) · [052A](./052A_DYNAMIC_SECTION_ASSET_REGISTRY_STANDARD.md)  
**Runtime:** `lib/creationOwnership/`

## Mission

Every creation has one clear owner. Chamber and Board members may contribute expertise without competing versions or separate records.

## Core Principle

**One owner. Many contributors. One result.**

| Role | May | May not |
|------|-----|---------|
| **Primary Owner** | Guide process, validate output, resolve conflicts, keep connection | — |
| **Supporting Contributor** | Expertise, sections, review, risk, adaptation | Separate Creation Record, competing instance, restart discovery, re-ask known facts |
| **Board Advisor** | Options, consequences, risks, strategy | Own asset, create project, overwrite Chamber guidance |
| **Shari** | Orchestrate, route, resume, synthesize | Automatically become subject-matter owner of every creation |

## Ownership Registry

Canonical registry in `lib/creationOwnership/`. Every blueprint and asset type registers one primary owner, contributors, Board advisors, collaboration rules, completion authority, conflict policy, aliases, version, and status.

Sources (no identifier duplication):

- Create Blueprints (046) → blueprint ownership
- Event Asset Registry → asset-type ownership
- Explicit contributor tables in the Ownership Registry

## Contextual Leadership

Workspace owner and asset owner may differ. Events coordinates the Event Workspace; Content owns registration emails; Finance owns the budget. Everything stays on one Event Record.

## Collaboration Modes

Silent Contribution · Visible Contribution · Advisory Round · Board Consultation

Ordinary user experience: **one coherent response** synthesized by the Primary Owner in Shari’s voice.

## No-Duplicate Rule

Before creating, check for existing workspace, Creation Record, asset instance, alias, or draft. Resume or revise. Duplicate only with explicit intent. Board advice never creates a second workspace.

## Platform Principle

> One owner provides accountability. Many contributors provide depth. One connected result protects the user from complexity.

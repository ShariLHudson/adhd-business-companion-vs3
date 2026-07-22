# 046 — Create Blueprint Standard

**Status:** Binding  
**Parent:** [045 Platform Intent Routing and Creation Standard](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md)  
**Companion:** [047 Create Ecosystem & Asset Generation](./047_CREATE_ECOSYSTEM_AND_ASSET_GENERATION_STANDARD.md)  
**Runtime:** `lib/platformIntent/blueprintRegistry.ts` · ecosystems: `lib/createAssets/`

## Mission

Every Create option owns exactly one Blueprint. Blueprints are consistent, editable, and automatically integrate with Projects, Cartography, Chamber members, and the conversation engine.

## One Owner Rule

- Every Blueprint has exactly one owner (Chamber member or Create catalog owner).
- No duplicates.
- Aliases point to the owner.

## Required Blueprint Structure

Every Blueprint defines:

| Field | Purpose |
|-------|---------|
| `id` | Stable blueprint id |
| `label` | Member-facing name |
| `catalogType` | Create catalog / template type |
| `ownerChamberMemberId` | Intelligent doorway member (or null for Create-only) |
| `aliases` | Alternate phrases that resolve here |
| `purpose` | Why this creation exists |
| `expectedOutcome` | What “done” looks like |
| `sections` | Ordered section ids/titles |
| `foundationQuestions` | One-at-a-time conversation questions |
| `editableTemplate` | Template / preset id |
| `knowledgeContributors` | Chamber / library sources |
| `projectIntegration` | `none` · `simple` · `complex` · `long_term` |
| `visibleThinking` | `none` · `helpful` · `recommended` · `essential` |
| `completionCriteria` | When creation is complete enough |
| `assetsProduced` | Expected artifacts |
| `tasksProduced` | When tasks may be created (never dump full checklist) |
| `conversationFlow` | Discovery → shape → confirm → continue |

## Project Integration States

| State | When |
|-------|------|
| **No Project** | Single short artifact (social post, one email) |
| **Simple Project** | Short multi-step deliverable |
| **Complex Project** | Events, launches, courses, multi-workstream plans |
| **Long-term Project** | Memberships, ongoing programs |

Project creation is automatic when beneficial. Never ask the user to choose architecture.

## Visible Thinking Eligibility

| Level | Behavior |
|-------|----------|
| **None** | Do not offer Cartography |
| **Helpful** | May offer: “There are several connected ideas here. Would it help to see them visually?” |
| **Recommended** | Offer when complexity rises |
| **Essential** | Strongly offer before major structure decisions |

Never force Cartography. Always offer with permission.

## Registry Examples (non-exhaustive)

Marketing Plan · Business Plan · Course · Workshop · Retreat · Conference · Book · Proposal · Sales Funnel · Membership · Website · Brand Guide · Policy · Client Journey · Training Program · Podcast · Presentation · Product Launch · Research Report · Budget · Event Plan · Newsletter · SOP · …

## Canonical Creation Record

Shared by Create, Projects, Cartography, Chamber, Search, History, Conversations, Knowledge retrieval.

Runtime bridge: `lib/createProjects/canonicalWorkRecord.ts` and Events Intelligence `EventRecord` where applicable.

## Consistency Gate

A Blueprint is incomplete if it lacks: purpose, expected outcome, sections, at least one foundation question, project integration state, visible thinking eligibility, and a single owner.

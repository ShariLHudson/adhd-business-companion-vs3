# Create Platform Integration + Ecosystem Routing Certification (095 / 096)

**Branch:** `deploy/companion-app-v3`  
**Safety branch:** `backup/pre-ecosystem-routing-096` @ `234876e1`  
**Date:** 2026-07-20  
**Decision:** `ECOSYSTEM ROUTING ALIGNMENT PARTIALLY COMPLETE`

---

## Final destination ID map

| Capability | Destination ID | Opener | Mounted panel |
|------------|----------------|--------|----------------|
| Create | `create` | `openCreateEstateCore()` | `CreateEstateEntrancePanel` / `CreateEstateWorkingPanel` |
| Projects | `projects` | `openStandaloneFocusSectionCore("projects")` | `ProjectsPanel` |
| Talk It Out | `talk-it-out` | `openTalkItOutCore()` | `TalkItOutPanel` |
| Wander the Grounds | `wander-the-grounds` | `openExploreSparkVisualExplorer()` | Explore map |
| Spark Estate Guide | `spark-estate-guide` | `openSparkEstateGuideCore()` | Estate Guide flipbook |
| Journal | `journal` → section `growth-journal` | `openGrowthDestinationCore("growth-journal")` | `GrowthJournalRoomPanel` |
| Parking Lot | `parking-lot` | `openParkingLotCore()` | `ParkingLotRoomPanel` |
| Evidence Vault | `evidence-vault` → section `evidence-bank` | `enterEvidenceVaultRoomCore()` | `EvidenceVaultRoomPanel` |

## Legacy alias map

| Legacy | Authoritative | Notes |
|--------|---------------|-------|
| `content-generator` | `create` | CPC still redirects; Estate Brain toolIds now `create` |
| `estate-guidebook` | `spark-estate-guide` | Master registry Welcome dest updated |
| `explore-estate` | `wander-the-grounds` | Master registry Welcome dest updated |
| `goals-projects` | `projects` | Welcome dest; place ambience id may remain |
| `homestead` | `wander-the-grounds` | Explore/guidebook browse alias |
| `creative-studio` | *(not aliased)* | Chamber Creative Studio member — keep separate from Create |

Source: `lib/estate/destinationAliases.ts`

## Projects route correction

Welcome Home `onOpenProjects` → `openStandaloneFocusSectionCore("projects")`  
Universal capability `case "projects"` → same  
Project Homes remains via `openProjectHomesPrototypeCore()` / `onPreviewProjectHomes` only

## Create route correction

| Surface | Before | After |
|---------|--------|-------|
| `masterFeatureRegistry` Welcome | `creative-studio` | `create` |
| `environmentRegistry` create-studio / writing-room | `content-generator` | `create` |
| `capabilityRegistry` create.* toolIds | `content-generator` | `create` (mindmap stays `visual-focus`) |
| `estateCoachingRegistry` creative-create / growth-create | `content-generator` | `create` |
| `knowledgeRegistry` Create | `content-generator` | `create` |

## Event Begin binding

`bindEventRecord` in `CompanionPageClient.tsx` — synchronous `enterCreationFromCreate` + `applyEventWorkspaceToCreateWorkflow` inside `startFreshCreateFromEstate`. Never deferred.

## Opener verification

`EstateTopRightChrome` forwards Create, Projects, Talk It Out, Wander, Guide, Journal, Parking Lot, Evidence Vault.  
`EstateRoomExperienceMenu` maps each destination id. Silent hide gate remains `if (!action) return null` when prop missing.

## Capability matrix (code contracts)

| Capability | Registered | Mounted | Routed | Opener forwarded | Visible | Brain intent | Coaching | Knowledge | Works E2E |
|------------|:----------:|:-------:|:------:|:----------------:|:-------:|:------------:|:--------:|:---------:|:---------:|
| Create | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ Preview |
| Projects | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ Preview |
| Talk It Out | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ⬜ Preview |
| Wander | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ⬜ Preview |
| Spark Estate Guide | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | ✅ alias | ⬜ Preview |
| Journal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ Preview |
| Parking Lot | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ⬜ Preview |
| Evidence Vault | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ⬜ Preview |

## Automated tests

See commit notes. Preview smoke: **not run** (browser MCP unavailable).

## Remaining gaps

- Authenticated Preview smoke checklist (096 §9)
- `productionReadiness` still `not_started` in master registry (governance, not a UI hide)
- Some place graph edges still use `goals-projects` / `creative-studio` as ambience/related ids (intentional)

## Final Decision

**`ECOSYSTEM ROUTING ALIGNMENT PARTIALLY COMPLETE`**

Not CERTIFIED until Preview smoke passes for Create Estate shell, Projects panel (not Project Homes), Event Begin bind, and menu destinations.

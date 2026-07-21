# 301 — Universal Intelligence Object Model

## Purpose

Define the canonical objects and relationships used by Spark Estate Intelligence Architecture v2.

## Canonical objects

### IntelligenceMember

Required fields:

- `id`
- `name`
- `version`
- `status`
- `mission`
- `domainBoundaries`
- `publishedCapabilityIds`
- `ownedCollectionIds`
- `contributedCollectionIds`
- `knowledgeSources`
- `routingContract`
- `conversationContract`
- `implementationContract`
- `testingContract`
- `certificationStatus`
- `maintenanceOwner`

### CapabilityDefinition

Required fields:

- `id`
- `name`
- `ownerMemberId`
- `version`
- `purpose`
- `inputs`
- `outputs`
- `preconditions`
- `rules`
- `evidenceStandards`
- `adaptationRules`
- `allowedConsumers`
- `dependencies`
- `conflicts`
- `provenanceRequirements`
- `testingRequirements`
- `certificationStatus`
- `deprecationStatus`

### CollectionDefinition

Required fields:

- `id`
- `name`
- `collectionType`
- `ownerMemberId`
- `contributorMemberIds`
- `capabilityRequirements`
- `businessIdentityMatches`
- `industryMatches`
- `stageMatches`
- `assetIds`
- `entryPoints`
- `outputs`
- `dependencies`
- `routingSignals`
- `certificationStatus`
- `version`

Collection types may include:

- intelligence
- business-model
- industry
- lifecycle
- work-type
- audience
- growth-stage
- cross-functional

### CollectionAsset

Asset types:

- Blueprint
- Framework
- Playbook
- Guide
- Template
- Checklist
- Calculator
- Report
- Assessment
- Decision Tool
- Guided Experience
- Conversation Pattern
- Operating System
- Certification

Required fields:

- `id`
- `assetType`
- `collectionId`
- `ownerMemberId`
- `contributorMemberIds`
- `requiredCapabilityIds`
- `compatibleWorkTypes`
- `businessIdentityMatches`
- `depthModes`
- `outputs`
- `version`
- `certificationStatus`

### BusinessIdentityDefinition

Required fields:

- `id`
- `name`
- `aliases`
- `description`
- `typicalRevenueModels`
- `typicalOffers`
- `typicalAudiences`
- `commonWorkflows`
- `commonMetrics`
- `recommendedCollectionIds`
- `commonCapabilityNeeds`
- `antiAssumptions`
- `version`

Examples:

- speaker
- coach
- consultant
- author
- artist
- crafter
- service provider
- designer
- marketer
- LinkedIn creator
- solopreneur
- agency owner
- nonprofit leader
- course creator
- podcaster

### UserBusinessProfile

Required fields:

- `userId`
- `activeBusinessIds`
- `businessIdentities`
- `industries`
- `revenueModels`
- `offers`
- `audiences`
- `businessStage`
- `tools`
- `constraints`
- `goals`
- `preferences`
- `confirmedFacts`
- `inferredFacts`
- `lastReviewedAt`

A user may have multiple businesses and multiple identities per business.

### UserCapabilityState

Required fields:

- `userId`
- `businessId`
- `capabilityId`
- `knowledgeLevel`
- `experienceLevel`
- `confidenceLevel`
- `supportPreference`
- `evidence`
- `lastObservedAt`
- `userConfirmed`

Levels must not be collapsed into one score.

### AdaptiveContextState

Required fields:

- `userId`
- `businessId`
- `capturedAt`
- `energy`
- `focus`
- `motivation`
- `stress`
- `availableTime`
- `urgency`
- `decisionLoad`
- `currentCommitments`
- `interruptions`
- `healthOrAccessibilityNeeds`
- `quietHours`
- `source`
- `confidence`

### CapabilityRequest

Required fields:

- `requestId`
- `workId`
- `origin`
- `intent`
- `requiredCapabilityIds`
- `optionalCapabilityIds`
- `context`
- `requestedOutputs`
- `approvalMode`
- `status`

### IntelligenceContribution

Required fields:

- `contributionId`
- `requestId`
- `workId`
- `capabilityId`
- `ownerMemberId`
- `contributorMemberId`
- `contentOrChange`
- `evidence`
- `assumptions`
- `confidence`
- `approvalStatus`
- `appliedVersion`
- `createdAt`

## Canonical relationships

Allowed relationships include:

- MEMBER_PUBLISHES_CAPABILITY
- MEMBER_OWNS_COLLECTION
- MEMBER_CONTRIBUTES_TO_COLLECTION
- COLLECTION_REQUIRES_CAPABILITY
- COLLECTION_CONTAINS_ASSET
- ASSET_REQUIRES_CAPABILITY
- BUSINESS_IDENTITY_RECOMMENDS_COLLECTION
- USER_HAS_BUSINESS_IDENTITY
- USER_HAS_CAPABILITY_STATE
- WORK_USES_COLLECTION
- WORK_USES_BLUEPRINT
- WORK_REQUESTS_CAPABILITY
- CONTRIBUTION_APPLIES_TO_WORK
- WORK_RELATES_TO_WORK
- COLLECTION_DEPENDS_ON_COLLECTION
- CAPABILITY_DEPENDS_ON_CAPABILITY
- PROJECT_EXECUTES_WORK
- CARTOGRAPHY_MAPS_RELATIONSHIP

## Ownership rules

- Every Capability has exactly one owning Member.
- Every Collection has exactly one accountable owner.
- Collections may have many contributors.
- Every asset has one accountable owner.
- A contributor may not redefine the owner's capability.
- The Universal Work Engine owns Work identity and persistence.
- Projects own execution data, not source content.
- Cartography owns relationship visualization, not source content.
- Shari owns orchestration behavior, not domain knowledge.

## Versioning

Every registry object must support:

- semantic version
- certification status
- active/deprecated state
- replacement reference
- migration guidance
- change history
- compatibility checks

## Validation

Reject objects when:

- owner is missing
- capability owner does not exist
- collection contributor does not exist
- capability dependency forms an unresolved cycle
- asset references an uncertified required capability in production
- Work Type compatibility is invalid
- duplicate IDs exist
- a Collection attempts to create a private persistence path

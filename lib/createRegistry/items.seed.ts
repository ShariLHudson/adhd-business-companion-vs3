/**
 * Seed registry entries — four guided Universal Work Engine creation types only.
 *
 * Runtime IDs match workTypeSchema / UWE packages:
 * event_plan · marketing_plan · business_plan · facebook_community
 *
 * Lifecycle: testing (jsdom integration pack exists; authenticated browser NOT_RUN).
 * All verification flags remain false → computeIsUserVisible === false (intentional).
 * See certification/guidedCreateCertification.ts + guided-create-certification-report.md.
 */

import type { CreationRegistryItem } from "./types";

/** Stable seed ids — same as UWE work type ids. */
export const GUIDED_CREATION_REGISTRY_IDS = [
  "event_plan",
  "marketing_plan",
  "business_plan",
  "facebook_community",
] as const;

export type GuidedCreationRegistryId =
  (typeof GUIDED_CREATION_REGISTRY_IDS)[number];

/**
 * Honest verification baseline:
 * jsdom/integration coverage is not founder/authenticated browser proof.
 * Do not set these true until Ready requirements are genuinely met.
 */
const UNVERIFIED = {
  routeVerified: false,
  saveVerified: false,
  reopenVerified: false,
  printVerified: false,
  exportVerified: false,
  projectHandoffVerified: false,
  requiredActionsVerified: false,
} as const;

export const CREATION_REGISTRY_SEED_ITEMS: readonly CreationRegistryItem[] = [
  {
    id: "event_plan",
    name: "Event Plan",
    singularLabel: "Event Plan",
    pluralLabel: "Event Plans",
    categoryId: "plan_an_experience",
    subcategoryId: "events",
    shortDescription: "Plan an event from purpose through follow-up.",
    userOutcome:
      "A clear event plan that covers purpose, audience, logistics, and next steps.",
    searchTerms: [
      "event",
      "event plan",
      "workshop",
      "webinar",
      "gathering",
      "retreat",
      "summit",
      "conference",
    ],
    relevantBusinessTypes: ["service", "education", "community", "creator"],
    relevantBusinessStages: ["launching", "growing", "established"],
    relevantGoals: ["host_event", "teach", "launch", "community"],
    audienceSensitivity: "required",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: [
      "peopleServed",
      "offersAndServices",
      "preferredChannels",
    ],
    minimumContextQuestions: [
      "Who is this event for?",
      "What kind of event are you planning?",
    ],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior:
      "Create remains source of truth; Project manages execution timeline and tasks.",
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "multi-asset-workspace",
    route: "create/uwe/event_plan",
    lifecycleStatus: "testing",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "universal-work-engine",
    dependencies: [
      "lib/universalWorkEngine/packages/eventPlan",
      "lib/workTypeSchema/schemas/eventPlanMap",
    ],
    implementationNotes: [
      "Legacy Browse parent id: event (label Event).",
      "Workshop resolves through event subtypes — not a separate registry seed yet.",
    ],
    auditNotes: [
      "2026-07-23 guided cert: jsdom integration pack pass; founder/browser NOT_RUN.",
      "Workshop → event_plan (subtype), not a separate registry id.",
    ],
    legacyParentTypeId: "event",
    legacyCatalogLabels: ["Event Plan", "Workshop"],
  },
  {
    id: "marketing_plan",
    name: "Marketing Plan",
    singularLabel: "Marketing Plan",
    pluralLabel: "Marketing Plans",
    categoryId: "market_grow",
    subcategoryId: "marketing_planning",
    shortDescription:
      "Build a practical marketing plan aligned with business goals.",
    userOutcome:
      "A marketing plan with priorities, channels, and next actions you can execute.",
    searchTerms: ["marketing plan", "content plan", "marketing"],
    relevantBusinessTypes: ["service", "product", "creator", "local"],
    relevantBusinessStages: ["starting", "launching", "growing"],
    relevantGoals: ["grow_audience", "get_clients", "launch"],
    audienceSensitivity: "required",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: [
      "peopleServed",
      "businessGoals",
      "preferredChannels",
      "offersAndServices",
    ],
    minimumContextQuestions: [
      "Who are you trying to reach?",
      "What is this marketing plan for?",
    ],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior:
      "Create remains source of truth; Project manages execution timeline and tasks.",
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "multi-asset-workspace",
    route: "create/uwe/marketing_plan",
    lifecycleStatus: "testing",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "universal-work-engine",
    dependencies: [
      "lib/universalWorkEngine/packages/marketingPlan",
      "lib/workTypeSchema/schemas/marketingPlanMap",
    ],
    implementationNotes: ["Legacy Browse parent id: marketing-plan."],
    auditNotes: [
      "2026-07-23 guided cert: jsdom integration pack pass; founder/browser NOT_RUN.",
      "Verification flags remain false until authenticated Estate journey passes.",
    ],
    legacyParentTypeId: "marketing-plan",
    legacyCatalogLabels: ["Marketing Plan"],
  },
  {
    id: "business_plan",
    name: "Business Plan",
    singularLabel: "Business Plan",
    pluralLabel: "Business Plans",
    categoryId: "build_run_the_business",
    subcategoryId: "strategy_and_direction",
    shortDescription:
      "Clarify the business model, direction, market, and execution.",
    userOutcome:
      "A business plan that clarifies model, market, direction, and near-term execution.",
    searchTerms: ["business plan", "business model"],
    relevantBusinessTypes: ["service", "product", "creator", "local"],
    relevantBusinessStages: ["starting", "pivoting", "growing"],
    relevantGoals: ["clarity", "funding", "direction"],
    audienceSensitivity: "helpful",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: [
      "businessType",
      "offersAndServices",
      "peopleServed",
      "businessGoals",
    ],
    minimumContextQuestions: [
      "What kind of business is this plan for?",
      "What decision should this plan help you make?",
    ],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior:
      "Create remains source of truth; Project manages execution timeline and tasks.",
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "multi-asset-workspace",
    route: "create/uwe/business_plan",
    lifecycleStatus: "testing",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "universal-work-engine",
    dependencies: [
      "lib/universalWorkEngine/packages/businessPlan",
      "lib/workTypeSchema/schemas/businessPlanMap",
    ],
    implementationNotes: [
      "Legacy Browse parent id: business-plan.",
      "Deliverable manifests still a known gap per audit.",
    ],
    auditNotes: [
      "2026-07-23 guided cert: Begin now sets isBusinessPlanDomain + Anywhere-Origin.",
      "jsdom integration pack pass; founder/browser NOT_RUN.",
    ],
    legacyParentTypeId: "business-plan",
    legacyCatalogLabels: ["Business Plan"],
  },
  {
    id: "facebook_community",
    name: "Facebook Community",
    singularLabel: "Facebook Community",
    pluralLabel: "Facebook Communities",
    categoryId: "market_grow",
    subcategoryId: "audience_community_building",
    shortDescription: "Plan and structure a Facebook group or community.",
    userOutcome:
      "A Facebook community plan covering positioning, setup, welcome, and growth.",
    searchTerms: [
      "facebook community",
      "facebook group",
      "fb group",
      "facebook groups",
    ],
    relevantBusinessTypes: ["service", "creator", "education", "community"],
    relevantBusinessStages: ["launching", "growing"],
    relevantGoals: ["community", "audience", "engagement"],
    audienceSensitivity: "required",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: [
      "peopleServed",
      "offersAndServices",
      "preferredChannels",
    ],
    minimumContextQuestions: [
      "Who is this Facebook community for?",
      "What is the purpose of the group?",
    ],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior:
      "Create remains source of truth; Project manages execution timeline and tasks.",
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "multi-asset-workspace",
    route: "create/uwe/facebook_community",
    lifecycleStatus: "testing",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "universal-work-engine",
    dependencies: [
      "lib/universalWorkEngine/packages/facebookCommunity",
      "lib/workTypeSchema/schemas/facebookCommunityMap",
    ],
    implementationNotes: ["Legacy Browse parent id: facebook-community."],
    auditNotes: [
      "2026-07-23 guided cert: jsdom integration pack pass; founder/browser NOT_RUN.",
      "Project bridge is explicit (never auto-convert).",
    ],
    legacyParentTypeId: "facebook-community",
    legacyCatalogLabels: ["Facebook Community"],
  },
] as const;

const BY_ID = new Map(
  CREATION_REGISTRY_SEED_ITEMS.map((item) => [item.id, item] as const),
);

export function getCreationRegistrySeedItem(
  id: string,
): CreationRegistryItem | undefined {
  return BY_ID.get(id);
}

export function listCreationRegistrySeedItems(): readonly CreationRegistryItem[] {
  return CREATION_REGISTRY_SEED_ITEMS;
}

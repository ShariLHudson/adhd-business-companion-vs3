/**
 * Seed registry entries — the 8 Version 1 priority Guided Builds, minus
 * Marketing Plan (already seeded in items.seed.ts as a guided UWE type).
 *
 * These 7 run through the generic Create Estate / Current Focus flow with a
 * lib/createTemplates.ts preset (builderType "structured-form"), not a full
 * Universal Work Engine package — Workshop is the one exception, since it
 * genuinely executes through event_plan's existing UWE package (see its
 * parentCreationId and implementationNotes below).
 *
 * Kept in a separate file/array from items.seed.ts deliberately:
 * items.seed.ts's own tests assert it holds exactly the 4 guided UWE types
 * (seedIntegrity.test.ts: "seed IDs are unique and match guided runtime ids",
 * "four seeds remain hidden") — adding to that array would break those
 * assertions. index.ts merges both arrays for any full-registry read.
 *
 * Lifecycle: needs-audit. None of these have been founder/browser certified
 * against this registry's readiness gate — all verification flags remain
 * false, so computeIsUserVisible === false for all of them (intentional;
 * they are already live in the OLD createParentTypes/createCatalogData
 * system, just not yet verified against the NEW registry's stricter gate).
 */

import type { CreationRegistryItem } from "./types";

/** Stable ids for the 7 items seeded here (Marketing Plan lives in items.seed.ts). */
export const V1_PRIORITY_REGISTRY_IDS = [
  "sop",
  "checklist",
  "email",
  "proposal",
  "offer",
  "client_onboarding",
  "workshop",
] as const;

export type V1PriorityRegistryId = (typeof V1_PRIORITY_REGISTRY_IDS)[number];

/**
 * Honest verification baseline — same convention as items.seed.ts.
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

const CREATE_TO_PROJECT_BEHAVIOR =
  "Create remains source of truth; Project manages execution timeline and tasks.";

export const V1_PRIORITY_REGISTRY_ITEMS: readonly CreationRegistryItem[] = [
  {
    id: "sop",
    name: "Standard Operating Procedure",
    singularLabel: "SOP",
    pluralLabel: "SOPs",
    emoji: "📋",
    categoryId: "build_run_the_business",
    subcategoryId: "operations_and_systems",
    shortDescription:
      "Document a repeatable process so anyone on the team can follow it.",
    userOutcome:
      "A clear, step-by-step procedure your team can follow consistently.",
    searchTerms: ["sop", "standard operating procedure", "procedure", "workflow doc"],
    relevantBusinessTypes: ["service", "product", "local"],
    relevantBusinessStages: ["growing", "established"],
    relevantGoals: ["consistency", "delegation", "training"],
    audienceSensitivity: "helpful",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: ["businessType", "offersAndServices"],
    minimumContextQuestions: [
      "What process are you documenting?",
      "Who will follow this procedure?",
    ],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior: CREATE_TO_PROJECT_BEHAVIOR,
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "structured-form",
    route: "create/estate/sop",
    lifecycleStatus: "needs-audit",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "create-estate",
    dependencies: ["lib/createTemplates.ts#SOP_SECTIONS"],
    implementationNotes: [
      "Legacy Browse parent id: standard-operating-procedure.",
      "Phantom UWE work-type id 'sop' resolves via resolveWorkTypeIdFromMemberLabel " +
        "but is never registered — this build runs through the generic Create Estate " +
        "/ Current Focus flow with the SOP_SECTIONS template, not a UWE package.",
    ],
    auditNotes: [
      "2026-08-05 Phase 1: added as a Version 1 priority build; not yet " +
        "founder/browser certified against this registry's readiness gate.",
    ],
    legacyParentTypeId: "standard-operating-procedure",
    legacyCatalogLabels: ["SOP"],
  },
  {
    id: "checklist",
    name: "Checklist",
    singularLabel: "Checklist",
    pluralLabel: "Checklists",
    emoji: "✅",
    categoryId: "build_run_the_business",
    subcategoryId: "operations_and_systems",
    shortDescription: "Turn a process into a simple list your team can check off.",
    userOutcome:
      "A practical checklist that makes a process easy to follow and hard to miss a step on.",
    searchTerms: ["checklist", "task list"],
    relevantBusinessTypes: ["service", "product", "local", "creator"],
    relevantBusinessStages: ["starting", "growing", "established"],
    relevantGoals: ["consistency", "delegation"],
    audienceSensitivity: "helpful",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: ["businessType"],
    minimumContextQuestions: ["What are you making a checklist for?"],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior: CREATE_TO_PROJECT_BEHAVIOR,
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "structured-form",
    route: "create/estate/checklist",
    lifecycleStatus: "needs-audit",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "create-estate",
    dependencies: ["lib/createTemplates.ts#CHECKLIST_SECTIONS"],
    implementationNotes: [
      "Legacy Browse parent id: checklist.",
      "Phantom UWE work-type id 'checklist' resolves via resolveWorkTypeIdFromMemberLabel " +
        "but is never registered — runs through the generic Create Estate / Current Focus " +
        "flow with the CHECKLIST_SECTIONS template (added 2026-08-05, ADR-013 follow-on).",
    ],
    auditNotes: ["2026-08-05 Phase 1: added as a Version 1 priority build."],
    legacyParentTypeId: "checklist",
    legacyCatalogLabels: ["Checklist"],
  },
  {
    id: "email",
    name: "Email",
    singularLabel: "Email",
    pluralLabel: "Emails",
    emoji: "✉️",
    categoryId: "write_communicate",
    subcategoryId: "everyday_business_communication",
    shortDescription: "Write one email, shaped for the moment it needs to land in.",
    userOutcome: "An email ready to send, in the right tone for who it's going to.",
    searchTerms: ["email", "e-mail", "cold email", "follow-up email"],
    relevantBusinessTypes: ["service", "product", "creator", "local"],
    relevantBusinessStages: ["starting", "launching", "growing", "established"],
    relevantGoals: ["communicate", "follow_up", "get_clients"],
    audienceSensitivity: "recommended",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: ["peopleServed", "preferredChannels"],
    minimumContextQuestions: [
      "Who is this email going to?",
      "What do you want them to do after reading it?",
    ],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: false,
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "structured-form",
    route: "create/estate/email",
    lifecycleStatus: "needs-audit",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "create-estate",
    dependencies: ["lib/createTemplates.ts#EMAIL_SECTIONS"],
    implementationNotes: [
      "Legacy Browse parent id: email — 7 of its 8 legacy subtypes collapse to the " +
        "same catalog label before generation (2026-08-05 audit finding); this " +
        "registry item does not fix that, it only gives Email its own canonical " +
        "identity for the future registry-driven Browse UI.",
    ],
    auditNotes: ["2026-08-05 Phase 1: added as a Version 1 priority build."],
    legacyParentTypeId: "email",
    legacyCatalogLabels: ["Email"],
  },
  {
    id: "proposal",
    name: "Proposal",
    singularLabel: "Proposal",
    pluralLabel: "Proposals",
    emoji: "📄",
    categoryId: "sell_convert",
    subcategoryId: "sales_materials",
    shortDescription: "Put together a proposal that shows a prospect exactly what you'll do.",
    userOutcome:
      "A proposal that clearly lays out scope, approach, timeline, and investment.",
    searchTerms: ["proposal", "scope of work", "sow", "statement of work"],
    relevantBusinessTypes: ["service"],
    relevantBusinessStages: ["launching", "growing", "established"],
    relevantGoals: ["get_clients", "close_sale"],
    audienceSensitivity: "required",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: ["offersAndServices", "peopleServed"],
    minimumContextQuestions: [
      "Who is this proposal for?",
      "What are you proposing to do for them?",
    ],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior: CREATE_TO_PROJECT_BEHAVIOR,
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "structured-form",
    route: "create/estate/proposal",
    lifecycleStatus: "needs-audit",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "create-estate",
    dependencies: ["lib/createTemplates.ts#PROPOSAL_SECTIONS"],
    implementationNotes: ["Legacy Browse parent id: proposal."],
    auditNotes: ["2026-08-05 Phase 1: added as a Version 1 priority build."],
    legacyParentTypeId: "proposal",
    legacyCatalogLabels: ["Proposal"],
  },
  {
    id: "offer",
    name: "Offer",
    singularLabel: "Offer",
    pluralLabel: "Offers",
    emoji: "🎁",
    categoryId: "sell_convert",
    subcategoryId: "offers_and_packaging",
    shortDescription: "Shape what you sell into a clear, sellable offer.",
    userOutcome: "An offer with a clear promise, price, and what's included.",
    searchTerms: ["offer", "offer stack", "pricing offer"],
    relevantBusinessTypes: ["service", "product", "creator"],
    relevantBusinessStages: ["starting", "launching", "growing"],
    relevantGoals: ["get_clients", "launch", "clarity"],
    audienceSensitivity: "required",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: ["offersAndServices", "peopleServed", "businessGoals"],
    minimumContextQuestions: [
      "Who is this offer for?",
      "What problem does it solve for them?",
    ],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior: CREATE_TO_PROJECT_BEHAVIOR,
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "structured-form",
    route: "create/estate/offer",
    lifecycleStatus: "needs-audit",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "create-estate",
    dependencies: ["lib/createTemplates.ts#OFFER_SECTIONS"],
    implementationNotes: ["Legacy Browse parent id: offer."],
    auditNotes: ["2026-08-05 Phase 1: added as a Version 1 priority build."],
    legacyParentTypeId: "offer",
    legacyCatalogLabels: ["Offer"],
  },
  {
    id: "client_onboarding",
    name: "Client Onboarding",
    singularLabel: "Client Onboarding",
    pluralLabel: "Client Onboarding Plans",
    emoji: "🤝",
    categoryId: "work_with_clients",
    subcategoryId: "beginning_the_relationship",
    shortDescription: "Plan how a new client's first experience with you goes.",
    userOutcome: "An onboarding plan that gives a new client a clear, welcoming start.",
    searchTerms: [
      "client onboarding",
      "onboarding process",
      "onboarding plan",
      "new client onboarding",
    ],
    relevantBusinessTypes: ["service"],
    relevantBusinessStages: ["launching", "growing", "established"],
    relevantGoals: ["client_experience", "consistency"],
    audienceSensitivity: "required",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: ["offersAndServices", "peopleServed"],
    minimumContextQuestions: [
      "Who is this onboarding plan for?",
      "What happens in the first week of working together?",
    ],
    relatedCreationIds: [],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior: CREATE_TO_PROJECT_BEHAVIOR,
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "structured-form",
    route: "create/estate/client-onboarding",
    lifecycleStatus: "needs-audit",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "create-estate",
    dependencies: ["lib/createTemplates.ts#CLIENT_ONBOARDING_SECTIONS"],
    implementationNotes: [
      "Legacy Browse parent id: client-onboarding.",
      "Master inventory doc names this as a V1 priority build specifically because " +
        "it can produce several connected outputs (welcome email, intake form, " +
        "checklist, timeline, FAQ, internal instructions) — today it runs through " +
        "the same single-template Current Focus flow as the others; builderType " +
        "stays 'structured-form' until that connected-outputs behavior is actually " +
        "built, not claimed early.",
    ],
    auditNotes: ["2026-08-05 Phase 1: added as a Version 1 priority build."],
    legacyParentTypeId: "client-onboarding",
    legacyCatalogLabels: ["Client Onboarding"],
  },
  {
    id: "workshop",
    name: "Workshop",
    singularLabel: "Workshop",
    pluralLabel: "Workshops",
    emoji: "🎓",
    categoryId: "plan_an_experience",
    subcategoryId: "workshops_learning",
    parentCreationId: "event_plan",
    shortDescription: "Plan a workshop from purpose through follow-up.",
    userOutcome: "A workshop plan that covers purpose, audience, agenda, and follow-up.",
    searchTerms: ["workshop", "workshop plan", "workshop outline", "webinar plan", "webinar"],
    relevantBusinessTypes: ["service", "education", "community", "creator"],
    relevantBusinessStages: ["launching", "growing", "established"],
    relevantGoals: ["teach", "host_event", "community"],
    audienceSensitivity: "required",
    supportsMultipleAvatars: false,
    helpfulBusinessProfileFields: ["peopleServed", "offersAndServices", "preferredChannels"],
    minimumContextQuestions: [
      "Who is this workshop for?",
      "What will they be able to do after it?",
    ],
    relatedCreationIds: ["event_plan"],
    usuallyCreatedTogetherIds: [],
    canBecomeProject: true,
    createToProjectBehavior: CREATE_TO_PROJECT_BEHAVIOR,
    recommendedChamberMemberIds: [],
    recommendedMapTypes: [],
    recommendedBoardRoles: [],
    builderType: "multi-asset-workspace",
    route: "create/uwe/event_plan",
    lifecycleStatus: "needs-audit",
    priority: "release-essential",
    ...UNVERIFIED,
    owner: "universal-work-engine",
    dependencies: [
      "lib/universalWorkEngine/packages/eventPlan",
      "lib/workTypeSchema/schemas/eventPlanMap",
    ],
    implementationNotes: [
      "Modeled as a distinct registry build (Plan an Experience → Workshops and " +
        "Learning) per the approved master structure, while executing through " +
        "event_plan's existing Universal Work Engine package via parentCreationId " +
        "— not a separate work type, not a separate routing decision, not a new " +
        "artifact type.",
      "event_plan's own seed item already carries the legacy dual-read claim on " +
        "the 'Workshop' catalog label (legacyCatalogLabels) — this item " +
        "intentionally does NOT duplicate that claim. See auditNotes.",
    ],
    auditNotes: [
      "2026-08-05 Phase 1: added as a Version 1 priority build. Does not set " +
        "legacyCatalogLabels or legacyParentTypeId — event_plan already owns the " +
        "'Workshop' legacy catalog label and LEGACY_PARENT_TO_REGISTRY['event'] " +
        "already maps to event_plan; adding a second claim here would create an " +
        "ambiguous dual-read mapping in findRegistryItemByLegacyLabel. This item " +
        "exists so a future registry-driven Browse UI can surface Workshop as its " +
        "own Build under the approved taxonomy without touching UWE work-type " +
        "identity, routing, or the existing event_plan legacy mapping.",
    ],
  },
] as const;

const BY_ID = new Map(
  V1_PRIORITY_REGISTRY_ITEMS.map((item) => [item.id, item] as const),
);

export function getV1PriorityRegistryItem(
  id: string,
): CreationRegistryItem | undefined {
  return BY_ID.get(id);
}

export function listV1PriorityRegistryItems(): readonly CreationRegistryItem[] {
  return V1_PRIORITY_REGISTRY_ITEMS;
}

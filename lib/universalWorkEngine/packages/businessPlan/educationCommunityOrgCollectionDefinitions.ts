/**
 * 249–252 — Education, Nonprofit, Public & Faith/Membership Org Collection (definition data only).
 * Collection: collection.education_community_org
 * Distinct from business.course_creator, business.coaching, business.membership,
 * business.service, business.consulting, and wellness practice.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const EDUCATION_COMMUNITY_ORG_COLLECTION_ID =
  "collection.education_community_org" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const EDUCATION_TRAINING_BUSINESS_BLUEPRINT_ID =
  "business.education_training" as const;
export const NONPROFIT_FOUNDATION_BUSINESS_BLUEPRINT_ID =
  "business.nonprofit_foundation" as const;
export const PUBLIC_SECTOR_COMMUNITY_BUSINESS_BLUEPRINT_ID =
  "business.public_sector_community" as const;
export const FAITH_MEMBERSHIP_ORG_BUSINESS_BLUEPRINT_ID =
  "business.faith_membership_org" as const;

type BusinessBlueprintSeed = Omit<
  BlueprintDefinition,
  "compatibleWorkTypeIds" | "supportedDepthModes" | "category"
> & {
  category?: BlueprintDefinition["category"];
};

function groupsForSections(sectionIds: readonly string[]): BlueprintGroup[] {
  const set = new Set(sectionIds);
  return BUSINESS_PLAN_MAP_GROUPS.map((g) => ({
    ...g,
    sectionIds: g.sectionIds.filter((id) => set.has(id)),
  })).filter((g) => g.sectionIds.length > 0);
}

function businessBlueprint(seed: BusinessBlueprintSeed): BlueprintDefinition {
  const sectionIds = seed.sections.map((s) => s.id);
  return {
    ...seed,
    category: seed.category ?? "spark",
    compatibleWorkTypeIds: BUSINESS_WORK,
    supportedDepthModes: ALL_BLUEPRINT_DEPTH_MODES,
    groups: seed.groups ?? groupsForSections(sectionIds),
  };
}

const SHARED_HIDDEN = {
  id: "system_work_meta",
  title: "System",
  role: "hidden_system" as const,
};

const CERT_RULES = [
  "business_plan.foundation",
  "business_plan.map",
  "business_plan.depth",
] as const;

const depthGuided = {
  role: "optional" as const,
  condition: { kind: "depth_at_least" as const, mode: "guided_build" as const },
};

const depthComplete = {
  role: "optional" as const,
  condition: {
    kind: "depth_at_least" as const,
    mode: "complete_planning" as const,
  },
};

const COLLECTION_META = {
  collectionId: EDUCATION_COMMUNITY_ORG_COLLECTION_ID,
  collectionOwner:
    "Business Intelligence / Education Community Org Collection",
  notCourseCreatorOnly: true,
  notBusinessMembershipOnly: true,
  notGenericServiceOnly: true,
  notCoachingOnly: true,
  notConsultingOnly: true,
  notWellnessPracticeOnly: true,
} as const;

/** 249 — Education & Training Business Blueprint */
export const BUSINESS_BLUEPRINT_EDUCATION_TRAINING = businessBlueprint({
  blueprintId: EDUCATION_TRAINING_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Education & Training Business",
  description:
    "Create and operate education, training, tutoring, corporate learning, and instructional businesses — programs, curriculum, instructors, schedules, and certification together.",
  intendedUse:
    "Schools of practice, tutoring firms, corporate L&D, training studios, and instructional businesses — not digital course-product OS alone, not 1:1 coaching OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Education Business Positioning", role: "required" },
    { id: "et_program_architecture", title: "Program Architecture", role: "required" },
    { id: "et_curriculum", title: "Curriculum Map", role: "required" },
    { id: "et_learning_paths", title: "Learning Paths", ...depthGuided },
    { id: "et_lessons_assessments", title: "Lesson Plans and Assessments", ...depthGuided },
    { id: "et_instructor_ops", title: "Instructor Guides and Ops", ...depthGuided },
    { id: "et_student_onboarding", title: "Student Onboarding", ...depthGuided },
    { id: "et_schedules", title: "Training Schedules", role: "required" },
    { id: "et_certification", title: "Certification Workflows", ...depthGuided },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "et_performance", title: "Education Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_position",
      prompt:
        "What education or training do you deliver — tutoring, corporate learning, studio instruction, or something else?",
      lowerFrictionPrompt: "What kind of education business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_programs",
      prompt: "What programs or learning paths should students move through?",
      lowerFrictionPrompt: "What programs do you offer?",
      sectionId: "et_program_architecture",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next education-business move?",
      lowerFrictionPrompt: "What's the next small training step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    {
      id: "t_architecture",
      title: "Sketch program architecture",
      sectionId: "et_program_architecture",
    },
    { id: "t_curriculum", title: "Draft curriculum map", sectionId: "et_curriculum" },
    {
      id: "t_schedule",
      title: "Build training schedule skeleton",
      sectionId: "et_schedules",
    },
  ],
  suggestedMilestones: [
    { id: "m_programs", title: "Programs framed" },
    { id: "m_curriculum", title: "Curriculum map usable" },
    {
      id: "m_ops",
      title: "Schedules and onboarding considered",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not the digital course-creator product OS — this owns live/instructional delivery",
    "Assessments need a clear owner",
    "Instructor capacity before enrollment volume",
    "Certification workflows are drafts until reviewed",
  ],
  riskPrompts: [
    "What if enrollment fills before instructors and rooms are ready?",
    "What if assessment or certification has no calm owner?",
  ],
  researchPrompts: [
    "Compare simple curriculum map patterns for small training businesses",
    "Find student onboarding sequences that stay low-friction",
  ],
  deliverables: [
    "Program Architecture",
    "Curriculum Map",
    "Learning Paths",
    "Lesson Plans",
    "Assessments",
    "Instructor Guides",
    "Student Onboarding",
    "Training Schedules",
    "Certification Workflows",
    "KPI Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "systems",
    "finance",
  ],
  boardReviewRecommendations: [
    "program completion",
    "instructor capacity",
    "certification readiness",
  ],
  projectBridgeRecommendations: [
    "Bridge when curriculum build, instructor onboarding, or launch cohorts need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Education/training OS — distinct from business.course_creator and business.coaching",
    },
  ],
  completionCriteria: [
    "Programs and curriculum framed",
    "Schedules and onboarding considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "education_training",
  },
});

/** 250 — Nonprofit & Foundation Blueprint */
export const BUSINESS_BLUEPRINT_NONPROFIT_FOUNDATION = businessBlueprint({
  blueprintId: NONPROFIT_FOUNDATION_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Nonprofit & Foundation",
  description:
    "Support nonprofit operations — mission, programs, volunteers, fundraising, grants, governance, donor stewardship, and impact measurement together.",
  intendedUse:
    "Nonprofits, foundations, and mission-driven organizations — not paid creator membership OS, not consulting firm OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Mission and Positioning", role: "required" },
    { id: "np_mission_map", title: "Mission Map", role: "required" },
    { id: "np_strategic_plan", title: "Strategic Plan", role: "required" },
    { id: "np_program_plans", title: "Program Plans", role: "required" },
    { id: "np_volunteer_ops", title: "Volunteer Operations", ...depthGuided },
    { id: "np_fundraising", title: "Fundraising Campaigns", ...depthGuided },
    { id: "np_grants", title: "Grant Tracker", ...depthGuided },
    { id: "np_board", title: "Board Governance", ...depthGuided },
    { id: "np_donor_stewardship", title: "Donor Stewardship", ...depthGuided },
    { id: "np_impact", title: "Impact Dashboard", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_mission",
      prompt: "What mission are you serving — and who benefits most directly?",
      lowerFrictionPrompt: "What is this nonprofit for?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_programs",
      prompt: "Which programs carry the mission right now?",
      lowerFrictionPrompt: "What programs do you run?",
      sectionId: "np_program_plans",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next nonprofit move?",
      lowerFrictionPrompt: "What's the next small mission step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_mission", title: "Draft mission map", sectionId: "np_mission_map" },
    {
      id: "t_programs",
      title: "List active program plans",
      sectionId: "np_program_plans",
    },
    {
      id: "t_fundraising",
      title: "Sketch one fundraising campaign",
      sectionId: "np_fundraising",
    },
  ],
  suggestedMilestones: [
    { id: "m_mission", title: "Mission clear" },
    { id: "m_programs", title: "Programs framed" },
    {
      id: "m_ops",
      title: "Fundraising or grants path usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not a paid creator membership product OS",
    "Board rhythm needs a calm owner",
    "Grant tracking before promise volume",
    "Impact measures should stay honest and simple",
  ],
  riskPrompts: [
    "What if programs grow faster than volunteer and funding capacity?",
    "What if donor stewardship has no steady rhythm?",
  ],
  researchPrompts: [
    "Compare simple grant tracker patterns for small nonprofits",
    "Find volunteer handbook structures that stay usable",
  ],
  deliverables: [
    "Mission Map",
    "Strategic Plan",
    "Program Plans",
    "Volunteer Handbook",
    "Fundraising Campaigns",
    "Grant Tracker",
    "Board Agenda",
    "Impact Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "finance",
    "systems",
  ],
  boardReviewRecommendations: [
    "program load",
    "fundraising health",
    "governance rhythm",
  ],
  projectBridgeRecommendations: [
    "Bridge when campaign launches, grant applications, or program build-outs need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Nonprofit/foundation OS — distinct from membership product and consulting firm Blueprints",
    },
  ],
  completionCriteria: [
    "Mission and programs framed",
    "Fundraising or governance considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "nonprofit_foundation",
  },
});

/** 251 — Public Sector & Community Blueprint */
export const BUSINESS_BLUEPRINT_PUBLIC_SECTOR_COMMUNITY = businessBlueprint({
  blueprintId: PUBLIC_SECTOR_COMMUNITY_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Public Sector & Community",
  description:
    "Organize public, civic, municipal, and community initiatives — charters, stakeholders, communications, engagement, risk, and progress together.",
  intendedUse:
    "Civic initiatives, municipal projects, community coalitions, and public programs — not nonprofit fundraising OS, not consulting firm OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Initiative Positioning", role: "required" },
    { id: "ps_charter", title: "Initiative Charter", role: "required" },
    { id: "ps_stakeholders", title: "Stakeholder Map", role: "required" },
    { id: "ps_comms", title: "Communication Plan", ...depthGuided },
    { id: "ps_meetings", title: "Meeting Agendas and Cadence", ...depthGuided },
    { id: "ps_engagement", title: "Community Engagement Plan", role: "required" },
    { id: "ps_risk", title: "Risk Log", ...depthGuided },
    { id: "ps_progress", title: "Progress Dashboard", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_initiative",
      prompt: "What public or community initiative are you organizing?",
      lowerFrictionPrompt: "What initiative is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_stakeholders",
      prompt: "Who must be informed, consulted, or able to decide?",
      lowerFrictionPrompt: "Who are the key stakeholders?",
      sectionId: "ps_stakeholders",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "customers", "clients"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next civic move?",
      lowerFrictionPrompt: "What's the next small community step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_charter", title: "Write initiative charter", sectionId: "ps_charter" },
    {
      id: "t_stakeholders",
      title: "Map stakeholders",
      sectionId: "ps_stakeholders",
    },
    {
      id: "t_engagement",
      title: "Draft community engagement plan",
      sectionId: "ps_engagement",
    },
  ],
  suggestedMilestones: [
    { id: "m_charter", title: "Charter clear" },
    { id: "m_stakeholders", title: "Stakeholders mapped" },
    {
      id: "m_engagement",
      title: "Engagement path usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not a nonprofit fundraising OS — civic/public initiative ownership",
    "Risk log needs an owner before public commitments",
    "Meeting cadence before announcement volume",
    "Progress measures should stay simple and visible",
  ],
  riskPrompts: [
    "What if stakeholders disagree and no decision path exists?",
    "What if engagement outpaces capacity to follow through?",
  ],
  researchPrompts: [
    "Compare simple civic initiative charter patterns",
    "Find community engagement plans that stay human and clear",
  ],
  deliverables: [
    "Initiative Charter",
    "Stakeholder Map",
    "Communication Plan",
    "Meeting Agendas",
    "Community Engagement Plan",
    "Risk Log",
    "Progress Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "systems",
    "project-management",
  ],
  boardReviewRecommendations: [
    "stakeholder alignment",
    "engagement load",
    "risk ownership",
  ],
  projectBridgeRecommendations: [
    "Bridge when initiative phases, outreach waves, or convenings need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Public/community initiative OS — distinct from nonprofit and consulting Blueprints",
    },
  ],
  completionCriteria: [
    "Charter and stakeholders framed",
    "Engagement considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "public_sector_community",
  },
});

/** 252 — Faith & Membership Organization Blueprint */
export const BUSINESS_BLUEPRINT_FAITH_MEMBERSHIP_ORG = businessBlueprint({
  blueprintId: FAITH_MEMBERSHIP_ORG_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Faith & Membership Organization",
  description:
    "Coordinate faith communities and member organizations — ministries, events, volunteers, care, education, communications, and administration together.",
  intendedUse:
    "Congregations, associations, clubs, and faith/member communities — not paid creator membership product OS, not nonprofit foundation fundraising OS alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Community Positioning", role: "required" },
    { id: "fm_ministry_plans", title: "Ministry and Program Plans", role: "required" },
    { id: "fm_volunteer_schedule", title: "Volunteer Schedules", role: "required" },
    { id: "fm_events", title: "Event Plans", ...depthGuided },
    { id: "fm_care", title: "Care Workflows", ...depthGuided },
    { id: "fm_member_onboarding", title: "Member Onboarding", role: "required" },
    { id: "fm_comms", title: "Communication Calendar", ...depthGuided },
    { id: "fm_education", title: "Community Education Tracks", ...depthGuided },
    { id: "fm_admin", title: "Administration", ...depthComplete },
    { id: "fm_roadmap", title: "Annual Ministry Roadmap", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_community",
      prompt:
        "What kind of faith community or membership organization is this — and who does it serve?",
      lowerFrictionPrompt: "What community is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_ministries",
      prompt: "Which ministries, programs, or member groups need coordination now?",
      lowerFrictionPrompt: "What programs do you coordinate?",
      sectionId: "fm_ministry_plans",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next community move?",
      lowerFrictionPrompt: "What's the next small community step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    {
      id: "t_ministry",
      title: "List active ministry plans",
      sectionId: "fm_ministry_plans",
    },
    {
      id: "t_volunteers",
      title: "Sketch volunteer schedule",
      sectionId: "fm_volunteer_schedule",
    },
    {
      id: "t_onboarding",
      title: "Draft member onboarding path",
      sectionId: "fm_member_onboarding",
    },
  ],
  suggestedMilestones: [
    { id: "m_ministry", title: "Ministry plans clear" },
    { id: "m_volunteers", title: "Volunteer rhythm framed" },
    {
      id: "m_onboarding",
      title: "Member onboarding usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not business.membership creator product OS",
    "Care workflows need privacy and dignity",
    "Volunteer schedules before event promises",
    "Annual roadmap should stay light and reviewable",
  ],
  riskPrompts: [
    "What if events outpace volunteer coverage?",
    "What if care requests have no calm handoff?",
  ],
  researchPrompts: [
    "Compare simple member onboarding patterns for congregations and associations",
    "Find volunteer schedule templates that stay calm",
  ],
  deliverables: [
    "Ministry Plans",
    "Volunteer Schedules",
    "Event Plans",
    "Care Workflows",
    "Member Onboarding",
    "Communication Calendar",
    "Annual Ministry Roadmap",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "systems",
    "project-management",
  ],
  boardReviewRecommendations: [
    "volunteer coverage",
    "care ownership",
    "annual roadmap load",
  ],
  projectBridgeRecommendations: [
    "Bridge when seasonal calendars, major events, or onboarding systems need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Faith/member org OS — distinct from business.membership and nonprofit foundation OS",
    },
  ],
  completionCriteria: [
    "Ministry and volunteers framed",
    "Onboarding considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "faith_membership_org",
  },
});

export const EDUCATION_COMMUNITY_ORG_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_EDUCATION_TRAINING,
    BUSINESS_BLUEPRINT_NONPROFIT_FOUNDATION,
    BUSINESS_BLUEPRINT_PUBLIC_SECTOR_COMMUNITY,
    BUSINESS_BLUEPRINT_FAITH_MEMBERSHIP_ORG,
  ];

/**
 * 219–224 — Professional Organizing Collection Blueprints (definition data only).
 * Collection architecture: collection.professional_organizing
 * Not decluttering-only — physical, digital, operational, and strategic organization.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const PROFESSIONAL_ORGANIZING_COLLECTION_ID =
  "collection.professional_organizing" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID =
  "business.professional_organizing" as const;
export const PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID =
  "organizing.physical_space" as const;
export const DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID =
  "organizing.digital_information" as const;
export const OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID =
  "organizing.operational_procedural" as const;
export const STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID =
  "organizing.strategic_management" as const;

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
  collectionId: PROFESSIONAL_ORGANIZING_COLLECTION_ID,
  collectionOwner: "Business Intelligence / Professional Organizing Collection",
  notDeclutteringOnly: true,
} as const;

/** 220 — Professional Organizing Business Blueprint */
export const BUSINESS_BLUEPRINT_PROFESSIONAL_ORGANIZING = businessBlueprint({
  blueprintId: PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Professional Organizing Business",
  description:
    "Build and operate a credible organizing business spanning homes, businesses, executives, digital systems, procedures, and strategic organization — not decluttering alone.",
  intendedUse:
    "Professional organizers and hybrid organizing consultants who need a full business OS across physical, digital, operational, and strategic domains.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Organizer Identity and Positioning", role: "required" },
    { id: "organizing_clients", title: "Client and Need Architecture", role: "required" },
    { id: "organizing_services", title: "Service Portfolio", role: "required" },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "organizing_inquiry", title: "Inquiry and Qualification", ...depthGuided },
    { id: "organizing_assessment", title: "Assessment", ...depthGuided },
    { id: "organizing_proposal", title: "Proposal and Agreement", ...depthGuided },
    { id: "organizing_delivery", title: "Organizing Project Delivery", role: "required" },
    { id: "organizing_maintenance", title: "Maintenance and Follow-Up", ...depthGuided },
    { id: "organizing_privacy", title: "Privacy, Safety, and Boundaries", ...depthComplete },
    { id: "organizing_growth", title: "Referrals and Growth", ...depthComplete },
    { id: "organizing_operations", title: "Business Operations", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt:
        "What kind of organizing business are you building — homes, businesses, digital, procedures, strategy, or hybrid?",
      lowerFrictionPrompt: "What organizing work do you do?",
      lowEnergyPrompt: "What's one organizing specialty you want to clarify?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_clients",
      prompt: "Who do you serve — and who decides and pays?",
      lowerFrictionPrompt: "Who are your clients?",
      sectionId: "organizing_clients",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["clients", "audience", "payers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_services",
      prompt: "Which services belong in your suite — and what is out of scope?",
      lowerFrictionPrompt: "What services do you offer?",
      sectionId: "organizing_services",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for your organizing business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_position", title: "Draft organizer positioning", sectionId: "purpose_vision" },
    { id: "t_suite", title: "List service suite and exclusions", sectionId: "organizing_services" },
    { id: "t_pricing", title: "Set pricing and capacity floor", sectionId: "pricing" },
    {
      id: "t_qualify",
      title: "Write qualification questions",
      sectionId: "organizing_inquiry",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Positioning clear" },
    { id: "m_suite", title: "Service suite named" },
    {
      id: "m_delivery",
      title: "Delivery plan usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Organizing is not decluttering alone",
    "Privacy and safety boundaries",
    "Decision fatigue support",
    "Maintenance after the project",
    "Out-of-scope referrals",
  ],
  riskPrompts: [
    "What if scope expands into therapy, legal, or regulated records work?",
    "What if capacity ignores travel and emotional load?",
    "What if systems look neat but cannot be maintained?",
  ],
  researchPrompts: [
    "Compare organizing package structures",
    "Find ADHD-sensitive session design patterns",
    "Review privacy language for home and business clients",
  ],
  deliverables: [
    "Professional Organizing Business Plan",
    "Organizing Business Snapshot",
    "Specialty Map",
    "Service Suite",
    "Pricing Model",
    "Qualification Guide",
    "Organizing Assessment",
    "Organizing Project Plan",
    "Maintenance Offer",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "project-management",
    "systems",
    "client-relationships",
    "finance",
    "marketing",
    "sales",
    "leadership",
    "learning",
    "wellness",
  ],
  boardReviewRecommendations: [
    "specialty boundaries",
    "pricing and capacity",
    "privacy and safety",
    "maintenance offers",
  ],
  projectBridgeRecommendations: [
    "Bridge when an organizing engagement needs session tasks",
    "Keep Create as source of truth for assessment and plan design",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Delivery Blueprints (physical, digital, operational, strategic) advance engagement Work",
    },
  ],
  completionCriteria: [
    "Specialty and philosophy captured",
    "Clients and services framed",
    "Pricing considered",
    "Delivery approach named",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META },
});

/** 221 — Physical Space Organization Blueprint */
export const BUSINESS_BLUEPRINT_PHYSICAL_SPACE_ORGANIZING = businessBlueprint({
  blueprintId: PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Physical Space Organization",
  description:
    "Organize a home, room, office, or physical work environment for function, accessibility, ease of use, and sustainable maintenance.",
  intendedUse:
    "Organizing engagements focused on physical environments — not a full organizing business OS.",
  complexity: "moderate",
  sections: [
    { id: "purpose_vision", title: "Purpose of the Space", role: "required" },
    { id: "space_users", title: "Users and Constraints", role: "required" },
    { id: "current_state_space", title: "Current-State Map", role: "required" },
    { id: "sort_decide", title: "Sort and Decide", ...depthGuided },
    { id: "space_design", title: "Zones and Placement", ...depthGuided },
    { id: "labels_containers", title: "Labels and Containers", ...depthGuided },
    { id: "accessibility_flow", title: "Accessibility and Flow", ...depthGuided },
    { id: "maintenance_space", title: "Maintenance System", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What space are we organizing, and what should feel easier when it's done?",
      lowerFrictionPrompt: "What space needs organizing?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "space", "vision"],
      materialChangeNextStep: true,
    },
    {
      id: "q_users",
      prompt: "Who uses this space, and what constraints matter (energy, mobility, household dynamics)?",
      lowerFrictionPrompt: "Who uses the space?",
      sectionId: "space_users",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["users", "constraints"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for this space?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_purpose", title: "Name the purpose of the space", sectionId: "purpose_vision" },
    { id: "t_current", title: "Map current friction", sectionId: "current_state_space" },
    { id: "t_maintain", title: "Design a maintenance rhythm", sectionId: "maintenance_space" },
  ],
  suggestedMilestones: [
    { id: "m_purpose", title: "Space purpose clear" },
    { id: "m_maintain", title: "Maintenance plan named" },
  ],
  commonlyForgottenItems: [
    "Maintenance is part of the solution",
    "Fit the human, not a magazine photo",
    "Accessibility and flow",
  ],
  riskPrompts: [
    "What if the system looks neat but cannot be maintained?",
    "What if decisions overwhelm the session?",
  ],
  researchPrompts: ["Find low-energy sorting sequences for this space type"],
  deliverables: [
    "Physical Space Organization Plan",
    "Current-State Map",
    "Zone Plan",
    "Maintenance Checklist",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["project-management", "systems", "wellness", "client-relationships"],
  boardReviewRecommendations: ["purpose fit", "maintenance"],
  projectBridgeRecommendations: ["Bridge when multi-session space work needs tasks"],
  cartographyRelationshipRecommendations: [
    { relationship: "related_to", note: "May link from Professional Organizing Business Work" },
  ],
  completionCriteria: [
    "Space purpose captured",
    "Users and constraints named",
    "Maintenance framed",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "physical_space" },
});

/** 222 — Digital & Information Organization Blueprint */
export const BUSINESS_BLUEPRINT_DIGITAL_INFORMATION_ORGANIZING = businessBlueprint({
  blueprintId: DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Digital and Information Organization",
  description:
    "Create a searchable, maintainable structure for files, email, notes, photos, research, and business information.",
  intendedUse:
    "Digital and information organizing engagements — not a full IT migration project.",
  complexity: "moderate",
  sections: [
    { id: "purpose_vision", title: "Information Purpose", role: "required" },
    { id: "info_inventory", title: "Information Inventory", role: "required" },
    { id: "naming_structure", title: "Naming and Structure", role: "required" },
    { id: "retrieval_rules", title: "Retrieval Rules", ...depthGuided },
    { id: "permissions_archives", title: "Permissions and Archives", ...depthGuided },
    { id: "email_notes_photos", title: "Email, Notes, and Photos", ...depthGuided },
    { id: "digital_maintenance", title: "Digital Maintenance", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What information should be easy to find — and for whom?",
      lowerFrictionPrompt: "What digital mess is slowing you down?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "information"],
      materialChangeNextStep: true,
    },
    {
      id: "q_inventory",
      prompt: "Where does information live today — drives, email, notes, photos, shared folders?",
      lowerFrictionPrompt: "Where is the information now?",
      sectionId: "info_inventory",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["inventory", "systems"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for this information system?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_purpose", title: "Name retrieval goals", sectionId: "purpose_vision" },
    { id: "t_structure", title: "Draft naming conventions", sectionId: "naming_structure" },
    { id: "t_maintain", title: "Set digital maintenance rhythm", sectionId: "digital_maintenance" },
  ],
  suggestedMilestones: [
    { id: "m_structure", title: "Structure draft ready" },
    { id: "m_maintain", title: "Maintenance cadence set" },
  ],
  commonlyForgottenItems: [
    "Permissions and shared access",
    "Archive versus delete decisions",
    "Maintenance after the tidy",
  ],
  riskPrompts: [
    "What if renaming breaks shared links?",
    "What if the system depends on perfect memory?",
  ],
  researchPrompts: ["Compare simple folder taxonomies for solo operators"],
  deliverables: [
    "Digital Information Organization Plan",
    "Information Inventory",
    "Naming Convention Guide",
    "Retrieval Rules",
    "Digital Maintenance Checklist",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "knowledge-management",
    "systems",
    "project-management",
    "data-analytics",
  ],
  boardReviewRecommendations: ["retrieval", "permissions", "maintenance"],
  projectBridgeRecommendations: ["Bridge when migration or rename work needs tasks"],
  cartographyRelationshipRecommendations: [
    { relationship: "related_to", note: "May support Professional Organizing Business Work" },
  ],
  completionCriteria: [
    "Information purpose captured",
    "Inventory started",
    "Naming structure framed",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "digital_information" },
});

/** 223 — Operational & Procedural Organization Blueprint */
export const BUSINESS_BLUEPRINT_OPERATIONAL_PROCEDURAL_ORGANIZING = businessBlueprint({
  blueprintId: OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Operational and Procedural Organization",
  description:
    "Organize how work gets done through procedures, workflows, roles, handoffs, documentation, and management visibility.",
  intendedUse:
    "Businesses reducing friction in how work is done — SOPs, workflows, and rhythms — not a full strategy OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Operational Scope", role: "required" },
    { id: "workflow_map", title: "Current Workflow Map", role: "required" },
    { id: "roles_handoffs", title: "Roles and Handoffs", role: "required" },
    { id: "sop_design", title: "SOP and Procedure Design", ...depthGuided },
    { id: "recurring_rhythms", title: "Recurring Work Rhythms", ...depthGuided },
    { id: "visibility_ops", title: "Management Visibility", ...depthGuided },
    { id: "ops_maintenance", title: "Procedure Maintenance", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "Which process or workflow is creating the most friction right now?",
      lowerFrictionPrompt: "What process needs organizing?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "process", "workflow"],
      materialChangeNextStep: true,
    },
    {
      id: "q_owners",
      prompt: "Who owns each step today — and where do handoffs break?",
      lowerFrictionPrompt: "Who does what today?",
      sectionId: "roles_handoffs",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["roles", "handoffs", "owners"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for this operating system?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_scope", title: "Name the process in scope", sectionId: "purpose_vision" },
    { id: "t_map", title: "Map current steps", sectionId: "workflow_map" },
    { id: "t_sop", title: "Draft one SOP", sectionId: "sop_design" },
  ],
  suggestedMilestones: [
    { id: "m_map", title: "Workflow mapped" },
    { id: "m_sop", title: "First SOP usable" },
  ],
  commonlyForgottenItems: [
    "Handoffs and ownership",
    "Maintenance of procedures",
    "Reduce memory burden",
  ],
  riskPrompts: [
    "What if SOPs become unread wallpaper?",
    "What if ownership stays ambiguous?",
  ],
  researchPrompts: ["Find lightweight SOP formats for small teams"],
  deliverables: [
    "Operational Organization Plan",
    "Workflow Map",
    "Roles and Handoffs Chart",
    "SOP Draft",
    "Recurring Rhythm Calendar",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "systems",
    "project-management",
    "leadership",
    "people-culture",
  ],
  boardReviewRecommendations: ["ownership", "handoffs", "maintenance"],
  projectBridgeRecommendations: ["Bridge when SOP rollout needs tasks"],
  cartographyRelationshipRecommendations: [
    { relationship: "related_to", note: "May support strategic organizing Work" },
  ],
  completionCriteria: [
    "Process scope captured",
    "Workflow mapped",
    "Ownership framed",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "operational_procedural" },
});

/** 224 — Strategic & Management Organization Blueprint */
export const BUSINESS_BLUEPRINT_STRATEGIC_MANAGEMENT_ORGANIZING = businessBlueprint({
  blueprintId: STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Strategic and Management Organization",
  description:
    "Turn scattered goals, ideas, responsibilities, decisions, and initiatives into an understandable strategic and management structure.",
  intendedUse:
    "Founders and leaders organizing direction and management rhythms — not a full consulting engagement OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Strategic Context", role: "required" },
    { id: "priority_structure", title: "Priorities and Goals", role: "required" },
    { id: "initiative_map", title: "Initiatives and Projects", role: "required" },
    { id: "decision_log_org", title: "Decisions and Visibility", ...depthGuided },
    { id: "meeting_rhythms", title: "Meeting and Planning Rhythms", ...depthGuided },
    { id: "alignment_load", title: "Alignment and Load", ...depthGuided },
    { id: "management_cadence", title: "Management Cadence", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What feels scattered — goals, initiatives, decisions, or management rhythm?",
      lowerFrictionPrompt: "What needs strategic organizing?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "strategy"],
      materialChangeNextStep: true,
    },
    {
      id: "q_priorities",
      prompt: "What are the few priorities that should actually drive the next season?",
      lowerFrictionPrompt: "What matters most right now?",
      sectionId: "priority_structure",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["priorities", "goals"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for this management structure?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_context", title: "Capture strategic context", sectionId: "purpose_vision" },
    { id: "t_priorities", title: "Name top priorities", sectionId: "priority_structure" },
    { id: "t_cadence", title: "Set management cadence", sectionId: "management_cadence" },
  ],
  suggestedMilestones: [
    { id: "m_priorities", title: "Priorities clear" },
    { id: "m_cadence", title: "Cadence set" },
  ],
  commonlyForgottenItems: [
    "Goals versus projects versus tasks",
    "Initiative overload",
    "Decision visibility",
  ],
  riskPrompts: [
    "What if everything stays a priority?",
    "What if meetings replace decisions?",
  ],
  researchPrompts: ["Compare lightweight planning cadences for solopreneurs and small teams"],
  deliverables: [
    "Strategic Organization Plan",
    "Priority Map",
    "Initiative Map",
    "Decision Visibility Guide",
    "Management Cadence",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "strategy",
    "leadership",
    "project-management",
    "systems",
  ],
  boardReviewRecommendations: ["priority clarity", "load", "cadence"],
  projectBridgeRecommendations: ["Bridge when initiatives become Project Work"],
  cartographyRelationshipRecommendations: [
    { relationship: "supports", note: "Can spawn Project Work without duplicating strategy SoT" },
  ],
  completionCriteria: [
    "Strategic context captured",
    "Priorities named",
    "Management cadence framed",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "strategic_management" },
});

export const ORGANIZING_PROFESSIONAL_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_PROFESSIONAL_ORGANIZING,
    BUSINESS_BLUEPRINT_PHYSICAL_SPACE_ORGANIZING,
    BUSINESS_BLUEPRINT_DIGITAL_INFORMATION_ORGANIZING,
    BUSINESS_BLUEPRINT_OPERATIONAL_PROCEDURAL_ORGANIZING,
    BUSINESS_BLUEPRINT_STRATEGIC_MANAGEMENT_ORGANIZING,
  ];

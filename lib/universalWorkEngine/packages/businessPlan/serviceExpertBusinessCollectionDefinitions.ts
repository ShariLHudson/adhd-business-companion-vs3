/**
 * 207–210 — Service & Expert Business Collection Blueprints (definition data only).
 * Registered on Business Plan Work Type via businessBlueprintDefinitions.
 * Separate runtime Blueprints — not combined into one.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const SPEAKER_BUSINESS_BLUEPRINT_ID = "business.speaker" as const;
export const COACHING_BUSINESS_BLUEPRINT_ID = "business.coaching" as const;
export const CONSULTING_BUSINESS_BLUEPRINT_ID = "business.consulting" as const;
export const SERVICE_BUSINESS_BLUEPRINT_ID = "business.service" as const;

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

/** 207 — Speaker Business Blueprint */
export const BUSINESS_BLUEPRINT_SPEAKER = businessBlueprint({
  blueprintId: SPEAKER_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Speaker Business",
  description:
    "Build, organize, operate, and grow a sustainable speaking business — positioning, signature talks, offers, fees, marketing, booking, delivery, and follow-up.",
  intendedUse:
    "Keynote speakers, trainers, authors, and experts who need a speaking business OS — not merely a presentation outline.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Speaker Business Foundation", role: "required" },
    { id: "audience_buyer_architecture", title: "Audience and Buyer Architecture", role: "required" },
    { id: "signature_talk_portfolio", title: "Signature Talk Portfolio", role: "required" },
    { id: "speaking_offers", title: "Offer and Package Design", role: "required" },
    { id: "pricing", title: "Pricing and Financial Model", role: "required" },
    { id: "speaker_marketing", title: "Speaker Marketing System", ...depthGuided },
    { id: "booking_pipeline", title: "Outreach and Booking Pipeline", ...depthGuided },
    { id: "speaker_proposal", title: "Proposal and Agreement", ...depthGuided },
    { id: "event_preparation", title: "Event Preparation", ...depthGuided },
    { id: "delivery_experience", title: "Delivery and Experience", ...depthComplete },
    { id: "post_event_followup", title: "Post-Event Follow-Up", ...depthGuided },
    { id: "speaker_operations", title: "Speaker Business Operations", ...depthComplete },
    { id: "linked_event_work", title: "Linked Event Work", ...depthGuided },
    { id: "profitability", title: "Revenue and Stewardship", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt:
        "What kind of speaking business are you building, and what should feel clearer?",
      lowerFrictionPrompt: "What speaking business are you building?",
      lowEnergyPrompt: "What's one thing you want your speaking work to support?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "speaker_identity"],
      materialChangeNextStep: true,
    },
    {
      id: "q_buyers",
      prompt:
        "Who benefits from your talks — and who usually pays or books you?",
      lowerFrictionPrompt: "Who books you, and who sits in the room?",
      sectionId: "audience_buyer_architecture",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "buyers", "organizers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_talk",
      prompt: "What signature talk or topic is central right now?",
      lowerFrictionPrompt: "What's your main talk about?",
      sectionId: "signature_talk_portfolio",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["signature_talk", "topics"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for your speaking business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_positioning", title: "Draft speaker positioning", sectionId: "purpose_vision" },
    { id: "t_buyer_map", title: "Separate audience from buyers", sectionId: "audience_buyer_architecture" },
    { id: "t_talk_brief", title: "Write one signature talk brief", sectionId: "signature_talk_portfolio" },
    { id: "t_fee_floor", title: "Set fee floor and target fee", sectionId: "pricing" },
    {
      id: "t_pipeline",
      title: "Name three outreach targets",
      sectionId: "booking_pipeline",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_one_sheet", title: "Speaker one-sheet ready" },
    { id: "m_fee_clarity", title: "Fee floor decided" },
    {
      id: "m_pipeline",
      title: "Booking pipeline in use",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Buyers are not the same as the audience",
    "Travel and prep time in fees",
    "Recording and IP terms",
    "Post-event follow-up and referrals",
    "Accessibility and AV contingencies",
  ],
  riskPrompts: [
    "What if unpaid speaking crowds out paid work?",
    "What if customization erodes margin?",
    "What if follow-up never happens after the event?",
  ],
  researchPrompts: [
    "Compare speaker fee ranges for this audience",
    "Find bureau or association pathways",
    "Review talk-to-offer pathways that stay ethical",
  ],
  deliverables: [
    "Speaker Business Plan",
    "Speaker Positioning Statement",
    "Audience and Buyer Map",
    "Signature Talk Brief",
    "Speaking Offer Suite",
    "Speaker Fee Calculator",
    "Booking Pipeline",
    "Speaker Preparation Plan",
    "Follow-Up System",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "marketing",
    "sales",
    "finance",
    "events",
    "learning",
    "content",
    "creative-studio",
    "client-relationships",
    "project-management",
    "leadership",
  ],
  boardReviewRecommendations: [
    "positioning",
    "fee floor",
    "talk portfolio",
    "booking pipeline",
  ],
  projectBridgeRecommendations: [
    "Bridge when outreach cadence begins",
    "Bridge a specific booked engagement as Event Work when useful",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Speaking can feed coaching, consulting, books, or courses",
    },
    {
      relationship: "related_to",
      note: "Booked talks may link to Event Work without replacing this business plan",
    },
  ],
  completionCriteria: [
    "Speaker identity and goals captured",
    "Audience and buyers separated",
    "At least one signature talk framed",
    "Fee floor named (Guided+)",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    collectionOwner: "Business Intelligence / Speaker Business Collection",
    successModel:
      "Speaking becomes a calm, repeatable business — talks, fees, bookings, and follow-up stay connected.",
    guardrails: [
      "Do not duplicate Chamber Events knowledge — connect when a talk becomes an event",
      "Separate audience benefit from buyer decision",
    ],
  },
});

/** 208 — Coaching Business Blueprint */
export const BUSINESS_BLUEPRINT_COACHING = businessBlueprint({
  blueprintId: COACHING_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Coaching Business",
  description:
    "Define, build, deliver, and grow a trustworthy coaching business with clear positioning, client fit, ethical boundaries, offers, enrollment, delivery, and operations.",
  intendedUse:
    "Coaches who need a full coaching business OS — not a therapy substitute or generic service menu.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Coaching Identity", role: "required" },
    { id: "client_fit", title: "Ideal Client and Fit", role: "required" },
    { id: "coaching_offers", title: "Coaching Offer Design", role: "required" },
    { id: "coaching_framework", title: "Coaching Framework", ...depthGuided },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "coaching_marketing", title: "Marketing and Trust", ...depthGuided },
    { id: "discovery_enrollment", title: "Discovery and Enrollment", ...depthGuided },
    { id: "coaching_onboarding", title: "Onboarding", ...depthGuided },
    { id: "coaching_delivery", title: "Delivery", ...depthGuided },
    { id: "completion_renewal", title: "Completion and Renewal", ...depthComplete },
    { id: "coaching_operations", title: "Operations and Quality", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What coaching focus are you building, and where are the boundaries?",
      lowerFrictionPrompt: "What do you coach people on?",
      lowEnergyPrompt: "What's the heart of the coaching you want to offer?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "coaching_focus"],
      materialChangeNextStep: true,
    },
    {
      id: "q_fit",
      prompt: "Who is a strong fit — and who should you refer elsewhere?",
      lowerFrictionPrompt: "Who is this coaching for?",
      sectionId: "client_fit",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["ideal_client", "fit", "non_fit"],
      materialChangeNextStep: true,
    },
    {
      id: "q_offer",
      prompt: "What coaching format are you offering first?",
      lowerFrictionPrompt: "One-to-one, group, or something else?",
      sectionId: "coaching_offers",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["offers", "format"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for your coaching business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_boundaries", title: "Write scope and boundary statement", sectionId: "purpose_vision" },
    { id: "t_fit", title: "List fit and non-fit signals", sectionId: "client_fit" },
    { id: "t_offer", title: "Name one primary coaching offer", sectionId: "coaching_offers" },
    { id: "t_capacity", title: "Set capacity and pricing floor", sectionId: "pricing" },
    {
      id: "t_discovery",
      title: "Draft discovery conversation guide",
      sectionId: "discovery_enrollment",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_boundaries", title: "Boundaries stated" },
    { id: "m_offer", title: "Primary offer clear" },
    {
      id: "m_enrollment",
      title: "Enrollment path usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Coaching is not therapy, legal, or medical advice",
    "Non-fit and referral paths",
    "Capacity before more marketing",
    "Confidentiality and cancellation terms",
    "Renewal without pressure",
  ],
  riskPrompts: [
    "What if scope creeps into regulated advice?",
    "What if enrollment pressure harms trust?",
    "What if capacity collapses quality?",
  ],
  researchPrompts: [
    "Compare ethical coaching offer structures",
    "Find referral partners for out-of-scope needs",
    "Review capacity models for solo coaches",
  ],
  deliverables: [
    "Coaching Business Plan",
    "Scope and Boundary Statement",
    "Client Fit Profile",
    "Coaching Offer Suite",
    "Coaching Framework",
    "Coaching Pricing Model",
    "Discovery Conversation Guide",
    "Coaching Welcome Packet",
    "Session Template",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "marketing",
    "sales",
    "finance",
    "client-relationships",
    "learning",
    "leadership",
    "project-management",
    "content",
    "wellness",
  ],
  boardReviewRecommendations: [
    "boundaries",
    "client fit",
    "pricing and capacity",
    "enrollment ethics",
  ],
  projectBridgeRecommendations: [
    "Bridge when onboarding a client cohort or intensive",
    "Keep Create as source of truth for coaching design",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "related_to",
      note: "Speaking or consulting may support coaching without merging Work IDs",
    },
  ],
  completionCriteria: [
    "Coaching focus and boundaries captured",
    "Fit and non-fit named",
    "Primary offer framed",
    "Capacity considered (Guided+)",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    collectionOwner: "Business Intelligence / Coaching Business Collection",
    successModel:
      "Coaching feels trustworthy and sustainable — fit, delivery, and renewal stay clear without pressure.",
    guardrails: [
      "Distinguish coaching from therapy and regulated professions",
      "No unsupported outcome guarantees",
      "Preserve client agency and confidentiality",
    ],
  },
});

/** 209 — Consulting Business Blueprint */
export const BUSINESS_BLUEPRINT_CONSULTING = businessBlueprint({
  blueprintId: CONSULTING_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Consulting Business",
  description:
    "Turn expertise into a clearly positioned consulting business with diagnosis, proposals, delivery, governance, outcomes, and operating rhythm.",
  intendedUse:
    "Consultants and fractional leaders who need diagnosis-before-recommendation structure — not a coaching journey or generic service checklist.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Consulting Position", role: "required" },
    { id: "service_architecture", title: "Service Architecture", role: "required" },
    { id: "diagnostic_method", title: "Diagnostic Method", role: "required" },
    { id: "pricing", title: "Pricing", role: "required" },
    { id: "lead_generation", title: "Lead Generation", ...depthGuided },
    { id: "qualification_discovery", title: "Qualification and Discovery", ...depthGuided },
    { id: "proposal_contract", title: "Proposal and Contract", ...depthGuided },
    { id: "engagement_kickoff", title: "Engagement Kickoff", ...depthGuided },
    { id: "consulting_delivery", title: "Delivery", ...depthGuided },
    { id: "client_communication", title: "Client Communication", ...depthComplete },
    { id: "outcomes_closeout", title: "Outcomes and Closeout", ...depthComplete },
    { id: "consulting_operations", title: "Consulting Operations", ...depthComplete },
    { id: "profitability", title: "Margin and Utilization", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What problems do you solve, and for which buyers?",
      lowerFrictionPrompt: "What consulting work are you known for?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "domain"],
      materialChangeNextStep: true,
    },
    {
      id: "q_services",
      prompt: "What service formats do you offer — assessment, advisory, implementation, or something else?",
      lowerFrictionPrompt: "How do clients usually hire you?",
      sectionId: "service_architecture",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "formats"],
      materialChangeNextStep: true,
    },
    {
      id: "q_diagnosis",
      prompt: "How do you diagnose before you recommend?",
      lowerFrictionPrompt: "What do you need to understand first?",
      sectionId: "diagnostic_method",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["diagnosis", "discovery"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for your consulting business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_position", title: "Write consulting position", sectionId: "purpose_vision" },
    { id: "t_suite", title: "List service suite and exclusions", sectionId: "service_architecture" },
    { id: "t_diagnostic", title: "Outline diagnostic steps", sectionId: "diagnostic_method" },
    { id: "t_pricing", title: "Choose primary pricing model", sectionId: "pricing" },
    {
      id: "t_proposal",
      title: "Draft proposal architecture",
      sectionId: "proposal_contract",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Position clear" },
    { id: "m_diagnostic", title: "Diagnostic method named" },
    {
      id: "m_proposal",
      title: "Proposal template usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Diagnosis before recommendation",
    "Assumptions and exclusions in proposals",
    "Change control",
    "Stakeholder vs buyer",
    "Closeout and adoption evidence",
  ],
  riskPrompts: [
    "What if scope expands without change control?",
    "What if recommendations outrun evidence?",
    "What if utilization hides weak pipeline?",
  ],
  researchPrompts: [
    "Compare consulting pricing models for this domain",
    "Find governance patterns for multi-stakeholder work",
    "Review closeout evidence practices",
  ],
  deliverables: [
    "Consulting Business Plan",
    "Consulting Position",
    "Consulting Service Suite",
    "Diagnostic Framework",
    "Pricing Model",
    "Qualification Guide",
    "Proposal Architecture",
    "Engagement Charter",
    "Delivery Plan",
    "Outcome Report",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "marketing",
    "sales",
    "finance",
    "project-management",
    "data-analytics",
    "client-relationships",
    "leadership",
    "systems",
    "learning",
  ],
  boardReviewRecommendations: [
    "diagnosis method",
    "scope control",
    "pricing",
    "governance",
  ],
  projectBridgeRecommendations: [
    "Bridge when an engagement kickoff needs execution tasks",
    "Keep Create as source of truth for diagnosis and proposal content",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Engagements may spawn Project Work without copying Create as a second master",
    },
  ],
  completionCriteria: [
    "Consulting position captured",
    "Service architecture named",
    "Diagnostic method framed",
    "Pricing model chosen",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    collectionOwner: "Business Intelligence / Consulting Business Collection",
    successModel:
      "Consulting stays diagnosable, scoped, and measurable — proposals and delivery share one Work lineage.",
    guardrails: [
      "Diagnosis before recommendation",
      "Buyer and stakeholder separation",
      "Measurable outcomes and change control",
    ],
  },
});

/** 210 — Service Business Operating Blueprint */
export const BUSINESS_BLUEPRINT_SERVICE = businessBlueprint({
  blueprintId: SERVICE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Service Business Operating",
  description:
    "Create a complete, repeatable operating model for a service business — from inquiry through delivery, payment, follow-up, and referral.",
  intendedUse:
    "Independent service professionals (VA, organizer, designer, bookkeeper, copywriter, home services, and similar) who need an operating system — not a speaker, coach, or consultant specialty plan.",
  complexity: "moderate",
  sections: [
    { id: "purpose_vision", title: "Business Foundation", role: "required" },
    { id: "service_menu", title: "Service Menu", role: "required" },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "client_acquisition", title: "Client Acquisition", ...depthGuided },
    { id: "inquiry_qualification", title: "Inquiry and Qualification", ...depthGuided },
    { id: "estimate_proposal", title: "Estimate, Proposal, and Agreement", ...depthGuided },
    { id: "service_onboarding", title: "Onboarding", ...depthGuided },
    { id: "delivery_workflow", title: "Delivery Workflow", role: "required" },
    { id: "change_issue_management", title: "Change and Issue Management", ...depthComplete },
    { id: "completion_payment", title: "Completion and Payment", ...depthGuided },
    { id: "followup_retention", title: "Follow-Up and Retention", ...depthComplete },
    { id: "service_operations", title: "Operations", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What service do you provide, and what outcome should clients leave with?",
      lowerFrictionPrompt: "What service business are you running?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "service"],
      materialChangeNextStep: true,
    },
    {
      id: "q_menu",
      prompt: "What belongs on your service menu — and what is out of scope?",
      lowerFrictionPrompt: "What do you offer, and what don't you?",
      sectionId: "service_menu",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "packages", "exclusions"],
      materialChangeNextStep: true,
    },
    {
      id: "q_delivery",
      prompt: "What are the main steps from start of work to done?",
      lowerFrictionPrompt: "How do you deliver the work?",
      sectionId: "delivery_workflow",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["delivery", "workflow"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for your service business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_snapshot", title: "Write service business snapshot", sectionId: "purpose_vision" },
    { id: "t_menu", title: "Draft service menu and exclusions", sectionId: "service_menu" },
    { id: "t_pricing", title: "Set pricing and capacity floor", sectionId: "pricing" },
    { id: "t_workflow", title: "Map standard delivery workflow", sectionId: "delivery_workflow" },
    {
      id: "t_inquiry",
      title: "Write inquiry response questions",
      sectionId: "inquiry_qualification",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_menu", title: "Service menu clear" },
    { id: "m_workflow", title: "Delivery workflow written" },
    {
      id: "m_agreement",
      title: "Agreement checklist ready",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Exclusions and revision limits",
    "Admin and revision time in pricing",
    "Change requests mid-delivery",
    "Final acceptance before invoice",
    "Referral and reactivation rhythm",
  ],
  riskPrompts: [
    "What if scope expands without a change request?",
    "What if capacity is full but marketing continues?",
    "What if payment lags completion?",
  ],
  researchPrompts: [
    "Compare service package structures for this trade",
    "Find simple change-request language",
    "Review retention rhythms that stay gentle",
  ],
  deliverables: [
    "Service Business Operating Plan",
    "Service Business Snapshot",
    "Service Menu",
    "Pricing Calculator",
    "Inquiry Workflow",
    "Proposal and Agreement Checklist",
    "Standard Delivery Workflow",
    "Change Request Guide",
    "Follow-Up Sequence",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "marketing",
    "sales",
    "finance",
    "project-management",
    "client-relationships",
    "systems",
    "data-analytics",
  ],
  boardReviewRecommendations: [
    "scope and exclusions",
    "pricing and capacity",
    "delivery workflow",
    "payment completion",
  ],
  projectBridgeRecommendations: [
    "Bridge when a client engagement needs task execution",
    "Keep Create as source of truth for menu, pricing, and workflow design",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "related_to",
      note: "Specialty Blueprints (speaker, coaching, consulting) supersede this when the identity match is clearer",
    },
  ],
  completionCriteria: [
    "Service and outcome captured",
    "Menu and exclusions named",
    "Pricing and capacity considered",
    "Delivery workflow framed",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    collectionOwner: "Business Intelligence / Service Business Collection",
    successModel:
      "Service work becomes repeatable — inquiry to payment stays calm, scoped, and paid.",
    guardrails: [
      "Prefer specialty Blueprints when speaker/coach/consultant identity is clear",
      "Clear scope, change control, and payment completion",
    ],
  },
});

export const SERVICE_EXPERT_BUSINESS_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_SPEAKER,
    BUSINESS_BLUEPRINT_COACHING,
    BUSINESS_BLUEPRINT_CONSULTING,
    BUSINESS_BLUEPRINT_SERVICE,
  ];

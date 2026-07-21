/**
 * 211–214 — Creator & Knowledge Business Collection Blueprints (definition data only).
 * Registered on Business Plan Work Type via businessBlueprintDefinitions.
 * Separate runtime Blueprints — not merged into one generic creator Blueprint.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const AUTHOR_BUSINESS_BLUEPRINT_ID = "business.author" as const;
export const COURSE_CREATOR_BUSINESS_BLUEPRINT_ID =
  "business.course_creator" as const;
export const MEMBERSHIP_BUSINESS_BLUEPRINT_ID = "business.membership" as const;
export const CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID =
  "business.content_creator" as const;

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

/** 211 — Author Business Blueprint */
export const BUSINESS_BLUEPRINT_AUTHOR = businessBlueprint({
  blueprintId: AUTHOR_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Author Business",
  description:
    "Build a sustainable author business around books, readers, publishing path, platform, marketing, distribution, expansion offers, and long-term catalog growth.",
  intendedUse:
    "Authors and experts who need a book-centered business OS — not merely a manuscript outline or a single book-launch event.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Author Identity and Strategic Purpose", role: "required" },
    { id: "reader_market_architecture", title: "Reader and Market Architecture", role: "required" },
    { id: "book_portfolio_strategy", title: "Book Portfolio Strategy", role: "required" },
    { id: "publishing_path", title: "Publishing Path Decision", role: "required" },
    { id: "book_development_workflow", title: "Book Development Workflow", ...depthGuided },
    { id: "author_platform", title: "Author Brand and Platform", ...depthGuided },
    { id: "book_marketing", title: "Book Marketing System", ...depthGuided },
    { id: "sales_distribution", title: "Sales and Distribution", ...depthGuided },
    { id: "book_to_business", title: "Book-to-Business Expansion", ...depthComplete },
    { id: "pricing", title: "Financial Model", role: "required" },
    { id: "linked_event_work", title: "Launch and Event Integration", ...depthGuided },
    { id: "author_operations", title: "Author Operations", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What kind of author business are you building, and what role do books play?",
      lowerFrictionPrompt: "What author business are you building?",
      lowEnergyPrompt: "What's one thing you want your books to support?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "author_identity"],
      materialChangeNextStep: true,
    },
    {
      id: "q_readers",
      prompt: "Who are your readers — and who usually buys or recommends the book?",
      lowerFrictionPrompt: "Who is the book for?",
      sectionId: "reader_market_architecture",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["readers", "audience", "buyers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_path",
      prompt: "Which publishing path are you considering — traditional, independent, hybrid, or something else?",
      lowerFrictionPrompt: "How do you want to publish?",
      sectionId: "publishing_path",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["publishing_path", "publish"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for your author business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_positioning", title: "Draft author positioning", sectionId: "purpose_vision" },
    { id: "t_readers", title: "Separate readers from buyers", sectionId: "reader_market_architecture" },
    { id: "t_portfolio", title: "Map current or planned books", sectionId: "book_portfolio_strategy" },
    { id: "t_path", title: "Compare publishing path tradeoffs", sectionId: "publishing_path" },
    {
      id: "t_platform",
      title: "Name platform priorities",
      sectionId: "author_platform",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Author position clear" },
    { id: "m_path", title: "Publishing path chosen" },
    {
      id: "m_marketing",
      title: "Book marketing rhythm named",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Readers are not always the buyers",
    "Post-launch evergreen promotion",
    "Rights and metadata",
    "Book-to-business expansion without forced upsells",
    "Link launches to Event Work without replacing this plan",
  ],
  riskPrompts: [
    "What if the book never connects to a sustainable business rhythm?",
    "What if launch energy fades with no evergreen path?",
    "What if publishing costs outrun distribution plans?",
  ],
  researchPrompts: [
    "Compare publishing path costs for this genre",
    "Find bulk or special-market pathways",
    "Review ethical book-to-offer expansions",
  ],
  deliverables: [
    "Author Business Plan",
    "Author Positioning Statement",
    "Reader and Buyer Map",
    "Book Portfolio Map",
    "Publishing Path Comparison",
    "Book Development Plan",
    "Author Platform Plan",
    "Book Marketing Plan",
    "Distribution Strategy",
    "Author Financial Model",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "content",
    "marketing",
    "sales",
    "finance",
    "creative-studio",
    "events",
    "learning",
    "client-relationships",
    "project-management",
  ],
  boardReviewRecommendations: [
    "publishing path",
    "platform priorities",
    "financial model",
    "book-to-business map",
  ],
  projectBridgeRecommendations: [
    "Bridge manuscript production milestones when drafting begins",
    "Link a Book Launch Event Work when a launch date is real",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "related_to",
      note: "Book launches may use Event Blueprints without replacing Author Business Work",
    },
    {
      relationship: "supports",
      note: "Books can support speaking, courses, coaching, or memberships",
    },
  ],
  completionCriteria: [
    "Author identity and book role captured",
    "Readers and buyers separated",
    "Portfolio or primary book framed",
    "Publishing path considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    collectionOwner: "Business Intelligence / Author Business Collection",
    successModel:
      "Books become a calm, repeatable business asset — platform, marketing, and catalog stay connected.",
  },
});

/** 212 — Course Creator Business Blueprint */
export const BUSINESS_BLUEPRINT_COURSE_CREATOR = businessBlueprint({
  blueprintId: COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Course Creator Business",
  description:
    "Validate, design, launch, deliver, improve, and scale learning experiences with clear outcomes, sustainable production, and honest enrollment.",
  intendedUse:
    "Experts building digital or live learning products — not a generic membership or content calendar alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Course Business Foundation", role: "required" },
    { id: "learner_demand_validation", title: "Learner and Demand Validation", role: "required" },
    { id: "course_model", title: "Course Model Selection", role: "required" },
    { id: "learning_outcomes", title: "Learning Outcome Architecture", role: "required" },
    { id: "curriculum_sequence", title: "Curriculum and Sequence", ...depthGuided },
    { id: "content_production", title: "Content Production", ...depthGuided },
    { id: "student_experience", title: "Student Experience", ...depthGuided },
    { id: "pricing", title: "Pricing and Packaging", role: "required" },
    { id: "course_enrollment", title: "Marketing and Enrollment", ...depthGuided },
    { id: "course_delivery_ops", title: "Delivery Operations", ...depthGuided },
    { id: "course_measurement", title: "Measurement and Improvement", ...depthComplete },
    { id: "course_portfolio_growth", title: "Course Portfolio Growth", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What course are you building, and what transformation should learners leave with?",
      lowerFrictionPrompt: "What course business are you building?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "course"],
      materialChangeNextStep: true,
    },
    {
      id: "q_learner",
      prompt: "Who is the learner, and what evidence do you have that they want this?",
      lowerFrictionPrompt: "Who is this course for?",
      sectionId: "learner_demand_validation",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["learner", "demand", "validation"],
      materialChangeNextStep: true,
    },
    {
      id: "q_model",
      prompt: "Is this self-paced, live cohort, hybrid, or something else?",
      lowerFrictionPrompt: "How will people take the course?",
      sectionId: "course_model",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["course_model", "delivery"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for your course business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_opportunity", title: "Write course opportunity statement", sectionId: "purpose_vision" },
    { id: "t_validate", title: "List demand validation steps", sectionId: "learner_demand_validation" },
    { id: "t_outcomes", title: "Define observable learning outcomes", sectionId: "learning_outcomes" },
    { id: "t_pricing", title: "Choose pricing and package shape", sectionId: "pricing" },
    {
      id: "t_curriculum",
      title: "Sketch module sequence",
      sectionId: "curriculum_sequence",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_validated", title: "Demand validation started" },
    { id: "m_outcomes", title: "Outcomes clear" },
    {
      id: "m_curriculum",
      title: "Curriculum map drafted",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Validation before full production",
    "Accessibility in content production",
    "Completion support after enrollment",
    "Refund and support load in pricing",
    "Measurement beyond vanity enrollment",
  ],
  riskPrompts: [
    "What if production outruns validated demand?",
    "What if learners enroll but never complete?",
    "What if support load collapses capacity?",
  ],
  researchPrompts: [
    "Compare cohort versus evergreen tradeoffs",
    "Find completion-support patterns",
    "Review ethical enrollment language",
  ],
  deliverables: [
    "Course Creator Business Plan",
    "Course Opportunity Statement",
    "Learner Profile",
    "Course Model Comparison",
    "Learning Outcome Map",
    "Curriculum Map",
    "Content Production Plan",
    "Course Pricing Model",
    "Enrollment Strategy",
    "Course KPI Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "learning",
    "marketing",
    "sales",
    "finance",
    "content",
    "creative-studio",
    "client-relationships",
    "events",
    "data-analytics",
    "project-management",
  ],
  boardReviewRecommendations: [
    "demand validation",
    "learning outcomes",
    "pricing",
    "completion support",
  ],
  projectBridgeRecommendations: [
    "Bridge content production when filming or writing begins",
    "Bridge cohort delivery tasks when a start date is set",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "related_to",
      note: "Membership or content businesses may support courses without merging Work IDs",
    },
  ],
  completionCriteria: [
    "Course opportunity captured",
    "Learner and validation framed",
    "Course model named",
    "Outcomes defined",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    collectionOwner: "Learning Intelligence / Course Creator Business Collection",
    successModel:
      "Courses produce real learner outcomes without exhausting the creator.",
  },
});

/** 213 — Membership Business Blueprint */
export const BUSINESS_BLUEPRINT_MEMBERSHIP = businessBlueprint({
  blueprintId: MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Membership Business",
  description:
    "Create, operate, retain, and grow a membership that delivers recurring value without overwhelming the owner or members.",
  intendedUse:
    "Founders building community, education, accountability, or resource memberships — not a one-time course launch alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Membership Purpose", role: "required" },
    { id: "member_profile_fit", title: "Member Profile and Fit", role: "required" },
    { id: "membership_model", title: "Membership Model", role: "required" },
    { id: "value_architecture", title: "Value Architecture", role: "required" },
    { id: "pricing", title: "Pricing and Economics", role: "required" },
    { id: "member_onboarding", title: "Onboarding and Activation", ...depthGuided },
    { id: "membership_rhythm", title: "Content and Experience Rhythm", ...depthGuided },
    { id: "community_health", title: "Community Health", ...depthGuided },
    { id: "retention_renewal", title: "Retention and Renewal", ...depthGuided },
    { id: "membership_growth", title: "Marketing and Enrollment", ...depthGuided },
    { id: "membership_operations", title: "Operations", ...depthComplete },
    { id: "membership_measurement", title: "Measurement and Improvement", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What ongoing need does this membership serve, and for whom?",
      lowerFrictionPrompt: "What is this membership for?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "membership"],
      materialChangeNextStep: true,
    },
    {
      id: "q_member",
      prompt: "Who is a strong member fit — and who should not join?",
      lowerFrictionPrompt: "Who is this membership for?",
      sectionId: "member_profile_fit",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["member", "fit", "non_fit"],
      materialChangeNextStep: true,
    },
    {
      id: "q_model",
      prompt: "Is this community, education, accountability, library, mastermind, or hybrid?",
      lowerFrictionPrompt: "What kind of membership is it?",
      sectionId: "membership_model",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["membership_model", "model"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for your membership business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_promise", title: "Write membership promise", sectionId: "purpose_vision" },
    { id: "t_fit", title: "List fit and non-fit signals", sectionId: "member_profile_fit" },
    { id: "t_value", title: "Name recurring value pillars", sectionId: "value_architecture" },
    { id: "t_pricing", title: "Choose pricing and tier shape", sectionId: "pricing" },
    {
      id: "t_activation",
      title: "Design first-win onboarding",
      sectionId: "member_onboarding",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_promise", title: "Membership promise clear" },
    { id: "m_value", title: "Value pillars named" },
    {
      id: "m_onboarding",
      title: "Activation journey drafted",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Recurring value over content volume",
    "First win in the first 30 days",
    "Owner capacity and rest periods",
    "Ethical cancellation and pause options",
    "Churn and support load in economics",
  ],
  riskPrompts: [
    "What if content volume burns you out?",
    "What if members join but never activate?",
    "What if retention depends on pressure instead of value?",
  ],
  researchPrompts: [
    "Compare membership models for this audience",
    "Find gentle retention and win-back patterns",
    "Review moderation and community health practices",
  ],
  deliverables: [
    "Membership Business Plan",
    "Membership Promise",
    "Member Profile",
    "Membership Model Comparison",
    "Value Pillars",
    "Membership Pricing Model",
    "Member Onboarding",
    "Membership Operating Calendar",
    "Retention System",
    "Membership Health Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "client-relationships",
    "learning",
    "events",
    "marketing",
    "sales",
    "finance",
    "leadership",
    "content",
    "data-analytics",
    "project-management",
  ],
  boardReviewRecommendations: [
    "recurring value",
    "activation",
    "retention economics",
    "owner capacity",
  ],
  projectBridgeRecommendations: [
    "Bridge launch or founding-member campaign tasks when enrollment opens",
    "Keep Create as source of truth for membership design",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "related_to",
      note: "Courses or content businesses may feed membership without merging Work",
    },
  ],
  completionCriteria: [
    "Membership purpose captured",
    "Member fit framed",
    "Model chosen",
    "Value pillars named",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    collectionOwner: "Business Intelligence / Membership Business Collection",
    successModel:
      "Membership feels valuable and sustainable — activation and retention without overwhelm.",
  },
});

/** 214 — Content Creator Business Blueprint */
export const BUSINESS_BLUEPRINT_CONTENT_CREATOR = businessBlueprint({
  blueprintId: CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Content Creator Business",
  description:
    "Build a sustainable content business through positioning, publishing rhythm, audience growth, monetization, partnerships, and performance learning.",
  intendedUse:
    "Creators for whom content is a business or a primary growth channel — not a one-off marketing plan document.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Creator Position", role: "required" },
    { id: "creator_audience", title: "Audience Architecture", role: "required" },
    { id: "content_pillars", title: "Content Pillars and Formats", role: "required" },
    { id: "platform_strategy", title: "Platform Strategy", role: "required" },
    { id: "content_production_system", title: "Production System", ...depthGuided },
    { id: "audience_growth", title: "Audience Growth", ...depthGuided },
    { id: "trust_relationship", title: "Trust and Relationship", ...depthGuided },
    { id: "creator_monetization", title: "Monetization", ...depthGuided },
    { id: "sponsorship_partnerships", title: "Sponsorship and Partnerships", ...depthComplete },
    { id: "creator_analytics", title: "Analytics and Learning", ...depthComplete },
    { id: "content_asset_library", title: "Content Asset Library", ...depthComplete },
    { id: "creator_operations", title: "Creator Operations", ...depthComplete },
    { id: "pricing", title: "Revenue and Stewardship", role: "required" },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "Is content your primary business, or a channel that grows another offer?",
      lowerFrictionPrompt: "What content business are you building?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "creator"],
      materialChangeNextStep: true,
    },
    {
      id: "q_audience",
      prompt: "Who is your primary audience — and who buys, sponsors, or partners?",
      lowerFrictionPrompt: "Who is your audience?",
      sectionId: "creator_audience",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "sponsors", "buyers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_pillars",
      prompt: "What content pillars and formats will you return to?",
      lowerFrictionPrompt: "What do you create about?",
      sectionId: "content_pillars",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["pillars", "formats", "topics"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for your content business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_position", title: "Write creator positioning", sectionId: "purpose_vision" },
    { id: "t_pillars", title: "Name three content pillars", sectionId: "content_pillars" },
    { id: "t_platforms", title: "Choose primary and supporting platforms", sectionId: "platform_strategy" },
    { id: "t_rhythm", title: "Set a sustainable publishing rhythm", sectionId: "content_production_system" },
    {
      id: "t_monetize",
      title: "Map monetization pathways",
      sectionId: "creator_monetization",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Creator position clear" },
    { id: "m_rhythm", title: "Publishing rhythm chosen" },
    {
      id: "m_monetize",
      title: "Monetization path named",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Sustainable production capacity",
    "Sponsorship disclosure and brand fit",
    "Audience quality over vanity reach",
    "Repurposing and asset library",
    "Burnout prevention in weekly rhythm",
  ],
  riskPrompts: [
    "What if publishing cadence exceeds capacity?",
    "What if monetization conflicts with audience trust?",
    "What if multi-platform work dilutes quality?",
  ],
  researchPrompts: [
    "Compare platform roles for this niche",
    "Find ethical sponsorship rate practices",
    "Review repurposing workflows that stay simple",
  ],
  deliverables: [
    "Content Creator Business Plan",
    "Creator Positioning",
    "Audience Map",
    "Content Pillar Map",
    "Platform Role Map",
    "Content Production Workflow",
    "Audience Growth Plan",
    "Monetization Map",
    "Media Kit Structure",
    "Creator Operating System",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "content",
    "marketing",
    "sales",
    "finance",
    "creative-studio",
    "data-analytics",
    "client-relationships",
    "project-management",
  ],
  boardReviewRecommendations: [
    "positioning",
    "production capacity",
    "monetization ethics",
    "platform focus",
  ],
  projectBridgeRecommendations: [
    "Bridge series production when a flagship series starts",
    "Keep Create as source of truth for strategy and pillars",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Content may feed courses, memberships, speaking, or services",
    },
  ],
  completionCriteria: [
    "Creator position captured",
    "Audience framed",
    "Pillars and primary platform named",
    "Publishing capacity considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    collectionOwner: "Content Intelligence / Content Creator Business Collection",
    successModel:
      "Content stays sustainable and useful — growth and monetization without burnout or trust erosion.",
    guardrails: [
      "Prefer marketing_plan.simple for a one-off campaign document",
      "Sponsorship disclosures and brand-fit boundaries required when monetizing",
    ],
  },
});

export const CREATOR_KNOWLEDGE_BUSINESS_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_AUTHOR,
    BUSINESS_BLUEPRINT_COURSE_CREATOR,
    BUSINESS_BLUEPRINT_MEMBERSHIP,
    BUSINESS_BLUEPRINT_CONTENT_CREATOR,
  ];

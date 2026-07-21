/**
 * Marketing Plan — domain Blueprint *definitions* only (105).
 * Registered through the Universal Blueprint registry (no private runtime).
 * Do not copy Event Blueprint code — domain-specific content only.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import { MARKETING_PLAN_MAP_GROUPS } from "./marketingPlanMapGroups";

const MARKETING_WORK = [MARKETING_PLAN_WORK_TYPE_ID] as const;

/** Recommended stable Blueprint ID (105). */
export const MARKETING_PLAN_SIMPLE_BLUEPRINT_ID = "marketing_plan.simple" as const;

export const MARKETING_PLAN_BLUEPRINT_IDS = [
  MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
] as const;

type MarketingBlueprintSeed = Omit<
  BlueprintDefinition,
  "compatibleWorkTypeIds" | "supportedDepthModes" | "category"
> & {
  category?: BlueprintDefinition["category"];
};

function groupsForSections(sectionIds: readonly string[]): BlueprintGroup[] {
  const set = new Set(sectionIds);
  return MARKETING_PLAN_MAP_GROUPS.map((g) => ({
    ...g,
    sectionIds: g.sectionIds.filter((id) => set.has(id)),
  })).filter((g) => g.sectionIds.length > 0);
}

function marketingBlueprint(seed: MarketingBlueprintSeed): BlueprintDefinition {
  const sectionIds = seed.sections.map((s) => s.id);
  return {
    ...seed,
    category: seed.category ?? "spark",
    compatibleWorkTypeIds: MARKETING_WORK,
    supportedDepthModes: ALL_BLUEPRINT_DEPTH_MODES,
    groups: seed.groups ?? groupsForSections(sectionIds),
  };
}

const SHARED_HIDDEN = {
  id: "system_work_meta",
  title: "System",
  role: "hidden_system" as const,
};

/**
 * Simple Marketing Plan — first Marketing Blueprint.
 * Quick Start stays light; Guided and Complete add depth without changing Work ID.
 */
export const MARKETING_BLUEPRINT_SIMPLE = marketingBlueprint({
  blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Simple Marketing Plan",
  description:
    "A clear, practical plan for what you are marketing, who it is for, where you will show up, and what to do next.",
  intendedUse:
    "Offers, launches, and steady marketing when you want a useful plan without corporate clutter.",
  complexity: "simple",
  sections: [
    { id: "purpose_outcome", title: "Purpose and Desired Outcome", role: "required" },
    { id: "business_offer", title: "Business and Offer", role: "required" },
    { id: "people_to_reach", title: "People You Want to Reach", role: "required" },
    {
      id: "current_situation",
      title: "Where Things Stand Now",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "positioning_message",
      title: "Positioning and Core Message",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "marketing_goals",
      title: "Marketing Goals",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    { id: "channels", title: "Channels and Places to Show Up", role: "required" },
    {
      id: "content_approach",
      title: "Content and Communication",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "offer_path",
      title: "Offer Path and Calls to Action",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "activity_plan",
      title: "Simple Activity Plan",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "capacity",
      title: "Budget, Time, and Energy",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    { id: "measures", title: "Measures and Signals", role: "required" },
    {
      id: "risks_assumptions",
      title: "Risks, Assumptions, and Gaps",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    { id: "next_actions", title: "Next Actions", role: "required" },
    {
      id: "review_rhythm",
      title: "Review and Improvement Rhythm",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    {
      id: "final_plan",
      title: "Final Plan and Deliverables",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_what_marketing",
      purpose: "Name what is being marketed.",
      whyItMatters:
        "Everything else — audience, channels, message — hangs on a clear offer or idea.",
      examples: [
        "A coaching package for overwhelmed founders",
        "A new online workshop",
        "My book launch",
      ],
      prompt: "What are you marketing?",
      lowerFrictionPrompt: "What are you trying to get in front of people?",
      lowEnergyPrompt: "In a few words — what is this for?",
      promptByDepth: {
        quick_start: "What are you trying to get in front of people?",
        guided_build:
          "What offer, product, or idea are we building this marketing plan around?",
        complete_planning:
          "What exactly are we marketing, and how does it connect to the business outcome you care about most?",
      },
      sectionId: "business_offer",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["offer", "product", "business_offer", "what_marketing"],
      materialChangeNextStep: true,
      dontKnowBehavior:
        "Invite a rough label — even 'my main service' is enough to start.",
      skipBehavior: "Recoverable; return before final plan assembly.",
      postponeBehavior: "Allowed only when known context already names an offer.",
      followUpRules: "If vague, ask one clarifying example — not a full interview.",
      sectionsAffected: ["business_offer", "purpose_outcome", "positioning_message"],
      deliverablesAffected: ["concise Marketing Plan", "audience and message summary"],
      tasksAffected: ["t_clarify_offer"],
      researchOpportunities: ["Comparable offers in this niche"],
    },
    {
      id: "q_who_for",
      purpose: "Name the primary people to reach.",
      whyItMatters:
        "One clear primary audience usually beats trying to speak to everyone.",
      examples: [
        "ADHD entrepreneurs who sell services",
        "Local business owners near me",
        "Past clients who might refer",
      ],
      prompt: "Who is this mainly for?",
      lowerFrictionPrompt: "Who do you most want to reach?",
      lowEnergyPrompt: "Who is this for, roughly?",
      promptByDepth: {
        quick_start: "Who do you most want to reach?",
        guided_build:
          "Who is the primary person this should feel written for — and what are they hoping for?",
        complete_planning:
          "Who is the primary audience, what situation are they in, and who can wait for a later plan?",
      },
      sectionId: "people_to_reach",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "ideal_client", "people_to_reach"],
      materialChangeNextStep: true,
      dontKnowBehavior: "Offer 2–3 example audiences from known business context.",
      skipBehavior: "Recoverable; channel advice stays cautious until answered.",
      sectionsAffected: ["people_to_reach", "positioning_message", "channels"],
      deliverablesAffected: ["audience and message summary", "channel plan"],
      tasksAffected: ["t_audience_sketch"],
      researchOpportunities: [
        "Where this audience already spends attention",
        "Language they use for the problem",
      ],
    },
    {
      id: "q_main_outcome",
      purpose: "Connect marketing to a real business outcome.",
      whyItMatters: "Activity without an outcome becomes busywork.",
      examples: [
        "Book 5 discovery calls this month",
        "Fill the next cohort",
        "Get 20 warm replies from past clients",
      ],
      prompt: "What would a good outcome look like?",
      lowerFrictionPrompt: "What would 'this is helping' look like?",
      lowEnergyPrompt: "What do you hope happens if this works?",
      promptByDepth: {
        quick_start: "What would 'this is helping' look like?",
        guided_build:
          "What business outcome should this plan support in the next stretch of time?",
        complete_planning:
          "What outcome matters most, how will you recognize progress, and what would tell you to adjust?",
      },
      sectionId: "purpose_outcome",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["desired_outcome", "goal", "purpose_outcome"],
      materialChangeNextStep: true,
      sectionsAffected: ["purpose_outcome", "marketing_goals", "measures"],
      deliverablesAffected: ["concise Marketing Plan", "measurement plan"],
      tasksAffected: ["t_define_success_signal"],
    },
    {
      id: "q_primary_channel",
      purpose: "Choose one realistic primary place to show up.",
      whyItMatters:
        "Channels should have roles; starting with one primary channel reduces overload.",
      examples: [
        "Email to my existing list",
        "LinkedIn posts twice a week",
        "Warm outreach to past clients",
      ],
      prompt: "Where is the most realistic place to show up first?",
      lowerFrictionPrompt: "Where will you actually show up first?",
      lowEnergyPrompt: "One place you can show up without burning out?",
      promptByDepth: {
        quick_start: "Where will you actually show up first?",
        guided_build:
          "Which channel should lead, and what role might a second channel play later?",
        complete_planning:
          "Which channel leads, which support, and which are explicitly not now?",
      },
      sectionId: "channels",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["primary_channel", "channels"],
      materialChangeNextStep: true,
      sectionsAffected: ["channels", "content_approach", "activity_plan"],
      deliverablesAffected: ["channel plan", "simple activity calendar"],
      tasksAffected: ["t_choose_primary_channel"],
      researchOpportunities: ["Where similar audiences gather"],
    },
    {
      id: "q_next_actions",
      purpose: "Turn the plan into a few visible next steps.",
      whyItMatters: "A plan only helps when the next actions are small and clear.",
      examples: [
        "Draft one email to past clients",
        "Write three post ideas",
        "Update the offer landing line",
      ],
      prompt: "What are the next few actions?",
      lowerFrictionPrompt: "What are 2–3 things you could do next?",
      lowEnergyPrompt: "What's the smallest next step?",
      promptByDepth: {
        quick_start: "What are 2–3 things you could do next?",
        guided_build:
          "What are the next actions, in order, that would make this plan real?",
        complete_planning:
          "What are the sequenced next actions, owners if any, and what can wait in the Parking Lot?",
      },
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_actions"],
      materialChangeNextStep: true,
      sectionsAffected: ["next_actions", "activity_plan"],
      deliverablesAffected: ["one-page action plan", "task list"],
      tasksAffected: ["t_first_outreach", "t_draft_message"],
    },
    {
      id: "q_success_signal",
      purpose: "Define a simple way to tell whether the plan is helping.",
      whyItMatters: "Measurement should connect to decisions, not vanity noise.",
      examples: [
        "Number of replies",
        "Booked conversations",
        "Whether I showed up consistently for two weeks",
      ],
      prompt: "How will you tell whether this is helping?",
      lowerFrictionPrompt: "What's one simple signal you'll watch?",
      lowEnergyPrompt: "How will you know it's worth continuing?",
      promptByDepth: {
        quick_start: "What's one simple signal you'll watch?",
        guided_build:
          "What signal will tell you this is helping — and what would tell you to change course?",
        complete_planning:
          "What will you measure, how often will you review, and what decision each signal should support?",
      },
      sectionId: "measures",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["success_signal", "measures"],
      materialChangeNextStep: false,
      postponable: true,
      sectionsAffected: ["measures", "review_rhythm"],
      deliverablesAffected: ["measurement plan"],
      tasksAffected: ["t_define_success_signal"],
    },
    {
      id: "q_core_message",
      purpose: "Shape a clear message of relevance and difference.",
      whyItMatters:
        "Positioning should clarify why this matters to the right people.",
      examples: [
        "Help for founders who need calm structure, not hustle noise",
        "A workshop that turns overwhelm into one clear week",
      ],
      prompt: "What should people understand about this?",
      lowerFrictionPrompt: "What's the one thing you want them to get?",
      promptByDepth: {
        guided_build:
          "What should the right person understand about why this is for them?",
        complete_planning:
          "What is the core message, how does it differ from nearby alternatives, and where might it confuse?",
      },
      sectionId: "positioning_message",
      requiredInModes: ["guided_build", "complete_planning"],
      dependencies: ["q_what_marketing", "q_who_for"],
      knownContextKeys: ["core_message", "positioning"],
      materialChangeNextStep: true,
      postponable: true,
      sectionsAffected: ["positioning_message", "content_approach", "offer_path"],
      deliverablesAffected: ["audience and message summary"],
      researchOpportunities: ["Competitor or alternative messaging patterns"],
    },
    {
      id: "q_capacity",
      purpose: "Match activity to real budget, time, and energy.",
      whyItMatters: "Consistency must be realistic or the plan will collapse.",
      examples: [
        "Two hours a week",
        "No paid ads yet",
        "I can only do async outreach this month",
      ],
      prompt: "What capacity do you actually have for this?",
      lowerFrictionPrompt: "How much time or energy can this take?",
      lowEnergyPrompt: "What amount of marketing feels doable right now?",
      promptByDepth: {
        complete_planning:
          "What budget, time, and energy can this take — and what should we deliberately not commit to?",
      },
      sectionId: "capacity",
      requiredInModes: ["complete_planning"],
      knownContextKeys: ["capacity", "budget", "energy"],
      materialChangeNextStep: true,
      postponable: true,
      sectionsAffected: ["capacity", "activity_plan", "channels"],
      deliverablesAffected: ["simple activity calendar", "detailed Marketing Plan"],
      tasksAffected: ["t_trim_channel_list"],
    },
    {
      id: "q_risks",
      purpose: "Surface assumptions and what may be missing.",
      whyItMatters: "Visible risks keep the plan adaptable instead of brittle.",
      examples: [
        "Assuming my list still opens email",
        "Not sure the offer price feels right",
        "I might overbuild content before talking to anyone",
      ],
      prompt: "What might go wrong, or what are we assuming?",
      promptByDepth: {
        complete_planning:
          "What assumptions are we making, what might be missing, and what is worth a small test first?",
      },
      sectionId: "risks_assumptions",
      requiredInModes: ["complete_planning"],
      knownContextKeys: ["risks", "assumptions"],
      materialChangeNextStep: false,
      postponable: true,
      sectionsAffected: ["risks_assumptions", "review_rhythm"],
      deliverablesAffected: ["assumptions and risks", "review checklist"],
      researchOpportunities: ["What might I be missing in this market?"],
    },
  ],
  suggestedTasks: [
    {
      id: "t_clarify_offer",
      title: "Write a one-line offer description",
      sectionId: "business_offer",
    },
    {
      id: "t_audience_sketch",
      title: "Sketch the primary audience in plain language",
      sectionId: "people_to_reach",
    },
    {
      id: "t_choose_primary_channel",
      title: "Confirm the primary channel for the next two weeks",
      sectionId: "channels",
    },
    {
      id: "t_draft_message",
      title: "Draft the core message in everyday words",
      sectionId: "positioning_message",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "t_first_outreach",
      title: "Complete the first outreach or publish action",
      sectionId: "next_actions",
    },
    {
      id: "t_define_success_signal",
      title: "Write down the one signal you'll review",
      sectionId: "measures",
    },
    {
      id: "t_trim_channel_list",
      title: "Cut channels that exceed capacity",
      sectionId: "capacity",
      depthModes: ["complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_first_plan", title: "Useful first plan drafted" },
    {
      id: "m_message_clear",
      title: "Core message clear enough to use",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "m_implementation_ready",
      title: "Implementation ready with tasks sequenced",
      depthModes: ["complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "One primary audience (not everyone)",
    "A realistic channel load for current energy",
    "A clear next action this week",
    "A simple success signal tied to a decision",
    "Permission to keep Parking Lot ideas out of the active plan",
    "A review date so the plan can adapt",
  ],
  riskPrompts: [
    "Are we trying to speak to everyone and landing with no one?",
    "Does the activity list exceed the time and energy available?",
    "Are we measuring vanity instead of decisions?",
    "Is the offer clear enough that a stranger would know what to do next?",
  ],
  researchPrompts: [
    "Where do people like this already spend attention?",
    "What language do they use for the problem this offer solves?",
    "What nearby alternatives might they compare this to?",
    "What might I be missing before I commit to a channel?",
    "What simple measurement approaches fit this capacity?",
  ],
  deliverables: [
    "concise Marketing Plan",
    "detailed Marketing Plan",
    "one-page action plan",
    "audience and message summary",
    "channel plan",
    "simple activity calendar",
    "task list",
    "milestone view",
    "measurement plan",
    "assumptions and risks",
    "review checklist",
    "print/export output",
  ],
  chamberRoutingRecommendations: [
    "marketing",
    "strategy",
    "content",
    "creative-studio",
    "sales",
    "client-relationships",
    "finance",
    "data-analytics",
    "ai-technology",
    "events",
    "project-management",
  ],
  boardReviewRecommendations: [
    "Whole Marketing Plan readiness",
    "Audience decision",
    "Positioning clarity",
    "Budget and capacity fit",
    "Channel choice",
    "Risk and assumptions",
    "Implementation readiness",
    "Measurement approach",
  ],
  projectBridgeRecommendations: [
    "Create Project when implementation tasks begin",
    "Link existing Project for launch or campaign execution",
    "Sync approved tasks and milestones — keep plan content on the Work item",
  ],
  cartographyRelationshipRecommendations: [
    { relationship: "supports", note: "Supports a business goal" },
    { relationship: "informs", note: "Markets an offer or campaign" },
    { relationship: "depends_on", note: "Depends on an audience decision" },
    { relationship: "related_to", note: "Connected to content, event, or sales work" },
    { relationship: "part_of", note: "Part of a growth strategy" },
  ],
  completionCriteria: [
    "Offer and primary audience are clear enough to guide choices",
    "Desired outcome connects to a business result",
    "Primary channel matches capacity",
    "Next actions are visible and small enough to start",
    "At least one success signal is defined (Quick Start+)",
    "Guided+: message and activity sequencing support implementation",
    "Complete: risks, capacity, and review rhythm are visible",
  ],
  certificationRules: [
    "marketing_plan.foundation",
    "marketing_plan.map",
    "marketing_plan.depth",
    "marketing_plan.anywhere_origin",
  ],
  domainExtensions: {
    peopleAndRoles: [
      "Member (owner)",
      "Marketing Intelligence (Chamber lead)",
      "Optional Project owner for execution",
    ],
    budgetConsiderations: [
      "Paid channels only when capacity and offer clarity exist",
      "Time and energy count as real budget",
      "Prefer consistent small actions over expensive bursts",
    ],
    timelineRecommendations: [
      "Day 1: clarify offer, audience, outcome",
      "Week 1: choose primary channel and first actions",
      "Week 2: review the success signal and adjust",
      "Monthly: review rhythm for Complete Planning",
    ],
    communications: [
      "Core message",
      "Primary call to action",
      "Follow-up for warm contacts",
    ],
    followUpRequirements: [
      "Review whether the plan is helping before adding channels",
      "Keep Parking Lot ideas separate from active commitments",
    ],
    domainIntelligencePrinciples: [
      "Goals must connect to business outcomes",
      "Audience understanding should be specific enough to guide choices",
      "One clear primary audience is often better than speaking to everyone",
      "Positioning should clarify relevance and difference",
      "Channels should have distinct roles",
      "Activity should match capacity",
      "Consistency must be realistic",
      "Measurement should connect to decisions",
      "Plans should include testing and learning",
      "Implementation should be sequenced",
      "Risks and assumptions should be visible",
      "The plan should remain adaptable",
    ],
    adhdSupportAdaptations: [
      "Avoid demanding every answer up front",
      "Offer one helpful next step",
      "Support low-energy wording",
      "Distinguish ideas from commitments",
      "Reduce channel overload",
      "Prevent overbuilding",
      "Surface the smallest useful plan",
      "Allow I don't know, skip, and return",
      "Support Body Doubling on section or task focus",
      "No shame-based language",
    ],
    shariModes: ["talk_only", "work_on_this"],
    bodyDoublingTargets: ["whole_plan", "active_section", "task", "milestone"],
    researchModes: [
      "Quick Check",
      "Compare Options",
      "Deep Research",
      "Use Existing Knowledge",
      "What Might I Be Missing?",
    ],
    researchAttachTargets: [
      "audience",
      "competitors_or_alternatives",
      "channels",
      "communities",
      "content_themes",
      "pricing_context",
      "partnerships",
      "events",
      "tools",
      "trends",
      "examples",
      "measurement_approaches",
    ],
    completionStates: [
      "started",
      "in_progress",
      "ready_for_review",
      "implementation_ready",
      "active",
      "under_review",
      "updated",
      "complete",
      "archived",
    ],
  },
});

export const MARKETING_PLAN_BLUEPRINT_DEFINITIONS: readonly BlueprintDefinition[] =
  [MARKETING_BLUEPRINT_SIMPLE];

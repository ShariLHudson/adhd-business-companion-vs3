/**
 * Facebook Community — domain Blueprint *definitions* only (587–598).
 * Registered through the Universal Blueprint registry (no private runtime).
 * Do not copy Event or Marketing Plan Blueprint code — domain-specific content only.
 *
 * Source pack: docs/create-experience/facebook-community-587-598/
 * 587 Master Spec · 588 Strategy/Positioning · 589 Naming/Brand/Banner ·
 * 590 Setup/Privacy/Admin · 591 Welcome/Onboarding · 592 Content/Programming ·
 * 593 Launch/First 100 · 594 Growth/Retention/Referral ·
 * 595 Moderation/Safety/Governance · 596 Analytics/Health ·
 * 597 Runtime/Routing/Testing · 598 Cursor Manifest/Handoff.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { FACEBOOK_COMMUNITY_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/facebookCommunityMap";
import { FACEBOOK_COMMUNITY_MAP_GROUPS } from "./facebookCommunityMapGroups";

const FACEBOOK_COMMUNITY_WORK = [FACEBOOK_COMMUNITY_WORK_TYPE_ID] as const;

/** Recommended stable Blueprint ID (587–598). */
export const FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID =
  "facebook_community.simple" as const;

export const FACEBOOK_COMMUNITY_BLUEPRINT_IDS = [
  FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
] as const;

type FacebookCommunityBlueprintSeed = Omit<
  BlueprintDefinition,
  "compatibleWorkTypeIds" | "supportedDepthModes" | "category"
> & {
  category?: BlueprintDefinition["category"];
};

function groupsForSections(sectionIds: readonly string[]): BlueprintGroup[] {
  const set = new Set(sectionIds);
  return FACEBOOK_COMMUNITY_MAP_GROUPS.map((g) => ({
    ...g,
    sectionIds: g.sectionIds.filter((id) => set.has(id)),
  })).filter((g) => g.sectionIds.length > 0);
}

function facebookCommunityBlueprint(
  seed: FacebookCommunityBlueprintSeed,
): BlueprintDefinition {
  const sectionIds = seed.sections.map((s) => s.id);
  return {
    ...seed,
    category: seed.category ?? "spark",
    compatibleWorkTypeIds: FACEBOOK_COMMUNITY_WORK,
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
 * Simple Facebook Community — first Facebook Community Blueprint.
 * Quick Start covers idea → positioning → name → setup → welcome → launch.
 * Guided and Complete add brand, content, moderation, growth, and analytics
 * depth without changing Work ID (587 Explicit Create rule — never begins,
 * saves, or converts to a Project until the member intentionally chooses).
 */
export const FACEBOOK_COMMUNITY_BLUEPRINT_SIMPLE = facebookCommunityBlueprint({
  blueprintId: FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Facebook Community",
  description:
    "A guided path from an early idea to a positioned, branded, configured, launched, and growing Facebook group — not a post generator.",
  intendedUse:
    "Client, lead, peer, learning, paid, local, or interest communities built as a real Facebook group, from foundation through operations.",
  complexity: "complex",
  sections: [
    { id: "purpose_and_audience", title: "Purpose and Who It's For", role: "required" },
    {
      id: "positioning_and_promise",
      title: "Positioning and Promise",
      role: "required",
    },
    {
      id: "community_type_and_capacity",
      title: "Community Type and Founder Capacity",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    { id: "naming_and_tagline", title: "Name and Tagline", role: "required" },
    {
      id: "brand_and_banner",
      title: "Brand, Banner, and Profile Image",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "setup_privacy_and_visibility",
      title: "Setup, Privacy, and Visibility",
      role: "required",
    },
    {
      id: "membership_questions_and_rules",
      title: "Membership Questions and Rules",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "roles_and_moderation_setup",
      title: "Roles, Permissions, and Automation",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    {
      id: "welcome_and_onboarding",
      title: "Welcome and Onboarding Kit",
      role: "required",
    },
    {
      id: "first_week_journey",
      title: "First Week Journey",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "content_pillars_and_programming",
      title: "Content Pillars and Programming",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "content_calendar",
      title: "Content Calendar",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    { id: "launch_plan", title: "Launch Plan", role: "required" },
    {
      id: "first_100_members",
      title: "First 100 Members",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "guided_build" },
    },
    {
      id: "growth_and_referral",
      title: "Growth and Referral System",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    {
      id: "retention_and_reengagement",
      title: "Retention and Re-engagement",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    {
      id: "moderation_and_safety",
      title: "Moderation, Safety, and Governance",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    {
      id: "analytics_and_health",
      title: "Analytics and Community Health",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    {
      id: "operating_manual",
      title: "Community Operating Manual",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    {
      id: "project_handoff",
      title: "Create-to-Project Handoff",
      role: "optional",
      condition: { kind: "depth_at_least", mode: "complete_planning" },
    },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_community_purpose",
      purpose: "Name who the community serves and why it should exist.",
      whyItMatters:
        "Everything else — name, setup, content, moderation — hangs on a clear purpose and audience (588).",
      examples: [
        "Past clients who want ongoing support after a program ends",
        "Local business owners who want to help each other",
        "People learning the same skill and cheering each other on",
      ],
      prompt: "What is this community for, and who is it for?",
      lowerFrictionPrompt: "Who would this group be for, roughly?",
      lowEnergyPrompt: "In a sentence — who is this for?",
      promptByDepth: {
        quick_start: "Who would this group be for, roughly?",
        guided_build:
          "Who is this community for, and what do they share — a stage, a goal, or a problem?",
        complete_planning:
          "Who is this for, what do they share, and what would tell you the group is not the right fit for someone?",
      },
      sectionId: "purpose_and_audience",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "ideal_client", "community_purpose"],
      materialChangeNextStep: true,
      dontKnowBehavior:
        "Offer 2–3 example communities drawn from known business context.",
      skipBehavior: "Recoverable; positioning stays cautious until answered.",
      followUpRules: "If vague, ask one clarifying example — not a full interview.",
      sectionsAffected: [
        "purpose_and_audience",
        "positioning_and_promise",
        "naming_and_tagline",
      ],
      deliverablesAffected: ["Community Foundation Brief"],
      tasksAffected: ["t_write_foundation_brief"],
      researchOpportunities: ["Where this audience already gathers online"],
    },
    {
      id: "q_promise",
      purpose: "Name the credible promise members can count on.",
      whyItMatters:
        "A promise that is relevant, credible, and member-centered protects trust (588 Promise quality test).",
      examples: [
        "A place to ask questions without feeling behind",
        "Weekly accountability without pressure",
        "Direct access to the founder a few times a month",
      ],
      prompt: "What should members be able to count on this group for?",
      lowerFrictionPrompt: "What would members come here to get?",
      promptByDepth: {
        guided_build:
          "What does this group help members do, learn, or feel — and how is that different from nearby alternatives?",
        complete_planning:
          "What is the promise, how is it different from alternatives, and is it realistic for your current capacity?",
      },
      sectionId: "positioning_and_promise",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["promise", "positioning"],
      materialChangeNextStep: true,
      sectionsAffected: ["positioning_and_promise", "naming_and_tagline"],
      deliverablesAffected: ["Community Foundation Brief"],
      researchOpportunities: ["Comparable communities and how they position themselves"],
    },
    {
      id: "q_community_type",
      purpose: "Name the community type and realistic founder capacity.",
      whyItMatters:
        "Type and capacity shape everything downstream — moderation load, content rhythm, and growth pace (588 Founder capacity check).",
      examples: [
        "Paid membership community, a few hours a week",
        "Free lead-nurture group, light-touch",
        "Private client group tied to an existing program",
      ],
      prompt:
        "What kind of community is this, and how much time can you realistically give it each week?",
      lowerFrictionPrompt: "What kind of group is this, roughly?",
      promptByDepth: {
        guided_build:
          "What kind of community is this — lead nurture, paid, peer, client, or something else — and how much time can it realistically get each week?",
        complete_planning:
          "What kind of community is this, who moderates, and what would make room for this work sustainably?",
      },
      sectionId: "community_type_and_capacity",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["community_type", "capacity"],
      materialChangeNextStep: true,
      postponable: true,
      sectionsAffected: [
        "community_type_and_capacity",
        "content_pillars_and_programming",
        "roles_and_moderation_setup",
      ],
      deliverablesAffected: ["Community Foundation Brief"],
      tasksAffected: ["t_confirm_capacity"],
    },
    {
      id: "q_name_direction",
      purpose: "Move toward a usable name and tagline.",
      whyItMatters:
        "A clear, credible name (not clever-but-confusing) helps the right people recognize the group (589 naming patterns and scoring).",
      examples: [
        "Already have a name in mind",
        "Want a shortlist to react to",
        "Want Spark to suggest options from the promise and audience",
      ],
      prompt: "Do you already have a name in mind, or should we explore a few together?",
      lowerFrictionPrompt: "Got a name in mind, or want a few options?",
      promptByDepth: {
        complete_planning:
          "Do you have a name in mind, and how should it hold up over time as the community grows or changes?",
      },
      sectionId: "naming_and_tagline",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["community_name", "tagline"],
      materialChangeNextStep: true,
      sectionsAffected: ["naming_and_tagline", "brand_and_banner"],
      deliverablesAffected: ["Naming Workbook"],
      tasksAffected: ["t_shortlist_names"],
    },
    {
      id: "q_privacy_choice",
      purpose: "Choose the privacy and visibility setup deliberately.",
      whyItMatters:
        "Privacy changes can be restricted or irreversible on Facebook — this decision deserves care before setup (590 Privacy safeguard).",
      examples: [
        "Public — discoverability matters",
        "Private, visible — member-only content, still discoverable",
        "Private, hidden — invitation-based, paid, or sensitive community",
      ],
      prompt:
        "Should this group be public, private and visible, or private and hidden?",
      lowerFrictionPrompt: "Public, or more private?",
      promptByDepth: {
        guided_build:
          "Given who this is for, should the group be public, private and visible, or private and hidden — and why?",
        complete_planning:
          "What privacy and visibility fit best, and have you confirmed current Meta rules before treating this as final?",
      },
      sectionId: "setup_privacy_and_visibility",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["privacy_choice"],
      materialChangeNextStep: true,
      sectionsAffected: [
        "setup_privacy_and_visibility",
        "membership_questions_and_rules",
      ],
      deliverablesAffected: ["Setup Workbook"],
      tasksAffected: ["t_choose_privacy"],
      researchOpportunities: ["Current Meta Group privacy and visibility rules"],
    },
    {
      id: "q_welcome_plan",
      purpose: "Shape what a brand-new member sees and feels first.",
      whyItMatters:
        "First impressions set the tone for belonging and participation (591 Welcome kit / Start Here structure).",
      examples: [
        "A warm welcome message and a pinned Start Here post",
        "A short welcome video",
        "An introduction prompt on arrival",
      ],
      prompt:
        "What should a brand-new member see and feel in their first few minutes here?",
      lowerFrictionPrompt: "What's the first thing a new member should see?",
      promptByDepth: {
        complete_planning:
          "What should a new member see, feel, and do in their first week — without creating posting pressure for you?",
      },
      sectionId: "welcome_and_onboarding",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["welcome_plan"],
      materialChangeNextStep: true,
      sectionsAffected: ["welcome_and_onboarding", "first_week_journey"],
      deliverablesAffected: ["Welcome Kit"],
      tasksAffected: ["t_draft_welcome_post"],
    },
    {
      id: "q_launch_seed",
      purpose: "Identify the first trusted people to invite.",
      whyItMatters:
        "A relevant seed group establishes tone before a wider launch (593 Stage 1 — Seed).",
      examples: [
        "Current or past clients",
        "Warm subscribers or followers",
        "A handful of peers who understand the mission",
      ],
      prompt: "Who are the first people you'd invite to help set the tone?",
      lowerFrictionPrompt: "Who would you invite first?",
      promptByDepth: {
        complete_planning:
          "Who are the seed, soft-launch, and public-launch groups, and what channel fits each?",
      },
      sectionId: "launch_plan",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["seed_list", "launch_plan"],
      materialChangeNextStep: true,
      postponable: true,
      sectionsAffected: ["launch_plan", "first_100_members"],
      deliverablesAffected: ["Launch Plan"],
      tasksAffected: ["t_build_seed_list"],
    },
    {
      id: "q_moderation_support",
      purpose: "Name who moderates and how much support exists.",
      whyItMatters:
        "Moderation capacity protects both safety and founder sustainability (590 Team roles; 595 Moderator handbook).",
      examples: [
        "Just me for now",
        "A co-founder or team member helps",
        "A moderator volunteer from the community",
      ],
      prompt: "Who will help moderate, and how much time can they give?",
      promptByDepth: {
        complete_planning:
          "Who moderates, what authority do they have, and what is the escalation path for serious issues?",
      },
      sectionId: "roles_and_moderation_setup",
      requiredInModes: ["complete_planning"],
      knownContextKeys: ["moderation_support"],
      materialChangeNextStep: false,
      postponable: true,
      sectionsAffected: ["roles_and_moderation_setup", "moderation_and_safety"],
      deliverablesAffected: ["Moderator Handbook"],
    },
    {
      id: "q_success_signal",
      purpose: "Define what community health looks like, beyond member count.",
      whyItMatters:
        "Member count is not health — relevance, trust, and peer support matter more (596 Safeguards).",
      examples: [
        "Members helping each other, not just reacting",
        "New members introducing themselves and returning",
        "Fewer unanswered posts over time",
      ],
      prompt: "How will you know this community is actually helping people?",
      lowerFrictionPrompt: "What would tell you this is working?",
      promptByDepth: {
        complete_planning:
          "What will you measure, how often will you review it, and what decision should each signal support?",
      },
      sectionId: "analytics_and_health",
      requiredInModes: ["complete_planning"],
      knownContextKeys: ["success_signal"],
      materialChangeNextStep: false,
      postponable: true,
      sectionsAffected: ["analytics_and_health", "operating_manual"],
      deliverablesAffected: ["Analytics Plan"],
    },
  ],
  suggestedTasks: [
    {
      id: "t_write_foundation_brief",
      title: "Write the Community Foundation Brief",
      sectionId: "purpose_and_audience",
    },
    {
      id: "t_shortlist_names",
      title: "Shortlist 10–20 name candidates",
      sectionId: "naming_and_tagline",
    },
    {
      id: "t_choose_privacy",
      title: "Confirm privacy and visibility choice",
      sectionId: "setup_privacy_and_visibility",
    },
    {
      id: "t_draft_welcome_post",
      title: "Draft the welcome message and Start Here post",
      sectionId: "welcome_and_onboarding",
    },
    {
      id: "t_build_seed_list",
      title: "Build the seed invitation list",
      sectionId: "launch_plan",
    },
    {
      id: "t_write_rules",
      title: "Write community rules and membership questions",
      sectionId: "membership_questions_and_rules",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "t_confirm_capacity",
      title: "Confirm realistic weekly time and moderation capacity",
      sectionId: "community_type_and_capacity",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_foundation_defined", title: "Foundation defined and name selected" },
    {
      id: "m_setup_ready",
      title: "Setup, brand, and welcome kit ready",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "m_launched",
      title: "Community launched with a seed group",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "m_operating",
      title: "Growth, moderation, and analytics rhythms in place",
      depthModes: ["complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "A promise specific enough that a stranger understands why to join",
    "A privacy and visibility choice confirmed against current Meta rules",
    "No more than three membership questions",
    "A welcome moment that does not depend on the founder posting daily",
    "A realistic moderation plan before inviting broadly",
    "A way to tell community health apart from member count and reactions",
    "Permission before treating this as launched or converting it to a Project",
  ],
  riskPrompts: [
    "Are we implying guaranteed growth or results members can't count on?",
    "Would this invite or add people without their consent?",
    "Does anything here read as deceptive engagement or manufactured urgency?",
    "Are we asking for more sensitive information than the group truly needs?",
    "Could wording suggest an upload, post, or invite already happened when it hasn't?",
    "Is the moderation load realistic for the capacity the founder described?",
  ],
  researchPrompts: [
    "Where does this audience already gather online?",
    "What comparable communities exist, and how do they position themselves?",
    "What is Facebook's current Group creation and privacy flow (subject to change)?",
    "What imagery or layout direction fits this audience for the banner brief?",
    "What launch channels does the founder already have warm access to?",
  ],
  deliverables: [
    "Community Foundation Brief",
    "Naming Workbook",
    "Brand & Banner Brief",
    "Setup Workbook",
    "Welcome Kit",
    "Content Calendar",
    "Launch Plan",
    "Growth Plan",
    "Moderator Handbook",
    "Analytics Plan",
    "Operating Manual",
    "Master Blueprint",
  ],
  chamberRoutingRecommendations: [
    "marketing",
    "client-relationships",
    "content",
    "creative-studio",
    "events",
    "project-management",
  ],
  boardReviewRecommendations: [
    "Whole Facebook Community readiness",
    "Positioning and promise clarity",
    "Privacy and setup decision",
    "Launch and seed-group plan",
    "Moderation and safety capacity",
    "Growth plan realism",
    "Analytics and health signals",
  ],
  projectBridgeRecommendations: [
    "Create Project when setup and launch tasks begin",
    "Link existing Project for ongoing community operations",
    "Sync approved tasks and milestones — keep plan content on the Work item",
    "Never auto-convert — Create-to-Project handoff is member-intentional only (587 Explicit Create rule)",
  ],
  cartographyRelationshipRecommendations: [
    { relationship: "supports", note: "Supports a business or growth goal" },
    { relationship: "informs", note: "Informs marketing, content, or events work" },
    { relationship: "depends_on", note: "Depends on an offer or brand decision" },
    {
      relationship: "related_to",
      note: "Connected to Events, Content, or Client Relationships work",
    },
    { relationship: "part_of", note: "Part of a growth or retention strategy" },
  ],
  completionCriteria: [
    "Purpose, audience, and promise are clear enough to guide naming and setup",
    "Name, tagline, and privacy/visibility choice are ready to use",
    "Guided+: brand direction, welcome kit, and launch plan are ready",
    "Complete: moderation, growth, and analytics plans support sustainable operation",
    "Facebook truth contract respected — no claim of a completed upload, post, or invite without verified integration",
  ],
  certificationRules: [
    "facebook_community.foundation",
    "facebook_community.map",
    "facebook_community.depth",
    "facebook_community.anywhere_origin",
  ],
  domainExtensions: {
    peopleAndRoles: [
      "Member (owner)",
      "Marketing Intelligence (Chamber lead — positioning, launch, growth)",
      "Client Relationships Intelligence (belonging, retention, member journey)",
      "Content Intelligence (pillars, programming, calendar)",
      "Creative Studio (banner and visual identity)",
      "Events Intelligence (lives, challenges, workshops)",
      "Optional moderators, content lead, and Project owner for execution",
    ],
    budgetConsiderations: [
      "Time and moderation capacity count as real budget",
      "Paid growth only after positioning and welcome experience are clear",
      "Creative production should match actual founder capacity",
    ],
    timelineRecommendations: [
      "Day 1: clarify purpose, audience, and promise",
      "Week 1: choose name, privacy, and setup; draft welcome kit",
      "Weeks 2–4: seed, soft launch, and public launch toward first 100 members",
      "Monthly: review growth, moderation, and analytics against real signals",
    ],
    communications: [
      "Welcome message and pinned Start Here post",
      "Founding-member invitation",
      "Launch announcement",
      "Re-entry message for members returning after a while",
    ],
    followUpRequirements: [
      "Revisit privacy and visibility choice before scaling invitations",
      "Review moderation load before inviting broadly",
      "Distinguish community health from vanity metrics at every review",
    ],
    domainIntelligencePrinciples: [
      "One meaningful decision at a time",
      "Explain why each decision matters",
      "Recommend without taking control",
      "Never promise growth or guaranteed results",
      "Preserve decisions and support resume; allow skipped sections",
      "Do not force monetization or daily posting",
      "Adapt to client, lead, peer, learning, paid, local, or interest communities",
      "Distinguish community health from vanity metrics",
      "Keep Facebook instructions configurable — features change and vary by group",
      "Never claim an action (upload, post, invite) was completed without verified integration",
      "Preserve privacy warnings — some changes can be restricted or irreversible",
    ],
    adhdSupportAdaptations: [
      "Avoid demanding every answer up front",
      "Offer one helpful next step",
      "Support low-energy wording",
      "Distinguish ideas from commitments",
      "Reduce content and posting-cadence overload",
      "Prevent overbuilding before the first real member arrives",
      "Surface the smallest useful next artifact",
      "Allow I don't know, skip, and return",
      "Support Body Doubling on section or task focus",
      "No shame-based language about member count or posting frequency",
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
      "comparable_communities",
      "platform_features",
      "banner_inspiration",
      "content_pillars",
      "launch_channels",
      "moderation_practices",
      "measurement_approaches",
    ],
    completionStates: [
      "idea-captured",
      "foundation-defined",
      "identity-selected",
      "setup-ready",
      "visual-ready",
      "launch-ready",
      "launched",
      "operating",
      "review-due",
      "paused",
      "archived",
    ],
  },
});

export const FACEBOOK_COMMUNITY_BLUEPRINT_DEFINITIONS: readonly BlueprintDefinition[] =
  [FACEBOOK_COMMUNITY_BLUEPRINT_SIMPLE];

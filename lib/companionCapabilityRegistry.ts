/**
 * Companion Capability Registry — canonical registration for every ecosystem capability.
 *
 * Registry-driven routing replaces ad-hoc feature conditionals where possible.
 * Spec: docs-companion-intelligence/25_Capability_Registration_And_12_10_Readiness.md
 */

import type { AppSection } from "./companionUi";
import type { EmotionalState } from "./companionEmotions";
import type { ActualNeed } from "./companionIntuitiveAwareness";
import type { InterventionBucket } from "./intelligence-layer/interventionRegistry";
import { recordTrustEvidence } from "./intelligence-layer/trustSignals";
import { recordCapabilityLifecycleFromRegistry } from "./companionInterventionLearning";
import type { FutureCapabilityCategory } from "./futureCapabilityArchitecture";
import {
  isContentBrainstorming,
  shouldSuppressEmotionalTools,
} from "./messageClassification";
import { isExplicitBreatheRequest } from "./explicitBreatheRouting";
import { isAdaptMyDayIntent } from "./adaptMyDayChatRouting";
import { workspaceTitle } from "./workspaceMode";

export type EcosystemIntentMatch = {
  section: AppSection;
  featureLabel: string;
  userProblem: string;
  whyItHelps: string;
  offerLine: string;
  workflowKind:
    | "open_clear_my_mind"
    | "open_decision_compass"
    | "open_plan_my_day"
    | "open_adjust_my_day"
    | "open_workspace";
};

export type CapabilityStatus = "production" | "partial" | "future";

export type CompanionCapabilityId =
  | "create_workspace"
  | "content_tools"
  | "templates"
  | "strategies"
  | "snippets"
  | "projects"
  | "plan_my_day"
  | "adapt_my_day"
  | "clear_my_mind"
  | "decision_compass"
  | "focus_audio"
  | "voice"
  | "email"
  | "calendar"
  | "social_posting"
  | "analytics"
  | "knowledge_vault"
  | "sop_builder"
  | "postcraft"
  | "ghl"
  | "founder_intelligence"
  | "client_avatar"
  | "offer_intelligence"
  | "sales_call_support"
  | "visibility_support";

export type CapabilityLearningSignal =
  | "offer_shown"
  | "offer_accepted"
  | "offer_dismissed"
  | "feature_opened"
  | "action_completed"
  | "user_abandoned"
  | "user_returned"
  | "reported_success"
  | "reported_frustration";

export type CapabilityOutcomeSignal =
  | "reduce_overwhelm"
  | "make_decision"
  | "start_action"
  | "finish_action"
  | "build_confidence"
  | "preserve_momentum"
  | "business_progress";

export type CapabilityRoutingType = "workspace" | "intelligence" | "future";

export type CapabilityContextContract = {
  userGoal: boolean;
  currentProblem: boolean;
  activeProject: boolean;
  businessProfile: boolean;
  clientAvatar: boolean;
  priorThread: boolean;
  emotionalState: boolean;
  energyLevel: boolean;
  learningStyle: boolean;
  outcomeThread: boolean;
};

export type CompanionCapabilityEntry = {
  id: CompanionCapabilityId;
  name: string;
  category: FutureCapabilityCategory;
  status: CapabilityStatus;
  ownerModule: string;
  routingType: CapabilityRoutingType;
  appSection?: AppSection;
  interventionBucket?: InterventionBucket;
  appFeatureId?: string;
  needMapping: {
    surfaceIntents: string[];
    actualNeeds: ActualNeed[];
    adhdPatterns: string[];
    businessSituations: string[];
    emotionalStates: EmotionalState[];
    frictionTypes: string[];
  };
  routingRules: {
    intentPatterns: RegExp[];
    whenToOffer: string;
    whenNotToOffer: string[];
    confidenceThreshold: number;
    requiredClarification: string | null;
    contraindications: string[];
    permissionLanguage: string;
  };
  contextContract: CapabilityContextContract;
  learningSignals: CapabilityLearningSignal[];
  outcomeSignals: CapabilityOutcomeSignal[];
  whyItHelps: string;
  offerTemplate: (featureLabel: string) => string;
  firstStepHint: string;
  workflowKind?: EcosystemIntentMatch["workflowKind"];
  intelligenceHint?: string;
};

const STANDARD_LEARNING: CapabilityLearningSignal[] = [
  "offer_shown",
  "offer_accepted",
  "offer_dismissed",
  "feature_opened",
  "action_completed",
  "user_abandoned",
  "user_returned",
  "reported_success",
  "reported_frustration",
];

const STANDARD_OUTCOMES: CapabilityOutcomeSignal[] = [
  "reduce_overwhelm",
  "make_decision",
  "start_action",
  "finish_action",
  "build_confidence",
  "preserve_momentum",
  "business_progress",
];

const PERMISSION =
  "Want to stay in chat, or open this beside us? I'll stay with you either way.";

function workspaceEntry(
  partial: Omit<
    CompanionCapabilityEntry,
    "routingType" | "learningSignals" | "outcomeSignals" | "routingRules"
  > & {
    intentPatterns: RegExp[];
    whenNotToOffer?: string[];
    contraindications?: string[];
    confidenceThreshold?: number;
  },
): CompanionCapabilityEntry {
  return {
    ...partial,
    routingType: "workspace",
    learningSignals: STANDARD_LEARNING,
    outcomeSignals: STANDARD_OUTCOMES,
    routingRules: {
      intentPatterns: partial.intentPatterns,
      whenToOffer: partial.whyItHelps,
      whenNotToOffer: partial.whenNotToOffer ?? [
        "User is in active hyperfocus/momentum — defer routing",
        "Discovery phase without enough context",
      ],
      confidenceThreshold: partial.confidenceThreshold ?? 0.65,
      requiredClarification: null,
      contraindications: partial.contraindications ?? ["explicit_breathe_request"],
      permissionLanguage: PERMISSION,
    },
  };
}

function intelligenceEntry(
  partial: Omit<
    CompanionCapabilityEntry,
    "routingType" | "learningSignals" | "outcomeSignals" | "routingRules"
  > & {
    intentPatterns: RegExp[];
    intelligenceHint: string;
  },
): CompanionCapabilityEntry {
  return {
    ...partial,
    routingType: "intelligence",
    intelligenceHint: partial.intelligenceHint,
    learningSignals: STANDARD_LEARNING,
    outcomeSignals: STANDARD_OUTCOMES,
    routingRules: {
      intentPatterns: partial.intentPatterns,
      whenToOffer: partial.whyItHelps,
      whenNotToOffer: ["Generic marketing/sales lecture requested without emotional friction"],
      confidenceThreshold: 0.7,
      requiredClarification: null,
      contraindications: [],
      permissionLanguage: "Respond in conversation — one next step, not a module switch.",
    },
  };
}

function futureEntry(
  partial: Omit<
    CompanionCapabilityEntry,
    "routingType" | "learningSignals" | "outcomeSignals" | "routingRules" | "offerTemplate"
  > & {
    intentPatterns?: RegExp[];
    futureSummary: string;
  },
): CompanionCapabilityEntry {
  return {
    ...partial,
    routingType: "future",
    learningSignals: STANDARD_LEARNING,
    outcomeSignals: STANDARD_OUTCOMES,
    offerTemplate: (label) =>
      `**${label}** is on the roadmap. I'll help you move forward in chat until it's ready.`,
    routingRules: {
      intentPatterns: partial.intentPatterns ?? [],
      whenToOffer: partial.futureSummary,
      whenNotToOffer: ["Capability not yet shipped"],
      confidenceThreshold: 1,
      requiredClarification: null,
      contraindications: [],
      permissionLanguage: PERMISSION,
    },
  };
}

const CONTEXT_WORKSPACE: CapabilityContextContract = {
  userGoal: true,
  currentProblem: true,
  activeProject: false,
  businessProfile: false,
  clientAvatar: false,
  priorThread: true,
  emotionalState: true,
  energyLevel: true,
  learningStyle: false,
  outcomeThread: true,
};

const CONTEXT_BUSINESS: CapabilityContextContract = {
  userGoal: true,
  currentProblem: true,
  activeProject: true,
  businessProfile: true,
  clientAvatar: true,
  priorThread: true,
  emotionalState: true,
  energyLevel: false,
  learningStyle: true,
  outcomeThread: true,
};

export const COMPANION_CAPABILITY_REGISTRY: CompanionCapabilityEntry[] = [
  workspaceEntry({
    id: "clear_my_mind",
    name: "Clear My Mind",
    category: "productivity_ecosystem",
    status: "production",
    ownerModule: "lib/companionEcosystemIntent.ts",
    appSection: "brain-dump",
    interventionBucket: "brain_dump",
    appFeatureId: "clear-my-mind",
    workflowKind: "open_clear_my_mind",
    intentPatterns: [
      /\b(?:too much on my mind|so much on my mind|everything in my head|head is (?:full|crowded)|mind is (?:full|racing|busy)|carrying a lot mentally|can'?t stop thinking|thoughts (?:are|keep) piling|mental clutter|brain is (?:full|noisy))\b/i,
    ],
    needMapping: {
      surfaceIntents: ["make a list", "organize thoughts"],
      actualNeeds: ["reduce_complexity"],
      adhdPatterns: ["overwhelm", "brain_dump"],
      businessSituations: ["mental overload before work"],
      emotionalStates: ["overwhelmed", "stuck"],
      frictionTypes: ["volume", "cognitive_load"],
    },
    contextContract: CONTEXT_WORKSPACE,
    whyItHelps:
      "Clear My Mind unloads everything visually without organizing yet — reduces overwhelm.",
    offerTemplate: (label) =>
      `It sounds like you're carrying a lot mentally. **${label}** was built for this — get everything out without fixing it all at once.\n\nWould you like to stay in chat, or move into **${label}** beside us?`,
    firstStepHint: "Capture one cluster of thoughts — no sorting required.",
  }),
  workspaceEntry({
    id: "decision_compass",
    name: "Decision Compass",
    category: "productivity_ecosystem",
    status: "production",
    ownerModule: "lib/decision-intelligence/",
    appSection: "decision-compass",
    interventionBucket: "workspace_open",
    appFeatureId: "decision-compass",
    workflowKind: "open_decision_compass",
    intentPatterns: [
      /\b(?:can'?t decide|cannot decide|don'?t know which (?:one|option)|stuck between|torn between|which (?:should|do) i (?:choose|pick)|help me decide|need to decide|decision paralysis|too many options)\b/i,
    ],
    needMapping: {
      surfaceIntents: ["pros and cons", "which option"],
      actualNeeds: ["make_decision", "clarify_direction"],
      adhdPatterns: ["decision_paralysis"],
      businessSituations: ["offer choice", "pricing choice", "hire vs diy"],
      emotionalStates: ["stuck", "unclear"],
      frictionTypes: ["decision_paralysis"],
    },
    contextContract: CONTEXT_WORKSPACE,
    whyItHelps:
      "Decision Compass walks options step by step — without a pros-and-cons lecture in chat.",
    offerTemplate: (label) =>
      `When a decision feels stuck, lists in chat usually add noise. **${label}** helps you think it through visually.\n\nWant to stay here, or open **${label}** beside us?`,
    firstStepHint: "Name the decision in one sentence — options come next.",
  }),
  workspaceEntry({
    id: "plan_my_day",
    name: "Plan My Day",
    category: "productivity_ecosystem",
    status: "production",
    ownerModule: "lib/appFeatureKnowledge.ts",
    appSection: "plan-my-day",
    interventionBucket: "plan_my_day",
    workflowKind: "open_plan_my_day",
    intentPatterns: [
      /\b(?:don'?t know what to (?:work on|focus on|do next|start)|what should i (?:work on|focus on|do next)|can'?t prioritize|no idea where to start|so many things to do|what matters most today|what to tackle first)\b/i,
    ],
    needMapping: {
      surfaceIntents: ["prioritize", "plan today"],
      actualNeeds: ["clarify_direction"],
      adhdPatterns: ["prioritization_paralysis"],
      businessSituations: ["busy founder morning"],
      emotionalStates: ["overwhelmed", "unclear"],
      frictionTypes: ["too_many_options"],
    },
    contextContract: { ...CONTEXT_WORKSPACE, energyLevel: true },
    whyItHelps:
      "Plan My Day shapes today around what's realistic — better than abstract prioritization talk.",
    offerTemplate: (label) =>
      `When everything competes for attention, talking often isn't enough. **${label}** helps you shape today realistically.\n\nWant to stay in chat, or open **${label}** together?`,
    firstStepHint: "Pick one anchor task for today — not the whole week.",
  }),
  workspaceEntry({
    id: "adapt_my_day",
    name: "Today's Reality",
    category: "productivity_ecosystem",
    status: "production",
    ownerModule: "lib/adaptMyDayChatRouting.ts",
    appSection: "today",
    interventionBucket: "workspace_open",
    workflowKind: "open_adjust_my_day",
    intentPatterns: [
      /\b(?:adapt my day|adjust my day|today changed|energy (?:is )?low|feel(?:ing)? sluggish|rough morning|low energy today|didn'?t sleep well|need to adapt|rebuild today)\b/i,
    ],
    needMapping: {
      surfaceIntents: ["fix my schedule", "restart day"],
      actualNeeds: ["reduce_complexity", "clarify_direction"],
      adhdPatterns: ["energy_mismatch", "time_blindness"],
      businessSituations: ["plan derailed"],
      emotionalStates: ["overwhelmed", "emotional"],
      frictionTypes: ["energy", "overcommit"],
    },
    contextContract: { ...CONTEXT_WORKSPACE, energyLevel: true },
    whyItHelps: "Today's Reality retunes the plan to real energy — without guilt or a full replan.",
    offerTemplate: (label) =>
      `Today isn't matching how you expected to feel. **${label}** helps update reality without starting over.\n\nOpen **${label}** beside us, or stay in chat?`,
    firstStepHint: "Name what changed about today's energy — one honest line.",
  }),
  workspaceEntry({
    id: "create_workspace",
    name: "Create Workspace",
    category: "content_ecosystem",
    status: "production",
    ownerModule: "lib/createCatalog.ts",
    appSection: "content-generator",
    interventionBucket: "create",
    appFeatureId: "create",
    workflowKind: "open_workspace",
    intentPatterns: [
      /\b(?:need content ideas|content ideas|what (?:should|can) i post|don'?t know what to (?:post|write about)|stuck on (?:what to|content)|ideas for (?:my )?(?:post|newsletter|email|content))\b/i,
    ],
    whenNotToOffer: ["User asked to write/draft a specific piece in chat"],
    needMapping: {
      surfaceIntents: ["content ideas", "what to post"],
      actualNeeds: ["start_execution", "clarify_direction"],
      adhdPatterns: ["blank_page", "perfectionism"],
      businessSituations: ["content marketing"],
      emotionalStates: ["stuck", "building"],
      frictionTypes: ["activation"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps:
      "Create builds content in context with your audience — not generic idea lists.",
    offerTemplate: (label) =>
      `Content lands better in context. **${label}** can brainstorm and draft with your audience in mind.\n\nStay in chat, or open **${label}** beside us?`,
    firstStepHint: "Pick one format and one audience — draft the hook line.",
  }),
  workspaceEntry({
    id: "content_tools",
    name: "Content Tools",
    category: "content_ecosystem",
    status: "production",
    ownerModule: "app/api/generate/",
    appSection: "content-generator",
    interventionBucket: "create",
    workflowKind: "open_workspace",
    intentPatterns: [
      /\b(?:draft (?:a |my )?(?:post|email|newsletter)|help me write|content generator|generate content)\b/i,
    ],
    needMapping: {
      surfaceIntents: ["write content", "draft post"],
      actualNeeds: ["start_execution"],
      adhdPatterns: ["perfectionism", "blank_page"],
      businessSituations: ["content creation"],
      emotionalStates: ["building", "focused"],
      frictionTypes: ["activation"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Content tools draft with your business context — faster than blank-page chat.",
    offerTemplate: (label) =>
      `Let's draft in **${label}** where your context lives — I'll stay with you for the first step.`,
    firstStepHint: "Open Create and paste the working title or topic.",
  }),
  workspaceEntry({
    id: "templates",
    name: "Templates",
    category: "knowledge_ecosystem",
    status: "production",
    ownerModule: "app/api/templates/",
    appSection: "templates-library",
    interventionBucket: "workspace_open",
    appFeatureId: "templates",
    intentPatterns: [/\b(?:use a template|templates library|start from template)\b/i],
    needMapping: {
      surfaceIntents: ["find a template"],
      actualNeeds: ["start_execution", "reduce_complexity"],
      adhdPatterns: ["blank_page"],
      businessSituations: ["repeatable deliverables"],
      emotionalStates: ["building"],
      frictionTypes: ["activation"],
    },
    contextContract: { ...CONTEXT_BUSINESS, clientAvatar: false },
    whyItHelps: "Templates remove blank-page friction for repeatable work.",
    offerTemplate: (label) =>
      `**${label}** gives you a starting structure so you're not staring at a blank page.`,
    firstStepHint: "Pick the closest template — customize one section only.",
  }),
  workspaceEntry({
    id: "strategies",
    name: "Strategies",
    category: "knowledge_ecosystem",
    status: "production",
    ownerModule: "lib/strategySystem.ts",
    appSection: "playbook",
    interventionBucket: "workspace_open",
    appFeatureId: "strategies",
    intentPatterns: [/\b(?:adhd strateg(?:y|ies)|which strategy|pick a strategy)\b/i],
    needMapping: {
      surfaceIntents: ["find a strategy", "coping strategy"],
      actualNeeds: ["clarify_direction", "reduce_complexity"],
      adhdPatterns: ["overwhelm", "procrastination"],
      businessSituations: ["ADHD friction moment"],
      emotionalStates: ["stuck", "overwhelmed"],
      frictionTypes: ["emotional", "activation"],
    },
    contextContract: CONTEXT_WORKSPACE,
    whyItHelps: "Strategies match ADHD friction patterns to proven micro-interventions.",
    offerTemplate: (label) =>
      `**${label}** can match this moment to something that actually works for ADHD brains.`,
    firstStepHint: "Name the friction — we'll find one strategy, not ten.",
  }),
  workspaceEntry({
    id: "snippets",
    name: "Snippets",
    category: "knowledge_ecosystem",
    status: "production",
    ownerModule: "app/api/snippets/",
    appSection: "snippets",
    interventionBucket: "workspace_open",
    appFeatureId: "snippets",
    intentPatterns: [/\b(?:saved snippets|my snippets|reuse (?:this|that) copy)\b/i],
    needMapping: {
      surfaceIntents: ["reuse copy", "saved text"],
      actualNeeds: ["start_execution"],
      adhdPatterns: ["reinvention"],
      businessSituations: ["client email", "sales follow-up"],
      emotionalStates: ["building"],
      frictionTypes: ["activation"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Snippets stop you rewriting the same thing — momentum preserved.",
    offerTemplate: (label) => `Open **${label}** to grab proven copy and tweak one line.`,
    firstStepHint: "Search snippets for the situation — edit one paragraph max.",
  }),
  workspaceEntry({
    id: "projects",
    name: "Projects",
    category: "productivity_ecosystem",
    status: "production",
    ownerModule: "lib/myWorkHub.ts",
    appSection: "projects",
    interventionBucket: "workspace_open",
    appFeatureId: "projects",
    intentPatterns: [
      /\b(?:my projects|project hub|where is (?:this|my) project|track (?:this|my) project)\b/i,
    ],
    needMapping: {
      surfaceIntents: ["see my projects", "project status"],
      actualNeeds: ["reconnect_goal", "clarify_direction"],
      adhdPatterns: ["object_permanence", "follow_through"],
      businessSituations: ["multiple active offers"],
      emotionalStates: ["unclear", "building"],
      frictionTypes: ["visibility"],
    },
    contextContract: { ...CONTEXT_BUSINESS, activeProject: true },
    whyItHelps: "Projects make work visible — ADHD brains need to see what's active.",
    offerTemplate: (label) =>
      `**${label}** shows what's in motion so nothing important disappears.`,
    firstStepHint: "Open the active project — what's the next visible step?",
  }),
  workspaceEntry({
    id: "focus_audio",
    name: "Peaceful Places",
    category: "productivity_ecosystem",
    status: "partial",
    ownerModule: "lib/audioSuggestions.ts",
    appSection: "focus-timer",
    interventionBucket: "generic_tip",
    appFeatureId: "focus-audio",
    intentPatterns: [/\b(?:focus audio|background sound|music to focus|audio for focus)\b/i],
    needMapping: {
      surfaceIntents: ["focus music"],
      actualNeeds: ["protect_flow"],
      adhdPatterns: ["distractibility"],
      businessSituations: ["deep work block"],
      emotionalStates: ["focused"],
      frictionTypes: ["attention"],
    },
    contextContract: CONTEXT_WORKSPACE,
    whyItHelps: "Focus audio supports sustained attention without breaking flow.",
    offerTemplate: (label) => `Try **${label}** for a timed focus block — one task only.`,
    firstStepHint: "Pick audio + one named task before starting the timer.",
  }),
  workspaceEntry({
    id: "email",
    name: "Email Generator",
    category: "communication_ecosystem",
    status: "partial",
    ownerModule: "app/api/email-generator/",
    appSection: "email-generator",
    interventionBucket: "create",
    appFeatureId: "email",
    intentPatterns: [
      /\b(?:write (?:an |a )?email|email generator|draft (?:an |a )?email to)\b/i,
    ],
    needMapping: {
      surfaceIntents: ["write email"],
      actualNeeds: ["start_execution"],
      adhdPatterns: ["perfectionism", "avoidance"],
      businessSituations: ["client outreach", "follow-up"],
      emotionalStates: ["stuck", "building"],
      frictionTypes: ["activation"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Email generator drafts with context — you refine, not reinvent.",
    offerTemplate: (label) =>
      `Let's draft in **${label}** — subject line first, then one paragraph.`,
    firstStepHint: "Who is it to, and what's the one ask?",
  }),
  workspaceEntry({
    id: "voice",
    name: "Voice",
    category: "communication_ecosystem",
    status: "partial",
    ownerModule: "app/api/tts/",
    interventionBucket: "generic_tip",
    intentPatterns: [/\b(?:read (?:this|it) aloud|text to speech|voice read)\b/i],
    needMapping: {
      surfaceIntents: ["hear it read"],
      actualNeeds: ["reduce_complexity"],
      adhdPatterns: ["reading_friction"],
      businessSituations: ["review draft"],
      emotionalStates: ["focused", "unclear"],
      frictionTypes: ["cognitive_load"],
    },
    contextContract: { ...CONTEXT_WORKSPACE, businessProfile: false },
    whyItHelps: "Voice reduces reading friction for review and comprehension.",
    offerTemplate: (label) => `Use **${label}** to hear the draft — catch what eyes miss.`,
    firstStepHint: "Paste the paragraph to review aloud.",
  }),
  workspaceEntry({
    id: "calendar",
    name: "Calendar",
    category: "communication_ecosystem",
    status: "partial",
    ownerModule: "app/api/google/",
    appSection: "google-workspace",
    interventionBucket: "workspace_open",
    intentPatterns: [/\b(?:my calendar|schedule (?:a |the )?meeting|google calendar|what'?s on today)\b/i],
    needMapping: {
      surfaceIntents: ["check calendar", "schedule meeting"],
      actualNeeds: ["clarify_direction", "make_decision"],
      adhdPatterns: ["time_blindness"],
      businessSituations: ["scheduling", "client calls"],
      emotionalStates: ["unclear", "overwhelmed"],
      frictionTypes: ["time"],
    },
    contextContract: { ...CONTEXT_BUSINESS, energyLevel: true },
    whyItHelps: "Calendar makes time visible — critical for ADHD scheduling.",
    offerTemplate: (label) =>
      `Open **${label}** to see today's reality — we'll pick one slot to protect.`,
    firstStepHint: "Check the next 4 hours — one commitment to confirm or move.",
  }),
  workspaceEntry({
    id: "social_posting",
    name: "Social Posting",
    category: "content_ecosystem",
    status: "partial",
    ownerModule: "lib/ecosystem/postcraft/",
    interventionBucket: "create",
    intentPatterns: [/\b(?:post to (?:linkedin|social)|schedule (?:a )?post|publish (?:this|my) post)\b/i],
    needMapping: {
      surfaceIntents: ["post online", "schedule social"],
      actualNeeds: ["start_execution"],
      adhdPatterns: ["visibility_avoidance", "perfectionism"],
      businessSituations: ["content marketing"],
      emotionalStates: ["stuck", "emotional"],
      frictionTypes: ["visibility", "activation"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Social posting moves visibility from draft to published — companion stays for courage.",
    offerTemplate: (label) =>
      `**${label}** helps publish — define good enough, then ship one post.`,
    firstStepHint: "Pick one platform and one post ready enough to publish.",
  }),
  intelligenceEntry({
    id: "sales_call_support",
    name: "Sales Call Support",
    category: "business_intelligence",
    status: "partial",
    ownerModule: "lib/companionSalesIntelligence.ts",
    intentPatterns: [
      /\b(?:discovery call|sales call|(?:make|making) the call|putting off the call|too expensive|follow up (?:with|on))\b/i,
    ],
    needMapping: {
      surfaceIntents: ["sales script", "objection handling"],
      actualNeeds: ["start_execution", "build_confidence", "make_decision"],
      adhdPatterns: ["sales_avoidance", "fear_of_rejection", "people_pleasing"],
      businessSituations: ["discovery", "objection", "follow-up"],
      emotionalStates: ["stuck", "emotional"],
      frictionTypes: ["rejection", "avoidance"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Sales friction is emotional — one next response beats a seven-step framework.",
    intelligenceHint:
      "SALES INTELLIGENCE: detect avoidance, pricing freeze, overexplaining. One practical next response. ADHD filter wins.",
    offerTemplate: () => "",
    firstStepHint: "Name the call outcome — one question you'll ask or one follow-up line.",
  }),
  intelligenceEntry({
    id: "visibility_support",
    name: "Visibility Support",
    category: "business_intelligence",
    status: "partial",
    ownerModule: "lib/companionVisibilityIntelligence.ts",
    intentPatterns: [
      /\b(?:should make videos?|make videos?|posting|publish|visibility|webinar|terrified to (?:post|speak)|nobody responded|keep putting (?:it )?off)\b/i,
    ],
    needMapping: {
      surfaceIntents: ["marketing help", "content strategy"],
      actualNeeds: ["build_confidence", "start_execution", "launch_move"],
      adhdPatterns: ["visibility_fear", "content_perfectionism", "comparison_spiral"],
      businessSituations: ["content marketing", "public speaking"],
      emotionalStates: ["stuck", "emotional"],
      frictionTypes: ["visibility", "perfectionism"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Marketing problems are often visibility and confidence problems — one brave action.",
    intelligenceHint:
      "VISIBILITY INTELLIGENCE: reduce scope, define good enough to publish, sustainable rhythm. No 90-day content plans.",
    offerTemplate: () => "",
    firstStepHint: "One visibility action today — record, post, or schedule.",
  }),
  workspaceEntry({
    id: "client_avatar",
    name: "Client Avatar",
    category: "business_intelligence",
    status: "partial",
    ownerModule: "lib/appFeatureKnowledge.ts",
    appSection: "client-avatars",
    interventionBucket: "workspace_open",
    appFeatureId: "client-avatars",
    intentPatterns: [
      /\b(?:client avatar|ideal client|who is my audience|target customer profile)\b/i,
    ],
    needMapping: {
      surfaceIntents: ["define audience", "client persona"],
      actualNeeds: ["clarify_direction"],
      adhdPatterns: ["research_spiral"],
      businessSituations: ["offer positioning"],
      emotionalStates: ["unclear", "building"],
      frictionTypes: ["clarity"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Client Avatars anchor messaging — one persona beats endless research.",
    offerTemplate: (label) =>
      `Open **${label}** to name one ideal client — we'll keep it simple.`,
    firstStepHint: "One sentence: who you help and what changes for them.",
  }),
  futureEntry({
    id: "analytics",
    name: "Analytics",
    category: "analytics_ecosystem",
    status: "future",
    ownerModule: "lib/futureCapabilityArchitecture.ts",
    futureSummary: "Track behavior, content, sales, momentum, and intervention effectiveness.",
    intentPatterns: [/\b(?:analytics dashboard|how am i doing|track my progress)\b/i],
    needMapping: {
      surfaceIntents: ["see stats", "track progress"],
      actualNeeds: ["clarify_direction", "build_confidence"],
      adhdPatterns: ["metrics_obsession"],
      businessSituations: ["growth review"],
      emotionalStates: ["building", "emotional"],
      frictionTypes: ["validation_seeking"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Analytics will connect outcomes to companion learning — advisory, not dopamine loops.",
    firstStepHint: "Future: companion surfaces one meaningful metric tied to your goal.",
  }),
  futureEntry({
    id: "knowledge_vault",
    name: "Knowledge Vault",
    category: "knowledge_ecosystem",
    status: "future",
    ownerModule: "lib/companionCapabilityRegistry.ts",
    futureSummary: "Stored ideas, SOPs, business memory, reusable wisdom.",
    intentPatterns: [/\b(?:knowledge vault|business memory|store this idea)\b/i],
    needMapping: {
      surfaceIntents: ["save knowledge", "business wiki"],
      actualNeeds: ["reduce_complexity"],
      adhdPatterns: ["idea_explosion"],
      businessSituations: ["SOP capture"],
      emotionalStates: ["building"],
      frictionTypes: ["memory"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Future vault captures wisdom without losing the companion thread.",
    firstStepHint: "Future: save one insight with context — companion retrieves it later.",
  }),
  futureEntry({
    id: "sop_builder",
    name: "SOP Builder",
    category: "knowledge_ecosystem",
    status: "future",
    ownerModule: "lib/companionCapabilityRegistry.ts",
    futureSummary: "Document the one process that causes the most frustration.",
    intentPatterns: [/\b(?:sop|standard operating procedure|document this process)\b/i],
    needMapping: {
      surfaceIntents: ["write SOP", "document workflow"],
      actualNeeds: ["reduce_complexity", "start_execution"],
      adhdPatterns: ["planning_addiction"],
      businessSituations: ["operations"],
      emotionalStates: ["building"],
      frictionTypes: ["overwhelm"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Future SOP builder — one painful process, minimum viable steps.",
    firstStepHint: "Future: name the process that breaks most often.",
  }),
  futureEntry({
    id: "postcraft",
    name: "PostCraft",
    category: "content_ecosystem",
    status: "future",
    ownerModule: "lib/ecosystem/postcraft/",
    futureSummary: "Content planning, repurposing, trend-informed content, social posting, analytics feedback.",
    intentPatterns: [/\b(?:postcraft|repurpose content|content calendar)\b/i],
    needMapping: {
      surfaceIntents: ["content calendar", "repurpose"],
      actualNeeds: ["clarify_direction", "start_execution"],
      adhdPatterns: ["perfectionism", "inconsistent_visibility"],
      businessSituations: ["content marketing"],
      emotionalStates: ["building"],
      frictionTypes: ["consistency"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Future PostCraft — sustainable rhythm, not aggressive calendars.",
    firstStepHint: "Future: one post repurposed to one channel.",
  }),
  futureEntry({
    id: "ghl",
    name: "GHL Integration",
    category: "communication_ecosystem",
    status: "future",
    ownerModule: "lib/ecosystem/",
    futureSummary: "CRM, sales pipeline, follow-up automation, client communication.",
    intentPatterns: [/\b(?:ghl|go high level|crm pipeline|sales pipeline)\b/i],
    needMapping: {
      surfaceIntents: ["CRM", "pipeline"],
      actualNeeds: ["clarify_direction", "start_execution"],
      adhdPatterns: ["tool_hopping"],
      businessSituations: ["sales ops"],
      emotionalStates: ["overwhelmed"],
      frictionTypes: ["complexity"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Future GHL — companion routes to pipeline actions, not another dashboard.",
    firstStepHint: "Future: one follow-up action from companion context.",
  }),
  futureEntry({
    id: "founder_intelligence",
    name: "Founder Intelligence",
    category: "companion_intelligence",
    status: "future",
    ownerModule: "lib/ecosystem/",
    futureSummary: "Founder goals, personal patterns, long-term direction, business identity.",
    intentPatterns: [/\b(?:founder mode|long.term vision|business identity)\b/i],
    needMapping: {
      surfaceIntents: ["founder strategy"],
      actualNeeds: ["clarify_direction", "reconnect_goal"],
      adhdPatterns: ["shiny_object"],
      businessSituations: ["strategic planning"],
      emotionalStates: ["unclear", "building"],
      frictionTypes: ["direction"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Future founder intelligence — companion-first, not a separate founder app feel.",
    firstStepHint: "Future: one milestone aligned to identity — not a 90-day plan.",
  }),
  futureEntry({
    id: "offer_intelligence",
    name: "Offer Intelligence",
    category: "business_intelligence",
    status: "future",
    ownerModule: "lib/companionCapabilityRegistry.ts",
    futureSummary: "Offer positioning, packaging, pricing clarity.",
    intentPatterns: [/\b(?:my offer|package my offer|what should i sell)\b/i],
    needMapping: {
      surfaceIntents: ["offer design", "pricing"],
      actualNeeds: ["make_decision", "clarify_direction"],
      adhdPatterns: ["offer_hopping", "perfectionism"],
      businessSituations: ["offer launch"],
      emotionalStates: ["stuck", "unclear"],
      frictionTypes: ["decision_paralysis"],
    },
    contextContract: CONTEXT_BUSINESS,
    whyItHelps: "Future offer intelligence — one clear offer hypothesis, test in market.",
    firstStepHint: "Future: one sentence offer + one person it's for.",
  }),
];

export function getCapabilityById(id: CompanionCapabilityId): CompanionCapabilityEntry | undefined {
  return COMPANION_CAPABILITY_REGISTRY.find((c) => c.id === id);
}

export function getCapabilitiesByStatus(status: CapabilityStatus): CompanionCapabilityEntry[] {
  return COMPANION_CAPABILITY_REGISTRY.filter((c) => c.status === status);
}

export function findCapabilitiesForActualNeed(need: ActualNeed): CompanionCapabilityEntry[] {
  return COMPANION_CAPABILITY_REGISTRY.filter((c) => c.needMapping.actualNeeds.includes(need));
}

function shouldSuppressCapabilityMatch(text: string): boolean {
  const t = text.trim();
  if (!t || t.length < 8) return true;
  if (shouldSuppressEmotionalTools(t)) return true;
  if (isExplicitBreatheRequest(t)) return true;
  if (isAdaptMyDayIntent(t)) return true;
  if (isContentBrainstorming(t) && /\b(?:write|draft|create)\b/i.test(t)) return true;
  if (/\bhelp me (?:write|draft)\b/i.test(t)) return true;
  return false;
}

/**
 * Registry-driven lookup: what registered capability best fits this message?
 */
export function matchRegisteredCapabilityForText(
  text: string,
): EcosystemIntentMatch | null {
  if (shouldSuppressCapabilityMatch(text)) return null;

  for (const cap of COMPANION_CAPABILITY_REGISTRY) {
    if (cap.routingType !== "workspace") continue;
    if (!cap.appSection || !cap.workflowKind) continue;

    const matched = cap.routingRules.intentPatterns.some((re) => re.test(text));
    if (!matched) continue;

    const featureLabel = workspaceTitle(cap.appSection);
    return {
      section: cap.appSection,
      featureLabel,
      userProblem: text.slice(0, 200),
      whyItHelps: cap.whyItHelps,
      offerLine: cap.offerTemplate(featureLabel),
      workflowKind: cap.workflowKind,
    };
  }
  return null;
}

export function matchIntelligenceCapabilityForText(
  text: string,
): CompanionCapabilityEntry | null {
  if (shouldSuppressCapabilityMatch(text)) return null;

  for (const cap of COMPANION_CAPABILITY_REGISTRY) {
    if (cap.routingType !== "intelligence") continue;
    if (cap.routingRules.intentPatterns.some((re) => re.test(text))) return cap;
  }
  return null;
}

export function capabilityRoutingHintForChat(text: string): string | null {
  const workspace = matchRegisteredCapabilityForText(text);
  if (workspace) {
    return [
      `CAPABILITY REGISTRY (workspace): **${workspace.featureLabel}** [${workspace.section}]`,
      workspace.whyItHelps,
      "Permission-first: stay in chat or open beside chat. Pass context. First step inside the feature.",
    ].join(" ");
  }

  const intel = matchIntelligenceCapabilityForText(text);
  if (intel?.intelligenceHint) {
    return [
      `CAPABILITY REGISTRY (intelligence): ${intel.name}`,
      intel.intelligenceHint,
      intel.firstStepHint,
    ].join(" ");
  }
  return null;
}

const LEARNING_TO_TRUST: Partial<
  Record<CapabilityLearningSignal, "trust.offer_rendered" | "trust.suggestion_accepted" | "trust.suggestion_dismissed" | "trust.intervention_started" | "trust.intervention_completed" | "trust.intervention_abandoned">
> = {
  offer_shown: "trust.offer_rendered",
  offer_accepted: "trust.suggestion_accepted",
  offer_dismissed: "trust.suggestion_dismissed",
  feature_opened: "trust.intervention_started",
  action_completed: "trust.intervention_completed",
  user_abandoned: "trust.intervention_abandoned",
};

export function recordCapabilityIntervention(input: {
  capabilityId: CompanionCapabilityId;
  action: CapabilityLearningSignal;
  reason?: string;
  confidence?: number;
  userState?: string;
  userPattern?: string;
}): void {
  const cap = getCapabilityById(input.capabilityId);
  if (!cap) return;

  const trustCategory = LEARNING_TO_TRUST[input.action];
  if (trustCategory) {
    recordTrustEvidence({
      category: trustCategory,
      offerKey: cap.interventionBucket ?? cap.id,
      source: "companionCapabilityRegistry",
      emitter: "capability.intervention",
      meta: {
        capabilityId: cap.id,
        reason: input.reason ?? "",
        confidence: input.confidence ?? 0,
        userState: input.userState ?? "",
        userPattern: input.userPattern ?? "",
      },
    });
  }

  recordCapabilityLifecycleFromRegistry({
    capabilityId: input.capabilityId,
    action: input.action,
    momentumImproved: input.action === "reported_success",
    confidenceImproved:
      input.action === "reported_success" || input.capabilityId === "visibility_support",
  });
}

export function listRegisteredCapabilityIds(): CompanionCapabilityId[] {
  return COMPANION_CAPABILITY_REGISTRY.map((c) => c.id);
}

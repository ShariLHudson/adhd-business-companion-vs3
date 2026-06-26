/**
 * Future Capability Architecture™ — ecosystem capability registry and design gates.
 *
 * The current app is only the first visible layer. Capabilities register here;
 * new features must pass design gates before implementation.
 *
 * Human-readable spec: docs-companion-intelligence/24_Future_Capability_Architecture.md
 * Intelligence layers: lib/adaptiveCompanionArchitecture.ts
 * Future-first three-layer rule: lib/companionIntelligenceEcosystem/
 */

import { evaluateFutureFirstFeature } from "./companionIntelligenceEcosystem";

import type { LayerMaturity } from "./adaptiveCompanionArchitecture";

export type FutureCapabilityCategory =
  | "companion_intelligence"
  | "business_intelligence"
  | "content_ecosystem"
  | "knowledge_ecosystem"
  | "productivity_ecosystem"
  | "communication_ecosystem"
  | "analytics_ecosystem";

/** How a capability plugs into the platform — prefer registry over hardcoding. */
export type CapabilityRegistrationChannel =
  | "intervention_registry"
  | "signal_registry"
  | "app_feature_knowledge"
  | "ecosystem_intelligence_layer"
  | "companion_ecosystem_intent"
  | "tool_routing"
  | "unregistered";

export type FutureCapability = {
  id: string;
  name: string;
  category: FutureCapabilityCategory;
  maturity: LayerMaturity;
  canonicalModules: string[];
  registrationChannel: CapabilityRegistrationChannel;
  /** Five architecture-rule dimensions */
  observable: boolean;
  learnable: boolean;
  personalizable: boolean;
  predictable: boolean;
  companionConnected: boolean;
  companionFirst: boolean;
  debtRisks: string[];
};

export type CapabilityDesignValidation = {
  observable: boolean;
  learnable: boolean;
  personalizable: boolean;
  predictable: boolean;
  companionConnected: boolean;
  passesArchitectureRule: boolean;
  blockers: string[];
};

export type Vision2029Test = {
  scalesTenX: boolean;
  usesRegistrationNotHardcoding: boolean;
  companionRemainsCenter: boolean;
  approved: boolean;
  blockers: string[];
};

export type FutureCapabilityPortfolio = {
  evaluatedAt: string;
  totalCapabilities: number;
  byCategory: Record<FutureCapabilityCategory, number>;
  byMaturity: Record<LayerMaturity, number>;
  productionCount: number;
  futureCount: number;
  unregisteredCount: number;
  companionDisconnectedCount: number;
  debtRiskCount: number;
  capabilities: FutureCapability[];
};

/**
 * Contract for registering a new ecosystem capability.
 * Implementations register — do not hardcode workspace/tool/board logic in page.tsx.
 */
export type EcosystemCapabilityRegistrationContract = {
  id: string;
  category: FutureCapabilityCategory;
  displayName: string;
  /** Emit signals on meaningful user actions */
  signalCategories?: string[];
  /** Stable intervention bucket when offering from companion */
  interventionBucket?: string;
  /** App feature knowledge entry for how-to routing */
  appFeatureId?: string;
  /** Ecosystem intelligence layer id when vertical offers apply */
  ecosystemLayer?: string;
  /** Companion offer line — user feels helped, not sent to another app */
  companionOfferTemplate?: string;
};

export const FUTURE_CAPABILITY_CATEGORIES: Record<
  FutureCapabilityCategory,
  { label: string; description: string }
> = {
  companion_intelligence: {
    label: "Companion Intelligence",
    description: "Trust, confidence, adaptive user, predictive, relationship, learning, founder",
  },
  business_intelligence: {
    label: "Business Intelligence",
    description: "Profile, avatars, offers, marketing, sales, launch, financial",
  },
  content_ecosystem: {
    label: "Content Ecosystem",
    description: "Create, planning, generation, repurposing, posting, analytics, trends",
  },
  knowledge_ecosystem: {
    label: "Knowledge Ecosystem",
    description: "Vault, SOPs, templates, strategies, snippets, knowledge graph",
  },
  productivity_ecosystem: {
    label: "Productivity Ecosystem",
    description: "Plan/adapt day, clear mind, decisions, projects, focus, energy",
  },
  communication_ecosystem: {
    label: "Communication Ecosystem",
    description: "Email, calendar, voice, meetings, client comms, social",
  },
  analytics_ecosystem: {
    label: "Analytics Ecosystem",
    description: "Behavior, business, content, sales, momentum, completion, interventions",
  },
};

/**
 * Ecosystem capability map — first visible layer + future vision.
 * Update maturity and channels as capabilities ship.
 */
export const FUTURE_CAPABILITIES: FutureCapability[] = [
  // — Companion Intelligence —
  {
    id: "trust_engine",
    name: "Trust Engine",
    category: "companion_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/companionTrustEngine.ts", "lib/intelligence-layer/trustSignals.ts"],
    registrationChannel: "signal_registry",
    observable: true,
    learnable: true,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Trust evolution gated on attribution"],
  },
  {
    id: "confidence_engine",
    name: "Confidence Engine",
    category: "companion_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/companionConfidenceEngine.ts"],
    registrationChannel: "signal_registry",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "adaptive_user_intelligence",
    name: "Adaptive User Intelligence",
    category: "companion_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/companionAdaptiveUserEngine.ts", "lib/intelligence-layer/"],
    registrationChannel: "signal_registry",
    observable: true,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Profile learning OFF by default", "Local-only profile store"],
  },
  {
    id: "predictive_intelligence",
    name: "Predictive Intelligence",
    category: "companion_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/predictive-support/"],
    registrationChannel: "ecosystem_intelligence_layer",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Dual prediction systems", "No accuracy feedback loop"],
  },
  {
    id: "relationship_intelligence",
    name: "Relationship Intelligence",
    category: "companion_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/relationship-intelligence/", "lib/companionOutcomeThread.ts"],
    registrationChannel: "ecosystem_intelligence_layer",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Three relationship stores"],
  },
  {
    id: "learning_intelligence",
    name: "Learning Intelligence",
    category: "companion_intelligence",
    maturity: "stub",
    canonicalModules: [
      "lib/intelligence-layer/profileEvolution.ts",
      "lib/intelligence-layer/signalBus.ts",
    ],
    registrationChannel: "signal_registry",
    observable: true,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Production learning disabled", "Shadow bus only"],
  },
  {
    id: "founder_intelligence",
    name: "Founder Intelligence",
    category: "companion_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/ecosystem/"],
    registrationChannel: "unregistered",
    observable: true,
    learnable: true,
    personalizable: false,
    predictable: true,
    companionConnected: false,
    companionFirst: false,
    debtRisks: ["Separate from end-user companion stack"],
  },
  // — Business Intelligence —
  {
    id: "business_profile",
    name: "Business Profile",
    category: "business_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/businessStrategyBuilder.ts"],
    registrationChannel: "app_feature_knowledge",
    observable: false,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "client_avatar_intelligence",
    name: "Client Avatar Intelligence",
    category: "business_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/appFeatureKnowledge.ts"],
    registrationChannel: "app_feature_knowledge",
    observable: false,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "offer_intelligence",
    name: "Offer Intelligence",
    category: "business_intelligence",
    maturity: "future",
    canonicalModules: [],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: ["Not yet built — must register, not hardcode in chat"],
  },
  {
    id: "marketing_intelligence",
    name: "Marketing Intelligence",
    category: "business_intelligence",
    maturity: "partial",
    canonicalModules: [
      "lib/companionVisibilityIntelligence.ts",
      "lib/workspaceContextLock.ts",
    ],
    registrationChannel: "unregistered",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Advisory hints not in intervention registry"],
  },
  {
    id: "sales_intelligence",
    name: "Sales Intelligence",
    category: "business_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/companionSalesIntelligence.ts"],
    registrationChannel: "unregistered",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "launch_intelligence",
    name: "Launch Intelligence",
    category: "business_intelligence",
    maturity: "partial",
    canonicalModules: ["lib/companionValidationScenarios.ts"],
    registrationChannel: "unregistered",
    observable: true,
    learnable: false,
    personalizable: false,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Validated offline only"],
  },
  {
    id: "financial_intelligence",
    name: "Financial Intelligence",
    category: "business_intelligence",
    maturity: "future",
    canonicalModules: ["lib/ecosystem/revenue/"],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: ["Founder-scoped today — needs companion-first registration"],
  },
  // — Content Ecosystem —
  {
    id: "create_workspace",
    name: "Create Workspace",
    category: "content_ecosystem",
    maturity: "production",
    canonicalModules: ["lib/createCatalog.ts", "lib/workspaceMode.ts"],
    registrationChannel: "intervention_registry",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "content_planning",
    name: "Content Planning",
    category: "content_ecosystem",
    maturity: "partial",
    canonicalModules: ["lib/businessStrategyBuilder.ts"],
    registrationChannel: "tool_routing",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "content_generation",
    name: "Content Generation",
    category: "content_ecosystem",
    maturity: "partial",
    canonicalModules: ["app/api/generate/", "app/api/create-draft-review/"],
    registrationChannel: "intervention_registry",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "content_repurposing",
    name: "Content Repurposing",
    category: "content_ecosystem",
    maturity: "future",
    canonicalModules: [],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: ["Must register before build"],
  },
  {
    id: "social_posting",
    name: "Social Posting",
    category: "content_ecosystem",
    maturity: "partial",
    canonicalModules: ["lib/ecosystem/postcraft/"],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: ["PostCraft not companion-centered for end users"],
  },
  {
    id: "content_analytics_feedback",
    name: "Analytics Feedback",
    category: "content_ecosystem",
    maturity: "future",
    canonicalModules: [],
    registrationChannel: "unregistered",
    observable: false,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: false,
    companionFirst: false,
    debtRisks: [],
  },
  {
    id: "trend_detection",
    name: "Trend Detection",
    category: "content_ecosystem",
    maturity: "partial",
    canonicalModules: ["lib/ecosystem/liveContentOpportunityGenerator.ts"],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: true,
    companionConnected: false,
    companionFirst: false,
    debtRisks: ["Founder-only surface"],
  },
  // — Knowledge Ecosystem —
  {
    id: "knowledge_vault",
    name: "Knowledge Vault",
    category: "knowledge_ecosystem",
    maturity: "future",
    canonicalModules: [],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: [],
  },
  {
    id: "sop_builder",
    name: "SOP Builder",
    category: "knowledge_ecosystem",
    maturity: "future",
    canonicalModules: [],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: [],
  },
  {
    id: "templates",
    name: "Templates",
    category: "knowledge_ecosystem",
    maturity: "production",
    canonicalModules: ["lib/appFeatureKnowledge.ts", "app/api/templates/"],
    registrationChannel: "app_feature_knowledge",
    observable: false,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "strategies",
    name: "Strategies",
    category: "knowledge_ecosystem",
    maturity: "production",
    canonicalModules: ["lib/strategySystem.ts", "lib/userStrategies.ts"],
    registrationChannel: "app_feature_knowledge",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "snippets",
    name: "Snippets",
    category: "knowledge_ecosystem",
    maturity: "production",
    canonicalModules: ["app/api/snippets/"],
    registrationChannel: "app_feature_knowledge",
    observable: false,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "user_knowledge_graph",
    name: "User Knowledge Graph",
    category: "knowledge_ecosystem",
    maturity: "stub",
    canonicalModules: ["lib/intelligence-layer/types.ts"],
    registrationChannel: "signal_registry",
    observable: true,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Trait graph only — not full knowledge graph"],
  },
  // — Productivity Ecosystem —
  {
    id: "plan_my_day",
    name: "Plan My Day",
    category: "productivity_ecosystem",
    maturity: "production",
    canonicalModules: ["lib/appFeatureKnowledge.ts"],
    registrationChannel: "intervention_registry",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "adapt_my_day",
    name: "Today's Reality™",
    category: "productivity_ecosystem",
    maturity: "production",
    canonicalModules: ["lib/adaptMyDayChatRouting.ts", "lib/companionEcosystemIntent.ts"],
    registrationChannel: "companion_ecosystem_intent",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "clear_my_mind",
    name: "Clear My Mind",
    category: "productivity_ecosystem",
    maturity: "production",
    canonicalModules: ["lib/companionRouting.ts", "lib/intelligence-layer/interventionRegistry.ts"],
    registrationChannel: "intervention_registry",
    observable: true,
    learnable: true,
    personalizable: false,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "decision_compass",
    name: "Decision Compass",
    category: "productivity_ecosystem",
    maturity: "production",
    canonicalModules: [
      "lib/decision-intelligence/",
      "lib/companionEcosystemIntent.ts",
    ],
    registrationChannel: "companion_ecosystem_intent",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "projects",
    name: "Projects",
    category: "productivity_ecosystem",
    maturity: "production",
    canonicalModules: ["lib/myWorkHub.ts"],
    registrationChannel: "app_feature_knowledge",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "focus_systems",
    name: "Focus Systems",
    category: "productivity_ecosystem",
    maturity: "production",
    canonicalModules: ["lib/companionRouting.ts", "lib/workspaceMode.ts"],
    registrationChannel: "tool_routing",
    observable: true,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Emotional state → tool routing is hardcoded in companionRouting.ts"],
  },
  {
    id: "energy_systems",
    name: "Energy Systems",
    category: "productivity_ecosystem",
    maturity: "partial",
    canonicalModules: ["lib/user-health-intelligence/", "lib/companionEmotions.ts"],
    registrationChannel: "ecosystem_intelligence_layer",
    observable: true,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  // — Communication Ecosystem —
  {
    id: "email",
    name: "Email",
    category: "communication_ecosystem",
    maturity: "partial",
    canonicalModules: ["app/api/email-generator/", "lib/appFeatureKnowledge.ts"],
    registrationChannel: "app_feature_knowledge",
    observable: false,
    learnable: false,
    personalizable: true,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "calendar",
    name: "Calendar",
    category: "communication_ecosystem",
    maturity: "partial",
    canonicalModules: ["app/api/google/", "lib/ecosystem/google-workspace/"],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: ["Google integration not companion-routed"],
  },
  {
    id: "voice",
    name: "Voice",
    category: "communication_ecosystem",
    maturity: "partial",
    canonicalModules: ["app/api/tts/"],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "meetings",
    name: "Meetings",
    category: "communication_ecosystem",
    maturity: "future",
    canonicalModules: [],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: [],
  },
  {
    id: "client_communications",
    name: "Client Communications",
    category: "communication_ecosystem",
    maturity: "future",
    canonicalModules: [],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: [],
  },
  {
    id: "social_media",
    name: "Social Media",
    category: "communication_ecosystem",
    maturity: "partial",
    canonicalModules: ["lib/ecosystem/postcraft/"],
    registrationChannel: "unregistered",
    observable: false,
    learnable: false,
    personalizable: false,
    predictable: false,
    companionConnected: false,
    companionFirst: false,
    debtRisks: [],
  },
  // — Analytics Ecosystem (mostly future) —
  {
    id: "user_behavior_analytics",
    name: "User Behavior Analytics",
    category: "analytics_ecosystem",
    maturity: "partial",
    canonicalModules: ["lib/toolSuggestionAnalytics.ts", "lib/ecosystem/userIntelligenceEngine.ts"],
    registrationChannel: "signal_registry",
    observable: true,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Fragmented across client and founder"],
  },
  {
    id: "business_behavior_analytics",
    name: "Business Behavior Analytics",
    category: "analytics_ecosystem",
    maturity: "future",
    canonicalModules: [],
    registrationChannel: "unregistered",
    observable: false,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: false,
    companionFirst: false,
    debtRisks: [],
  },
  {
    id: "content_performance_analytics",
    name: "Content Performance Analytics",
    category: "analytics_ecosystem",
    maturity: "future",
    canonicalModules: [],
    registrationChannel: "unregistered",
    observable: false,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: false,
    companionFirst: false,
    debtRisks: [],
  },
  {
    id: "sales_performance_analytics",
    name: "Sales Performance Analytics",
    category: "analytics_ecosystem",
    maturity: "future",
    canonicalModules: ["lib/ecosystem/revenue/"],
    registrationChannel: "unregistered",
    observable: false,
    learnable: true,
    personalizable: false,
    predictable: true,
    companionConnected: false,
    companionFirst: false,
    debtRisks: [],
  },
  {
    id: "momentum_pattern_analytics",
    name: "Momentum Pattern Analytics",
    category: "analytics_ecosystem",
    maturity: "partial",
    canonicalModules: ["lib/momentum-intelligence/", "lib/companionActionBias.ts"],
    registrationChannel: "ecosystem_intelligence_layer",
    observable: true,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "completion_pattern_analytics",
    name: "Completion Pattern Analytics",
    category: "analytics_ecosystem",
    maturity: "partial",
    canonicalModules: ["lib/companionOutcomeThread.ts", "lib/intelligence-layer/trustEvolutionAudit.ts"],
    registrationChannel: "signal_registry",
    observable: true,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: [],
  },
  {
    id: "intervention_effectiveness_analytics",
    name: "Intervention Effectiveness Analytics",
    category: "analytics_ecosystem",
    maturity: "stub",
    canonicalModules: [
      "lib/intelligence-layer/interventionRegistry.ts",
      "lib/intelligence-layer/trustAttribution.ts",
    ],
    registrationChannel: "intervention_registry",
    observable: true,
    learnable: true,
    personalizable: true,
    predictable: true,
    companionConnected: true,
    companionFirst: true,
    debtRisks: ["Attribution not fully wired"],
  },
];

/** Five-question architecture rule — every new feature must pass. */
export function validateCapabilityDesign(input: {
  observable: boolean;
  learnable: boolean;
  personalizable: boolean;
  predictable: boolean;
  companionConnected: boolean;
}): CapabilityDesignValidation {
  const checks = [
    { key: "observable" as const, label: "Can this eventually become observable?" },
    { key: "learnable" as const, label: "Can this eventually become learnable?" },
    { key: "personalizable" as const, label: "Can this eventually become personalizable?" },
    { key: "predictable" as const, label: "Can this eventually become predictable?" },
    {
      key: "companionConnected" as const,
      label: "Can this connect to Companion Intelligence?",
    },
  ];

  const blockers = checks.filter((c) => !input[c.key]).map((c) => c.label);

  return {
    ...input,
    passesArchitectureRule: blockers.length === 0,
    blockers,
  };
}

/**
 * Combined gate — future-first three-layer rule + five-dimension capability design.
 */
export function validateFutureFirstCapability(input: {
  userValue: string;
  intelligenceCaptures: string[];
  futureEnables: string[];
  observable: boolean;
  learnable: boolean;
  personalizable: boolean;
  predictable: boolean;
  companionConnected: boolean;
}): {
  futureFirst: ReturnType<typeof evaluateFutureFirstFeature>;
  design: CapabilityDesignValidation;
  aligned: boolean;
  blockers: string[];
} {
  const futureFirst = evaluateFutureFirstFeature({
    userValue: input.userValue,
    intelligenceCaptures: input.intelligenceCaptures,
    futureEnables: input.futureEnables,
  });
  const design = validateCapabilityDesign({
    observable: input.observable,
    learnable: input.learnable,
    personalizable: input.personalizable,
    predictable: input.predictable,
    companionConnected: input.companionConnected,
  });
  const blockers = [...futureFirst.blockers, ...design.blockers];
  return {
    futureFirst,
    design,
    aligned: futureFirst.aligned && design.passesArchitectureRule,
    blockers,
  };
}

/** 2029 vision test — before major implementation. */
export function runVision2029Test(input: {
  scalesTenX: boolean;
  usesRegistrationNotHardcoding: boolean;
  companionRemainsCenter: boolean;
}): Vision2029Test {
  const checks = [
    { key: "scalesTenX" as const, label: "Will this architecture work if the ecosystem is 10x larger?" },
    {
      key: "usesRegistrationNotHardcoding" as const,
      label: "Does it register via systems instead of hardcoding workspaces/tools/boards?",
    },
    {
      key: "companionRemainsCenter" as const,
      label: "Does the companion remain the center (not another disconnected module)?",
    },
  ];

  const blockers = checks.filter((c) => !input[c.key]).map((c) => c.label);

  return {
    ...input,
    approved: blockers.length === 0,
    blockers,
  };
}

export function getCapabilitiesByCategory(
  category: FutureCapabilityCategory,
): FutureCapability[] {
  return FUTURE_CAPABILITIES.filter((c) => c.category === category);
}

export function evaluateFutureCapabilityPortfolio(): FutureCapabilityPortfolio {
  const byCategory = {} as Record<FutureCapabilityCategory, number>;
  const byMaturity = {} as Record<LayerMaturity, number>;

  for (const cat of Object.keys(FUTURE_CAPABILITY_CATEGORIES) as FutureCapabilityCategory[]) {
    byCategory[cat] = 0;
  }
  for (const m of ["production", "partial", "stub", "future"] as LayerMaturity[]) {
    byMaturity[m] = 0;
  }

  for (const cap of FUTURE_CAPABILITIES) {
    byCategory[cap.category] += 1;
    byMaturity[cap.maturity] += 1;
  }

  return {
    evaluatedAt: new Date().toISOString(),
    totalCapabilities: FUTURE_CAPABILITIES.length,
    byCategory,
    byMaturity,
    productionCount: byMaturity.production,
    futureCount: byMaturity.future,
    unregisteredCount: FUTURE_CAPABILITIES.filter((c) => c.registrationChannel === "unregistered")
      .length,
    companionDisconnectedCount: FUTURE_CAPABILITIES.filter((c) => !c.companionConnected).length,
    debtRiskCount: FUTURE_CAPABILITIES.reduce((n, c) => n + c.debtRisks.length, 0),
    capabilities: FUTURE_CAPABILITIES,
  };
}

export function formatFutureCapabilityReviewText(portfolio?: FutureCapabilityPortfolio): string {
  const p = portfolio ?? evaluateFutureCapabilityPortfolio();
  const categoryLines = (
    Object.entries(p.byCategory) as [FutureCapabilityCategory, number][]
  ).map(([cat, n]) => `  ${FUTURE_CAPABILITY_CATEGORIES[cat].label}: ${n}`);

  const unregistered = p.capabilities
    .filter((c) => c.registrationChannel === "unregistered" && c.maturity !== "future")
    .map((c) => c.name);

  return [
    "Future Capability Architecture Review",
    `Evaluated: ${p.evaluatedAt}`,
    `Total capabilities tracked: ${p.totalCapabilities}`,
    `Companion registry: see lib/companionCapabilityRegistry.ts (12/10 readiness in companionCapabilityReadiness.ts)`,
    `Production: ${p.productionCount} | Partial: ${p.byMaturity.partial} | Stub: ${p.byMaturity.stub} | Future: ${p.futureCount}`,
    `Unregistered (shipped or partial): ${unregistered.length}`,
    `Companion-disconnected: ${p.companionDisconnectedCount}`,
    `Debt risks documented: ${p.debtRiskCount}`,
    "By category:",
    ...categoryLines,
    unregistered.length
      ? `Shipped but unregistered: ${unregistered.join(", ")}`
      : "No partial/production capabilities lack registration.",
    "Registration channels: intervention_registry | signal_registry | app_feature_knowledge | ecosystem_intelligence_layer | companion_ecosystem_intent",
    "Before building: evaluateFutureFirstFeature() + validateCapabilityDesign() + runVision2029Test()",
  ].join("\n");
}

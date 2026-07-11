/**
 * Create Experience Philosophy (Spec 104).
 * How building a business inside Spark should feel — not screens or workflows.
 *
 * @see docs/CREATE_EXPERIENCE_PHILOSOPHY.md
 * @see docs/CREATE_PHILOSOPHY.md (T-004 — supplementary implementation)
 */

/** Every creation accomplishes four outcomes simultaneously */
export type CreatePurposeOutcome =
  | "build_something_valuable"
  | "strengthen_capability"
  | "improve_decision_quality"
  | "increase_confidence";

export const CREATE_PURPOSE_OUTCOMES: readonly CreatePurposeOutcome[] = [
  "build_something_valuable",
  "strengthen_capability",
  "improve_decision_quality",
  "increase_confidence",
] as const;

export const CREATE_PURPOSE_OUTCOME_LABELS: Record<CreatePurposeOutcome, string> = {
  build_something_valuable: "Build Something Valuable",
  strengthen_capability: "Strengthen Capability",
  improve_decision_quality: "Improve Decision Quality",
  increase_confidence: "Increase Confidence",
};

/** Governing Create principles — Spec 104 */
export type CreateExperiencePrinciple =
  | "hero"
  | "collaboration"
  | "thinking"
  | "momentum"
  | "confidence"
  | "decision"
  | "business_asset"
  | "connected_creation"
  | "executive_function";

export const CREATE_EXPERIENCE_PRINCIPLES: readonly CreateExperiencePrinciple[] = [
  "hero",
  "collaboration",
  "thinking",
  "momentum",
  "confidence",
  "decision",
  "business_asset",
  "connected_creation",
  "executive_function",
] as const;

/** Connected Creation — ecosystem targets */
export type CreateEcosystemConnection =
  | "business_brain"
  | "business_assets"
  | "guidance_engine"
  | "gallery"
  | "spark_cards"
  | "momentum_builders"
  | "capability_graph"
  | "transformation_graph"
  | "estate"
  | "community"
  | "guilds";

export const CREATE_ECOSYSTEM_CONNECTIONS: readonly CreateEcosystemConnection[] = [
  "business_brain",
  "business_assets",
  "guidance_engine",
  "gallery",
  "spark_cards",
  "momentum_builders",
  "capability_graph",
  "transformation_graph",
  "estate",
  "community",
  "guilds",
] as const;

/** Cognitive load — minimize */
export type CreateCognitiveLoadMinimize =
  | "decision_fatigue"
  | "prompt_anxiety"
  | "context_switching"
  | "information_overload"
  | "navigation_complexity";

export const CREATE_COGNITIVE_LOAD_MINIMIZE: readonly CreateCognitiveLoadMinimize[] = [
  "decision_fatigue",
  "prompt_anxiety",
  "context_switching",
  "information_overload",
  "navigation_complexity",
] as const;

/** Cognitive load — maximize */
export type CreateCognitiveLoadMaximize =
  | "clarity"
  | "momentum"
  | "recognition"
  | "confidence"
  | "progress";

export const CREATE_COGNITIVE_LOAD_MAXIMIZE: readonly CreateCognitiveLoadMaximize[] = [
  "clarity",
  "momentum",
  "recognition",
  "confidence",
  "progress",
] as const;

/** Guidance Philosophy — never generate before understanding */
export const CREATE_GUIDANCE_FLOW = [
  "understand",
  "guide",
  "collaborate",
  "create",
] as const;

export type CreateGuidanceFlowStage = (typeof CREATE_GUIDANCE_FLOW)[number];

/** Reflection Philosophy */
export const CREATE_REFLECTION_PROMPTS = [
  "What did I learn?",
  "What worked?",
  "What would I improve?",
  "How does this strengthen my business?",
] as const;

/** Decision domains strengthened through Create */
export type CreateDecisionDomain =
  | "marketing"
  | "sales"
  | "products"
  | "pricing"
  | "branding"
  | "customers"
  | "operations"
  | "growth"
  | "leadership";

export const CREATE_DECISION_DOMAINS: readonly CreateDecisionDomain[] = [
  "marketing",
  "sales",
  "products",
  "pricing",
  "branding",
  "customers",
  "operations",
  "growth",
  "leadership",
] as const;

/** Success Metrics */
export type CreateExperienceSuccessMetric =
  | "think_more_clearly"
  | "creating_easier"
  | "understand_business_better"
  | "work_feels_like_mine"
  | "know_what_to_create_next"
  | "becoming_better_entrepreneur";

export const CREATE_EXPERIENCE_SUCCESS_METRICS: readonly CreateExperienceSuccessMetric[] =
  [
    "think_more_clearly",
    "creating_easier",
    "understand_business_better",
    "work_feels_like_mine",
    "know_what_to_create_next",
    "becoming_better_entrepreneur",
  ] as const;

/** What Create should never become */
export type CreateAntiPattern =
  | "prompt_library"
  | "form_builder"
  | "template_collection"
  | "ai_content_factory"
  | "generator_dashboard"
  | "disconnected_tools";

export const CREATE_ANTI_PATTERNS: readonly CreateAntiPattern[] = [
  "prompt_library",
  "form_builder",
  "template_collection",
  "ai_content_factory",
  "generator_dashboard",
  "disconnected_tools",
] as const;

/** Mission framing */
export const CREATE_MISSION_POSITIVE =
  "This is where I build my business." as const;

export const CREATE_MISSION_NEGATIVE =
  "This is where AI writes things for me." as const;

/** Create experience spec gate — design-time checklist */
export type SparkCreateExperienceSpec = {
  purposeOutcomes: readonly CreatePurposeOutcome[];
  principlesHonored: readonly CreateExperiencePrinciple[];
  ecosystemConnections: readonly CreateEcosystemConnection[];
  executiveFunctionStrategy: string;
  guidanceFlow: readonly CreateGuidanceFlowStage[];
  reflectionPrompt?: string;
  strengthensDecisionIn?: readonly CreateDecisionDomain[];
  antiPatternsAvoided: readonly CreateAntiPattern[];
};

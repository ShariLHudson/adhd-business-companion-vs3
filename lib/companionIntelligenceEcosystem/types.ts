/**
 * Companion Intelligence™ Ecosystem — future-first architecture types.
 *
 * Build simple user experiences. Build powerful architecture underneath.
 * Spec: Future-First Architecture Rule (Companion Intelligence™ Ecosystem).
 */

/** Three-layer value every major feature must define. */
export type ThreeLayerFeatureValue = {
  /** What problem does this solve today? */
  userValue: string;
  /** What can the ecosystem learn? */
  intelligenceCaptures: string[];
  /** What future systems become possible? */
  futureEnables: string[];
};

/**
 * Companion Intelligence™ owns the experience — canonical pipeline for major features.
 * Visual Thinking™ maps to a subset via `visualThinkingPipelineStage`.
 */
export type CompanionIntelligencePipelineStage =
  | "user_situation"
  | "understanding"
  | "clarification"
  | "pattern_recognition"
  | "framework_selection"
  | "interactive_experience"
  | "insights"
  | "recommendations"
  | "learning_signals"
  | "future_intelligence";

export const COMPANION_INTELLIGENCE_PIPELINE_ORDER: CompanionIntelligencePipelineStage[] =
  [
    "user_situation",
    "understanding",
    "clarification",
    "pattern_recognition",
    "framework_selection",
    "interactive_experience",
    "insights",
    "recommendations",
    "learning_signals",
    "future_intelligence",
  ];

/** Intelligence analytics — not just usage counts. */
export type IntelligencePatternCategory =
  | "founder_decision"
  | "founder_momentum"
  | "overwhelm"
  | "business_growth"
  | "planning"
  | "content_creation"
  | "execution"
  | "energy"
  | "confidence"
  | "opportunity";

export const INTELLIGENCE_PATTERN_LABELS: Record<IntelligencePatternCategory, string> =
  {
    founder_decision: "Founder Decision Patterns™",
    founder_momentum: "Founder Momentum Patterns™",
    overwhelm: "Overwhelm Patterns™",
    business_growth: "Business Growth Patterns™",
    planning: "Planning Patterns™",
    content_creation: "Content Creation Patterns™",
    execution: "Execution Patterns™",
    energy: "Energy Patterns™",
    confidence: "Confidence Patterns™",
    opportunity: "Opportunity Patterns™",
  };

export type EcosystemMajorSystemId =
  | "visual-thinking"
  | "mind-map"
  | "decision-tree"
  | "business-canvas"
  | "relationship-map"
  | "strategy-map"
  | "project-map"
  | "visual-kanban"
  | "decision-compass"
  | "plan-my-day"
  | "clear-my-mind"
  | "projects"
  | "goals"
  | "adapt-my-day";

export type EcosystemMajorSystem = {
  id: EcosystemMajorSystemId;
  userLabel: string;
  threeLayer: ThreeLayerFeatureValue;
  learningSignals: string[];
  intelligencePatterns: IntelligencePatternCategory[];
  canonicalModules: string[];
};

export type FutureFirstEvaluation = {
  userValueDefined: boolean;
  intelligenceValueDefined: boolean;
  futureValueDefined: boolean;
  aligned: boolean;
  blockers: string[];
};

export const FUTURE_FIRST_CORE_PRINCIPLE = {
  userExperience: ["Simplicity", "Clarity", "Guidance", "Momentum"],
  systemMaintains: [
    "Intelligence",
    "Memory",
    "Relationships",
    "Learning",
    "Analytics",
    "Pattern recognition",
  ],
} as const;

export const FOUNDER_INTELLIGENCE_LEARNING_DOMAINS = [
  "How the user thinks",
  "How the user plans",
  "How the user decides",
  "How the user grows",
  "What repeatedly creates friction",
  "What repeatedly creates momentum",
] as const;

export const BOARD_INTELLIGENCE_DATA_SOURCES = [
  "User data",
  "Pattern data",
  "Historical decisions",
  "Business Canvas data",
  "Visual Thinking data",
  "Project data",
  "Goal data",
] as const;

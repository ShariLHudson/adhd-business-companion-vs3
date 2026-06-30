/**
 * Response Quality Framework™ (Spec 101).
 * What members should experience receiving responses — Spark OS defines production.
 *
 * @see docs/RESPONSE_QUALITY_FRAMEWORK.md
 */

/** Twelve Response Standards™ — evaluate every delivery */
export type SparkResponseStandard =
  | "accuracy"
  | "business_relevance"
  | "context"
  | "decision_support"
  | "executive_function"
  | "actionability"
  | "transformation"
  | "trust"
  | "ownership"
  | "emotional_experience"
  | "efficiency"
  | "connection";

export const SPARK_RESPONSE_STANDARD_ORDER: readonly SparkResponseStandard[] = [
  "accuracy",
  "business_relevance",
  "context",
  "decision_support",
  "executive_function",
  "actionability",
  "transformation",
  "trust",
  "ownership",
  "emotional_experience",
  "efficiency",
  "connection",
] as const;

export const SPARK_RESPONSE_STANDARD_LABELS: Record<SparkResponseStandard, string> = {
  accuracy: "Accuracy",
  business_relevance: "Business Relevance",
  context: "Context",
  decision_support: "Decision Support",
  executive_function: "Executive Function",
  actionability: "Actionability",
  transformation: "Transformation",
  trust: "Trust",
  ownership: "Ownership",
  emotional_experience: "Emotional Experience",
  efficiency: "Efficiency",
  connection: "Connection",
};

/** Evaluation questions per standard — authoring / QA checklist */
export const SPARK_RESPONSE_STANDARD_QUESTIONS: Record<
  SparkResponseStandard,
  readonly string[]
> = {
  accuracy: [
    "Is it correct?",
    "Is it internally consistent?",
    "Are assumptions clearly identified?",
  ],
  business_relevance: [
    "Does it reflect the Business Brain?",
    "Does it consider current projects?",
    "Does it acknowledge existing Business Assets?",
  ],
  context: [
    "Did Spark recall previous work?",
    "Did it connect related ideas?",
    "Did it preserve continuity?",
  ],
  decision_support: [
    "Were trade-offs explained?",
    "Were alternatives considered?",
    "Was reasoning transparent?",
  ],
  executive_function: [
    "Was information organized?",
    "Were next steps obvious?",
    "Were unnecessary decisions removed?",
  ],
  actionability: [
    "Is there a clear next action?",
    "Does the member know where to begin?",
    "Is the work broken into manageable pieces?",
  ],
  transformation: [
    "What capability was strengthened?",
    "What confidence increased?",
    "What understanding improved?",
  ],
  trust: [
    "Did Spark explain its reasoning when appropriate?",
    "Did it acknowledge uncertainty?",
    "Did it avoid pretending to know?",
  ],
  ownership: [
    'Does the member feel "I created this"?',
    "Did Spark collaborate without replacing member agency?",
  ],
  emotional_experience: [
    "Less overwhelmed?",
    "More hopeful, capable, focused, or encouraged?",
  ],
  efficiency: [
    "Were unnecessary questions avoided?",
    "Was repetition minimized?",
    "Was the response appropriately sized?",
  ],
  connection: [
    "Connected a Business Asset, Spark Card, Momentum, or Gallery when relevant?",
    "Referenced previous work naturally?",
  ],
};

/** Response Promise™ — how delivery should feel */
export type SparkResponsePromiseQuality =
  | "fast"
  | "accurate"
  | "relevant"
  | "personal"
  | "business_aware"
  | "executive_function_friendly"
  | "encouraging"
  | "actionable"
  | "trustworthy"
  | "calm"
  | "clear"
  | "strategic";

export const SPARK_RESPONSE_PROMISE_QUALITIES: readonly SparkResponsePromiseQuality[] =
  [
    "fast",
    "accurate",
    "relevant",
    "personal",
    "business_aware",
    "executive_function_friendly",
    "encouraging",
    "actionable",
    "trustworthy",
    "calm",
    "clear",
    "strategic",
  ] as const;

/** Match depth to member need */
export type SparkResponseDepth =
  | "instant"
  | "guided"
  | "strategic"
  | "transformational";

export const SPARK_RESPONSE_DEPTH_LABELS: Record<SparkResponseDepth, string> = {
  instant: "Instant",
  guided: "Guided",
  strategic: "Strategic",
  transformational: "Transformational",
};

export const SPARK_RESPONSE_DEPTH_GUIDANCE: Record<SparkResponseDepth, string> = {
  instant: "Simple answer — no unnecessary detail",
  guided: "Help think · provide options · encourage action",
  strategic: "Explore consequences · compare possibilities · support significant decisions",
  transformational:
    "Reshape thinking · challenge assumptions respectfully · build capability",
};

/** Final gate before delivery */
export const SPARK_RESPONSE_FINAL_EVALUATION_QUESTION =
  "Will this response help the member make a better decision than they would have made without Spark?" as const;

/** Member-reported success signals */
export const SPARK_RESPONSE_QUALITY_SUCCESS_SIGNALS = [
  "understands_my_business",
  "helps_think_more_clearly",
  "helps_make_better_decisions",
  "saves_mental_energy",
  "helps_move_forward",
  "trusted_thinking_partner",
] as const;

export type SparkResponseQualitySuccessSignal =
  (typeof SPARK_RESPONSE_QUALITY_SUCCESS_SIGNALS)[number];

/** Spec authoring template for response-related features */
export type SparkResponseQualitySpec = {
  featureName: string;
  targetDepth: SparkResponseDepth;
  prioritizedStandards: SparkResponseStandard[];
  decisionQualityImpact: string;
  efLoadReduction: string;
  connectionOpportunity?: string;
  finalEvaluationAnswer: string;
};

/** Post-delivery member outcome — the experience standard */
export type SparkResponseMemberOutcome = {
  understands: boolean;
  knowsWhatToDo: boolean;
  feelsMoreConfident: boolean;
  canMoveForward: boolean;
};

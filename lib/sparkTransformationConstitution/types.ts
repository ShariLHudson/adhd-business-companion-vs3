/**
 * Entrepreneurial Transformation Constitution (Spec 100).
 * Governs how members grow — Spark OS governs how Spark understands.
 *
 * @see docs/ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md
 */

/** Continuous transformation cycle — no finish line */
export type EntrepreneurialTransformationCycleStage =
  | "understanding"
  | "thinking"
  | "decision"
  | "action"
  | "reflection"
  | "learning"
  | "growth"
  | "better_understanding";

export const ENTREPRENEURIAL_TRANSFORMATION_CYCLE_ORDER: readonly EntrepreneurialTransformationCycleStage[] =
  [
    "understanding",
    "thinking",
    "decision",
    "action",
    "reflection",
    "learning",
    "growth",
    "better_understanding",
  ] as const;

/** Eight governing principles — every experience inherits these */
export type EntrepreneurialTransformationPrinciple =
  | "hero"
  | "cognitive_load"
  | "capability"
  | "transformation"
  | "connection"
  | "decision"
  | "ownership"
  | "trust_experience";

export const ENTREPRENEURIAL_TRANSFORMATION_PRINCIPLE_LABELS: Record<
  EntrepreneurialTransformationPrinciple,
  string
> = {
  hero: "Hero Principle",
  cognitive_load: "Cognitive Load Principle",
  capability: "Capability Principle",
  transformation: "Transformation Principle",
  connection: "Connection Principle",
  decision: "Decision Principle",
  ownership: "Ownership Principle",
  trust_experience: "Trust Experience Principle",
};

/** Seven capability domain families */
export type EntrepreneurialCapabilityDomain =
  | "executive"
  | "strategic"
  | "creative"
  | "business"
  | "leadership"
  | "modern_entrepreneur"
  | "personal_growth";

export const ENTREPRENEURIAL_CAPABILITY_DOMAIN_LABELS: Record<
  EntrepreneurialCapabilityDomain,
  string
> = {
  executive: "Executive Capabilities",
  strategic: "Strategic Capabilities",
  creative: "Creative Capabilities",
  business: "Business Capabilities",
  leadership: "Leadership Capabilities",
  modern_entrepreneur: "Modern Entrepreneur Capabilities",
  personal_growth: "Personal Growth Capabilities",
};

/** Canonical capabilities — experiences must strengthen at least one */
export type EntrepreneurialCapability =
  | "executive_function"
  | "focus"
  | "prioritization"
  | "planning"
  | "organization"
  | "follow_through"
  | "strategic_thinking"
  | "systems_thinking"
  | "critical_thinking"
  | "decision_making"
  | "opportunity_recognition"
  | "creative_thinking"
  | "innovation"
  | "storytelling"
  | "product_design"
  | "problem_solving"
  | "marketing"
  | "sales"
  | "branding"
  | "customer_understanding"
  | "pricing"
  | "operations"
  | "financial_thinking"
  | "communication"
  | "leadership"
  | "influence"
  | "delegation"
  | "coaching"
  | "relationship_building"
  | "ai_fluency"
  | "research_skills"
  | "digital_literacy"
  | "automation_thinking"
  | "workflow_design"
  | "confidence"
  | "resilience"
  | "adaptability"
  | "curiosity"
  | "courage"
  | "self_awareness";

/** Map capabilities to domain — for spec authoring and analytics */
export const ENTREPRENEURIAL_CAPABILITY_BY_DOMAIN: Record<
  EntrepreneurialCapabilityDomain,
  readonly EntrepreneurialCapability[]
> = {
  executive: [
    "executive_function",
    "focus",
    "prioritization",
    "planning",
    "organization",
    "follow_through",
  ],
  strategic: [
    "strategic_thinking",
    "systems_thinking",
    "critical_thinking",
    "decision_making",
    "opportunity_recognition",
  ],
  creative: [
    "creative_thinking",
    "innovation",
    "storytelling",
    "product_design",
    "problem_solving",
  ],
  business: [
    "marketing",
    "sales",
    "branding",
    "customer_understanding",
    "pricing",
    "operations",
    "financial_thinking",
  ],
  leadership: [
    "communication",
    "leadership",
    "influence",
    "delegation",
    "coaching",
    "relationship_building",
  ],
  modern_entrepreneur: [
    "ai_fluency",
    "research_skills",
    "digital_literacy",
    "automation_thinking",
    "workflow_design",
  ],
  personal_growth: [
    "confidence",
    "resilience",
    "adaptability",
    "curiosity",
    "courage",
    "self_awareness",
  ],
};

/** Seven questions — gate before implementation */
export type EntrepreneurialExperienceDesignQuestions = {
  capabilityStrengthened: string;
  growthRecognition: string;
  nextDecisionImprovement: string;
  businessInfluence: string;
  ecosystemConnection: string;
  cognitiveLoadReduction: string;
  leavesMoreCapable: string;
};

/** Experience spec inherits Constitution — required fields */
export type EntrepreneurialTransformationExperienceSpec = {
  experienceName: string;
  principlesHonored: EntrepreneurialTransformationPrinciple[];
  capabilitiesStrengthened: EntrepreneurialCapability[];
  cycleContribution: EntrepreneurialTransformationCycleStage[];
  designQuestions: EntrepreneurialExperienceDesignQuestions;
};

/** Ultimate success measure — not engagement metrics */
export const ENTREPRENEURIAL_TRANSFORMATION_SUCCESS_MEASURE =
  "quality_of_members_next_decision" as const;

/** Member-reported transformation signals */
export const ENTREPRENEURIAL_TRANSFORMATION_SUCCESS_SIGNALS = [
  "know_what_to_do_next",
  "less_overwhelmed",
  "decide_more_confidently",
  "finish_more",
  "business_clearer",
  "becoming_better_entrepreneur",
  "spark_helps_me_think_not_think_for_me",
] as const;

export type EntrepreneurialTransformationSuccessSignal =
  (typeof ENTREPRENEURIAL_TRANSFORMATION_SUCCESS_SIGNALS)[number];

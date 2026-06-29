/**
 * Founder Journey Framework™ — entrepreneurial journey stages (member experience).
 * Not rigid labels; members may loop. Infer quietly — never force UI selection.
 *
 * @see docs/FOUNDER_JOURNEY_FRAMEWORK.md
 */

/** Eight entrepreneurial journey stages — experience vocabulary */
export type EntrepreneurialJourneyStage =
  | "dream"
  | "clarify"
  | "design"
  | "build"
  | "launch"
  | "grow"
  | "multiply"
  | "legacy";

export const ENTREPRENEURIAL_JOURNEY_STAGE_ORDER: readonly EntrepreneurialJourneyStage[] = [
  "dream",
  "clarify",
  "design",
  "build",
  "launch",
  "grow",
  "multiply",
  "legacy",
] as const;

export const ENTREPRENEURIAL_JOURNEY_STAGE_LABELS: Record<
  EntrepreneurialJourneyStage,
  string
> = {
  dream: "Dream",
  clarify: "Clarify",
  design: "Design",
  build: "Build",
  launch: "Launch",
  grow: "Grow",
  multiply: "Multiply",
  legacy: "Legacy",
};

/** Capability emphasis per stage — guidance and Momentum adapt quietly */
export const ENTREPRENEURIAL_JOURNEY_CAPABILITIES: Record<
  EntrepreneurialJourneyStage,
  readonly string[]
> = {
  dream: ["creativity", "curiosity", "confidence"],
  clarify: ["strategic_thinking", "customer_understanding", "communication"],
  design: ["planning", "storytelling", "business_design"],
  build: ["executive_function", "focus", "consistency"],
  launch: ["marketing", "sales", "decision_making"],
  grow: ["leadership", "operations", "financial_thinking"],
  multiply: ["innovation", "delegation", "systems_thinking"],
  legacy: ["mentorship", "reflection", "influence", "teaching"],
};

/** Guidance emphasis per stage */
export const ENTREPRENEURIAL_JOURNEY_GUIDANCE_FOCUS: Record<
  EntrepreneurialJourneyStage,
  string
> = {
  dream: "exploration",
  clarify: "clarity",
  design: "structure",
  build: "execution",
  launch: "visibility_and_feedback",
  grow: "optimization",
  multiply: "expansion_and_impact",
  legacy: "contribution_and_reflection",
};

/** T-010 experience spec template */
export type SparkJourneyExperienceSpec = {
  experienceName: string;
  /** Inferred — may be multiple during pivots */
  journeyStages: EntrepreneurialJourneyStage[];
  capabilitiesEmphasized: string[];
  businessAssetConnection: string;
  guidanceAdaptation: string;
  communityOpportunity?: string;
  galleryConnection?: string;
  estateEvolution?: string;
};

/**
 * Experience Patterns — twelve reusable interaction patterns for Spark.
 *
 * @see docs/EXPERIENCE_PATTERNS.md
 */

export type SparkExperiencePatternId =
  | "discovery"
  | "clarity"
  | "creation"
  | "decision"
  | "practice"
  | "reflection"
  | "celebration"
  | "recovery"
  | "guidance"
  | "connection"
  | "legacy"
  | "curiosity";

export const SPARK_EXPERIENCE_PATTERN_LABELS: Record<SparkExperiencePatternId, string> = {
  discovery: "Discovery",
  clarity: "Clarity",
  creation: "Creation",
  decision: "Decision",
  practice: "Practice",
  reflection: "Reflection",
  celebration: "Celebration",
  recovery: "Recovery",
  guidance: "Guidance",
  connection: "Connection",
  legacy: "Legacy",
  curiosity: "Curiosity",
};

/** Pattern flow stages — not every experience uses every stage */
export type SparkExperienceFlowStage =
  | "arrival"
  | "orientation"
  | "participation"
  | "insight"
  | "application"
  | "reflection"
  | "connection"
  | "growth";

export const SPARK_EXPERIENCE_FLOW_ORDER: readonly SparkExperienceFlowStage[] = [
  "arrival",
  "orientation",
  "participation",
  "insight",
  "application",
  "reflection",
  "connection",
  "growth",
] as const;

/** Required fields for every new experience spec — T-005 template */
export type SparkExperienceSpec = {
  experienceName: string;
  primaryPattern: SparkExperiencePatternId;
  secondaryPattern?: SparkExperiencePatternId;
  capabilityStrengthened: string;
  businessAssetConnection: string;
  galleryConnection?: string;
  sparkCardConnection?: string;
  executiveFunctionSupport: string;
};

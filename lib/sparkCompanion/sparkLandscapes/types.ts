/**
 * Spark Landscapes™ — today's weather, not today's identity.
 * Spark recognizes temporary conditions; never labels people.
 */

export const SPARK_LANDSCAPE_QUESTION =
  "What landscape does today most resemble?" as const;

export const SPARK_LANDSCAPE_CORE_RULE =
  "Spark never labels people. Spark only recognizes today's landscape." as const;

export type SparkLandscapeId =
  | "fog"
  | "backpack"
  | "crossroads"
  | "maze"
  | "bridge"
  | "mirror_pond"
  | "mountain"
  | "river"
  | "seed"
  | "campfire";

export type SparkLandscapeDecision = {
  primary: SparkLandscapeId;
  secondary: readonly SparkLandscapeId[];
  confidence: "high" | "medium" | "low";
  /** Gentle metaphor — use sparingly, never forced */
  optionalMetaphor: string | null;
  reason: string;
};

export type SparkLandscapeHintInput = {
  userText: string;
  overwhelmed?: boolean;
};

export const SPARK_LANDSCAPE_FORBIDDEN = [
  "You have executive dysfunction",
  "You are in Fog mode",
  "Your landscape is",
  "Choose a landscape",
  "Select your state",
] as const;

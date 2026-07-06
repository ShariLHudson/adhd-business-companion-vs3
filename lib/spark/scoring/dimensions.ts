import type { SparkScoreDimension } from "../types";

/** Configurable scoring dimensions — weights sum to 1.0 by default. Values are 0–100. */
export const SPARK_SCORE_DIMENSIONS: readonly {
  dimension: SparkScoreDimension;
  label: string;
  defaultWeight: number;
  description: string;
}[] = [
  {
    dimension: "strategicValue",
    label: "Strategic Value",
    defaultWeight: 0.14,
    description: "Long-term ecosystem positioning",
  },
  {
    dimension: "customerImpact",
    label: "Customer Impact",
    defaultWeight: 0.14,
    description: "Member outcome and relationship quality",
  },
  {
    dimension: "revenuePotential",
    label: "Revenue Potential",
    defaultWeight: 0.1,
    description: "Monetization and growth upside",
  },
  {
    dimension: "founderImportance",
    label: "Founder Importance",
    defaultWeight: 0.1,
    description: "Executive leverage for Shari",
  },
  {
    dimension: "productImportance",
    label: "Product Importance",
    defaultWeight: 0.12,
    description: "Core product integrity",
  },
  {
    dimension: "innovationValue",
    label: "Innovation Value",
    defaultWeight: 0.08,
    description: "Novel capability or differentiation",
  },
  {
    dimension: "urgency",
    label: "Urgency",
    defaultWeight: 0.1,
    description: "Time sensitivity",
  },
  {
    dimension: "confidence",
    label: "Confidence",
    defaultWeight: 0.08,
    description: "Evidence strength",
  },
  {
    dimension: "learningValue",
    label: "Learning Value",
    defaultWeight: 0.08,
    description: "Institutional knowledge gained",
  },
  {
    dimension: "implementationEffort",
    label: "Implementation Effort",
    defaultWeight: 0.06,
    description: "Cost to execute (lower effort scores higher when inverted)",
  },
] as const;

export function sparkDimensionWeights(
  overrides?: Partial<Record<SparkScoreDimension, number>>,
): Record<SparkScoreDimension, number> {
  const base = Object.fromEntries(
    SPARK_SCORE_DIMENSIONS.map((d) => [d.dimension, d.defaultWeight]),
  ) as Record<SparkScoreDimension, number>;
  if (!overrides) return base;
  return { ...base, ...overrides };
}

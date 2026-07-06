/**
 * Optional Founder bridge — consumes SPARK without UI wiring.
 * Founder Studio imports this layer, not duplicate intelligence logic.
 */
import { Spark, type SparkOverview, type SparkPrepareContext } from "@/lib/spark";

export type FounderSparkOverview = SparkOverview & {
  product: "founder";
  topPatterns: ReturnType<typeof Spark.findPatterns>;
  founderRecommendations: ReturnType<typeof Spark.prepareRecommendations>;
};

export function getFounderSparkOverview(
  context: Omit<SparkPrepareContext, "product"> = {},
): FounderSparkOverview {
  const product = "founder" as const;
  const overview = Spark.getSparkOverview({ ...context, product });
  return {
    ...overview,
    product,
    topPatterns: Spark.findPatterns(),
    founderRecommendations: Spark.prepareRecommendations({ ...context, product }),
  };
}

/**
 * Spark Restoration Intelligence™
 * @see docs/estate/SPARK_RESTORATION_INTELLIGENCE.md
 */

export type {
  AdventureWheelEntry,
  EnergyRestorationOffer,
  RestorationRecommendation,
  RestorationRecommendationKind,
  SparkEnergyType,
  SparkRestorationEvaluation,
  SparkRestorationInput,
} from "./types";

export {
  recommendationsForEnergy,
  SPARK_ENERGY_REGISTRY,
} from "./energyRegistry";

export {
  formatAdventureWheelLine,
  pickAdventureEntry,
  TODAYS_ADVENTURE_WHEEL,
} from "./adventureWheel";

export { classifySparkEnergy } from "./detection";

export {
  buildEnergyRestorationOffer,
  evaluateSparkRestoration,
  formatEnergyRestorationReply,
  formatInlineEnergyStory,
  isEnergyRestorationOfferMessage,
  restorationIntelligenceHint,
} from "./engine";

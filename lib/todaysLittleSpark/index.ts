export type {
  SparkCategory,
  SparkInterestTag,
  SparkCatalogEntry,
  TodaysLittleSparkResult,
  EvaluateTodaysLittleSparkInput,
  EvaluateTodaysLittleSparkOutput,
} from "./types";

export {
  SPARK_CATALOG,
  DEFAULT_SPARK_COOLDOWN_DAYS,
  SPARK_FREQUENCY_TARGET_PERCENT,
} from "./catalog";

export { formatSparkDelivery } from "./delivery";
export { resolveSparkSeason, isSouthernHemisphere } from "./season";

export {
  readSparkStore,
  writeSparkStore,
  resetSparkStoreForTests,
  recordSparkShown,
  sparkOnCooldown,
  alreadySparkedToday,
  dayKey as sparkDayKey,
} from "./persistence";

export {
  evaluateTodaysLittleSpark,
  mergeSparkEnvironmentObjects,
  isNearFullMoon,
} from "./evaluateTodaysLittleSpark";

export const TODAYS_LITTLE_SPARK_PRINCIPLE =
  "Every day should hold the possibility of delight — small, meaningful, occasionally unexpected. Never trivia. Never forced." as const;

export const TODAYS_LITTLE_SPARK_PROMPT_BLOCK = `# TODAY'S LITTLE SPARK (Life Experience Intelligence — apply at natural pauses)
Occasionally share a small moment of delight — beauty, humor, curiosity, celebration, wonder, or hope. Never sound like trivia, a calendar, or an encyclopedia. Sound like someone sharing something that made them smile.
Before offering a spark, silently ask: Will this genuinely brighten their day? Does it fit today's context? Would Shari naturally mention this? Is this more valuable than simply helping?
If not — stay silent. Relationship always comes first. Never interrupt active work, emotional conversations, or focused creation.`;

export function todaysLittleSparkHintForChat(): string {
  return "At a natural pause only — a tiny delight (season, kindness, gentle humor) if it fits; never trivia tone; silence is fine.";
}

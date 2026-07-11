import type { SparkNoteDailyCard } from "./types";

/** User-facing opener for Ask Spark About This. */
export function buildSparkCardAskUserMessage(card: SparkNoteDailyCard): string {
  return [
    `I'm curious about today's Daily Spark — "${card.title}".`,
    card.teaser,
    "Tell me more about this.",
  ].join(" ");
}

/** Structured context block for companion intelligence. */
export function buildSparkCardChatContextBlock(card: SparkNoteDailyCard): string {
  return [
    `Daily Spark: ${card.title}`,
    `Category: ${card.categoryLabel}`,
    card.teaser,
    `The story: ${card.whatHappened}`,
    `Why it matters: ${card.whyItMatters}`,
    card.whyInteresting ? `Fun fact: ${card.whyInteresting}` : null,
    `Spark connection: ${card.sparkApplication}`,
  ]
    .filter(Boolean)
    .join("\n");
}

import { describe, expect, it } from "vitest";

import {
  buildSparkCardAskUserMessage,
  buildSparkCardChatContextBlock,
} from "./sparkCardChatContext";
import type { SparkNoteDailyCard } from "./types";

const sampleCard: SparkNoteDailyCard = {
  id: "SPARK-INV-001",
  category: "invention",
  categoryLabel: "Innovation",
  sparkType: "story",
  title: "The Post-it Note",
  shortTitle: "The Post-it Note",
  teaser: "A mistake that became one of the world's most useful inventions.",
  whatHappened: "A scientist accidentally created a reusable adhesive.",
  whyInteresting: "The company initially thought it was a failure.",
  whyItMatters: "The mistake became a beloved tool for capturing ideas.",
  sparkApplication: "What idea deserves another chance?",
  source: "library",
};

describe("sparkCardChatContext", () => {
  it("builds a curiosity-first ask prompt", () => {
    const prompt = buildSparkCardAskUserMessage(sampleCard);
    expect(prompt).toContain(sampleCard.title);
    expect(prompt).toContain("Tell me more about this.");
  });

  it("builds structured companion context from the card", () => {
    const block = buildSparkCardChatContextBlock(sampleCard);
    expect(block).toContain("Daily Spark: The Post-it Note");
    expect(block).toContain("Fun fact:");
    expect(block).toContain("Spark connection:");
  });
});

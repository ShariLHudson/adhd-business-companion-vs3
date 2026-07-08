import { describe, expect, it } from "vitest";

import {
  buildSparkIdeaClipboard,
  buildSparkJournalSeed,
  SPARK_NOTE_DESTINATION_ROUTES,
} from "./sparkNoteDestinations";
import type { SparkNoteDailyCard } from "./types";

const sampleCard: SparkNoteDailyCard = {
  id: "SPARK-TEST",
  category: "invention",
  categoryLabel: "History of Inventions",
  sparkType: "story",
  title: "The Post-it Note",
  shortTitle: "The Post-it Note",
  teaser: "A tiny idea that changed the world.",
  whatHappened: "A failed adhesive became a gift.",
  whyItMatters: "Ideas can arrive sideways.",
  sparkApplication: "What idea deserves another look?",
};

describe("sparkNoteDestinations", () => {
  it("builds clipboard payloads from the daily card", () => {
    expect(buildSparkIdeaClipboard(sampleCard)).toContain(sampleCard.title);
    expect(buildSparkJournalSeed(sampleCard)).toContain("Today's Spark");
  });

  it("maps destinations to companion routes", () => {
    expect(SPARK_NOTE_DESTINATION_ROUTES.journal).toContain("growth-journal");
    expect(SPARK_NOTE_DESTINATION_ROUTES.momentum).toContain("momentum-builder");
    expect(SPARK_NOTE_DESTINATION_ROUTES["idea-vault"]).toContain("evidence-bank");
  });
});

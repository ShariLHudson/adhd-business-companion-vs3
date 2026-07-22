import { describe, expect, it } from "vitest";

import { SPARK_CARD_DIVERSITY_CATEGORY_IDS } from "./sparkCardDiversity";
import { generateSparkCardExpandedContent } from "./sparkCardTellMeMoreGenerator";

/**
 * Focused tests for the Tell Me More generator — the fallback second layer
 * used whenever a card has no hand-authored `expanded` content (the vast
 * majority of the library). See
 * docs/spark-card/SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_REPORT.md
 */
describe("sparkCardTellMeMoreGenerator", () => {
  it("produces a fully-populated discovery layer for every diversity category", () => {
    for (const category of SPARK_CARD_DIVERSITY_CATEGORY_IDS) {
      const content = generateSparkCardExpandedContent({
        id: `TEST-${category}-001`,
        category: "fun_fact",
        categoryLabel: category,
        tags: [category],
        title: "Sample title",
      });

      expect(content.lookCloser?.length).toBeGreaterThan(0);
      expect(content.deeperStory?.length).toBeGreaterThan(0);
      expect(content.unexpectedConnection?.length).toBeGreaterThan(0);
      expect(content.tryThis?.length).toBeGreaterThan(0);
      expect(content.newFacts?.length).toBeGreaterThanOrEqual(3);
      expect(content.gallery?.length).toBeGreaterThanOrEqual(3);
      expect(content.sources?.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic — same card id always yields the same variant", () => {
    const input = {
      id: "SPARK-INV-001",
      category: "invention" as const,
      categoryLabel: "Invention",
      tags: ["invention"],
      title: "The Post-it Note",
    };
    const first = generateSparkCardExpandedContent(input);
    const second = generateSparkCardExpandedContent(input);
    expect(second).toEqual(first);
  });

  it("varies content across different card ids within the same category", () => {
    const base = {
      category: "invention" as const,
      categoryLabel: "Invention",
      tags: ["invention"],
      title: "Some invention",
    };
    const seen = new Set<string>();
    for (let i = 0; i < 12; i += 1) {
      const content = generateSparkCardExpandedContent({
        ...base,
        id: `SPARK-INV-${String(i).padStart(3, "0")}`,
      });
      seen.add(content.lookCloser ?? "");
    }
    // The bank has 3 variants per category — with 12 ids we should see
    // more than one distinct variant selected (proves it's not hard-coded
    // to a single fixed string regardless of id).
    expect(seen.size).toBeGreaterThan(1);
  });

  it("always returns populated content, even for an unrecognized label/tags", () => {
    const content = generateSparkCardExpandedContent({
      id: "SPARK-UNKNOWN-001",
      category: "personal",
      categoryLabel: "Something Unmapped",
      tags: [],
      title: "Mystery card",
    });
    expect(content.lookCloser?.length).toBeGreaterThan(0);
    expect(content.gallery?.length).toBeGreaterThan(0);
  });
});

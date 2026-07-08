import { describe, expect, it } from "vitest";

import {
  SPARK_NOTE_FALLBACK_ID,
  resolveFallbackSparkCard,
} from "./runtimeIntegration";

describe("runtimeIntegration", () => {
  it("resolves a friendly fallback spark from the catalog", () => {
    const card = resolveFallbackSparkCard();
    expect(card.id).toBe(SPARK_NOTE_FALLBACK_ID);
    expect(card.title.length).toBeGreaterThan(0);
    expect(card.teaser.length).toBeGreaterThan(0);
    expect(card.sparkApplication.length).toBeGreaterThan(0);
  });
});

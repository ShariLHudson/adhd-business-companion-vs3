/**
 * @vitest-environment jsdom
 *
 * Proves the reused Spark Card engine behind Welcome → "Show Me Something
 * Helpful" varies across consecutive "Something Else" requests (it must not
 * repeatedly return the first catalog item), mirroring the picker in
 * CompanionPageClient (requestNewDailySparkCard + a session recent-id guard).
 */
import { beforeEach, describe, expect, it } from "vitest";

import { requestNewDailySparkCard } from "./sparkCardVisualDesignAndDailyGeneration";
import { resetSparkNoteStoreForTests } from "./persistence";

/** Mirror of CompanionPageClient.pickWelcomeSparkCard session dedup. */
function pickSequence(count: number) {
  const recent: string[] = [];
  const cards = [];
  for (let n = 0; n < count; n++) {
    let chosen = requestNewDailySparkCard().card;
    for (let i = 0; i < 8 && recent.includes(chosen.id); i++) {
      chosen = requestNewDailySparkCard().card;
    }
    recent.push(chosen.id);
    cards.push(chosen);
  }
  return cards;
}

describe("Welcome Something Helpful — rich Spark selection variety", () => {
  beforeEach(() => {
    resetSparkNoteStoreForTests();
    localStorage.clear();
  });

  it("does not repeatedly return the first catalog item", () => {
    const first = requestNewDailySparkCard().card;
    const second = requestNewDailySparkCard().card;
    // Two forced selections should differ (recent-avoidance in the engine).
    expect(second.id).not.toBe(first.id);
  });

  it("five consecutive selections are distinct and span at least three categories", () => {
    const cards = pickSequence(5);
    const ids = new Set(cards.map((c) => c.id));
    expect(ids.size).toBe(5);
    const categories = new Set(cards.map((c) => c.category));
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });

  it("degrades gracefully when localStorage is unavailable (still avoids index 0 repeats)", () => {
    const original = window.localStorage;
    // Simulate storage failure: every access throws.
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("storage disabled");
      },
    });
    try {
      const cards = pickSequence(4);
      const ids = new Set(cards.map((c) => c.id));
      // In-memory session store keeps variety even with no persistence.
      expect(ids.size).toBeGreaterThanOrEqual(3);
    } finally {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        value: original,
      });
    }
  });
});

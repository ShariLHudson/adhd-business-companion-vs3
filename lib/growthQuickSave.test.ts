import { describe, expect, it } from "vitest";
import { recommendQuickSaveDestination } from "./growthQuickSave";

describe("growthQuickSave P0.40", () => {
  it('recommends My Journey™ for "I decided to hire a salesperson"', () => {
    const rec = recommendQuickSaveDestination(
      "I decided to hire a salesperson.",
    );
    expect(rec.recommended).toBe("my-journey");
  });

  it('recommends My Wins for "I signed a client"', () => {
    const rec = recommendQuickSaveDestination("I signed a client today.");
    expect(rec.recommended).toBe("wins");
  });

  it('recommends Evidence Bank for positive feedback', () => {
    const rec = recommendQuickSaveDestination(
      "Someone gave me good feedback on the beta.",
    );
    expect(rec.recommended).toBe("evidence");
  });

  it('recommends Portfolio for completed course', () => {
    const rec = recommendQuickSaveDestination("Finished my launch funnel course.");
    expect(rec.recommended).toBe("portfolio");
  });
});

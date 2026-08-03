import { describe, expect, it } from "vitest";
import type { SparkNoteCatalogEntry } from "../types";
import { selectionTierOf } from "./selectSchedule";

function entry(
  overrides: Partial<SparkNoteCatalogEntry> & { id: string },
): SparkNoteCatalogEntry {
  return {
    category: "001",
    categoryLabel: "Discovery",
    title: overrides.id,
    teaser: "t",
    whatHappened: "w",
    whyItMatters: "m",
    sparkApplication: "a",
    ...overrides,
  };
}

const US = "US";

describe("selectionTierOf — legacy records (unchanged classification)", () => {
  it("monthDay on its day → exact-date; off day → not eligible", () => {
    const card = entry({ id: "md", monthDay: { month: 10, day: 31 } });
    expect(selectionTierOf(card, new Date(2024, 9, 31), US)).toBe("exact-date");
    expect(selectionTierOf(card, new Date(2024, 9, 30), US)).toBeNull();
  });

  it("legacy months stay in the DATE tier (compat — never demoted to seasonal)", () => {
    const card = entry({ id: "mo", months: [12] });
    // December → date tier, exactly as the pre-Phase-3 selector treated it.
    expect(selectionTierOf(card, new Date(2024, 11, 10), US)).toBe("exact-date");
    // Out of month → not eligible (not silently a seasonal/core card).
    expect(selectionTierOf(card, new Date(2024, 5, 10), US)).toBeNull();
  });

  it("legacy seasons → seasonal (in-season) with no region gate", () => {
    const card = entry({ id: "se", seasons: ["winter"] });
    expect(selectionTierOf(card, new Date(2024, 0, 15), US)).toBe("seasonal");
  });

  it("legacy evergreen → core", () => {
    expect(selectionTierOf(entry({ id: "ev" }), new Date(2024, 5, 1), US)).toBe(
      "core",
    );
  });
});

describe("selectionTierOf — new-model records", () => {
  it("exact-date via flat month/day", () => {
    const card = entry({ id: "x", displayRule: "exact-date", month: 11, day: 11 });
    expect(selectionTierOf(card, new Date(2024, 10, 11), US)).toBe("exact-date");
    expect(selectionTierOf(card, new Date(2024, 10, 10), US)).toBeNull();
  });

  it("calculated-date on the computed holiday", () => {
    const thanks = entry({
      id: "tg",
      displayRule: "calculated-date",
      dateRule: "thanksgiving-us",
    });
    expect(selectionTierOf(thanks, new Date(2024, 10, 28), US)).toBe(
      "calculated-date",
    );
    expect(selectionTierOf(thanks, new Date(2024, 10, 27), US)).toBeNull();
  });

  it("seasonal month eligibility (in-month vs out-of-month)", () => {
    const fall = entry({
      id: "fa",
      displayRule: "seasonal",
      season: "autumn",
      months: [9, 10, 11],
    });
    expect(selectionTierOf(fall, new Date(2024, 9, 15), US)).toBe("seasonal");
    expect(selectionTierOf(fall, new Date(2024, 0, 15), US)).toBeNull();
  });

  it("new-model core", () => {
    const core = entry({ id: "c", displayRule: "core", volume: 2 });
    expect(selectionTierOf(core, new Date(2024, 5, 1), US)).toBe("core");
  });
});

describe("selectionTierOf — region gating (new structured region)", () => {
  const iowaFall = entry({
    id: "iowa",
    displayRule: "seasonal",
    season: "autumn",
    months: [9, 10, 11],
    region: "US-IA",
  });

  it("regional card is NOT eligible without a matching member region", () => {
    // Member region "US" (no saved state region) must not silently show it.
    expect(selectionTierOf(iowaFall, new Date(2024, 9, 15), "US")).toBeNull();
  });

  it("regional card is eligible when the member region matches", () => {
    expect(selectionTierOf(iowaFall, new Date(2024, 9, 15), "US-IA")).toBe(
      "seasonal",
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  bestHowDoIMatch,
  HOW_DO_I_STABLE_ORDER,
  normalizeHowDoIQuery,
  resolveHowDoI,
  searchHowDoI,
} from "./howDoIContent";

describe("howDoIContent", () => {
  it("normalizes how-do-i phrasing", () => {
    expect(normalizeHowDoIQuery("How do I create a strategy?")).toBe(
      "create a strategy",
    );
  });

  it("finds create strategy guide on submit", () => {
    expect(
      bestHowDoIMatch("How do I create a strategy?")?.id,
    ).toBe("create-strategy");
  });

  it("finds calendar for schedule appointment", () => {
    const hits = searchHowDoI("How do I schedule an appointment?");
    expect(hits.some((h) => h.openLabel === "Open Calendar")).toBe(true);
  });

  it("finds create for workshop", () => {
    const hits = searchHowDoI("How do I create a workshop?");
    expect(hits.some((h) => h.openLabel === "Open Create")).toBe(true);
  });

  it("always resolves to actionable guidance", () => {
    const entry = resolveHowDoI("xyzzy unknown thing");
    expect(entry.steps.length).toBeGreaterThan(0);
    expect(entry.openLabel).toBeTruthy();
  });

  it("finds dynamic vs meaning-based colors guide", () => {
    expect(bestHowDoIMatch(
      "what is the difference between dynamic and meaning based colors",
    )?.id).toBe("colors");
    const hits = searchHowDoI(
      "what is the difference between dynamic and meaning based colors",
    );
    expect(hits[0]?.id).toBe("colors");
    expect(hits[0]?.details?.length).toBeGreaterThan(1);
    expect(hits[0]?.openSettingsSection).toBe("appearance");
  });

  it("keeps search results in stable alphabetical order while typing", () => {
    const partial = searchHowDoI("dec");
    const full = searchHowDoI("decision");
    const titles = (rows: typeof partial) => rows.map((r) => r.title);
    for (let i = 1; i < partial.length; i++) {
      expect(partial[i - 1]!.title.localeCompare(partial[i]!.title)).toBeLessThanOrEqual(
        0,
      );
    }
    for (const row of partial) {
      expect(full.some((hit) => hit.id === row.id)).toBe(true);
    }
    for (let i = 1; i < full.length; i++) {
      expect(full[i - 1]!.title.localeCompare(full[i]!.title)).toBeLessThanOrEqual(
        0,
      );
    }
  });

  it("surfaces ADHD Decision Compass for decision-related searches", () => {
    const terms = [
      "decision",
      "decision maker",
      "decision compass",
      "help me decide",
      "compare two options",
      "choose between options",
      "strategic decision",
      "emotional decision",
    ];
    for (const term of terms) {
      const hits = searchHowDoI(term);
      expect(hits.some((h) => h.id === "decision-compass"), term).toBe(true);
      expect(bestHowDoIMatch(term)?.id, term).toBe("decision-compass");
    }
    const entry = hitsFor("decision compass");
    expect(entry.openLabel).toBe("Open Decision Compass");
    expect(entry.openActivityId).toBe("decision-compass");
    expect(entry.whatItIs).toMatch(/compare options/i);
  });

  it("lists all topics alphabetically when search is empty", () => {
    const browse = searchHowDoI("");
    expect(browse).toEqual(HOW_DO_I_STABLE_ORDER);
  });
});

function hitsFor(term: string) {
  return searchHowDoI(term).find((h) => h.id === "decision-compass")!;
}

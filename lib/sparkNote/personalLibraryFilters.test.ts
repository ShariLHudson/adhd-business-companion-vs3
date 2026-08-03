import { describe, expect, it } from "vitest";
import type { MySparkSavedItem } from "./mySparksCollection";
import {
  PERSONAL_LIBRARY_ALPHABET_RANGES,
  PERSONAL_LIBRARY_DATE_OPTIONS,
  PERSONAL_LIBRARY_ITEM_TYPES,
  alphabetRangeOf,
  filterAndSortPersonalLibrary,
  firstMeaningfulLetter,
  matchesDateOption,
  personalLibraryEmptyState,
  shouldShowPersonalLibraryResults,
  sparkRecordsForItemType,
} from "./personalLibraryFilters";

function spark(
  overrides: Partial<MySparkSavedItem> & { id: string; title: string },
): MySparkSavedItem {
  return {
    category: "001",
    categoryLabel: "Discovery",
    shortTitle: overrides.title,
    teaser: "",
    savedAtIso: "2026-08-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("Personal Library filter — approved options", () => {
  it("Item Type contains exactly the five approved options, in order", () => {
    expect(PERSONAL_LIBRARY_ITEM_TYPES.map((o) => o.label)).toEqual([
      "Spark Cards",
      "My Ideas & Notes",
      "Actions I Tried",
      "What I’ve Learned",
      "Questions to Revisit",
    ]);
  });

  it("Alphabet Range contains exactly A–F, G–L, M–R, S–Z", () => {
    expect(PERSONAL_LIBRARY_ALPHABET_RANGES.map((o) => o.label)).toEqual([
      "A–F",
      "G–L",
      "M–R",
      "S–Z",
    ]);
  });

  it("Date contains the approved narrowing + sort options", () => {
    expect(PERSONAL_LIBRARY_DATE_OPTIONS.map((o) => o.label)).toEqual([
      "All dates",
      "Today",
      "This week",
      "This month",
      "Last 30 days",
      "Newest first",
      "Oldest first",
    ]);
  });
});

describe("Alphabet bucketing by first meaningful letter", () => {
  it("skips leading punctuation to the first letter", () => {
    expect(firstMeaningfulLetter("“Quiet” Wins")).toBe("Q");
    expect(firstMeaningfulLetter("  answer")).toBe("A");
  });

  it("does NOT strip leading articles (stays consistent with search rules)", () => {
    // "The Microwave Oven Accident" buckets under T (S–Z), not M.
    expect(alphabetRangeOf("The Microwave Oven Accident")).toBe("s-z");
  });

  it("maps first letters to the right range", () => {
    expect(alphabetRangeOf("Apple")).toBe("a-f");
    expect(alphabetRangeOf("Grow")).toBe("g-l");
    expect(alphabetRangeOf("Map")).toBe("m-r");
    expect(alphabetRangeOf("Zephyr")).toBe("s-z");
  });
});

describe("Gate — no results before Item Type AND Alphabet Range", () => {
  it("requires both selections", () => {
    expect(shouldShowPersonalLibraryResults("", "")).toBe(false);
    expect(shouldShowPersonalLibraryResults("spark-cards", "")).toBe(false);
    expect(shouldShowPersonalLibraryResults("", "a-f")).toBe(false);
    expect(shouldShowPersonalLibraryResults("spark-cards", "a-f")).toBe(true);
  });

  it("filterAndSortPersonalLibrary returns nothing without an alphabet range", () => {
    const records = [{ title: "Apple", dateIso: "2026-08-01T00:00:00.000Z" }];
    expect(
      filterAndSortPersonalLibrary({
        records,
        alphabetRange: "",
        dateOption: "all",
      }),
    ).toEqual([]);
  });
});

describe("Item Type record sources (real vs honest-empty)", () => {
  const withNote = spark({ id: "a", title: "Apple", note: "my idea" });
  const noNote = spark({ id: "b", title: "Banana" });

  it("Spark Cards = all saved Sparks", () => {
    expect(
      sparkRecordsForItemType("spark-cards", [withNote, noNote]).map((s) => s.id),
    ).toEqual(["a", "b"]);
  });

  it("My Ideas & Notes = saved Sparks that carry a note", () => {
    expect(
      sparkRecordsForItemType("ideas-notes", [withNote, noNote]).map((s) => s.id),
    ).toEqual(["a"]);
  });

  it("Actions/Learned/Questions have no records yet (honest empty)", () => {
    for (const type of ["actions-tried", "learned", "questions"] as const) {
      expect(sparkRecordsForItemType(type, [withNote, noNote])).toEqual([]);
      expect(personalLibraryEmptyState(type).heading.length).toBeGreaterThan(0);
      expect(personalLibraryEmptyState(type).body.length).toBeGreaterThan(0);
    }
  });
});

describe("Date narrows real results", () => {
  const now = new Date("2026-08-15T12:00:00.000Z");
  const records = [
    { title: "Apple", dateIso: "2026-08-15T09:00:00.000Z" }, // today
    { title: "Acorn", dateIso: "2026-08-10T09:00:00.000Z" }, // this month, >last week
    { title: "Anchor", dateIso: "2026-06-01T09:00:00.000Z" }, // old
  ];

  it("Today keeps only today's records", () => {
    const out = filterAndSortPersonalLibrary({
      records,
      alphabetRange: "a-f",
      dateOption: "today",
      now,
    });
    expect(out.map((r) => r.title)).toEqual(["Apple"]);
  });

  it("This month keeps August records only", () => {
    const out = filterAndSortPersonalLibrary({
      records,
      alphabetRange: "a-f",
      dateOption: "this-month",
      now,
    });
    expect(out.map((r) => r.title)).toEqual(["Apple", "Acorn"]);
  });

  it("Last 30 days excludes the June record", () => {
    const out = filterAndSortPersonalLibrary({
      records,
      alphabetRange: "a-f",
      dateOption: "last-30-days",
      now,
    });
    expect(out.map((r) => r.title)).toEqual(["Apple", "Acorn"]);
  });

  it("matchesDateOption: pure-sort options never narrow", () => {
    expect(matchesDateOption(null, "newest")).toBe(true);
    expect(matchesDateOption(null, "oldest")).toBe(true);
    expect(matchesDateOption(null, "all")).toBe(true);
    expect(matchesDateOption(null, "today")).toBe(false);
  });

  it("Oldest first reverses order", () => {
    const out = filterAndSortPersonalLibrary({
      records,
      alphabetRange: "a-f",
      dateOption: "oldest",
      now,
    });
    expect(out.map((r) => r.title)).toEqual(["Anchor", "Acorn", "Apple"]);
  });
});

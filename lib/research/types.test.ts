import { describe, expect, it } from "vitest";
import {
  findingMayShowCitation,
  isRealSourceCitation,
  makeFinding,
  type ResearchSourceCitation,
} from "./types";

const realSource: ResearchSourceCitation = {
  title: "Statista — SMB software spend 2026",
  url: "https://example.com/report",
  publisher: "Statista",
  retrievalDate: "2026-07-27T00:00:00.000Z",
  publicationDate: "2026-06-01",
};

describe("citation honesty invariant", () => {
  it("a live_source finding with a complete source may show citations", () => {
    const f = makeFinding({
      id: "f1",
      title: "SMB software spend is rising",
      content: "…",
      kind: "fact",
      evidenceBasis: "live_source",
      sources: [realSource],
      confidence: "high",
      freshness: "current",
      verificationStatus: "verified",
    });
    expect(findingMayShowCitation(f)).toBe(true);
    expect(f.sources).toHaveLength(1);
    expect(f.confidence).toBe("high");
  });

  it("interpretation/guidance/user_provided can NEVER show citations, even if sources are supplied", () => {
    for (const basis of [
      "interpretation",
      "built_in_guidance",
      "user_provided",
    ] as const) {
      const f = makeFinding({
        id: "f",
        title: "t",
        content: "c",
        kind: "inference",
        evidenceBasis: basis,
        // Someone tries to smuggle a real-looking source onto a non-source finding:
        sources: [realSource],
        confidence: "high",
        freshness: "current",
        verificationStatus: "verified",
      });
      // Constructor strips the sources and source-derived quality labels…
      expect(f.sources).toEqual([]);
      expect(f.confidence).toBeUndefined();
      expect(f.freshness).toBeUndefined();
      expect(f.verificationStatus).toBeUndefined();
      // …and the render gate refuses citations.
      expect(findingMayShowCitation(f), basis).toBe(false);
    }
  });

  it("a live_source finding with incomplete citation metadata may NOT show citations", () => {
    const incomplete: ResearchSourceCitation[] = [
      { title: "", url: "https://x", retrievalDate: "2026-07-27" }, // no title
      { title: "T", retrievalDate: "2026-07-27" }, // no locator
      { title: "T", url: "https://x", retrievalDate: "" }, // no retrieval date
    ];
    for (const src of incomplete) {
      const f = makeFinding({
        id: "f",
        title: "t",
        content: "c",
        kind: "fact",
        evidenceBasis: "live_source",
        sources: [src],
      });
      // Non-real sources are filtered out by the constructor, so no citation.
      expect(findingMayShowCitation(f)).toBe(false);
    }
  });

  it("isRealSourceCitation requires title + (url|sourceId) + retrievalDate", () => {
    expect(isRealSourceCitation(realSource)).toBe(true);
    expect(
      isRealSourceCitation({
        title: "T",
        sourceId: "conn:abc",
        retrievalDate: "2026-07-27",
      }),
    ).toBe(true);
    expect(
      isRealSourceCitation({ title: "T", retrievalDate: "2026-07-27" }),
    ).toBe(false);
  });

  it("a live_source finding with zero sources may not show citations", () => {
    const f = makeFinding({
      id: "f",
      title: "t",
      content: "c",
      kind: "fact",
      evidenceBasis: "live_source",
      sources: [],
    });
    expect(findingMayShowCitation(f)).toBe(false);
  });
});

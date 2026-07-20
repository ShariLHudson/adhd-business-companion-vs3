/**
 * @vitest-environment jsdom
 * P0 — Current Focus: one explanation, one fact, destination-specific copy.
 */
import { describe, expect, it } from "vitest";
import {
  buildCanonicalKnownFacts,
  knownFactDisplayLines,
} from "./canonicalFacts";

describe("Current Focus composition", () => {
  it("dedupes identical overview/purpose fact values", () => {
    const facts = buildCanonicalKnownFacts(
      {
        overview: "Leadership retreat for founders",
        purpose: "Leadership retreat for founders",
        audience: "Founders",
      },
      [
        { id: "overview", label: "Overview" },
        { id: "purpose", label: "Purpose" },
        { id: "audience", label: "Audience" },
      ],
    );
    expect(facts).toHaveLength(2);
    expect(facts.map((f) => f.label).sort()).toEqual(["Audience", "Overview"]);
  });

  it("knownFactDisplayLines never repeats the same value", () => {
    const lines = knownFactDisplayLines([
      {
        id: "fact:overview",
        sectionId: "overview",
        label: "Overview",
        value: "Same text",
      },
      {
        id: "fact:purpose",
        sectionId: "purpose",
        label: "Purpose",
        value: "Same text",
      },
    ]);
    expect(lines).toEqual(["Overview: Same text"]);
  });
});

import { describe, expect, it } from "vitest";

import {
  evaluateEstateExpansion,
  expansionRequiresMerge,
} from "./estateExpansionEngine";

describe("Estate Expansion Engine™ (Phase H.2)", () => {
  it('"wins room" merges into Celebration Room + Accomplishments Book', () => {
    const result = evaluateEstateExpansion({ name: "wins room" });
    expect(result.classification).toBe("Reject / Not Needed");
    expect(expansionRequiresMerge(result)).toBe(true);
    expect(result.mergeRecommendation).toMatch(/Celebration Room/i);
    expect(result.mergeRecommendation).toMatch(/Accomplishments Book/i);
    expect(result.conflictsWithExisting.join(" ")).toMatch(/celebration-room/);
    expect(result.conflictsWithExisting.join(" ")).toMatch(
      /accomplishments-shelf/,
    );
    expect(result.requiresHumanApproval).toBe(false);
  });

  it('"gallery" does not become a new room', () => {
    const result = evaluateEstateExpansion({ name: "gallery" });
    expect(result.classification).toBe("Reject / Not Needed");
    expect(expansionRequiresMerge(result)).toBe(true);
    expect(result.mergeRecommendation).toMatch(/Creative Studio/i);
    expect(result.mergeRecommendation).toMatch(/Portfolio/i);
    expect(result.conflictsWithExisting.join(" ")).toMatch(/creative-studio/);
    expect(result.conflictsWithExisting.join(" ")).toMatch(/portfolio/);
    expect(result.requiresHumanApproval).toBe(true);
  });

  it('"new idea: quiet thinking space" suggests Reading Nook / Conservatory merge', () => {
    const result = evaluateEstateExpansion({
      name: "new idea: quiet thinking space",
    });
    expect(result.classification).toBe("Living Place");
    expect(expansionRequiresMerge(result)).toBe(true);
    expect(result.mergeRecommendation).toMatch(/Reading Nook/i);
    expect(result.mergeRecommendation).toMatch(/Conservatory/i);
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.reasoning).toMatch(/merge|overlap|restorative/i);
  });

  it("rejects guidebook as a room", () => {
    const result = evaluateEstateExpansion({ name: "guidebook room" });
    expect(result.classification).toBe("Object");
    expect(result.mergeRecommendation).toMatch(/portable/i);
    expect(result.requiresHumanApproval).toBe(false);
  });

  it("never returns empty reasoning", () => {
    const cases = [
      { name: "wins room" },
      { name: "gallery" },
      { name: "new idea: quiet thinking space" },
      { name: "" },
    ];
    for (const input of cases) {
      expect(evaluateEstateExpansion(input).reasoning.length).toBeGreaterThan(
        0,
      );
    }
  });
});

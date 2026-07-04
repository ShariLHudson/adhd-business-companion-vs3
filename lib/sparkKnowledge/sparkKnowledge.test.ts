/**
 * Spark Knowledge Registry tests
 */

import { describe, expect, it } from "vitest";
import {
  allSparkKnowledgeEntries,
  isEstateGuideQuestion,
  resolveEstateGuideTurn,
  searchSparkKnowledge,
  sparkKnowledgeByKind,
  thinkingFrameworkById,
  recommendationsForEvent,
} from "./index";

describe("sparkKnowledge", () => {
  it("indexes experiences, capabilities, frameworks, creation, and experts", () => {
    const all = allSparkKnowledgeEntries();
    expect(all.length).toBeGreaterThan(60);
    expect(sparkKnowledgeByKind("framework").length).toBeGreaterThanOrEqual(10);
    expect(sparkKnowledgeByKind("creation").length).toBeGreaterThanOrEqual(10);
    expect(sparkKnowledgeByKind("expert").length).toBeGreaterThanOrEqual(10);
  });

  it("searches mind map framework", () => {
    const result = searchSparkKnowledge("what is a mind map framework");
    const ids = result.matches.map((m) => m.entry.id);
    expect(ids).toContain("mind-map");
  });

  it("searches create experience", () => {
    const result = searchSparkKnowledge("write an email");
    expect(result.best?.entry.kind).toMatch(/creation|experience|capability/);
  });

  it("explains SWOT framework", () => {
    const swot = thinkingFrameworkById("swot");
    expect(swot?.explain.when).toMatch(/planning|pivot/i);
    expect(swot?.explain.related).toContain("Decision Matrix");
  });

  it("detects estate guide questions", () => {
    expect(isEstateGuideQuestion("What can Spark do?")).toBe(true);
    expect(isEstateGuideQuestion("Tell me about the Butterfly Conservatory")).toBe(
      true,
    );
    expect(isEstateGuideQuestion("write an email to my client")).toBe(false);
  });

  it("resolves capabilities guide topic", () => {
    const turn = resolveEstateGuideTurn("What can Spark do?");
    expect(turn.topic).toBe("capabilities");
    expect(turn.body).toMatch(/Create|Momentum/i);
    expect(turn.responseHint).toMatch(/ESTATE GUIDE/i);
  });

  it("resolves room story for conservatory", () => {
    const turn = resolveEstateGuideTurn(
      "Tell me about the Butterfly Conservatory",
    );
    expect(turn.topic).toBe("room_story");
    expect(turn.matchedPlaceId).toBe("conservatory");
    expect(turn.body).toMatch(/Conservatory|conservatory/i);
  });

  it("recommends checklist after SOP", () => {
    const recs = recommendationsForEvent("sop_completed");
    expect(recs.some((r) => r.label === "Checklist")).toBe(true);
  });

  it("recommends social posts after newsletter", () => {
    const recs = recommendationsForEvent("newsletter_completed");
    expect(recs.some((r) => r.label.includes("Social"))).toBe(true);
  });
});

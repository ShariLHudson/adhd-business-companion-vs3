import { describe, expect, it } from "vitest";
import {
  Spark,
  SPARK_SCORE_DIMENSIONS,
  sparkPatternService,
  sparkRelationshipService,
  sparkScoringService,
  sparkRecommendationService,
} from "./index";

describe("SPARK public API", () => {
  it("exports stable observe, score, prioritize, connect, and overview methods", () => {
    expect(typeof Spark.observe).toBe("function");
    expect(typeof Spark.score).toBe("function");
    expect(typeof Spark.prioritize).toBe("function");
    expect(typeof Spark.connect).toBe("function");
    expect(typeof Spark.prepareRecommendations).toBe("function");
    expect(typeof Spark.findPatterns).toBe("function");
    expect(typeof Spark.getKnowledgeItems).toBe("function");
    expect(typeof Spark.getSparkOverview).toBe("function");
  });

  it("observe returns sources, signals, observations, findings, patterns, and themes", () => {
    const result = Spark.observe();
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.signals.length).toBeGreaterThan(0);
    expect(result.observations.length).toBeGreaterThan(0);
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.patterns.length).toBeGreaterThan(0);
    expect(result.themes.length).toBeGreaterThan(0);
  });

  it("score returns 0–100 dimensions including all ten scoring keys", () => {
    const { scores, composite } = Spark.score({
      strategicValue: 90,
      customerImpact: 85,
      urgency: 70,
    });
    expect(scores.length).toBe(3);
    expect(composite).toBeGreaterThan(0);
    expect(composite).toBeLessThanOrEqual(100);
    expect(SPARK_SCORE_DIMENSIONS.length).toBe(10);
    expect(SPARK_SCORE_DIMENSIONS.map((d) => d.dimension)).toContain("strategicValue");
    expect(SPARK_SCORE_DIMENSIONS.map((d) => d.dimension)).toContain("implementationEffort");
  });

  it("prioritize ranks sample priorities by composite score", () => {
    const priorities = Spark.prioritize(2);
    expect(priorities).toHaveLength(2);
    expect(priorities[0]!.compositeScore).toBeGreaterThanOrEqual(priorities[1]!.compositeScore);
  });

  it("findPatterns returns ADHD gentle re-entry sample pattern", () => {
    const patterns = Spark.findPatterns();
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0]!.summary).toMatch(/re-entry|restart|interruption/i);
  });

  it("connect exposes lineage, graph, and entity connections", () => {
    const { lineage, graph, connections } = Spark.connect();
    expect(lineage.chain.length).toBeGreaterThan(0);
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(connections.length).toBeGreaterThan(0);
  });

  it("prepareRecommendations filters by product scope", () => {
    const founder = Spark.prepareRecommendations({ product: "founder", limit: 5 });
    expect(founder.every((r) => r.preparedFor === "founder")).toBe(true);
    expect(founder.some((r) => r.title.toLowerCase().includes("cursor"))).toBe(true);
  });

  it("getKnowledgeItems returns linkable knowledge entries", () => {
    const items = Spark.getKnowledgeItems();
    expect(items.some((k) => k.title.includes("Listening Rooms"))).toBe(true);
    expect(items.some((k) => k.title.includes("Decision Compass"))).toBe(true);
  });

  it("getSparkOverview returns ecosystem counts", () => {
    const overview = Spark.getSparkOverview();
    expect(overview.headline).toBeTruthy();
    expect(overview.patternCount).toBeGreaterThan(0);
    expect(overview.topPatternTitle).toBeTruthy();
    expect(overview.preparedAt).toBeTruthy();
  });
});

describe("SPARK pattern service", () => {
  it("groups signals and ranks patterns by confidence", () => {
    const groups = sparkPatternService.groupSignals();
    expect(groups.size).toBeGreaterThan(0);
    const ranked = sparkPatternService.rankImportance();
    expect(ranked[0]!.confidence.score).toBeGreaterThanOrEqual(
      ranked[ranked.length - 1]!.confidence.score,
    );
  });
});

describe("SPARK relationship service", () => {
  it("returns connections and research-to-result lineage", () => {
    const connections = sparkRelationshipService.listConnections();
    expect(connections.length).toBeGreaterThan(0);
    const lineage = sparkRelationshipService.buildLineageRelationship();
    expect(lineage.summary).toMatch(/research|insight|campaign|nurture/i);
    expect(lineage.chain.length).toBeGreaterThanOrEqual(7);
  });
});

describe("SPARK scoring service", () => {
  it("inverts implementation effort on 0–100 scale", () => {
    const lowEffort = sparkScoringService.composite([
      { dimension: "implementationEffort", value: 20, weight: 0.06 },
    ]);
    const highEffort = sparkScoringService.composite([
      { dimension: "implementationEffort", value: 90, weight: 0.06 },
    ]);
    expect(lowEffort).toBeGreaterThan(highEffort);
  });
});

describe("SPARK recommendation service", () => {
  it("includes PostCraft and GHL nurture sample recommendation", () => {
    const recs = sparkRecommendationService.prepare({ product: "postcraft", limit: 5 });
    expect(recs.some((r) => r.summary.toLowerCase().includes("ghl"))).toBe(true);
  });
});

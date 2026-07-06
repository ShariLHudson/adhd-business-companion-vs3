import { describe, expect, it } from "vitest";
import {
  Spark,
  patternEngine,
  scoringEngine,
  relationshipService,
  recommendationPreparationService,
  SPARK_SCORE_DIMENSIONS,
} from "./index";

describe("SPARK Intelligence Core", () => {
  it("observe returns signals, observations, patterns, and themes", () => {
    const result = Spark.observe();
    expect(result.signals.length).toBeGreaterThan(0);
    expect(result.observations.length).toBeGreaterThan(0);
    expect(result.patterns.length).toBeGreaterThan(0);
    expect(result.themes.length).toBeGreaterThan(0);
  });

  it("score computes composite from configurable dimensions", () => {
    const { scores, composite } = Spark.score({
      "strategic-value": 0.9,
      "customer-impact": 0.85,
      urgency: 0.7,
    });
    expect(scores.length).toBe(3);
    expect(composite).toBeGreaterThan(0);
    expect(composite).toBeLessThanOrEqual(1);
    expect(SPARK_SCORE_DIMENSIONS.length).toBe(10);
  });

  it("prioritize ranks sample priorities by composite score", () => {
    const priorities = Spark.prioritize(2);
    expect(priorities).toHaveLength(2);
    expect(priorities[0]!.compositeScore).toBeGreaterThanOrEqual(
      priorities[1]!.compositeScore,
    );
  });

  it("connect exposes lineage chain and knowledge graph", () => {
    const { lineage, graph } = Spark.connect();
    expect(lineage.chain.length).toBeGreaterThan(0);
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it("prepare filters recommendations by product scope", () => {
    const founder = recommendationPreparationService.prepare({
      product: "founder",
      limit: 5,
    });
    expect(founder.every((r) => r.preparedFor === "founder")).toBe(true);

    const prepared = Spark.prepare({ product: "ecosystem" });
    expect(prepared.recommendations.length).toBeGreaterThan(0);
    expect(prepared.risks.length).toBeGreaterThan(0);
  });

  it("summarize returns intelligence snapshot", () => {
    const summary = Spark.summarize();
    expect(summary.headline).toBeTruthy();
    expect(summary.observationCount).toBeGreaterThan(0);
    expect(summary.preparedAt).toBeTruthy();
  });

  it("pattern engine groups signals and ranks patterns", () => {
    const groups = patternEngine.groupSignals();
    expect(groups.size).toBeGreaterThan(0);
    const ranked = patternEngine.rankImportance();
    expect(ranked[0]!.confidence.score).toBeGreaterThanOrEqual(
      ranked[ranked.length - 1]!.confidence.score,
    );
  });

  it("relationship service builds research-to-result lineage", () => {
    const lineage = relationshipService.buildLineageRelationship();
    expect(lineage.summary).toMatch(/research/i);
    expect(lineage.chain.length).toBe(7);
  });

  it("scoring engine inverts implementation effort", () => {
    const lowEffort = scoringEngine.composite([
      { dimension: "implementation-effort", value: 0.2, weight: 0.06 },
    ]);
    const highEffort = scoringEngine.composite([
      { dimension: "implementation-effort", value: 0.9, weight: 0.06 },
    ]);
    expect(lowEffort).toBeGreaterThan(highEffort);
  });

  it("bundle assembles full intelligence package", () => {
    const bundle = Spark.bundle();
    expect(bundle.graph.nodes.length).toBeGreaterThan(0);
    expect(bundle.knowledge.length).toBeGreaterThan(0);
  });
});

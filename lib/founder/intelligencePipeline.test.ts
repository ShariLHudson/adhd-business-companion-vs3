import { describe, expect, it } from "vitest";

import {
  FOUNDER_INTELLIGENCE_SOURCE_REGISTRY,
  listIntelligenceSources,
} from "./intelligence/sources";
import {
  getExecutiveTimeline,
  getIntelligenceRoomOverview,
  getPipelineStatus,
  traceSamplePipeline,
} from "./intelligence/services";

describe("Founder Intelligence Pipeline™", () => {
  it("source registry includes ecosystem placeholders", () => {
    const sources = listIntelligenceSources();
    expect(sources.length).toBeGreaterThanOrEqual(20);
    expect(FOUNDER_INTELLIGENCE_SOURCE_REGISTRY.some((s) => s.id === "companion")).toBe(
      true,
    );
    expect(FOUNDER_INTELLIGENCE_SOURCE_REGISTRY.some((s) => s.id === "cursor")).toBe(
      true,
    );
    expect(FOUNDER_INTELLIGENCE_SOURCE_REGISTRY.some((s) => s.id === "gohighlevel")).toBe(
      true,
    );
  });

  it("pipeline status returns all stages with counts", () => {
    const stages = getPipelineStatus();
    expect(stages.length).toBe(7);
    expect(stages.some((s) => s.id === "signal" && s.count > 0)).toBe(true);
    expect(stages.some((s) => s.id === "source" && s.count > 0)).toBe(true);
  });

  it("room overview loads through repository", () => {
    const overview = getIntelligenceRoomOverview();
    expect(overview.incomingSignals.length).toBeGreaterThan(0);
    expect(overview.timeline.length).toBeGreaterThan(0);
    expect(overview.recentFindings.length).toBeGreaterThan(0);
    expect(overview.inbox.new.length).toBeGreaterThan(0);
    expect(overview.pipelineStatus.length).toBe(7);
  });

  it("executive timeline is chronological newest first", () => {
    const timeline = getExecutiveTimeline();
    expect(timeline[0].occurredAt >= timeline[1].occurredAt).toBe(true);
  });

  it("traceSamplePipeline follows signal to recommendation", () => {
    const trace = traceSamplePipeline("sig-001");
    expect(trace).not.toBeNull();
    expect(trace?.signal.id).toBe("sig-001");
    expect(trace?.finding?.signalId).toBe("sig-001");
    expect(trace?.insightCandidate?.findingId).toBe(trace?.finding?.id);
    expect(trace?.recommendationCandidate?.insightCandidateId).toBe(
      trace?.insightCandidate?.id,
    );
  });
});

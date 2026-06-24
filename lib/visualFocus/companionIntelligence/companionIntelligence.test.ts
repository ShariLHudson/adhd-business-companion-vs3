import { describe, expect, it, beforeEach, vi } from "vitest";
import { createVisualFocusMap } from "../templates";
import { generateVisualFocusMap } from "../generateMap";
import { createAndActivateMap } from "../store";
import {
  FUTURE_VISUAL_THINKING_FRAMEWORKS,
  VISUAL_THINKING_FRAMEWORK_REGISTRY,
  frameworkRequiresPredefinedStructure,
} from "./frameworks";
import {
  beginVisualThinkingSession,
  isValidPipelineAdvance,
  resolvePipelineStageForMap,
} from "./pipeline";
import {
  buildVisualThinkingFounderSummary,
  listVisualThinkingLearningEvents,
  resetVisualThinkingLearningForTests,
} from "./learning";
import { VISUAL_THINKING_INTELLIGENCE_RULE, VISUAL_THINKING_PIPELINE_ORDER } from "./types";

describe("visualFocus companionIntelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    resetVisualThinkingLearningForTests();
  });

  it("defines the intelligence-first pipeline order", () => {
    expect(VISUAL_THINKING_PIPELINE_ORDER[0]).toBe("understand");
    expect(VISUAL_THINKING_PIPELINE_ORDER).toContain("visualize");
    expect(VISUAL_THINKING_PIPELINE_ORDER).toContain("feed_founder");
    expect(VISUAL_THINKING_INTELLIGENCE_RULE.length).toBeGreaterThanOrEqual(5);
  });

  it("registers current modes and future intelligence surfaces", () => {
    expect(VISUAL_THINKING_FRAMEWORK_REGISTRY.length).toBeGreaterThanOrEqual(7);
    for (const future of FUTURE_VISUAL_THINKING_FRAMEWORKS) {
      expect(future.maturity === "future" || future.maturity === "partial").toBe(
        true,
      );
    }
    expect(
      FUTURE_VISUAL_THINKING_FRAMEWORKS.some((f) => f.id === "living-canvas"),
    ).toBe(true);
    expect(
      FUTURE_VISUAL_THINKING_FRAMEWORKS.some((f) => f.id === "what-if-analysis"),
    ).toBe(true);
  });

  it("only Business Canvas™ requires predefined structure among production modes", () => {
    const production = VISUAL_THINKING_FRAMEWORK_REGISTRY.filter(
      (f) => f.maturity === "production",
    );
    const predefined = production.filter((f) => f.predefinedStructure);
    expect(predefined.map((f) => f.id)).toEqual(["business-canvas"]);
    expect(frameworkRequiresPredefinedStructure("mind-map")).toBe(false);
    expect(frameworkRequiresPredefinedStructure("business-canvas")).toBe(true);
  });

  it("does not allow skipping from understand to insights without advance path", () => {
    expect(isValidPipelineAdvance("understand", "structure")).toBe(true);
    expect(isValidPipelineAdvance("understand", "insights")).toBe(true);
    expect(isValidPipelineAdvance("insights", "understand")).toBe(false);
    expect(isValidPipelineAdvance("structure", "clarify")).toBe(true);
  });

  it("resolves business canvas pipeline stages from workflow", () => {
    let map = createVisualFocusMap("business-canvas", "My coaching business");
    expect(resolvePipelineStageForMap(map)).toBe("structure");

    map = generateVisualFocusMap(map);
    expect(resolvePipelineStageForMap(map)).toBe("insights");

    map = {
      ...map,
      businessCanvasWorkflow: "clarifyChange",
      businessCanvasChange: { description: "Add membership", followUpAnswers: {} },
    };
    expect(resolvePipelineStageForMap(map)).toBe("clarify");
  });

  it("captures learning on session start and generation cycle", () => {
    const map = createAndActivateMap("relationship-map", "Business connections");
    expect(listVisualThinkingLearningEvents().some((e) => e.stage === "understand")).toBe(
      true,
    );

    const generated = generateVisualFocusMap(map);

    const events = listVisualThinkingLearningEvents();
    expect(events.some((e) => e.stage === "learn")).toBe(true);
    expect(events.some((e) => e.stage === "feed_founder")).toBe(true);

    const summary = buildVisualThinkingFounderSummary();
    expect(summary.totalSessions).toBeGreaterThan(0);
    expect(summary.byFramework["relationship-map"]).toBeGreaterThan(0);
  });

  it("beginVisualThinkingSession records without throwing", () => {
    const map = createVisualFocusMap("mind-map", "Workshop ideas");
    beginVisualThinkingSession(map);
    expect(listVisualThinkingLearningEvents()).toHaveLength(1);
  });
});

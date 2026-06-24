import { describe, expect, it, beforeEach, vi } from "vitest";
import { buildMapAnalysis } from "./analysis";
import { canGenerateVisualFocusMap, generateVisualFocusMap } from "./index";
import { createVisualFocusMap } from "./templates";

describe("visualFocus generate workflow", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("requires meaningful content before generate", () => {
    const sparse = createVisualFocusMap("visual-kanban");
    expect(canGenerateVisualFocusMap(sparse)).toBe(false);
    const rich = createVisualFocusMap("relationship-map", "Marketing relationships");
    expect(canGenerateVisualFocusMap(rich)).toBe(true);
  });

  it("generates visual layout and analysis", () => {
    const map = createVisualFocusMap("relationship-map", "Audience to revenue");
    const generated = generateVisualFocusMap(map);
    expect(generated.workflowStage).toBe("generated");
    expect(generated.visualLayout?.nodes.length).toBeGreaterThan(1);
    expect(generated.visualLayout?.edges.length).toBeGreaterThan(0);
    expect(generated.analysis?.summary).toMatch(/Audience to revenue/i);
    expect(generated.analysis?.recommendations.length).toBeGreaterThan(0);
  });

  it("builds relationship-map vertical flow layout", () => {
    const map = createVisualFocusMap("relationship-map", "Ecosystem links");
    const generated = generateVisualFocusMap(map);
    expect(generated.visualLayout?.layoutKind).toBe("vertical-flow");
  });

  it("analysis includes opportunities for relationship maps", () => {
    const map = createVisualFocusMap("relationship-map", "Channel alignment");
    const analysis = buildMapAnalysis(map);
    expect(analysis.opportunities.length + analysis.recommendations.length).toBeGreaterThan(0);
  });
});

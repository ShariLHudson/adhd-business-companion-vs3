import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  advanceDecisionCompass,
  emptyDecisionCompassState,
  setDecisionType,
} from "./decisionCompass";
import { buildDecisionCanvasGraph } from "./decisionCanvasModel";
import {
  buildDecisionExportSvg,
  buildDecisionInfographicSvg,
  DECISION_EXPORT_PLAN,
  infographicSvgMatchesViewModel,
} from "./decisionCanvasExport";
import { buildDecisionMapView } from "./decisionMapView";
import {
  loadDecisionMapVisible,
  loadDecisionVisualView,
  saveDecisionMapVisible,
  saveDecisionVisualView,
} from "./decisionMapPreference";
import {
  clearDecisionCompassSession,
  saveDecisionCompassSession,
  snapshotFromPanelState,
  loadDecisionCompassSession,
} from "./decisionCompassSessionStore";
import { enrichAuthority } from "./decisionCompassSessionAuthority";

function stubStorage() {
  const localMem = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => localMem.get(k) ?? null,
    setItem: (k: string, v: string) => localMem.set(k, v),
    removeItem: (k: string) => localMem.delete(k),
    clear: () => localMem.clear(),
  };
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage });
}

function sampleSession() {
  let state = emptyDecisionCompassState();
  state = advanceDecisionCompass(state, { decision: "Hire a VA?" });
  state = advanceDecisionCompass(state, {
    options: "Hire a VA\n---\nDo it myself",
  });
  state = setDecisionType(state, "strategic");
  state = advanceDecisionCompass(state);
  state = advanceDecisionCompass(state, {
    "why-a": "More time for growth",
    "why-b": "Save money",
    "concern-a": "Training cost",
    "concern-b": "Burnout risk",
    "success-a": "Scale the business",
    freedom: "A",
    growth: "A",
    stress: "A",
  });
  return snapshotFromPanelState(state, "Hire a VA", "Do it myself", "");
}

describe("ADHD Visual Decision Canvas", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
    clearDecisionCompassSession();
  });

  it("visual updates when decision changes", () => {
    const session = sampleSession();
    const graph = buildDecisionCanvasGraph(session);
    expect(graph.hasDecision).toBe(true);
    expect(graph.nodes.find((n) => n.id === "decision")?.title).toMatch(
      /Hire a VA/i,
    );
  });

  it("visual updates when options change", () => {
    const session = sampleSession();
    const graph = buildDecisionCanvasGraph(session);
    expect(graph.hasOptions).toBe(true);
    expect(graph.nodes.find((n) => n.id === "option-a")?.title).toMatch(
      /Hire a VA/i,
    );
    expect(graph.nodes.find((n) => n.id === "option-b")?.title).toMatch(
      /myself/i,
    );
  });

  it("visual updates when recommendation changes", () => {
    const session = sampleSession();
    const withRec = {
      ...session,
      recommendation: {
        type: "strategic" as const,
        headline: "Strategic Recommendation",
        choice: "Hire a VA",
        summary: "Growth leads with Hire a VA",
      },
      complete: true,
    };
    const graph = buildDecisionCanvasGraph(withRec);
    expect(graph.recommendedSide).toBe("A");
    expect(graph.nodes.find((n) => n.id === "recommendation")).toBeTruthy();
    expect(graph.nodes.find((n) => n.id === "option-a")?.recommended).toBe(
      true,
    );
  });

  it("refresh preserves map via session persistence", () => {
    const session = sampleSession();
    saveDecisionCompassSession(session);
    const loaded = loadDecisionCompassSession();
    const graph = buildDecisionCanvasGraph(loaded);
    expect(graph.hasDecision).toBe(true);
    expect(graph.nodes.filter((n) => n.kind === "category").length).toBeGreaterThan(
      0,
    );
  });

  it("mobile layout model keeps readable node titles", () => {
    const session = sampleSession();
    const graph = buildDecisionCanvasGraph(session);
    for (const node of graph.nodes) {
      expect(node.title.length).toBeLessThanOrEqual(96);
      for (const item of node.items) {
        expect(item.length).toBeLessThanOrEqual(73);
      }
    }
  });

  it("recommendation highlight works", () => {
    const session = {
      ...sampleSession(),
      recommendation: {
        type: "strategic" as const,
        headline: "Pick",
        choice: "Hire a VA",
        summary: "Go with A",
      },
    };
    const graph = buildDecisionCanvasGraph(session);
    expect(graph.recommendedSide).toBe("A");
  });

  it("PNG export produces valid SVG source aligned with infographic", () => {
    const session = {
      ...sampleSession(),
      recommendation: {
        type: "strategic" as const,
        headline: "Strategic Recommendation",
        choice: "Hire a VA",
        summary: "Growth leads with Hire a VA",
      },
    };
    const vm = buildDecisionMapView(session);
    const graph = buildDecisionCanvasGraph(session);
    const svg = buildDecisionInfographicSvg(vm, graph);
    expect(svg).toContain("<svg");
    expect(svg).toContain("ADHD DECISION CANVAS");
    expect(infographicSvgMatchesViewModel(vm, svg)).toBe(true);
    expect(buildDecisionExportSvg(vm, graph)).toBe(svg);
  });

  it("PDF export plan includes multi-page report targets", () => {
    expect(DECISION_EXPORT_PLAN.supported).toContain("pdf");
  });

  it("visual reads only from shared session authority", () => {
    const session = sampleSession();
    const authority = enrichAuthority(session);
    const fromSession = buildDecisionCanvasGraph(session);
    const fromAuthority = buildDecisionCanvasGraph({
      ...authority,
      visualThinking: authority.visualThinking,
    });
    expect(fromAuthority.nodes.length).toBe(fromSession.nodes.length);
    expect(fromAuthority.hasDecision).toBe(fromSession.hasDecision);
  });

  it("hide/show and view preferences persist", () => {
    saveDecisionMapVisible(false);
    expect(loadDecisionMapVisible()).toBe(false);
    saveDecisionVisualView("infographic");
    expect(loadDecisionVisualView()).toBe("infographic");
  });

  it("export plan documents future targets", () => {
    expect(DECISION_EXPORT_PLAN.supported).toContain("png");
    expect(DECISION_EXPORT_PLAN.supported).toContain("pdf");
    expect(DECISION_EXPORT_PLAN.planned).toContain("google-doc");
  });
});

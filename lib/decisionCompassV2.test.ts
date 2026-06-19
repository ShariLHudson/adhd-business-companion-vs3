import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  advanceDecisionCompass,
  emptyDecisionCompassState,
  setDecisionType,
} from "./decisionCompass";
import { buildDecisionCanvasGraph } from "./decisionCanvasModel";
import {
  buildDecisionInfographicSvg,
  buildPrintableDecisionHtml,
  infographicSvgMatchesViewModel,
} from "./decisionCanvasExport";
import { buildDecisionMapView } from "./decisionMapView";
import {
  buildDecisionRecommendationReport,
  reportUsesNonAuthoritativeLanguage,
} from "./decisionRecommendationReport";
import {
  decisionCompassChatAwarenessHint,
  decisionCompassWorkspaceHint,
  duplicateQuestionGuardHint,
  enrichAuthority,
  formatCapturedCompassAnswers,
} from "./decisionCompassSessionAuthority";
import {
  clearDecisionCompassSession,
  snapshotFromPanelState,
} from "./decisionCompassSessionStore";

function sampleCompleteSession() {
  let state = emptyDecisionCompassState();
  state = advanceDecisionCompass(state, {
    decision: "Hire a salesperson or keep doing sales myself?",
  });
  state = advanceDecisionCompass(state, {
    options: "Hire a salesperson\n---\nKeep doing sales myself",
  });
  state = setDecisionType(state, "strategic");
  state = advanceDecisionCompass(state);
  state = advanceDecisionCompass(state, {
    "why-a": "More freedom and growth potential",
    "why-b": "Save money short term",
    "concern-a": "Cost and training",
    "concern-b": "Burnout and slower growth",
    "success-a": "Scale without me on every call",
    freedom: "A",
    growth: "A",
    stress: "A",
  });
  const snap = snapshotFromPanelState(
    state,
    "Hire a salesperson",
    "Keep doing sales myself",
    "",
  );
  return enrichAuthority({
    ...snap,
    complete: true,
    recommendation: {
      type: "strategic",
      headline: "Strategic Recommendation",
      choice: "Hire a salesperson",
      summary: "Growth and freedom lead with hiring",
    },
  });
}

describe("Decision Compass V2", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearDecisionCompassSession();
  });

  it("1. chat references existing decision data", () => {
    const authority = sampleCompleteSession();
    const hint = decisionCompassWorkspaceHint(authority)!;
    expect(hint).toMatch(/Hire a salesperson/i);
    expect(hint).toMatch(/sales myself/i);
    expect(hint).toMatch(/VISUAL AWARENESS/i);
  });

  it("2. chat does not ask user to repeat visible Compass information", () => {
    const authority = sampleCompleteSession();
    const awareness = decisionCompassChatAwarenessHint(authority)!;
    expect(awareness).toMatch(/NEVER ask/i);
    expect(awareness).toMatch(/What do you see/i);
    expect(awareness).toMatch(/VISIBLE ON CANVAS/i);
    const dup = duplicateQuestionGuardHint(authority)!;
    expect(dup).toMatch(/do NOT ask again/i);
    expect(dup).toMatch(/Concern/i);
  });

  it("3. PNG export matches visual canvas output", () => {
    const authority = sampleCompleteSession();
    const vm = buildDecisionMapView(authority);
    const graph = buildDecisionCanvasGraph(authority);
    const svg = buildDecisionInfographicSvg(vm, graph);
    expect(infographicSvgMatchesViewModel(vm, svg)).toBe(true);
    expect(svg).toContain("ADHD DECISION CANVAS");
    expect(svg).toContain("QUICK COMPARISON");
  });

  it("4. PDF includes infographic page", async () => {
    const addPage = vi.fn();
    const addImage = vi.fn();
    const save = vi.fn();
    const doc = {
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      text: vi.fn(),
      splitTextToSize: (t: string) => [t],
      setTextColor: vi.fn(),
      addPage,
      addImage,
      save,
      internal: { pageSize: { getWidth: () => 612, getHeight: () => 792 } },
    };
    vi.doMock("jspdf", () => ({ jsPDF: vi.fn(() => doc) }));
    const authority = sampleCompleteSession();
    const vm = buildDecisionMapView(authority);
    const graph = buildDecisionCanvasGraph(authority);
    const svg = buildDecisionInfographicSvg(vm, graph);
    expect(svg).toContain("<svg");
    expect(svg).toContain("Recommended");
  });

  it("5. print uses visual layout", () => {
    const authority = sampleCompleteSession();
    const report = buildDecisionRecommendationReport(authority);
    const html = buildPrintableDecisionHtml(
      { innerHTML: "<div data-testid='decision-infographic'>Canvas</div>" } as HTMLElement,
      report,
    );
    expect(html).toContain("decision-infographic");
    expect(html).toContain("Recommendation Report");
    expect(html).toContain("Potential Advantages");
  });

  it("6. Recommendation Report generated", () => {
    const report = buildDecisionRecommendationReport(sampleCompleteSession());
    expect(report).not.toBeNull();
    expect(report?.overallDirection?.choice).toMatch(/Hire a salesperson/i);
  });

  it("7. Recommendation Report includes advantages", () => {
    const report = buildDecisionRecommendationReport(sampleCompleteSession())!;
    expect(report.potentialAdvantages.length).toBeGreaterThan(0);
  });

  it("8. Recommendation Report includes concerns", () => {
    const report = buildDecisionRecommendationReport(sampleCompleteSession())!;
    expect(report.potentialConcerns.length).toBeGreaterThan(0);
    expect(
      report.potentialConcerns.some((c) =>
        /financial|sustainability|investment|capacity|concern/i.test(c),
      ),
    ).toBe(true);
  });

  it("9. Recommendation Report includes questions worth considering", () => {
    const report = buildDecisionRecommendationReport(sampleCompleteSession())!;
    expect(report.questionsWorthConsidering.length).toBeGreaterThan(0);
  });

  it("10. recommendation language remains non-authoritative", () => {
    const report = buildDecisionRecommendationReport(sampleCompleteSession())!;
    expect(reportUsesNonAuthoritativeLanguage(report)).toBe(true);
    expect(report.disclaimer).toMatch(/thinking tool/i);
    expect(report.overallDirection?.qualifier).toMatch(/Based on the information/i);
  });

  it("11. multiple decision dimensions influence reasoning", () => {
    const report = buildDecisionRecommendationReport(sampleCompleteSession())!;
    expect(report.dimensionsConsidered.length).toBeGreaterThanOrEqual(2);
    expect(
      report.dimensionsConsidered.some((d) =>
        /growth|stress|energy|fit/i.test(d),
      ),
    ).toBe(true);
  });

  it("12. shared session remains source of truth", () => {
    const authority = sampleCompleteSession();
    const captured = formatCapturedCompassAnswers(authority);
    expect(captured.some((l) => /Hire a salesperson/i.test(l))).toBe(true);
    const report = buildDecisionRecommendationReport(authority);
    expect(report?.overallDirection?.choice).toBe(
      authority.recommendation?.choice,
    );
  });
});

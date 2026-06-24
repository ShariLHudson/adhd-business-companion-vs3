import { describe, expect, it, vi, beforeEach } from "vitest";
import { createEmptyBusinessCanvas } from "../factory";
import { buildBusinessCanvasHealthOverview, userLabelForScore } from "./sectionStrength";
import {
  BUSINESS_CANVAS_RELATIONSHIP_MATRIX,
  relationshipWeightNumeric,
} from "./relationshipMatrix";
import {
  estimateChangeImpact,
  impactStatesFromEstimate,
} from "./impactEstimate";
import { createBusinessCanvasVersionRecord } from "./versionReadiness";
import { createVisualFocusMap } from "../../templates";

describe("businessCanvas impactModel", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("scores empty section as needs more detail", () => {
    const data = createEmptyBusinessCanvas();
    data.sections["customer-segments"].items = [];
    const health = buildBusinessCanvasHealthOverview(data);
    const segment = health.sections.find((s) => s.sectionId === "customer-segments");
    expect(segment?.userLabel).toBe("needs_more_detail");
    expect(segment?.userLabelText).toBe("Needs more detail");
  });

  it("scores specific entries higher", () => {
    const data = createEmptyBusinessCanvas();
    data.sections["revenue-streams"].items = [
      "Monthly membership at $49 for ADHD entrepreneurs",
      "Quarterly strategy intensive at $1,200",
    ];
    const section = buildBusinessCanvasHealthOverview(data).sections.find(
      (s) => s.sectionId === "revenue-streams",
    );
    expect(section!.overall).toBeGreaterThan(50);
  });

  it("uses shame-free labels only", () => {
    const labels = [
      userLabelForScore(10).text,
      userLabelForScore(50).text,
      userLabelForScore(70).text,
      userLabelForScore(90).text,
    ];
    expect(labels).not.toContain("Bad");
    expect(labels).not.toContain("Poor");
    expect(labels).toContain("Needs more detail");
    expect(labels).toContain("Strong");
  });

  it("defines relationship weights as low medium high", () => {
    const rel = BUSINESS_CANVAS_RELATIONSHIP_MATRIX["customer-segments"][0];
    expect(rel?.weight).toBe("high");
    expect(relationshipWeightNumeric("high")).toBe(75);
  });

  it("estimates directional impact for membership change", () => {
    const estimate = estimateChangeImpact("Add a membership offer");
    expect(estimate.affectedSections.length).toBeGreaterThan(0);
    expect(estimate.affectedSections.some((s) => s.level === "high")).toBe(true);
    const states = impactStatesFromEstimate(estimate);
    expect(Object.keys(states).length).toBeGreaterThan(0);
  });

  it("creates version records with section snapshot and health", () => {
    const map = createVisualFocusMap("business-canvas", "Studio");
    const record = createBusinessCanvasVersionRecord({
      map,
      versionName: "2026-06-23 Initial Version",
      createdFrom: "generate",
    });
    expect(record?.versionId).toBeTruthy();
    expect(record?.sectionSnapshot).toBeDefined();
    expect(record?.healthSnapshot?.sections).toHaveLength(9);
  });
});

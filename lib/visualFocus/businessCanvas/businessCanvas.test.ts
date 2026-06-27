import { describe, expect, it } from "vitest";
import { BUSINESS_CANVAS_SECTION_ORDER } from "./types";
import { BUSINESS_CANVAS_SECTION_GUIDANCE } from "./guidance";
import { guidanceForSection } from "./guidance";
import { buildBusinessCanvasAnalysis } from "./analysis";
import {
  createEmptyBusinessCanvas,
  filledBusinessCanvasSectionCount,
} from "./factory";

import { generateMapLabelForMode } from "../generateMap";

describe("businessCanvas guidance layer", () => {
  it("defines all 9 required sections with teaching copy", () => {
    expect(BUSINESS_CANVAS_SECTION_ORDER).toHaveLength(9);
    for (const id of BUSINESS_CANVAS_SECTION_ORDER) {
      const g = guidanceForSection(id);
      expect(g.title.length).toBeGreaterThan(0);
      expect(g.prompt.length).toBeGreaterThan(0);
      expect(g.explanation.length).toBeGreaterThan(10);
      expect(g.whyItMatters.length).toBeGreaterThan(10);
      expect(g.examples.length).toBeGreaterThan(2);
      expect(g.suggestionSource.length).toBeGreaterThan(0);
      expect(g.changeRipples.length).toBeGreaterThan(2);
      expect(BUSINESS_CANVAS_SECTION_GUIDANCE[id]).toBe(g);
    }
  });

  it("creates empty canvas with all sections", () => {
    const canvas = createEmptyBusinessCanvas();
    expect(canvas.canvasType).toBe("business-model");
    expect(filledBusinessCanvasSectionCount(canvas)).toBe(0);
    for (const id of BUSINESS_CANVAS_SECTION_ORDER) {
      expect(canvas.sections[id].items).toEqual([]);
    }
  });

  it("builds analysis with board observations after content", () => {
    const canvas = createEmptyBusinessCanvas();
    canvas.sections["customer-segments"].items = ["ADHD entrepreneurs"];
    canvas.sections["value-proposition"].items = ["Reduce overwhelm"];
    canvas.sections.channels.items = ["LinkedIn", "Pinterest"];
    canvas.sections["revenue-streams"].items = ["Coaching"];

    const analysis = buildBusinessCanvasAnalysis(
      canvas,
      "Test Business",
      "Pricing pivot",
    );
    expect(analysis.summary).toMatch(/Pricing pivot/i);
    expect(analysis.keyRelationships.length).toBeGreaterThan(0);
    expect(analysis.boardObservations?.length).toBeGreaterThan(0);
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });

  it("revenue streams includes what-if ripple guidance", () => {
    const g = guidanceForSection("revenue-streams");
    expect(g.changeRipples).toContain("Revenue may increase or decrease");
    expect(g.changeRipples).toContain("Marketing priorities may shift");
  });

  it("generate action uses Business Canvas not framework name", () => {
    expect(generateMapLabelForMode("business-canvas")).toBe("Generate Business Canvas");
  });
});

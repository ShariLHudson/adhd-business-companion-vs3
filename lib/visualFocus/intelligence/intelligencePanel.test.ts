import { describe, expect, it } from "vitest";
import { buildBusinessCanvasAnalysis } from "../businessCanvas/analysis";
import { createEmptyBusinessCanvas } from "../businessCanvas/factory";
import {
  buildIntelligencePanelSections,
  enrichInsightText,
} from "./enrichInsights";
import { INTELLIGENCE_CATEGORY_THEMES } from "./themes";
import { mergeCanvasHighlights } from "./highlightBridge";

describe("intelligence panel enrichment", () => {
  it("assigns permanent colors per intelligence category", () => {
    expect(INTELLIGENCE_CATEGORY_THEMES.risks.accent).toBe("#dc2626");
    expect(INTELLIGENCE_CATEGORY_THEMES.opportunities.accent).toBe("#16a34a");
    expect(INTELLIGENCE_CATEGORY_THEMES.board_observations.accent).toBe("#334155");
  });

  it("links insights to Business Canvas section colors", () => {
    const item = enrichInsightText(
      "Revenue Streams: Your revenue currently depends on only one primary source.",
      "risks",
    );
    expect(item.sectionId).toBe("revenue-streams");
    expect(item.sectionLabel).toMatch(/Revenue Streams/);
    expect(item.badge?.id).toBe("high_risk");
  });

  it("assigns category-appropriate badges", () => {
    const item = enrichInsightText(
      "Channels: Pinterest and LinkedIn are reaching similar audiences.",
      "opportunities",
    );
    expect(item.sectionId).toBe("channels");
    expect(item.badge?.id).toBe("growth_opportunity");
  });

  it("builds card sections from business canvas analysis", () => {
    const data = createEmptyBusinessCanvas();
    data.sections.channels.items = ["Pinterest", "LinkedIn"];
    data.sections["customer-segments"].items = ["Coaches"];
    data.sections["revenue-streams"].items = ["Monthly membership"];

    const analysis = buildBusinessCanvasAnalysis(data, "Studio", "Growth");
    const sections = buildIntelligencePanelSections(analysis);
    expect(sections.summary).toHaveLength(1);
    expect(sections.risks.some((r) => r.sectionId === "revenue-streams")).toBe(
      true,
    );
    expect(
      sections.opportunities.some((o) => o.sectionId === "channels"),
    ).toBe(true);
  });

  it("merges change and intelligence canvas highlights", () => {
    const merged = mergeCanvasHighlights(
      ["channels", "revenue-streams"],
      ["customer-segments"],
    );
    expect(merged).toEqual(
      expect.arrayContaining(["channels", "revenue-streams", "customer-segments"]),
    );
  });
});

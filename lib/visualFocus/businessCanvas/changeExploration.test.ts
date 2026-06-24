import { describe, expect, it } from "vitest";
import { purposeQuestionForMode } from "@/lib/companionEntry/purposeAnchor";
import {
  buildBusinessCanvasImpactAnalysis,
  detectChangeCategory,
  followUpQuestionsForChange,
  hasEnoughChangeDetail,
} from "./changeExploration";
import { createEmptyBusinessCanvas } from "./factory";
import { normalizeBusinessCanvasWorkflow } from "./workflowTypes";
import { createVisualFocusMap } from "../templates";
import { generateBusinessCanvasImpact } from "../generateMap";

describe("businessCanvas change exploration", () => {
  it("purpose anchor asks about mapping first, not change", () => {
    expect(purposeQuestionForMode("business-canvas")).toBe(
      "What business are we mapping?",
    );
    expect(purposeQuestionForMode("business-canvas")).not.toMatch(/change/i);
  });

  it("defaults workflow to buildCurrentCanvas on new maps", () => {
    const map = createVisualFocusMap("business-canvas", "My coaching biz");
    expect(map.businessCanvasWorkflow).toBe("buildCurrentCanvas");
    expect(normalizeBusinessCanvasWorkflow(undefined)).toBe("buildCurrentCanvas");
  });

  it("legacy generated maps normalize to generatedCurrentCanvas", () => {
    expect(normalizeBusinessCanvasWorkflow(undefined, true)).toBe(
      "generatedCurrentCanvas",
    );
  });

  it("detects membership and pricing change categories", () => {
    expect(detectChangeCategory("Add a membership")).toBe("membership");
    expect(detectChangeCategory("Raise prices on coaching")).toBe("pricing");
    expect(detectChangeCategory("Change audience to founders")).toBe("audience");
  });

  it("provides category-specific follow-up questions", () => {
    const membership = followUpQuestionsForChange("Add a membership");
    expect(membership.some((q) => /Who is the membership/i.test(q.question))).toBe(
      true,
    );
    const pricing = followUpQuestionsForChange("Raise prices");
    expect(pricing.some((q) => /Current price/i.test(q.question))).toBe(true);
  });

  it("requires minimum follow-up answers before impact", () => {
    const change = "Add a membership";
    const questions = followUpQuestionsForChange(change);
    expect(hasEnoughChangeDetail(change, {})).toBe(false);
    const partial: Record<string, string> = {};
    for (const q of questions.slice(0, 2)) {
      partial[q.id] = "answer";
    }
    expect(hasEnoughChangeDetail(change, partial)).toBe(false);
    for (const q of questions.slice(0, 3)) {
      partial[q.id] = "answer";
    }
    expect(hasEnoughChangeDetail(change, partial)).toBe(true);
  });

  it("builds impact analysis with what-if notes", () => {
    const canvas = createEmptyBusinessCanvas();
    canvas.sections["customer-segments"].items = ["Solo founders"];
    canvas.sections["value-proposition"].items = ["Clarity coaching"];
    canvas.sections["revenue-streams"].items = ["1:1 sessions"];

    const impact = buildBusinessCanvasImpactAnalysis(
      canvas,
      "Test Business",
      "Add a membership",
      {
        who: "Existing clients",
        included: "Monthly group call",
        price: "$49/mo",
      },
    );
    expect(impact.summary).toMatch(/membership/i);
    expect(impact.whatIfNotes?.length).toBeGreaterThan(0);
    expect(impact.risks.length).toBeGreaterThan(0);
    expect(impact.boardObservations?.length).toBeGreaterThan(0);
  });

  it("generateBusinessCanvasImpact returns null until enough detail", () => {
    let map = createVisualFocusMap("business-canvas", "Test");
    map = {
      ...map,
      businessCanvasWorkflow: "clarifyChange",
      businessCanvasChange: {
        description: "Raise prices",
        followUpAnswers: { offer: "Coaching" },
      },
    };
    expect(generateBusinessCanvasImpact(map)).toBeNull();

    map = {
      ...map,
      businessCanvasChange: {
        description: "Raise prices",
        followUpAnswers: {
          offer: "Coaching",
          "current-price": "$200",
          "new-price": "$300",
        },
      },
    };
    const result = generateBusinessCanvasImpact(map);
    expect(result?.businessCanvasWorkflow).toBe("generatedImpact");
    expect(result?.businessCanvasImpactAnalysis?.whatIfNotes?.length).toBeGreaterThan(
      0,
    );
  });
});

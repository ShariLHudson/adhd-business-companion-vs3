import { describe, expect, it } from "vitest";
import {
  BUSINESS_CANVAS_USER_LABEL,
  CANVAS_FRAMEWORK_REGISTRY,
  companionFrameworkLabelForType,
  selectCanvasFrameworkAfterPermission,
  userFacingCanvasLabel,
} from "./architecture";

describe("Business Canvas™ architecture rule", () => {
  it("exposes Business Canvas™ as the only user-facing label", () => {
    expect(userFacingCanvasLabel()).toBe("Business Canvas™");
    expect(BUSINESS_CANVAS_USER_LABEL).toBe("Business Canvas™");
  });

  it("keeps framework names internal to Companion Intelligence™", () => {
    expect(companionFrameworkLabelForType("business-model")).toBe(
      "Business Model Canvas™",
    );
    expect(companionFrameworkLabelForType("lean")).toBe("Lean Canvas™");
    for (const framework of CANVAS_FRAMEWORK_REGISTRY) {
      expect(framework.companionFrameworkLabel).not.toBe(BUSINESS_CANVAS_USER_LABEL);
    }
  });

  it("selects business-model framework for slow sales after permission", () => {
    expect(
      selectCanvasFrameworkAfterPermission("I want to understand why sales are slow"),
    ).toBe("business-model");
  });

  it("defaults unavailable future frameworks to business-model implementation", () => {
    expect(
      selectCanvasFrameworkAfterPermission("help me validate my startup mvp"),
    ).toBe("business-model");
  });
});

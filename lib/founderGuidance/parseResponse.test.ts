import { describe, expect, it } from "vitest";

import { parseFounderGuidanceResponse } from "./parseResponse";

describe("parseFounderGuidanceResponse", () => {
  it("parses JSON with suggested action", () => {
    const raw = JSON.stringify({
      message: "Try shipping onboarding first.",
      suggestedAction: {
        type: "add_experiment",
        label: "Add this experiment",
        payload: { title: "Onboarding test", kind: "experiment" },
      },
    });
    const parsed = parseFounderGuidanceResponse(raw);
    expect(parsed.message).toContain("onboarding");
    expect(parsed.suggestedAction?.type).toBe("add_experiment");
  });

  it("falls back to plain text", () => {
    const parsed = parseFounderGuidanceResponse("Plain reply");
    expect(parsed.message).toBe("Plain reply");
    expect(parsed.suggestedAction ?? null).toBeNull();
  });
});

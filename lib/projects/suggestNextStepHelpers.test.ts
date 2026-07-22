import { describe, expect, it } from "vitest";
import {
  SUGGEST_NEXT_STEP_HELPERS,
  getSuggestNextStepHelper,
} from "./suggestNextStepHelpers";

describe("suggestNextStepHelpers (137)", () => {
  it("exposes five distinct helper actions", () => {
    const ids = SUGGEST_NEXT_STEP_HELPERS.map((h) => h.id);
    expect(ids).toEqual([
      "suggest",
      "stuck",
      "breakdown",
      "simplify",
      "matters",
    ]);
  });

  it("returns distinct local guidance per helper", () => {
    const ctx = {
      name: "Workshop",
      goal: "Fill the room",
      nextAction: "Outline the agenda",
    };
    const stuck = getSuggestNextStepHelper("stuck").localGuidance(ctx);
    const breakdown = getSuggestNextStepHelper("breakdown").localGuidance(ctx);
    const simplify = getSuggestNextStepHelper("simplify").localGuidance(ctx);
    const matters = getSuggestNextStepHelper("matters").localGuidance(ctx);
    expect(stuck).not.toBe(breakdown);
    expect(breakdown).not.toBe(simplify);
    expect(simplify).not.toBe(matters);
    expect(stuck.toLowerCase()).toMatch(/2 minutes|tiny|stuck/);
    expect(matters).toContain("Fill the room");
  });
});

import { describe, expect, it } from "vitest";

import {
  CHAMBER_ENTRY_PROMPT,
  chamberMomentumIntentSection,
  classifyChamberMomentumIntent,
} from "./chamberOfMomentumRouting";

describe("chamberOfMomentumRouting", () => {
  it("maps entry intents to internal momentum shells", () => {
    expect(chamberMomentumIntentSection("learn")).toBe("momentum-institute");
    expect(chamberMomentumIntentSection("build")).toBe("momentum-builder");
    expect(chamberMomentumIntentSection("execute")).toBe("projects");
    expect(chamberMomentumIntentSection("plan")).toBe("momentum-builder");
  });

  it('routes "I am overwhelmed" through Chamber to Builder', () => {
    expect(classifyChamberMomentumIntent("I am overwhelmed")).toBe("build");
    expect(chamberMomentumIntentSection("build")).toBe("momentum-builder");
  });

  it('routes "Teach me marketing" through Chamber to Institute', () => {
    expect(classifyChamberMomentumIntent("Teach me marketing")).toBe("learn");
    expect(chamberMomentumIntentSection("learn")).toBe("momentum-institute");
  });

  it('routes "Help me finish my website" through Chamber to Projects', () => {
    expect(classifyChamberMomentumIntent("Help me finish my website")).toBe(
      "execute",
    );
    expect(chamberMomentumIntentSection("execute")).toBe("projects");
  });

  it("uses the Phase 2 entry prompt", () => {
    expect(CHAMBER_ENTRY_PROMPT).toContain("move forward");
  });
});

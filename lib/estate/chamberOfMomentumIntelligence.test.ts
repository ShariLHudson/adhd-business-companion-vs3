import { describe, expect, it } from "vitest";

import { classifyChamberMomentumIntent } from "./chamberOfMomentumRouting";
import {
  assessChamberMomentum,
  chamberIntelligenceSection,
  classifyStuckBlocker,
  detectChamberEnergyLevel,
  reduceActionForLowEnergy,
} from "./chamberOfMomentumIntelligence";

describe("chamberOfMomentumIntelligence", () => {
  it("prioritizes overwhelm relief before execution", () => {
    const assessment = assessChamberMomentum(
      "I have too much to do and need to finish my website",
    );
    expect(assessment?.state).toBe("overwhelmed");
    expect(assessment?.priority).toBe("reduce-overwhelm");
    expect(assessment?.section).toBe("brain-dump");
    expect(classifyChamberMomentumIntent(
      "I have too much to do and need to finish my website",
    )).toBe("build");
  });

  it("routes too many ideas to capture first", () => {
    const assessment = assessChamberMomentum(
      "I have so many ideas and don't want to lose this one",
    );
    expect(assessment?.state).toBe("too-many-ideas");
    expect(assessment?.section).toBe("evidence-bank");
    expect(assessment?.intent).toBe("idea");
  });

  it("routes stuck clarity to builder and skill to institute", () => {
    expect(
      assessChamberMomentum("I don't know what to do next on this")?.section,
    ).toBe("momentum-builder");
    expect(
      assessChamberMomentum("I started but cannot move forward — I don't know how")?.section,
    ).toBe("momentum-institute");
    expect(classifyStuckBlocker("I don't know how to do this")).toBe("skill");
  });

  it("routes confidence blockers to evidence", () => {
    expect(
      chamberIntelligenceSection({
        state: "stuck",
        energy: "normal",
        stuckBlocker: "confidence",
      }),
    ).toBe("evidence-bank");
  });

  it("detects low energy and shrinks large actions", () => {
    expect(detectChamberEnergyLevel("I am tired and overwhelmed")).toBe("low");
    expect(reduceActionForLowEnergy("Create marketing plan")).toBe(
      "Write three customer problems you solve.",
    );
  });

  it("routes learning and execution intents", () => {
    expect(assessChamberMomentum("Teach me marketing")?.section).toBe(
      "momentum-institute",
    );
    expect(assessChamberMomentum("Help me finish my website")?.section).toBe(
      "chamber-project-entry",
    );
  });

  it("asks one question when stuck without a clear blocker", () => {
    const assessment = assessChamberMomentum(
      "I started but cannot move forward",
    );
    expect(assessment?.memberQuestion).toContain("next step");
  });

  it("routes plan requests to builder", () => {
    expect(assessChamberMomentum("Help me organize this")?.section).toBe(
      "momentum-builder",
    );
    expect(classifyChamberMomentumIntent("Make me a plan")).toBe("plan");
  });
});

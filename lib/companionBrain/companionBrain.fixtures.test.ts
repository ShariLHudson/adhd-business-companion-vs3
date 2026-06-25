import { describe, expect, it } from "vitest";
import { CompanionBrain } from "@/lib/companionBrain";
import { ALL_SIMULATION_FIXTURES } from "@/lib/planMyDay/dailyCompanionCycle/fixtures";
import { mapFixtureToCompanionMemory } from "@/lib/planMyDay/companionBrainClient/mapFixtureToMemory";

function momentumBehavior(
  judgment: ReturnType<typeof CompanionBrain.runReasoningCycle>["judgment"],
): string {
  if (judgment.cycleState === "protected") return "anchorNone";
  if (judgment.momentum.kind === "explorationBlock") return "explorationBlock";
  if (judgment.momentum.kind === "none") return "anchorNone";
  if (judgment.dayMode === "survival") return "anchorOptional";
  return "anchorRequired";
}

function confidenceBehavior(
  judgment: ReturnType<typeof CompanionBrain.runReasoningCycle>["judgment"],
): string {
  if (judgment.confidence.encouragement) return "evidenceEncouragement";
  if (judgment.confidence.reason.includes("Paired")) return "pairedWithMomentum";
  if (judgment.confidence.reason.includes("boundary")) return "boundaryHonor";
  if (judgment.confidence.reason.includes("Orientation")) return "orientationOnly";
  if (judgment.confidence.candidateId) return "pairedWithMomentum";
  return "none";
}

describe("Companion Brain™ — Human Reality fixture regression", () => {
  for (const fixture of ALL_SIMULATION_FIXTURES) {
    describe(fixture.title, () => {
      it("resolves DayMode and CycleState", () => {
        const memory = mapFixtureToCompanionMemory(fixture);
        const { assembled, judgment } = CompanionBrain.runReasoningCycle(memory);

        expect(assembled.dayMode).toBe(fixture.expected.dayMode);
        expect(judgment.cycleState).toBe(fixture.expected.cycleState);
      });

      it("matches proposal count range", () => {
        const memory = mapFixtureToCompanionMemory(fixture);
        const { judgment } = CompanionBrain.runReasoningCycle(memory);
        const count = judgment.proposals.length;

        expect(count).toBeGreaterThanOrEqual(fixture.expected.proposalCount.min);
        expect(count).toBeLessThanOrEqual(fixture.expected.proposalCount.max);
      });

      it("matches momentum behavior", () => {
        const memory = mapFixtureToCompanionMemory(fixture);
        const { judgment } = CompanionBrain.runReasoningCycle(memory);
        const behavior = momentumBehavior(judgment);

        if (fixture.expected.momentum === "anchorOptional") {
          expect(["anchorOptional", "anchorNone", "anchorRequired"]).toContain(
            behavior,
          );
        } else {
          expect(behavior).toBe(fixture.expected.momentum);
        }
      });

      it("respects orientation constraints", () => {
        const memory = mapFixtureToCompanionMemory(fixture);
        const { judgment } = CompanionBrain.runReasoningCycle(memory);

        expect(judgment.orientationOnly).toBe(fixture.expected.orientationOnly);
        expect(judgment.permissionDisplay).toBe(
          fixture.expected.permissionDisplay,
        );
        expect(judgment.auditPassed).toBe(true);
      });

      it("avoids prohibited copy patterns", () => {
        const memory = mapFixtureToCompanionMemory(fixture);
        const { judgment } = CompanionBrain.runReasoningCycle(memory);
        const copy = [
          ...judgment.orientation.paragraphs,
          judgment.orientation.invitation ?? "",
        ].join(" ");

        for (const pattern of fixture.prohibitedCopyPatterns ?? []) {
          expect(copy).not.toMatch(pattern);
        }
      });
    });
  }
});

describe("Companion Brain™ — architectural inversion", () => {
  it("does not import planMyDay modules", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const { join } = await import("node:path");
    const brainDir = join(process.cwd(), "lib/companionBrain");
    const sources = readdirSync(brainDir)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
      .map((f) => readFileSync(join(brainDir, f), "utf8"));
    for (const source of sources) {
      expect(source).not.toMatch(/from ["']@\/lib\/planMyDay/);
      expect(source).not.toMatch(/from ["'].*\/planMyDay\//);
    }
  });

  it("exposes constitutional services", () => {
    expect(CompanionBrain.runReasoningCycle).toBeTypeOf("function");
    expect(CompanionBrain.runReflectionCycle).toBeTypeOf("function");
    expect(CompanionBrain.performReflection).toBeTypeOf("function");
  });
});

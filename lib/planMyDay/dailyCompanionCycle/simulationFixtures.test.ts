import { describe, expect, it } from "vitest";
import {
  ALL_SIMULATION_FIXTURES,
  SIMULATION_FIXTURES_BY_ID,
} from "./fixtures";
import {
  assertFixtureInvariants,
  validateFixtureInvariants,
} from "./fixtures/validateFixture";

describe("Companion Judgment simulation fixtures", () => {
  it("includes all ten human reality tests plus day after launch", () => {
    expect(ALL_SIMULATION_FIXTURES).toHaveLength(11);
    expect(SIMULATION_FIXTURES_BY_ID["normal-tuesday"]).toBeDefined();
    expect(SIMULATION_FIXTURES_BY_ID["day-after-launch"]).toBeDefined();
  });

  it("has unique fixture ids", () => {
    const ids = ALL_SIMULATION_FIXTURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const fixture of ALL_SIMULATION_FIXTURES) {
    describe(fixture.title, () => {
      it("passes structural invariants", () => {
        expect(() => assertFixtureInvariants(fixture)).not.toThrow();
      });

      it("documents expected DayMode and CycleState", () => {
        expect(fixture.expected.dayMode).toBeTruthy();
        expect(fixture.expected.cycleState).toBeTruthy();
      });

      it("defines proposal count range", () => {
        expect(fixture.expected.proposalCount.min).toBeLessThanOrEqual(
          fixture.expected.proposalCount.max,
        );
      });

      it("lists prohibited behaviors", () => {
        expect(fixture.prohibitedBehaviors.length).toBeGreaterThan(0);
      });
    });
  }
});

describe("Fixture invariant validator", () => {
  it("flags protected state with proposals", () => {
    const fixture = ALL_SIMULATION_FIXTURES.find((f) => f.id === "hyperfocus")!;
    const broken = {
      ...fixture,
      expected: {
        ...fixture.expected,
        proposalCount: { min: 1, max: 3 },
      },
    };
    const violations = validateFixtureInvariants(broken);
    expect(violations.some((v) => v.rule === "protected-no-proposals")).toBe(
      true,
    );
  });
});

/**
 * Sprint 2 orchestrator integration tests — enable as each module ships.
 * import { runDailyCompanionCycle } from "./orchestrator";
 */
describe.todo("Daily Companion Cycle orchestrator — fixture regression gate");

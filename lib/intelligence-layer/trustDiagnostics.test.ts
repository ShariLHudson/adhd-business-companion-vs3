import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getTrustCollectionDiagnostics,
  logTrustEvolutionDecision,
  resetTrustDiagnosticsForTests,
  type TrustEvolutionDecision,
} from "./trustDiagnostics";

function decision(
  overrides: Partial<TrustEvolutionDecision> & Pick<TrustEvolutionDecision, "evolve" | "reason">,
): TrustEvolutionDecision {
  return {
    at: "2026-06-22T12:00:00.000Z",
    signalId: "sig-test",
    category: "trust.suggestion_accepted",
    ...overrides,
  };
}

describe("trustDiagnostics", () => {
  beforeEach(() => {
    resetTrustDiagnosticsForTests();
  });

  it("tracks blockedByReason histogram", () => {
    logTrustEvolutionDecision(
      decision({ evolve: false, reason: "profile_learning_disabled" }),
    );
    logTrustEvolutionDecision(
      decision({ evolve: false, reason: "profile_learning_disabled" }),
    );
    logTrustEvolutionDecision(
      decision({ evolve: false, reason: "render_only_signal" }),
    );
    logTrustEvolutionDecision(decision({ evolve: true, reason: "evolved" }));

    const diag = getTrustCollectionDiagnostics();
    expect(diag.recorded).toBe(0);
    expect(diag.evolved).toBe(1);
    expect(diag.blocked).toBe(3);
    expect(diag.blockedByReason).toEqual({
      profile_learning_disabled: 2,
      render_only_signal: 1,
    });
    expect(diag.lastDecisions).toHaveLength(4);
  });

  it("resets blockedByReason in tests", () => {
    logTrustEvolutionDecision(
      decision({ evolve: false, reason: "system_causation" }),
    );
    resetTrustDiagnosticsForTests();
    expect(getTrustCollectionDiagnostics().blockedByReason).toEqual({});
  });
});

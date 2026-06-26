/**
 * Fixture invariant validation — runs before orchestrator exists.
 * Orchestrator tests import fixtures and assert against these rules.
 */

import type { CompanionJudgmentFixture } from "./types";

export type FixtureInvariantViolation = {
  fixtureId: string;
  rule: string;
  detail: string;
};

export function validateFixtureInvariants(
  fixture: CompanionJudgmentFixture,
): FixtureInvariantViolation[] {
  const violations: FixtureInvariantViolation[] = [];
  const { id, expected, prohibitedBehaviors, input } = fixture;

  if (prohibitedBehaviors.length === 0) {
    violations.push({
      fixtureId: id,
      rule: "prohibitedBehaviors",
      detail: "must list at least one prohibited behavior",
    });
  }

  if (input.mustNotSurface.length === 0) {
    violations.push({
      fixtureId: id,
      rule: "mustNotSurface",
      detail: "must list suppression expectations",
    });
  }

  if (
    expected.cycleState === "protected" &&
    expected.proposalCount.max > 0
  ) {
    violations.push({
      fixtureId: id,
      rule: "protected-no-proposals",
      detail: "protected CycleState requires proposalCount.max === 0",
    });
  }

  if (expected.dayMode === "hyperfocus" && expected.cycleState !== "protected") {
    violations.push({
      fixtureId: id,
      rule: "hyperfocus-protected",
      detail: "hyperfocus DayMode requires protected CycleState",
    });
  }

  if (expected.orientationOnly && expected.proposalCount.max > 1) {
    violations.push({
      fixtureId: id,
      rule: "orientationOnly-proposal-cap",
      detail: "orientationOnly allows at most 1 proposal",
    });
  }

  if (
    expected.dayMode === "celebration" &&
    expected.momentum === "anchorRequired"
  ) {
    violations.push({
      fixtureId: id,
      rule: "celebration-no-required-anchor",
      detail: "celebration mode must not require momentum anchor",
    });
  }

  if (
    expected.dayMode === "creative" &&
    expected.momentum !== "explorationBlock"
  ) {
    violations.push({
      fixtureId: id,
      rule: "creative-exploration-block",
      detail: "creative DayMode requires explorationBlock momentum behavior",
    });
  }

  if (
    (expected.dayMode === "survival" || expected.dayMode === "recovery") &&
    expected.proposalCount.max > 2 &&
    !expected.orientationOnly
  ) {
    violations.push({
      fixtureId: id,
      rule: "low-capacity-proposal-cap",
      detail: "survival/recovery should cap proposals at 2 unless orientationOnly",
    });
  }

  if (
    expected.permissionDisplay === "full" &&
    (expected.orientationOnly ||
      expected.dayMode === "survival" ||
      expected.dayMode === "recovery")
  ) {
    violations.push({
      fixtureId: id,
      rule: "collapsed-permission-default",
      detail: "overwhelm/survival/orientationOnly should not use full permission display",
    });
  }

  if (
    fixture.expected.reflection.mustNotCompensateTomorrow &&
    expected.dayMode === "recovery" &&
    expected.proposalCount.min > 2
  ) {
    violations.push({
      fixtureId: id,
      rule: "no-backlog-compensation",
      detail: "recovery must not suggest heavy proposal load",
    });
  }

  if (
    expected.celebrationCooldownActive &&
    expected.proposalCount.min > 1
  ) {
    violations.push({
      fixtureId: id,
      rule: "celebration-cooldown",
      detail: "celebrationCooldown active should limit proposals",
    });
  }

  return violations;
}

export function assertFixtureInvariants(fixture: CompanionJudgmentFixture): void {
  const violations = validateFixtureInvariants(fixture);
  if (violations.length > 0) {
    const msg = violations
      .map((v) => `${v.fixtureId}: ${v.rule} — ${v.detail}`)
      .join("\n");
    throw new Error(`Fixture invariant violations:\n${msg}`);
  }
}

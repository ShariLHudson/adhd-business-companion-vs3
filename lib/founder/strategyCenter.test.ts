import { describe, expect, it } from "vitest";

import { STRATEGY_CENTER_BOOTSTRAP } from "./strategyCenter/sample/data";
import {
  archiveStrategySession,
  duplicateStrategySession,
  getStrategyCenterBootstrap,
} from "./strategyCenter/services";

describe("Executive Strategy Center", () => {
  it("getStrategyCenterBootstrap returns full thinking environment", () => {
    const bootstrap = getStrategyCenterBootstrap();
    expect(bootstrap.tools.length).toBe(8);
    expect(bootstrap.perspectives.length).toBeGreaterThanOrEqual(12);
    expect(bootstrap.boardMembers.length).toBeGreaterThanOrEqual(10);
    expect(bootstrap.estatePlaces.length).toBe(6);
    expect(bootstrap.defaultSession.ideaCards.length).toBeGreaterThan(0);
    expect(bootstrap.defaultSession.executiveQuestion.length).toBeGreaterThan(10);
  });

  it("duplicateStrategySession creates a new session id", () => {
    const original = STRATEGY_CENTER_BOOTSTRAP.defaultSession;
    const copy = duplicateStrategySession(original);
    expect(copy.id).not.toBe(original.id);
    expect(copy.title).toContain("copy");
    expect(copy.archived).toBe(false);
  });

  it("archiveStrategySession marks session archived", () => {
    const archived = archiveStrategySession(STRATEGY_CENTER_BOOTSTRAP.defaultSession);
    expect(archived.archived).toBe(true);
    expect(archived.updatedAt).not.toBe(
      STRATEGY_CENTER_BOOTSTRAP.defaultSession.updatedAt,
    );
  });
});

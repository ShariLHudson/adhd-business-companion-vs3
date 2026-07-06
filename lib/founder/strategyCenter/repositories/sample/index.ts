import { STRATEGY_CENTER_BOOTSTRAP } from "../../sample/data";
import type { StrategyCenterBootstrap, StrategySession } from "../../types/index";

export const sampleStrategyCenterRepository = {
  getBootstrap(): StrategyCenterBootstrap {
    return STRATEGY_CENTER_BOOTSTRAP;
  },

  /** Placeholder — returns a fresh copy of the default session. */
  createSession(title?: string): StrategySession {
    const now = new Date().toISOString();
    return {
      ...STRATEGY_CENTER_BOOTSTRAP.defaultSession,
      id: `session-${Date.now()}`,
      title: title ?? "New Strategy Session",
      updatedAt: now,
      archived: false,
      ideaCards: STRATEGY_CENTER_BOOTSTRAP.defaultSession.ideaCards.map((card) => ({
        ...card,
      })),
      decision: { ...STRATEGY_CENTER_BOOTSTRAP.defaultSession.decision },
      notes: { ...STRATEGY_CENTER_BOOTSTRAP.defaultSession.notes },
    };
  },
};

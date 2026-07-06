import { sampleStrategyCenterRepository } from "../repositories/sample";
import type { StrategyCenterBootstrap, StrategySession } from "../types";

/** Bootstrap data for Executive Strategy Center™ room. */
export function getStrategyCenterBootstrap(): StrategyCenterBootstrap {
  return sampleStrategyCenterRepository.getBootstrap();
}

/** Placeholder — duplicate session for local resume flows. */
export function duplicateStrategySession(session: StrategySession): StrategySession {
  const now = new Date().toISOString();
  return {
    ...session,
    id: `session-${Date.now()}`,
    title: `${session.title} (copy)`,
    updatedAt: now,
    archived: false,
    ideaCards: session.ideaCards.map((card) => ({ ...card })),
    decision: { ...session.decision, pros: [...session.decision.pros], concerns: [...session.decision.concerns], unknowns: [...session.decision.unknowns] },
    notes: {
      ...session.notes,
      bullets: [...session.notes.bullets],
      actionItems: [...session.notes.actionItems],
    },
  };
}

/** Placeholder archive flag — no backend. */
export function archiveStrategySession(session: StrategySession): StrategySession {
  return {
    ...session,
    archived: true,
    updatedAt: new Date().toISOString(),
  };
}

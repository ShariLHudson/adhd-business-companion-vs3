/**
 * Strategy Apply session persistence — survives refresh and navigation.
 */

import type {
  StrategyApplyPhase,
  StrategyApplyQuestion,
  StrategyApplySession,
} from "./strategyApplyCoach";

export const STRATEGY_APPLY_SESSION_KEY = "companion-strategy-apply-v1";

export type PersistedStrategyApplySession = {
  strategyId: string;
  strategyTitle: string;
  questionIndex: number;
  answers: Record<string, string>;
  generatedPlan?: string;
  questions: StrategyApplyQuestion[];
  phase: StrategyApplyPhase;
  activeProjectName?: string | null;
  workspacePanelOpen?: boolean;
  lastTouchedAt: string;
};

export function toStrategyApplySession(
  persisted: PersistedStrategyApplySession,
): StrategyApplySession {
  return {
    strategyId: persisted.strategyId,
    title: persisted.strategyTitle,
    questions: persisted.questions,
    answers: persisted.answers,
    questionIndex: persisted.questionIndex,
    phase: persisted.phase,
    plan: persisted.generatedPlan,
    activeProjectName: persisted.activeProjectName,
  };
}

export function fromStrategyApplySession(
  session: StrategyApplySession,
  opts?: { workspacePanelOpen?: boolean },
): PersistedStrategyApplySession {
  return {
    strategyId: session.strategyId,
    strategyTitle: session.title,
    questionIndex: session.questionIndex,
    answers: session.answers,
    generatedPlan: session.plan,
    questions: session.questions,
    phase: session.phase,
    activeProjectName: session.activeProjectName,
    workspacePanelOpen: opts?.workspacePanelOpen ?? true,
    lastTouchedAt: new Date().toISOString(),
  };
}

export function hasResumableStrategyApplySession(
  persisted: PersistedStrategyApplySession,
): boolean {
  return persisted.phase !== "done" && Boolean(persisted.strategyId);
}

export function saveStrategyApplySession(
  session: StrategyApplySession,
  opts?: { workspacePanelOpen?: boolean },
): void {
  if (typeof window === "undefined") return;
  if (session.phase === "done") return;
  try {
    localStorage.setItem(
      STRATEGY_APPLY_SESSION_KEY,
      JSON.stringify(fromStrategyApplySession(session, opts)),
    );
  } catch {
    /* noop */
  }
}

export function loadStrategyApplySession(): PersistedStrategyApplySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STRATEGY_APPLY_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedStrategyApplySession;
    if (!parsed?.strategyId) return null;
    if (!hasResumableStrategyApplySession(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStrategyApplySession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STRATEGY_APPLY_SESSION_KEY);
  } catch {
    /* noop */
  }
}

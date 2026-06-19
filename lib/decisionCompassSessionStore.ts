/**
 * Decision Compass session persistence — survives refresh and navigation.
 */

import {
  allStepsForState,
  computeDecisionResult,
  currentStep,
  type DecisionCompassAnswers,
  type DecisionCompassState,
  type DecisionResult,
  type DecisionType,
} from "./decisionCompass";
import type { DecisionExplorationState } from "./decisionCompassExploration";

export const DECISION_COMPASS_SESSION_KEY = "companion-decision-compass-session-v1";

export type PersistedDecisionCompassSession = {
  sessionId: string;
  decision: string;
  optionA: string;
  optionB: string;
  decisionType: DecisionType | null;
  currentStepId: string;
  completedSteps: string[];
  answers: DecisionCompassAnswers;
  recommendation: DecisionResult | null;
  /** Internal fields required for exact UI restore. */
  stepIndex: number;
  showMap: boolean;
  complete: boolean;
  draft: string;
  lastTouchedAt: string;
  /** V3 — exploration, confidence, action plan (persists with session). */
  exploration?: DecisionExplorationState;
};

function newSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dc-${Date.now()}`;
}

export function snapshotFromPanelState(
  state: DecisionCompassState,
  optionA: string,
  optionB: string,
  draft: string,
  sessionId?: string,
  existingSnapshot?: PersistedDecisionCompassSession | null,
): PersistedDecisionCompassSession {
  const steps = allStepsForState(state);
  const step = currentStep(state);
  const completedSteps = steps.slice(0, state.stepIndex).map((s) => s.id);
  const recommendation = computeDecisionResult(state);
  const existing =
    existingSnapshot ??
    (sessionId
      ? loadDecisionCompassSession()?.sessionId === sessionId
        ? loadDecisionCompassSession()
        : null
      : loadDecisionCompassSession());

  return {
    sessionId: sessionId ?? existing?.sessionId ?? newSessionId(),
    decision: state.answers.decision?.trim() ?? "",
    optionA,
    optionB,
    decisionType: state.decisionType,
    currentStepId: step?.id ?? "decision",
    completedSteps,
    answers: state.answers,
    recommendation,
    stepIndex: state.stepIndex,
    showMap: state.showMap,
    complete: state.complete,
    draft,
    lastTouchedAt: new Date().toISOString(),
    exploration: existing?.exploration,
  };
}

export function panelStateFromSnapshot(snapshot: PersistedDecisionCompassSession): {
  state: DecisionCompassState;
  optionA: string;
  optionB: string;
  draft: string;
} {
  return {
    state: {
      stepIndex: snapshot.stepIndex,
      decisionType: snapshot.decisionType,
      answers: snapshot.answers,
      showMap: snapshot.showMap,
      complete: snapshot.complete,
    },
    optionA: snapshot.optionA,
    optionB: snapshot.optionB,
    draft: snapshot.draft,
  };
}

export function hasResumableDecisionCompassProgress(
  snapshot: PersistedDecisionCompassSession,
): boolean {
  if (snapshot.complete) {
    return Boolean(snapshot.recommendation);
  }
  return Boolean(
    snapshot.decision?.trim() ||
      snapshot.answers.decision?.trim() ||
      snapshot.stepIndex > 0 ||
      Object.keys(snapshot.answers).length > 0,
  );
}

export function saveDecisionCompassSession(
  snapshot: Omit<PersistedDecisionCompassSession, "lastTouchedAt"> & {
    lastTouchedAt?: string;
  },
): void {
  if (typeof window === "undefined") return;
  if (!hasResumableDecisionCompassProgress(snapshot as PersistedDecisionCompassSession)) {
    return;
  }
  try {
    const existing = loadDecisionCompassSession();
    localStorage.setItem(
      DECISION_COMPASS_SESSION_KEY,
      JSON.stringify({
        ...snapshot,
        sessionId: snapshot.sessionId ?? existing?.sessionId ?? newSessionId(),
        lastTouchedAt: snapshot.lastTouchedAt ?? new Date().toISOString(),
      } satisfies PersistedDecisionCompassSession),
    );
  } catch {
    /* noop */
  }
}

export function loadDecisionCompassSession(): PersistedDecisionCompassSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DECISION_COMPASS_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedDecisionCompassSession;
    if (!parsed?.sessionId) return null;
    if (!hasResumableDecisionCompassProgress(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDecisionCompassSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DECISION_COMPASS_SESSION_KEY);
  } catch {
    /* noop */
  }
}

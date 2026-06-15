export * from "./types";
export * from "./daySignals";
export * from "./dayReasoning";
export * from "./dayMessages";
export * from "./dayPlanner";
export * from "./dayStore";
export * from "./dayInsights";
export * from "./founderDayDesignerReporting";

import { buildDayPlan, buildSimpleDayPlanView } from "./dayPlanner";
import {
  advanceDayDesignerSession,
  companionIntroForDayDesigner,
  questionForStep,
  shouldStartDayDesigner,
  startDayDesignerSession,
} from "./dayMessages";
import {
  dismissDayDesigner,
  isDayDesignerDismissedToday,
  notifyDayDesignerUpdated,
  recordDayPlan,
  saveDayDesignerSession,
} from "./dayStore";
import type { DayDesignerInput, DayPlan, DayDesignerSession } from "./types";

export function beginDayDesignerFlow(now = new Date()): DayDesignerSession {
  const session = startDayDesignerSession(now);
  saveDayDesignerSession(session);
  return session;
}

export function processDayDesignerMessage(
  session: DayDesignerSession,
  text: string,
  input: DayDesignerInput = {},
): {
  session: DayDesignerSession;
  question: string | null;
  plan: DayPlan | null;
} {
  const next = advanceDayDesignerSession(session, text);
  saveDayDesignerSession(next);

  if (next.step === "complete") {
    const plan = buildDayPlan({ ...input, answers: next.answers });
    recordDayPlan(plan);
    notifyDayDesignerUpdated();
    return { session: next, question: null, plan };
  }

  if (next.step === "idle") {
    return { session: next, question: null, plan: null };
  }

  return {
    session: next,
    question: questionForStep(next.step),
    plan: null,
  };
}

export function createAdaptiveDayPlan(
  input: DayDesignerInput = {},
): DayPlan {
  const plan = buildDayPlan(input);
  recordDayPlan(plan);
  notifyDayDesignerUpdated();
  return plan;
}

export {
  shouldStartDayDesigner,
  companionIntroForDayDesigner,
  questionForStep,
  dismissDayDesigner,
  isDayDesignerDismissedToday,
  buildDayPlan,
  buildSimpleDayPlanView,
};

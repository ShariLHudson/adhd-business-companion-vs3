/**
 * ADHD strategy apply coach — one question at a time; panel fills as you go.
 */

import { isWorkflowConceptQuestion } from "./activeWorkflowContextLock";
import { getStrategy, type Strategy } from "./strategySystem";

export type StrategyApplyPhase = "collecting" | "done";

export type StrategyApplyQuestion = {
  id: string;
  /** Workspace panel label — step text or coach prompt. */
  prompt: string;
  /** Chat coaching message for this step. */
  chatPrompt: string;
};

export type StrategyApplySession = {
  strategyId: string;
  title: string;
  questions: StrategyApplyQuestion[];
  answers: Record<string, string>;
  questionIndex: number;
  phase: StrategyApplyPhase;
  plan?: string;
  /** Active project name — memory only, not shown in the coaching opener. */
  activeProjectName?: string | null;
};

function chatPromptForStep(step: string, index: number): string {
  return `Step ${index + 1}:\n${step}\n\nWhat does that look like for you right now?`;
}

export function questionsForStrategy(s: Strategy): StrategyApplyQuestion[] {
  if (s.coach?.length) {
    return s.coach.map((prompt, i) => ({
      id: `q${i}`,
      prompt,
      chatPrompt: prompt,
    }));
  }
  return s.steps.map((step, i) => ({
    id: `step${i}`,
    prompt: step,
    chatPrompt: chatPromptForStep(step, i),
  }));
}

export function buildStrategyApplyOpener(
  strategy: Strategy,
  firstQuestion: StrategyApplyQuestion,
): string {
  return [
    strategy.title,
    "",
    "Let's apply this to your situation.",
    "",
    firstQuestion.chatPrompt,
  ].join("\n");
}

export type StrategyApplyBootstrapContext = {
  activeProjectName?: string | null;
};

export function bootstrapStrategyApplySession(
  strategyId: string,
  ctx?: StrategyApplyBootstrapContext,
): { session: StrategyApplySession; opener: string } | null {
  const s = getStrategy(strategyId);
  if (!s) return null;

  const questions = questionsForStrategy(s);
  const first = questions[0];
  if (!first) return null;

  const project = ctx?.activeProjectName?.trim() || null;
  const session: StrategyApplySession = {
    strategyId: s.id,
    title: s.title,
    questions,
    answers: {},
    questionIndex: 0,
    phase: "collecting",
    activeProjectName: project,
  };

  return {
    session,
    opener: buildStrategyApplyOpener(s, first),
  };
}

/** API hint — project context without cluttering the visible coaching opener. */
export function strategyApplyContextHint(
  session: StrategyApplySession | null | undefined,
): string | null {
  const project = session?.activeProjectName?.trim();
  if (!project) return null;
  return (
    `STRATEGY APPLY CONTEXT: User is applying "${session!.title}". ` +
    `Active project on screen: ${project}. ` +
    `Reference it only when it naturally fits the current step — do not open Projects or repeat this in chat unless the user asks.`
  );
}

function buildPlan(session: StrategyApplySession): string {
  const s = getStrategy(session.strategyId);
  const lines = [
    `Applying ${session.title}`,
    "",
    "Your answers",
    ...session.questions.map((q) => {
      const a = session.answers[q.id]?.trim() || "—";
      return `${q.prompt}\n${a}`;
    }),
    "",
    "Your next move",
  ];

  if (s?.steps.length) {
    lines.push(
      ...s.steps.map((step, i) => `${i + 1}. ${step}`),
      "",
      "Start with step 1 — even a rough version counts.",
    );
  } else {
    lines.push("Pick the smallest action from your answers and do it now.");
  }

  return lines.join("\n");
}

export type StrategyApplyTurnResult = {
  session: StrategyApplySession;
  reply: string;
};

export function processStrategyApplyTurn(
  session: StrategyApplySession,
  userText: string,
): StrategyApplyTurnResult {
  const trimmed = userText.trim();
  if (!trimmed) {
    return { session, reply: "Take your time — even a rough answer helps." };
  }

  if (isWorkflowConceptQuestion(trimmed)) {
    const pending = session.questions[session.questionIndex]?.chatPrompt;
    return {
      session,
      reply: pending
        ? `Happy to clarify — I'll keep it short.\n\n${pending}`
        : "Happy to clarify — tell me what you're unsure about and we'll keep building.",
    };
  }

  if (session.phase === "done" && session.plan) {
    return {
      session,
      reply:
        "Your plan is on the right. Tell me what to tweak, or say focus or time block when you're ready to work.",
    };
  }

  const q = session.questions[session.questionIndex];
  if (!q) {
    const plan = buildPlan(session);
    return {
      session: { ...session, phase: "done", plan },
      reply: `Here's your ${session.title} plan — it's filling in on the right. What's the very first tiny action you'll take?`,
    };
  }

  const answers = { ...session.answers, [q.id]: trimmed };
  const nextIndex = session.questionIndex + 1;

  if (nextIndex >= session.questions.length) {
    const nextSession: StrategyApplySession = {
      ...session,
      answers,
      questionIndex: nextIndex,
      phase: "done",
      plan: buildPlan({ ...session, answers, questionIndex: nextIndex }),
    };
    return {
      session: nextSession,
      reply:
        "Got it — I've pulled that together on the right.\n\nWhat's the smallest first action you'll take in the next 10 minutes?",
    };
  }

  const nextQ = session.questions[nextIndex]!.chatPrompt;
  return {
    session: {
      ...session,
      answers,
      questionIndex: nextIndex,
    },
    reply: nextQ,
  };
}

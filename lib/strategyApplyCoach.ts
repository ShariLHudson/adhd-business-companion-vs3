/**
 * ADHD strategy apply coach — one question at a time; panel fills as you go.
 */

import { isWorkflowConceptQuestion } from "./activeWorkflowContextLock";
import { getStrategy, type Strategy } from "./strategySystem";

export type StrategyApplyPhase = "collecting" | "done";

export type StrategyApplyQuestion = { id: string; prompt: string };

export type StrategyApplySession = {
  strategyId: string;
  title: string;
  questions: StrategyApplyQuestion[];
  answers: Record<string, string>;
  questionIndex: number;
  phase: StrategyApplyPhase;
  plan?: string;
};

export function questionsForStrategy(s: Strategy): StrategyApplyQuestion[] {
  if (s.coach?.length) {
    return s.coach.map((prompt, i) => ({ id: `q${i}`, prompt }));
  }
  return s.steps.map((step, i) => ({
    id: `step${i}`,
    prompt: `Step ${i + 1} is "${step}" — what does that look like for your situation right now?`,
  }));
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
  const session: StrategyApplySession = {
    strategyId: s.id,
    title: s.title,
    questions,
    answers: {},
    questionIndex: 0,
    phase: "collecting",
  };

  const first = questions[0]?.prompt ?? "What's going on right now?";
  const project = ctx?.activeProjectName?.trim();
  const projectLine = project
    ? `\n\nYou're focused on **${project}** — I'll reference it only if it naturally fits; we won't force project routing.`
    : "";
  const opener = [
    `Let's apply **${s.title}** to your real situation — one question at a time.${projectLine}`,
    `**${first}**`,
  ].join("\n\n");

  return { session, opener };
}

function buildPlan(session: StrategyApplySession): string {
  const s = getStrategy(session.strategyId);
  const lines = [
    `# Applying ${session.title}`,
    "",
    "## Your answers",
    ...session.questions.map((q) => {
      const a = session.answers[q.id]?.trim() || "—";
      return `### ${q.prompt}\n${a}`;
    }),
    "",
    "## Your next move",
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
    const pending = session.questions[session.questionIndex]?.prompt;
    return {
      session,
      reply: pending
        ? `Happy to clarify — I'll keep it short.\n\n**${pending}**`
        : "Happy to clarify — tell me what you're unsure about and we'll keep building.",
    };
  }

  if (session.phase === "done" && session.plan) {
    return {
      session,
      reply:
        "Your plan is on the right. Tell me what to tweak, or say **focus** / **time block** when you're ready to work.",
    };
  }

  const q = session.questions[session.questionIndex];
  if (!q) {
    const plan = buildPlan(session);
    return {
      session: { ...session, phase: "done", plan },
      reply: `Here's your **${session.title}** plan — it's filling in on the right. What's the very first tiny action you'll take?`,
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
      reply: `Got it — I've pulled that together on the right.\n\nWhat's the **smallest first action** you'll take in the next 10 minutes?`,
    };
  }

  const nextQ = session.questions[nextIndex]!.prompt;
  return {
    session: {
      ...session,
      answers,
      questionIndex: nextIndex,
    },
    reply: `**${nextQ}**`,
  };
}

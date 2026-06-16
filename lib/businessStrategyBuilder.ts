/**
 * Business strategy builder — one question at a time beside Strategies.
 */

export type BusinessStrategyPhase = "discovery" | "readiness" | "collecting_extra" | "done";

export type BusinessStrategySession = {
  typeLabel: string;
  answers: Record<string, string>;
  questionIndex: number;
  phase: BusinessStrategyPhase;
  draft?: string;
};

const QUESTIONS: { id: string; prompt: string }[] = [
  { id: "purpose", prompt: "What is this strategy for?" },
  { id: "outcome", prompt: "What outcome are you trying to create?" },
  { id: "impacts", prompt: "Who does it impact?" },
  { id: "success", prompt: "What does success look like?" },
  { id: "obstacles", prompt: "What obstacles are in the way?" },
];

export function bootstrapBusinessStrategySession(
  typeLabel: string,
): { session: BusinessStrategySession; opener: string } {
  const label = typeLabel?.trim() || "Business Strategy";
  const session: BusinessStrategySession = {
    typeLabel: label,
    answers: {},
    questionIndex: 0,
    phase: "discovery",
  };
  const opener = `Let's build your **${label}** together — one question at a time.\n\n**${QUESTIONS[0]!.prompt}**`;
  return { session, opener };
}

function nextQuestion(session: BusinessStrategySession): string | null {
  if (session.questionIndex >= QUESTIONS.length) return null;
  return QUESTIONS[session.questionIndex]!.prompt;
}

function buildDraft(session: BusinessStrategySession): string {
  const a = session.answers;
  const title = session.typeLabel;
  return [
    `# ${title}`,
    "",
    "## Purpose",
    a.purpose?.trim() || "—",
    "",
    "## Desired Outcome",
    a.outcome?.trim() || "—",
    "",
    "## Who It Impacts",
    a.impacts?.trim() || "—",
    "",
    "## Success Looks Like",
    a.success?.trim() || "—",
    "",
    "## Obstacles & Mitigations",
    a.obstacles?.trim() || "—",
    "",
    "## Next Steps",
    "1. Pick the smallest action that moves this forward this week.",
    "2. Schedule a review date to adjust based on what you learn.",
  ].join("\n");
}

export type BusinessStrategyTurnResult = {
  session: BusinessStrategySession;
  reply: string;
  showBuildActions?: boolean;
};

export function processBusinessStrategyTurn(
  session: BusinessStrategySession,
  userText: string,
): BusinessStrategyTurnResult {
  const trimmed = userText.trim();
  if (!trimmed) {
    return { session, reply: "Take your time — even a rough answer helps." };
  }

  if (session.phase === "done" && session.draft) {
    return {
      session,
      reply: "Your strategy draft is ready beside you. Tell me what to refine.",
    };
  }

  if (session.phase === "readiness") {
    if (/^(build|yes|go|create|draft)/i.test(trimmed)) {
      const draft = buildDraft(session);
      return {
        session: { ...session, phase: "done", draft },
        reply: `Here's your **${session.typeLabel}** draft — it's in the panel beside you. Want to tweak anything?`,
      };
    }
    if (/more|detail|add|not yet|wait/i.test(trimmed)) {
      return {
        session: { ...session, phase: "collecting_extra" },
        reply: "What else should I know before we build the draft?",
      };
    }
    return {
      session,
      reply: 'Reply **Build Strategy** when you\'re ready, or **Add More Detail** if something is missing.',
      showBuildActions: true,
    };
  }

  if (session.phase === "collecting_extra") {
    const extra = session.answers.extra?.trim()
      ? `${session.answers.extra}\n${trimmed}`
      : trimmed;
    const next: BusinessStrategySession = {
      ...session,
      answers: { ...session.answers, extra },
      phase: "readiness",
    };
    return {
      session: next,
      reply: "Got it — I've added that.\n\nI think I have enough information to build your strategy.\n\nReply **Build Strategy** or **Add More Detail**.",
      showBuildActions: true,
    };
  }

  const q = QUESTIONS[session.questionIndex];
  if (!q) {
    return {
      session: { ...session, phase: "readiness" },
      reply: "I think I have enough information to build your strategy.\n\nReply **Build Strategy** or **Add More Detail**.",
      showBuildActions: true,
    };
  }

  const answers = { ...session.answers, [q.id]: trimmed };
  const nextIndex = session.questionIndex + 1;

  if (nextIndex >= QUESTIONS.length) {
    return {
      session: {
        ...session,
        answers,
        questionIndex: nextIndex,
        phase: "readiness",
      },
      reply: "I think I have enough information to build your strategy.\n\nReply **Build Strategy** or **Add More Detail**.",
      showBuildActions: true,
    };
  }

  const nextQ = QUESTIONS[nextIndex]!.prompt;
  return {
    session: {
      ...session,
      answers,
      questionIndex: nextIndex,
    },
    reply: `**${nextQ}**`,
  };
}

export function businessStrategyReadinessMessage(session: BusinessStrategySession): string {
  return `I think I have enough information to build your **${session.typeLabel}**.\n\nReply **Build Strategy** or **Add More Detail**.`;
}

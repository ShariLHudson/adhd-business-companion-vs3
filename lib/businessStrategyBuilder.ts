/**
 * Business strategy builder — conversational coaching; panel fills as you talk.
 */

import { isWorkflowConceptQuestion } from "./activeWorkflowContextLock";

export type BusinessStrategyPhase = "coaching" | "done";

export type BusinessStrategyQuestion = { id: string; prompt: string };

export type BusinessStrategySession = {
  typeLabel: string;
  answers: Record<string, string>;
  questions: BusinessStrategyQuestion[];
  /** @deprecated Kept for migration; conversational mode does not march through these. */
  questionIndex: number;
  phase: BusinessStrategyPhase;
  draft?: string;
};

const CORE_QUESTIONS: BusinessStrategyQuestion[] = [
  { id: "purpose", prompt: "What is this strategy for?" },
  { id: "outcome", prompt: "What outcome are you trying to create?" },
  { id: "impacts", prompt: "Who does it impact?" },
  { id: "success", prompt: "What does success look like?" },
  { id: "obstacles", prompt: "What obstacles are in the way?" },
];

const TYPE_EXTENSIONS: Record<string, BusinessStrategyQuestion[]> = {
  marketing: [
    { id: "timeframe", prompt: "Timeframe (e.g. 8 weeks)" },
    { id: "audience", prompt: "Target audience" },
    { id: "channels", prompt: "Channels" },
    { id: "offers", prompt: "Offers / CTAs" },
  ],
  sales: [
    { id: "timeframe", prompt: "Timeframe" },
    { id: "pipeline", prompt: "Warm leads / pipeline" },
  ],
  launch: [
    { id: "timeframe", prompt: "Launch window" },
    { id: "launch_offer", prompt: "What is launching" },
  ],
  content: [
    { id: "timeframe", prompt: "Plan duration" },
    { id: "themes", prompt: "Content themes" },
  ],
  product: [
    { id: "timeframe", prompt: "Timeframe" },
    { id: "audience", prompt: "Who this product is for" },
    { id: "offers", prompt: "Core offer / promise" },
  ],
};

export function questionsForStrategyType(typeLabel: string): BusinessStrategyQuestion[] {
  const lower = typeLabel.trim().toLowerCase();
  const ext =
    Object.entries(TYPE_EXTENSIONS).find(([key]) => lower.includes(key))?.[1] ??
    [];
  return [...CORE_QUESTIONS, ...ext];
}

function parseWeekCount(timeframe?: string): number | null {
  if (!timeframe?.trim()) return null;
  const m = timeframe.match(/(\d+)\s*[- ]?\s*week/i);
  if (m) return Math.min(Math.max(parseInt(m[1]!, 10), 1), 16);
  if (/quarter|90\s*day|3\s*month/i.test(timeframe)) return 12;
  return null;
}

function weekOutline(weeks: number): string[] {
  const lines: string[] = ["", "## Weekly Plan", ""];
  for (let w = 1; w <= weeks; w++) {
    lines.push(
      `### Week ${w}`,
      "- Focus:",
      "- Content / visibility:",
      "- Sales or conversion move:",
      "- One measurable win:",
      "",
    );
  }
  return lines;
}

export function buildBusinessStrategyDraft(session: BusinessStrategySession): string {
  const a = session.answers;
  const title = session.typeLabel;
  const isMarketing = /marketing/i.test(title);
  const weeks = parseWeekCount(a.timeframe);

  const sections = [
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
  ];

  if (a.timeframe?.trim()) sections.push("", "## Timeframe", a.timeframe.trim());
  if (a.audience?.trim()) sections.push("", "## Target Audience", a.audience.trim());
  if (a.channels?.trim()) sections.push("", "## Channels", a.channels.trim());
  if (a.offers?.trim()) sections.push("", "## Offers & CTAs", a.offers.trim());
  if (a.themes?.trim()) sections.push("", "## Content Themes", a.themes.trim());
  if (a.pipeline?.trim()) sections.push("", "## Pipeline / Warm Leads", a.pipeline.trim());
  if (a.launch_offer?.trim()) sections.push("", "## Launch Offer", a.launch_offer.trim());
  if (a.notes?.trim()) sections.push("", "## Notes from our conversation", a.notes.trim());

  if (isMarketing && weeks) {
    sections.push(...weekOutline(weeks));
  }

  if (a.extra?.trim()) {
    sections.push("", "## Additional detail", a.extra.trim());
  }

  return sections.join("\n");
}

export function bootstrapBusinessStrategySession(
  typeLabel: string,
): { session: BusinessStrategySession; opener: string } {
  const label = typeLabel?.trim() || "Business Strategy";
  const session: BusinessStrategySession = {
    typeLabel: label,
    answers: {},
    questions: questionsForStrategyType(label),
    questionIndex: 0,
    phase: "coaching",
  };

  const isMarketing = /marketing/i.test(label);
  const opener = isMarketing
    ? `Let's shape your **${label}** together — no checklist.\n\nTell me what you're building, who it's for, and what "done" looks like (8 weeks, a launch, steady visibility — whatever's real for you). I'll respond to what you share and we'll build the plan on the right as we go.`
    : `Let's build your **${label}** together — conversation first, not a form.\n\nWhat's the situation, what are you trying to make happen, and what's been getting in the way? I'll follow your lead and only ask what I actually need.`;

  return { session, opener };
}

const FIELD_FROM_ASSISTANT: { re: RegExp; id: string }[] = [
  { re: /\b(?:timeframe|how long|weeks?|quarter|90.day|timeline)\b/i, id: "timeframe" },
  { re: /\b(?:audience|who are you (?:trying to )?reach|ideal client|who is this for)\b/i, id: "audience" },
  { re: /\b(?:channel|where will you show up|social|email|newsletter)\b/i, id: "channels" },
  { re: /\b(?:offer|cta|call.to.action|what are you selling)\b/i, id: "offers" },
  { re: /\b(?:purpose|what is this (?:strategy )?for)\b/i, id: "purpose" },
  { re: /\b(?:outcome|trying to create|goal)\b/i, id: "outcome" },
  { re: /\b(?:obstacle|getting in the way|blocker|stuck)\b/i, id: "obstacles" },
  { re: /\b(?:success look|how will you know)\b/i, id: "success" },
  { re: /\b(?:pipeline|warm lead|past client)\b/i, id: "pipeline" },
  { re: /\b(?:launching|launch offer|what are you launching)\b/i, id: "launch_offer" },
  { re: /\b(?:theme|pillar|content angle)\b/i, id: "themes" },
];

function inferFieldFromAssistant(lastAssistantText: string): string | null {
  for (const { re, id } of FIELD_FROM_ASSISTANT) {
    if (re.test(lastAssistantText)) return id;
  }
  return null;
}

function nextEmptyFieldId(session: BusinessStrategySession): string | null {
  for (const q of session.questions) {
    if (!session.answers[q.id]?.trim()) return q.id;
  }
  return null;
}

/** Pull structure from natural chat into the plan on the right. */
export function absorbBusinessStrategyFromUserMessage(
  session: BusinessStrategySession,
  userText: string,
  lastAssistantText = "",
): BusinessStrategySession {
  const trimmed = userText.trim();
  if (!trimmed) return session;

  if (isWorkflowConceptQuestion(trimmed)) {
    return session;
  }

  const answers = { ...session.answers };

  if (/^build\s+strategy/i.test(trimmed) || /^draft\s+it/i.test(trimmed)) {
    const draft = buildBusinessStrategyDraft({ ...session, answers });
    return { ...session, answers, phase: "coaching", draft };
  }

  const inferred = inferFieldFromAssistant(lastAssistantText);
  if (inferred) {
    answers[inferred] = answers[inferred]?.trim()
      ? `${answers[inferred]}\n${trimmed}`
      : trimmed;
  } else if (trimmed.length > 120 || (trimmed.match(/[.!?]/g)?.length ?? 0) >= 2) {
    answers.notes = answers.notes?.trim()
      ? `${answers.notes}\n${trimmed}`
      : trimmed;
    const empty = nextEmptyFieldId({ ...session, answers });
    if (empty === "purpose" && !answers.purpose) answers.purpose = trimmed.slice(0, 280);
  } else {
    const empty = nextEmptyFieldId({ ...session, answers });
    if (empty) answers[empty] = trimmed;
    else {
      answers.extra = answers.extra?.trim()
        ? `${answers.extra}\n${trimmed}`
        : trimmed;
    }
  }

  if (/\b\d+\s*[- ]?week/i.test(trimmed) && !answers.timeframe) {
    const m = trimmed.match(/\b(\d+\s*[- ]?weeks?[^.!?]*)/i);
    if (m) answers.timeframe = m[1]!.trim();
  }

  const next: BusinessStrategySession = {
    ...session,
    answers,
    phase: "coaching",
  };
  const hasContent = Object.values(answers).some((v) => v?.trim());
  if (hasContent) {
    next.draft = buildBusinessStrategyDraft(next);
  }
  return next;
}

export function businessStrategyCoachHintForChat(
  session: BusinessStrategySession | null | undefined,
): string | null {
  if (!session) return null;
  return [
    "BUSINESS STRATEGY CONVERSATION (mandatory):",
    "The user is building a custom plan beside chat — NOT reading a library article.",
    "Do NOT march through a fixed questionnaire or repeat scripted readiness lines.",
    "Respond to what they actually said: reflect, connect dots, one natural follow-up at a time.",
    "If they already gave context, do NOT re-ask it. Build on it.",
    "For marketing/product plans: think like the Marketing board advisor — audience, message, channels, realistic weekly moves for ADHD energy.",
    "When helpful, suggest concrete plan sections (week-by-week, emails, posts) they can see updating on the right.",
    `Plan type: ${session.typeLabel}.`,
    "When Strategies is open, chat content auto-applies to the plan — never ask permission to save or add.",
    "If they ask what a concept means mid-build: brief answer tied to this plan, then continue coaching — never Teaching Mode path menus.",
  ].join("\n");
}

export function formatBusinessStrategyForPrompt(
  session: BusinessStrategySession | null | undefined,
  draft?: string | null,
): string | undefined {
  if (!session && !draft) return undefined;

  const lines = [
    businessStrategyCoachHintForChat(session) ?? "",
    "",
    "Captured so far (do not re-interrogate unless a gap blocks good advice):",
  ].filter(Boolean);

  if (session) {
    for (const q of session.questions) {
      const a = session.answers[q.id]?.trim();
      if (a) lines.push(`- ${q.prompt}: ${a}`);
    }
    if (session.answers.notes?.trim()) {
      lines.push(`- Conversation notes: ${session.answers.notes.trim()}`);
    }
    if (session.answers.extra?.trim()) {
      lines.push(`- Extra detail: ${session.answers.extra.trim()}`);
    }
  }
  if (draft?.trim()) {
    lines.push("", "Plan visible beside chat:", draft.trim().slice(0, 4000));
  }

  return lines.join("\n");
}

export function primaryAdvisorForStrategyType(
  typeLabel: string,
): "marketing" | "planning" | "operations" {
  const t = typeLabel.toLowerCase();
  if (/marketing|visibility|content|launch|product/i.test(t)) return "marketing";
  if (/sales|operations|system/i.test(t)) return "operations";
  return "planning";
}

/** @deprecated Conversational mode uses the API — kept for tests. */
export function processBusinessStrategyTurn(
  session: BusinessStrategySession,
  userText: string,
): { session: BusinessStrategySession; reply: string } {
  const next = absorbBusinessStrategyFromUserMessage(session, userText);
  return {
    session: next,
    reply: next.draft
      ? "I've updated your plan on the right based on that."
      : "Got it — keep going and I'll shape the plan as we talk.",
  };
}

/**
 * Talk It Out reflective engine — first consumer of Reflective Conversation Intelligence.
 * Keeps experience-local help boundary + situation-tuned candidate banks.
 */

import { tryConversationRepair } from "@/lib/conversationRepairClarificationIntelligence";
import { deliverConversationalResponse } from "@/lib/conversationalIntelligence";
import {
  runReflectiveTurn,
  type RciCandidateQuestion,
  type RciResponseKind,
  type ThinkingMap,
} from "@/lib/reflectiveConversationIntelligence";
import { getPrefs } from "@/lib/companionStore";
import { TALK_IT_OUT_HELP_OFFER, TALK_IT_OUT_OPENING } from "./copy";
import { TALK_IT_OUT_QUESTIONS } from "./questions";
import type { TalkItOutQuestion, TalkItOutSession } from "./types";
import {
  SHARI_OBSERVATIONS,
  pickRotating,
  type TalkItOutResponseKind,
} from "./voice";

const EXPLICIT_HELP =
  /\b(?:what else could help|another perspective|give me advice|i need advice|board(?:room)?|chamber|visual thinking|journal|decision compass|compare (?:the )?options|formal decision|map (?:this|it)|write (?:this|it) (?:out|down)|still stuck(?:\.|,)?(?:\s+(?:and|—|-))?\s*(?:want|need)?\s*more help|what else could help me think)\b/i;

type SituationSignal =
  | "multi-priority-avoidance"
  | "difficult-conversation"
  | "collaboration-decision"
  | "admin-avoidance"
  | "general";

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

export function detectsExplicitHelpRequest(text: string): boolean {
  return EXPLICIT_HELP.test(text);
}

function detectSituation(text: string): SituationSignal {
  const t = text.toLowerCase();
  if (
    /\b(?:three|several|multiple|too many)\b/.test(t) &&
    /\b(?:project|client|task)s?\b/.test(t) &&
    /\b(?:avoid(?:ing)?|putting off|procrastinat\w*|can't start|cannot start)\b/.test(
      t,
    )
  ) {
    return "multi-priority-avoidance";
  }
  if (
    /\b(?:let (?:a |the )?client go|fire|end (?:the )?relationship|hard conversation|difficult conversation|putting off the conversation)\b/.test(
      t,
    )
  ) {
    return "difficult-conversation";
  }
  if (
    /\b(?:collaborat|partner|other business|join (?:forces|them)|work with (?:them|these))\b/.test(
      t,
    ) &&
    /\b(?:decid|cannot decide|can't decide|unsure|whether)\b/.test(t)
  ) {
    return "collaboration-decision";
  }
  if (
    /\b(?:subscription|admin|paperwork|email|inbox|cancel)\b/.test(t) &&
    /\b(?:avoid|putting off|keep (?:not|avoiding))\b/.test(t)
  ) {
    return "admin-avoidance";
  }
  return "general";
}

/** Situation-tuned questions — connect to meaning, not echo the sentence. */
const SITUATION_QUESTIONS: Record<
  SituationSignal,
  readonly { id: string; text: string }[]
> = {
  "multi-priority-avoidance": [
    {
      id: "sit-multi-begin",
      text: "Which one would make you breathe a little easier if it were already handled?",
    },
    {
      id: "sit-multi-wrong",
      text: "What are you afraid will happen if you choose the wrong one to start with?",
    },
    {
      id: "sit-multi-equal",
      text: "Do they all feel equally urgent — or is one quietly louder than the others?",
    },
  ],
  "difficult-conversation": [
    {
      id: "sit-conv-hard",
      text: "What about that conversation feels hardest to begin?",
    },
    {
      id: "sit-conv-protect",
      text: "What are you protecting by waiting — them, yourself, or the relationship?",
    },
    {
      id: "sit-conv-know",
      text: "Is there a part of this you already know, but do not quite trust yet?",
    },
  ],
  "collaboration-decision": [
    {
      id: "sit-collab-matter",
      text: "What would need to be true for this collaboration to feel worth it?",
    },
    {
      id: "sit-collab-worry",
      text: "What concern keeps coming back when you picture saying yes?",
    },
    {
      id: "sit-collab-no",
      text: "What would a clear no protect for you?",
    },
  ],
  "admin-avoidance": [
    {
      id: "sit-admin-hang",
      text: "What might feel different once this was no longer hanging over you?",
    },
    {
      id: "sit-admin-block",
      text: "What about this task makes it stickier than it looks on paper?",
    },
    {
      id: "sit-admin-future",
      text: "How might tomorrow feel if this were already taken care of?",
    },
  ],
  general: [],
};

const SITUATION_OBSERVATIONS: Record<SituationSignal, readonly string[]> = {
  "multi-priority-avoidance": [
    "I wonder if the problem is not really the number of projects. It may be that they all feel equally urgent, so your brain cannot find a safe place to begin. Does that fit, or am I off?",
    "When everything feels equally important, starting can feel like picking a loss. That is a hard place to stand.",
  ],
  "difficult-conversation": [
    "Putting off a hard conversation often means something important is at stake — not that you lack courage.",
    "Tell me if I am reading this wrong: the delay may be less about the words, and more about what happens after them.",
  ],
  "collaboration-decision": [
    "Decisions like this often hinge less on the offer itself, and more on what it would change about how you work.",
    "I am curious whether the hesitation is about them — or about what partnership would ask of you.",
  ],
  "admin-avoidance": [
    "Small hanging tasks can take up more mental space than bigger work. That mismatch is exhausting.",
    "Avoiding this may not be laziness — it may be that the task feels boring, fiddly, or oddly final.",
  ],
  general: SHARI_OBSERVATIONS,
};

function areaForTurn(
  userTurns: number,
  text: string,
): TalkItOutQuestion["area"] {
  const t = text.toLowerCase();
  if (/\b(?:option|choice|between|either|or)\b/.test(t)) return "options";
  if (/\b(?:value|who i (?:am|want)|aligned|principle)\b/.test(t))
    return "values";
  if (/\b(?:need|safer|settled|understand)\b/.test(t)) return "needs";
  if (/\b(?:cost|trade|gain|lose)\b/.test(t)) return "trade-offs";
  if (/\b(?:always|again|pattern|usually|before)\b/.test(t)) return "patterns";
  if (/\b(?:ready|today|possible|too much)\b/.test(t)) return "readiness";
  if (/\b(?:mean|afraid|really about|weight)\b/.test(t)) return "meaning";
  if (userTurns <= 1) return "what-happened";
  if (userTurns === 2) return "meaning";
  if (userTurns === 3) return "values";
  if (userTurns === 4) return "needs";
  if (userTurns === 5) return "options";
  if (userTurns === 6) return "trade-offs";
  if (userTurns === 7) return "patterns";
  return "readiness";
}

function buildCandidateQuestions(
  session: TalkItOutSession,
  userText: string,
  signal: SituationSignal,
): RciCandidateQuestion[] {
  const used = new Set(session.usedQuestionIds);
  const userTurns = session.messages.filter((m) => m.role === "user").length;
  const preferred = areaForTurn(userTurns, userText);
  const out: RciCandidateQuestion[] = [];

  for (const q of SITUATION_QUESTIONS[signal]) {
    if (!used.has(q.id)) {
      out.push({ id: q.id, text: q.text, area: "meaning" });
    }
  }

  const preferredBank = TALK_IT_OUT_QUESTIONS.filter(
    (q) => q.area === preferred && !used.has(q.id),
  );
  const restBank = TALK_IT_OUT_QUESTIONS.filter(
    (q) => q.area !== preferred && !used.has(q.id),
  );
  for (const q of [...preferredBank, ...restBank]) {
    out.push({ id: q.id, text: q.text, area: q.area });
  }
  return out;
}

function mapRciKind(kind: RciResponseKind): TalkItOutResponseKind {
  switch (kind) {
    case "future-feeling":
      return "future_feeling";
    case "invite-continue":
      return "invite_continue";
    case "gentle-observation":
      return "observation";
    case "thoughtful-question":
      return "question";
    case "tentative-pattern":
    case "connection":
    case "clarification":
    case "summary":
    case "completion-check":
      return "observation";
    default:
      return "question";
  }
}

/**
 * When RCI returns a generic observation, prefer situation-tuned observation
 * on early turns so Talk It Out still feels specific.
 */
function maybeSituationLead(
  signal: SituationSignal,
  userText: string,
  rciText: string,
  kind: RciResponseKind,
  seed: number,
): string {
  if (signal === "general") return rciText;
  if (kind !== "gentle-observation" && kind !== "thoughtful-question") {
    return rciText;
  }
  // If RCI already used a sit- question or situation language, keep it.
  if (/sit-|equally|breathe|protect|collaborat|hanging|hesitat/i.test(rciText)) {
    return rciText;
  }
  const obs = pickRotating(SITUATION_OBSERVATIONS[signal], seed);
  if (kind === "gentle-observation" && !rciText.includes("?")) {
    return obs.includes("?") ? obs : `${obs}\n\n${rciText}`;
  }
  if (kind === "thoughtful-question" && seed % 2 === 0) {
    if (obs.includes("?")) return obs;
    return `${obs}\n\n${rciText}`;
  }
  void userText;
  return rciText;
}

export type TalkItOutTurnResult = {
  assistantText: string;
  questionId?: string;
  explicitHelpRequested: boolean;
  futureFeelingAsked: boolean;
  helpOffer?: string;
  responseKind?: TalkItOutResponseKind;
  /** Hidden Thinking Map — never show to members. */
  thinkingMap?: ThinkingMap;
};

/**
 * Build Shari's next Talk It Out turn via shared RCI.
 * Never auto-routes; help offer only when explicit.
 */
export function buildTalkItOutTurn(
  session: TalkItOutSession,
  userText: string,
): TalkItOutTurnResult {
  const explicit = detectsExplicitHelpRequest(userText);
  const seed = session.messages.length + userText.length;

  if (explicit) {
    const lead = pickRotating(
      [
        "We can keep talking this through.",
        "You do not have to leave this conversation to get more help.",
      ],
      seed,
    );
    return {
      assistantText: `${lead} ${TALK_IT_OUT_HELP_OFFER}`,
      explicitHelpRequested: true,
      futureFeelingAsked: session.futureFeelingAsked,
      helpOffer: TALK_IT_OUT_HELP_OFFER,
      responseKind: "help_offer",
      thinkingMap: session.thinkingMap,
    };
  }

  // CRCI — clarify confusion before any new reflective question (package 184).
  const repair = tryConversationRepair({
    experienceId: "talk-it-out",
    userText,
    messages: session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });
  if (repair.needsRepair && repair.assistantText) {
    let prefsTone: ReturnType<typeof getPrefs>["aiTone"] = "balanced";
    try {
      prefsTone = getPrefs().aiTone;
    } catch {
      /* SSR / tests */
    }
    const recentAssistantTexts = session.messages
      .filter((m) => m.role === "assistant")
      .map((m) => m.content)
      .slice(-4);
    const delivered = deliverConversationalResponse({
      experienceId: "talk-it-out",
      draftText: repair.assistantText,
      userText,
      responseKind: "clarification",
      archetype: session.thinkingMap?.archetype,
      aiTone: prefsTone,
      recentAssistantTexts,
      preferBrevity: true,
    });
    return {
      assistantText: delivered.text,
      explicitHelpRequested: false,
      futureFeelingAsked: session.futureFeelingAsked,
      responseKind: "repair",
      thinkingMap: session.thinkingMap,
    };
  }

  const signal = detectSituation(userText);
  const candidates = buildCandidateQuestions(session, userText, signal);
  const messages = session.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const rci = runReflectiveTurn({
    experienceId: "talk-it-out",
    messages,
    userText,
    previousMap: session.thinkingMap ?? null,
    usedQuestionIds: session.usedQuestionIds,
    candidateQuestions: candidates,
    futureFeelingAlreadyAsked: session.futureFeelingAsked,
  });

  const draft = maybeSituationLead(
    signal,
    userText,
    rci.assistantText,
    rci.responseKind,
    seed,
  );

  const recentAssistantTexts = session.messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content)
    .slice(-4);

  let prefsTone: ReturnType<typeof getPrefs>["aiTone"] = "balanced";
  try {
    prefsTone = getPrefs().aiTone;
  } catch {
    /* SSR / tests */
  }

  // CI — how Shari says the reflective move (package 183).
  const delivered = deliverConversationalResponse({
    experienceId: "talk-it-out",
    draftText: draft,
    userText,
    responseKind: rci.responseKind,
    archetype: rci.thinkingMap.archetype,
    aiTone: prefsTone,
    recentAssistantTexts,
    preferBrevity: rci.thinkingMap.archetype === "overwhelm",
  });
  const assistantText = delivered.text;

  // Ensure sit question id tracked when situation lead replaced text with sit observation that has ?
  let questionId = rci.questionId;
  if (
    !questionId &&
    signal !== "general" &&
    /breathe|equally urgent|hardest to begin|protecting by waiting|collaboration to feel|hanging over/i.test(
      assistantText,
    )
  ) {
    const sit = SITUATION_QUESTIONS[signal].find((q) =>
      assistantText.includes(q.text.slice(0, 24)),
    );
    if (sit) questionId = sit.id;
  }

  let futureFeelingAsked = rci.futureFeelingAsked;
  if (
    signal === "admin-avoidance" &&
    /feel|tomorrow|hanging/i.test(assistantText)
  ) {
    futureFeelingAsked = true;
  }

  let responseKind = mapRciKind(rci.responseKind);
  if (
    assistantText.includes("?") &&
    (rci.responseKind === "gentle-observation" ||
      draft.includes("\n\n"))
  ) {
    responseKind =
      rci.responseKind === "future-feeling"
        ? "future_feeling"
        : "observation_then_question";
  }

  return {
    assistantText,
    questionId,
    explicitHelpRequested: false,
    futureFeelingAsked,
    responseKind,
    thinkingMap: rci.thinkingMap,
  };
}

export function createOpeningMessage(): {
  id: string;
  content: string;
  createdAt: string;
} {
  return {
    id: uid("tio"),
    content: TALK_IT_OUT_OPENING,
    createdAt: new Date().toISOString(),
  };
}

export function buildDiscoveryDraft(session: TalkItOutSession): string {
  const userBits = session.messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean);
  const last = userBits[userBits.length - 1];
  if (session.userDiscoveries[0]) return session.userDiscoveries[0]!;
  if (last && last.length <= 280) return last;
  return "Something became a little clearer while we talked.";
}

/** Forbidden auto-routing phrases for tests / QA. */
export const TALK_IT_OUT_FORBIDDEN_AUTO_ROUTES = [
  "Open the Chamber",
  "Open the Boardroom",
  "Open Visual Thinking",
  "Open Journal Gazebo",
  "Open Decision Compass",
  "Open Clear My Mind",
  "Open Evidence Vault",
] as const;

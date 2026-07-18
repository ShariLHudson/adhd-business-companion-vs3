/**
 * Talk It Out reflective engine — first consumer of Reflective Conversation Intelligence.
 * Keeps experience-local help boundary + situation-tuned candidate banks.
 */

import { tryConversationRepair } from "@/lib/conversationRepairClarificationIntelligence";
import {
  applyGroundedAcknowledgement,
  deliverConversationalResponse,
} from "@/lib/conversationalIntelligence";
import { runConversationQualityAndRhythm } from "@/lib/conversationQualityRhythmIntelligence";
import {
  applyUserCorrectionToMap,
  buildDirectCorrectionRepair,
  detectsDirectCorrection,
  emptyThinkingMap,
  extractLiteralTopic,
  lastAssistantHadHiddenMeaning,
  runReflectiveTurn,
  updateThinkingMap,
  type RciCandidateQuestion,
  type RciResponseKind,
  type ThinkingMap,
} from "@/lib/reflectiveConversationIntelligence";
import {
  applyTopicContinuityValidation,
  buildTopicSafeClarificationRepair,
  buildUnconfirmedTopicChangePrompt,
  detectsExplicitTopicChange,
  hasActiveTopicAnchor,
  isClarificationRequest,
  recoverTopicFromHistory,
  updateTopicAnchor,
  type TopicAnchor,
} from "@/lib/topicContinuityAnchorIntelligence";
import { replaceBlockedDraft } from "@/lib/goldStandardConversationLibrary";
import {
  processConversationTurn,
  type ConversationRuntimeState,
} from "@/lib/conversationIntelligenceEngine";
import {
  selectConversationDesignPattern,
  type CdpPatternId,
} from "@/lib/conversationDesignPatterns";
import { getPrefs } from "@/lib/companionStore";
import { TALK_IT_OUT_HELP_OFFER, TALK_IT_OUT_OPENING } from "./copy";
import {
  buildCompletionResponse,
  buildTalkItOutSummary,
  detectCompletionSignal,
  shouldStopQuestioning,
} from "./completionIntelligence";
import { classifyTalkItOutIntent } from "./modeBoundaries";
import {
  adaptDraftToPreferences,
  applyExplicitPreferenceStatement,
  loadTalkItOutPreferences,
} from "./personalization";
import {
  extractAnsweredDutyHints,
  filterQuestionCandidates,
  groundedQuestionFallback,
  validateTalkItOutQuestion,
} from "./questionIntelligence";
import { TALK_IT_OUT_QUESTIONS } from "./questions";
import {
  selectStrategyMove,
  type TioStrategyMoveId,
} from "./strategyLibrary";
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
  // Package 192 — stay concrete early; do not jump to "meaning" on turn 2
  if (userTurns <= 2) return "what-happened";
  if (userTurns === 3) return "options";
  if (userTurns === 4) return "values";
  if (userTurns === 5) return "needs";
  if (userTurns === 6) return "trade-offs";
  if (userTurns === 7) return "patterns";
  if (userTurns >= 8) return "meaning";
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
  const hireLike = /\b(?:hir(?:e|ing)|marketing|sales)\b/i.test(userText);
  const concreteContext = hireLike || /\b(?:cost|budget|client|project|role)\b/i.test(userText);

  for (const q of SITUATION_QUESTIONS[signal]) {
    if (!used.has(q.id)) {
      out.push({ id: q.id, text: q.text, area: "meaning" });
    }
  }

  // Package 192/194 — concrete hire questions first on business decisions
  if (hireLike) {
    out.push({
      id: "gsc-hire-why-now",
      text: "What is making you consider hiring one now?",
      area: "what-happened",
    });
    for (const q of TALK_IT_OUT_QUESTIONS) {
      if (q.id.startsWith("wh-hire-") && !used.has(q.id)) {
        out.push({ id: q.id, text: q.text, area: q.area });
      }
    }
  }

  const preferredBank = TALK_IT_OUT_QUESTIONS.filter(
    (q) =>
      q.area === preferred &&
      !used.has(q.id) &&
      !q.id.startsWith("wh-hire-"),
  );
  const restBank = TALK_IT_OUT_QUESTIONS.filter(
    (q) =>
      q.area !== preferred &&
      !used.has(q.id) &&
      !q.id.startsWith("wh-hire-"),
  );
  for (const q of [...preferredBank, ...restBank]) {
    out.push({ id: q.id, text: q.text, area: q.area });
  }
  // Package 203 — drop abstract / banned probes when context is concrete
  return filterQuestionCandidates(out, { concreteContext });
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
  /** CIE runtime state — packages 195–196; never show to members. */
  cieState?: ConversationRuntimeState;
  /** Packages 201 / 207 — internal move + shared pattern */
  strategyMove?: TioStrategyMoveId;
  designPatternId?: CdpPatternId;
  usefulSummary?: string;
  usedStrategyMoves?: string[];
};

/**
 * Build Shari's next Talk It Out turn via shared RCI.
 * Never auto-routes; help offer only when explicit.
 */
function resolveActiveAnchor(
  session: TalkItOutSession,
  thinkingMap: ThinkingMap | undefined,
  messages: { role: "user" | "assistant"; content: string }[],
  userText: string,
): TopicAnchor | null {
  const fromMap = thinkingMap?.topicAnchor ?? session.thinkingMap?.topicAnchor;
  const updated = updateTopicAnchor({
    previous: fromMap,
    userText,
    messages,
  });
  if (hasActiveTopicAnchor(updated)) return updated;
  return (
    recoverTopicFromHistory(messages) ??
    (thinkingMap?.literalTopic
      ? updateTopicAnchor({
          previous: null,
          userText: thinkingMap.literalTopic,
          messages: [],
        })
      : null)
  );
}

function polishTalkItOutDelivery(input: {
  session: TalkItOutSession;
  userText: string;
  draftText: string;
  responseKind: RciResponseKind | "repair" | "clarification";
  repairActive: boolean;
  thinkingMap?: ThinkingMap;
  topicAnchor?: TopicAnchor | null;
  wasClarification?: boolean;
  /** Permission offers / summaries — CIE only blocks permanent failure phrases. */
  validationMode?: "full" | "permanent_bans_only";
}): { text: string; cieState: ConversationRuntimeState } {
  const messages = [
    ...input.session.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      id: m.id,
    })),
    { role: "user" as const, content: input.userText },
  ];
  const thinkingMap = input.thinkingMap ?? input.session.thinkingMap ?? null;
  const primaryTopic =
    input.topicAnchor?.primaryTopic ??
    thinkingMap?.literalTopic ??
    input.session.thinkingMap?.literalTopic ??
    null;

  // Authored offers / summaries — CIE state + permanent ban gate only
  if (input.validationMode === "permanent_bans_only") {
    let text = input.draftText.trim();
    const cie = processConversationTurn({
      conversationId: input.session.id,
      experienceId: "talk-it-out",
      userText: input.userText,
      messages,
      priorState: input.session.cieState ?? null,
      draftText: text,
      repairActive: false,
      thinkingMap,
      validationMode: "permanent_bans_only",
    });
    text = cie.assistantText;
    if (
      /\btake your time(?: with that)?\b/i.test(text) ||
      /\bquieter question underneath\b/i.test(text) ||
      /\bsomething around does\b/i.test(text) ||
      /\blet\'?s stay with\b/i.test(text) ||
      /\bwhat part feels most useful\b/i.test(text)
    ) {
      text = groundedQuestionFallback({
        topicAnchor: primaryTopic,
        userText: input.userText,
      });
    }
    return { text, cieState: cie.state };
  }

  let prefsTone: ReturnType<typeof getPrefs>["aiTone"] = "balanced";
  try {
    prefsTone = getPrefs().aiTone;
  } catch {
    /* SSR / tests */
  }
  const recentAssistantTexts = input.session.messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content)
    .slice(-4);

  const ciKind =
    input.repairActive ||
    input.responseKind === "repair" ||
    input.responseKind === "clarification"
      ? ("clarification" as const)
      : input.responseKind;
  const delivered = deliverConversationalResponse({
    experienceId: "talk-it-out",
    draftText: input.draftText,
    userText: input.userText,
    responseKind: ciKind,
    archetype: input.thinkingMap?.archetype ?? input.session.thinkingMap?.archetype,
    aiTone: prefsTone,
    recentAssistantTexts,
    preferBrevity: true,
  });
  const grounded = applyGroundedAcknowledgement({
    draftText: delivered.text,
    userText: input.userText,
    seed: input.userText.length + delivered.text.length,
    primaryTopic,
  });
  // Package 194 — block gold-standard anti-patterns (structure only, no verbatim scripts)
  const goldSafe = replaceBlockedDraft({
    draftText: grounded.text,
    userText: input.userText,
    topicAnchor: primaryTopic,
    clarificationOrRepair: input.repairActive || input.wasClarification,
    rejectedInterpretations: input.thinkingMap?.rejectedInterpretations,
  });
  // Package 193 — topic continuity before CQRI
  const continuity = applyTopicContinuityValidation({
    draftText: goldSafe.text,
    userText: input.userText,
    anchor: input.topicAnchor ?? null,
    previousAssistantText: recentAssistantTexts[recentAssistantTexts.length - 1],
    repairActive: input.repairActive,
    wasClarification: input.wasClarification,
  });
  const cqri = runConversationQualityAndRhythm({
    experienceId: "talk-it-out",
    userText: input.userText,
    messages: input.session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    draftText: continuity.text,
    responseKind: input.repairActive ? "repair" : input.responseKind,
    archetype: input.thinkingMap?.archetype ?? input.session.thinkingMap?.archetype,
    repairActive: input.repairActive,
    thinkingMap: input.thinkingMap ?? input.session.thinkingMap ?? null,
    recentPhraseUsage: recentAssistantTexts,
  });

  // Packages 195–199 — CIE orchestrates state, gold guidance, critical gates
  const cie = processConversationTurn({
    conversationId: input.session.id,
    experienceId: "talk-it-out",
    userText: input.userText,
    messages,
    priorState: input.session.cieState ?? null,
    draftText: cqri.approvedText,
    repairActive: input.repairActive || input.wasClarification,
    thinkingMap,
    validationMode: "full",
  });

  // Packages 203 / 205 — question quality + conversational preferences
  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content);
  const dutyHints = extractAnsweredDutyHints(userMessages);
  let text = cie.assistantText;
  const qCheck = validateTalkItOutQuestion({
    responseText: text,
    userText: input.userText,
    topicAnchor: primaryTopic,
    priorAssistantTexts: recentAssistantTexts,
    answeredDutyHints: dutyHints,
    concreteContext: Boolean(
      primaryTopic &&
        /\b(?:hir|market|cost|role|client|project)\b/i.test(primaryTopic),
    ),
  });
  if (!qCheck.passed) {
    text = groundedQuestionFallback({
      topicAnchor: primaryTopic,
      userText: input.userText,
      answeredDutyHints: dutyHints,
    });
  }
  text = adaptDraftToPreferences(text, loadTalkItOutPreferences());

  // Package 208 — corrections keep one natural follow-up (observation alone is incomplete)
  if (
    (input.repairActive || input.responseKind === "repair") &&
    !/\?/.test(text) &&
    primaryTopic
  ) {
    const follow = /\bhir|market|sales|assistant/i.test(primaryTopic)
      ? "What is making you consider it now?"
      : "What feels murkiest about it right now?";
    text = `${text.replace(/[.!]+\s*$/, "")}. ${follow}`;
  }

  // Packages 206 / 208 — permanent ban list; never display known failures
  if (
    /\btake your time(?: with that)?\b/i.test(text) ||
    /\bquieter question underneath\b/i.test(text) ||
    /\bsomething around does\b/i.test(text) ||
    /\baround does\b/i.test(text) ||
    /\blet\'?s stay with\b/i.test(text) ||
    /\bwhat part feels most useful\b/i.test(text) ||
    /\bwhat matters most\b/i.test(text)
  ) {
    text = groundedQuestionFallback({
      topicAnchor: primaryTopic,
      userText: input.userText,
      answeredDutyHints: dutyHints,
    });
  }

  return { text, cieState: cie.state };
}

export function buildTalkItOutTurn(
  session: TalkItOutSession,
  userText: string,
): TalkItOutTurnResult {
  const seed = session.messages.length + userText.length;
  const messages = session.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Package 205 — explicit conversational preferences win immediately
  applyExplicitPreferenceStatement(userText);

  // Package 193 — load / update Topic Anchor first
  let topicAnchor = resolveActiveAnchor(
    session,
    session.thinkingMap,
    messages,
    userText,
  );

  // Explicit topic change without a clear new topic — ask, do not guess
  if (
    detectsExplicitTopicChange(userText) &&
    topicAnchor?.topicChangeRequested &&
    !topicAnchor.topicChangeConfirmed &&
    hasActiveTopicAnchor(topicAnchor)
  ) {
    const thinkingMap: ThinkingMap = session.thinkingMap
      ? { ...session.thinkingMap, topicAnchor }
      : { ...emptyThinkingMap(), topicAnchor };
    // Package 206 — every assistant path goes through CIE polish
    const polished = polishTalkItOutDelivery({
      session,
      userText,
      draftText: buildUnconfirmedTopicChangePrompt(topicAnchor.primaryTopic),
      responseKind: "repair",
      repairActive: true,
      thinkingMap,
      topicAnchor,
    });
    return {
      assistantText: polished.text,
      explicitHelpRequested: false,
      futureFeelingAsked: session.futureFeelingAsked,
      responseKind: "repair",
      thinkingMap,
      cieState: polished.cieState,
      designPatternId: "CDP-CLARIFY-REQUEST",
    };
  }

  // Package 192 — direct correction before help / CRCI / RCI
  if (
    detectsDirectCorrection(userText) ||
    (lastAssistantHadHiddenMeaning(messages) &&
      /^(?:no|nope|not really|wrong)\b/i.test(userText.trim()))
  ) {
    let baseMap = session.thinkingMap
      ? { ...session.thinkingMap }
      : emptyThinkingMap();
    if (!baseMap.literalTopic) {
      for (const m of messages) {
        if (m.role !== "user") continue;
        const lit = extractLiteralTopic(m.content);
        if (lit) {
          baseMap = {
            ...baseMap,
            literalTopic: lit,
            situation: baseMap.situation ?? m.content.slice(0, 140),
          };
        }
      }
    }
    if (!baseMap.literalTopic && topicAnchor?.primaryTopic) {
      baseMap.literalTopic = topicAnchor.primaryTopic;
    }
    if (!baseMap.literalTopic) {
      baseMap = updateThinkingMap(baseMap, "", messages);
    }
    const built = buildDirectCorrectionRepair({
      map: baseMap,
      messages,
      seed,
    });
    const thinkingMap = applyUserCorrectionToMap(
      baseMap,
      userText,
      built.rejectedInterpretation,
    );
    if (topicAnchor) {
      thinkingMap.topicAnchor = { ...topicAnchor };
      thinkingMap.literalTopic = topicAnchor.primaryTopic;
    }
    const polished = polishTalkItOutDelivery({
      session,
      userText,
      draftText: built.text,
      responseKind: "repair",
      repairActive: true,
      thinkingMap,
      topicAnchor,
    });
    if (polished.cieState.topicAnchor) {
      thinkingMap.topicAnchor = polished.cieState.topicAnchor;
    }
    return {
      assistantText: polished.text,
      explicitHelpRequested: false,
      futureFeelingAsked: session.futureFeelingAsked,
      responseKind: "repair",
      thinkingMap,
      cieState: polished.cieState,
    };
  }

  // Package 193 — clarification request → topic-safe repair (anchor unchanged)
  if (isClarificationRequest(userText)) {
    const previous =
      [...messages].reverse().find((m) => m.role === "assistant")?.content ??
      "";
    const repairDraft = topicAnchor
      ? buildTopicSafeClarificationRepair({
          anchor: topicAnchor,
          previousAssistantText: previous,
          userText,
        })
      : tryConversationRepair({
          experienceId: "talk-it-out",
          userText,
          messages,
          previousAssistantText: previous,
          primaryTopic: null,
        }).assistantText;
    if (repairDraft) {
      const thinkingMap: ThinkingMap = {
        ...(session.thinkingMap ?? emptyThinkingMap()),
        topicAnchor: topicAnchor
          ? {
              ...topicAnchor,
              lastClarificationRequest: userText.trim().slice(0, 160),
            }
          : null,
        literalTopic:
          topicAnchor?.primaryTopic ??
          session.thinkingMap?.literalTopic ??
          null,
      };
      const polished = polishTalkItOutDelivery({
        session,
        userText,
        draftText: repairDraft,
        responseKind: "repair",
        repairActive: true,
        thinkingMap,
        topicAnchor,
        wasClarification: true,
      });
      if (polished.cieState.topicAnchor) {
        thinkingMap.topicAnchor = polished.cieState.topicAnchor;
      }
      return {
        assistantText: polished.text,
        explicitHelpRequested: false,
        futureFeelingAsked: session.futureFeelingAsked,
        responseKind: "repair",
        thinkingMap,
        cieState: polished.cieState,
      };
    }
  }

  const explicit = detectsExplicitHelpRequest(userText);

  if (explicit) {
    const lead = pickRotating(
      [
        "We can keep talking this through.",
        "You do not have to leave this conversation to get more help.",
      ],
      seed,
    );
    {
      const thinkingMap = session.thinkingMap ?? emptyThinkingMap();
      const polished = polishTalkItOutDelivery({
        session,
        userText,
        draftText: `${lead} ${TALK_IT_OUT_HELP_OFFER}`,
        responseKind: "invite-continue",
        repairActive: false,
        thinkingMap,
        topicAnchor,
        validationMode: "permanent_bans_only",
      });
      return {
        assistantText: polished.text,
        explicitHelpRequested: true,
        futureFeelingAsked: session.futureFeelingAsked,
        helpOffer: TALK_IT_OUT_HELP_OFFER,
        responseKind: "help_offer",
        thinkingMap,
        cieState: polished.cieState,
        designPatternId: "CDP-TRANSITION-PERMISSION",
        strategyMove: "transition_to_action",
      };
    }
  }

  // Package 204 — completion / summary before more reflective questions
  const completionSignal = detectCompletionSignal(userText);
  if (shouldStopQuestioning(completionSignal)) {
    const topic =
      topicAnchor?.primaryTopic ??
      session.thinkingMap?.literalTopic ??
      null;
    const summary = buildTalkItOutSummary({
      topicAnchor: topic,
      knownFacts: session.cieState?.knownFacts
        ?.filter((f) => f.status === "active")
        .map((f) => f.fact),
      currentFocus:
        topicAnchor?.currentFocus ?? session.cieState?.currentFocus?.label,
      concerns: session.thinkingMap?.concerns,
    });
    const draft = buildCompletionResponse({
      signal: completionSignal,
      summary,
      topicAnchor: topic,
    });
    const thinkingMap: ThinkingMap = session.thinkingMap
      ? { ...session.thinkingMap, topicAnchor }
      : { ...emptyThinkingMap(), topicAnchor };
    const polished = polishTalkItOutDelivery({
      session,
      userText,
      draftText: draft,
      responseKind: "summary",
      repairActive: false,
      thinkingMap,
      topicAnchor,
      validationMode: "permanent_bans_only",
    });
    return {
      assistantText: polished.text,
      explicitHelpRequested: false,
      futureFeelingAsked: session.futureFeelingAsked,
      responseKind: "observation",
      thinkingMap,
      cieState: polished.cieState,
      usefulSummary: summary,
      strategyMove: "summarize_what_became_clear",
      designPatternId: "CDP-NATURAL-COMPLETION",
      usedStrategyMoves: [
        ...(session.usedStrategyMoves ?? []),
        "summarize_what_became_clear",
      ],
    };
  }

  // Package 202 — mode boundaries (offer transition; never auto-launch)
  const boundary = classifyTalkItOutIntent(userText);
  if (
    !boundary.stayInTalkItOut &&
    boundary.transitionOffer &&
    (boundary.intent === "creation" ||
      boundary.intent === "planning" ||
      boundary.intent === "formal_decision" ||
      boundary.intent === "expert_advice" ||
      boundary.intent === "reminder")
  ) {
    const thinkingMap = session.thinkingMap ?? emptyThinkingMap();
    const polished = polishTalkItOutDelivery({
      session,
      userText,
      draftText: boundary.transitionOffer,
      responseKind: "invite-continue",
      repairActive: false,
      thinkingMap,
      topicAnchor,
      validationMode: "permanent_bans_only",
    });
    return {
      assistantText: polished.text,
      explicitHelpRequested: false,
      futureFeelingAsked: session.futureFeelingAsked,
      responseKind: "invite_continue",
      thinkingMap,
      cieState: polished.cieState,
      strategyMove: "transition_to_action",
      designPatternId: "CDP-TRANSITION-PERMISSION",
      usedStrategyMoves: [
        ...(session.usedStrategyMoves ?? []),
        "transition_to_action",
      ],
    };
  }

  // CRCI — clarify confusion before any new reflective question (package 184).
  const repair = tryConversationRepair({
    experienceId: "talk-it-out",
    userText,
    messages,
    primaryTopic: topicAnchor?.primaryTopic ?? null,
  });
  if (repair.needsRepair && repair.assistantText) {
    const thinkingMap: ThinkingMap = {
      ...(session.thinkingMap ?? emptyThinkingMap()),
      topicAnchor,
      literalTopic:
        topicAnchor?.primaryTopic ?? session.thinkingMap?.literalTopic ?? null,
    };
    const polished = polishTalkItOutDelivery({
      session,
      userText,
      draftText: repair.assistantText,
      responseKind: "repair",
      repairActive: true,
      thinkingMap,
      topicAnchor,
      wasClarification: true,
    });
    if (polished.cieState.topicAnchor) {
      thinkingMap.topicAnchor = polished.cieState.topicAnchor;
    }
    return {
      assistantText: polished.text,
      explicitHelpRequested: false,
      futureFeelingAsked: session.futureFeelingAsked,
      responseKind: "repair",
      thinkingMap,
      cieState: polished.cieState,
    };
  }

  const signal = detectSituation(userText);
  const candidates = buildCandidateQuestions(session, userText, signal);

  const previousMap: ThinkingMap = {
    ...(session.thinkingMap ?? emptyThinkingMap()),
    topicAnchor,
    literalTopic:
      topicAnchor?.primaryTopic ?? session.thinkingMap?.literalTopic ?? null,
  };

  const rci = runReflectiveTurn({
    experienceId: "talk-it-out",
    messages,
    userText,
    previousMap,
    usedQuestionIds: session.usedQuestionIds,
    candidateQuestions: candidates,
    futureFeelingAlreadyAsked: session.futureFeelingAsked,
  });

  // Refresh anchor from RCI map (may set primary on opening turn)
  topicAnchor =
    rci.thinkingMap.topicAnchor ??
    resolveActiveAnchor(session, rci.thinkingMap, messages, userText);

  const draft = maybeSituationLead(
    signal,
    userText,
    rci.assistantText,
    rci.responseKind,
    seed,
  );

  const thinkingMap: ThinkingMap = {
    ...rci.thinkingMap,
    topicAnchor,
    literalTopic: topicAnchor?.primaryTopic ?? rci.thinkingMap.literalTopic,
  };

  const polished = polishTalkItOutDelivery({
    session,
    userText,
    draftText: draft,
    responseKind: rci.responseKind,
    repairActive: false,
    thinkingMap,
    topicAnchor,
  });
  const assistantText = polished.text;
  if (polished.cieState.topicAnchor) {
    thinkingMap.topicAnchor = polished.cieState.topicAnchor;
  }

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

  const hireLike = /\b(?:hir(?:e|ing)|marketing|sales)\b/i.test(userText);
  const strategyMove = selectStrategyMove({
    phase: polished.cieState.conversationPhase,
    priorityEvent: polished.cieState.clarificationState?.repairRequired
      ? "clarification_request"
      : "normal",
    turnCount: polished.cieState.turnCount,
    usedMoves: session.usedStrategyMoves ?? [],
    hireLike,
  });
  const designPatternId = selectConversationDesignPattern({
    experienceId: "talk-it-out",
    mode: polished.cieState.primaryMode,
    completion: false,
  });

  return {
    assistantText,
    questionId,
    explicitHelpRequested: false,
    futureFeelingAsked,
    responseKind,
    thinkingMap,
    cieState: polished.cieState,
    strategyMove,
    designPatternId,
    usedStrategyMoves: [...(session.usedStrategyMoves ?? []), strategyMove],
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

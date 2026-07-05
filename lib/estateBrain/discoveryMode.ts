/**
 * Discovery Mode™ — understand goal, obstacle, and outcome before routing.
 *
 * User Request → Intent → Discovery → Confidence → Capability → Experience → Prepare → Navigate
 */

import {
  DISCOVERY_INTROS,
  DISCOVERY_QUESTIONS,
  questionsForTopic,
} from "./discoveryRegistry";
import {
  preparationLineForSession,
  discoveryExpertHint,
} from "./discoveryPreparation";
import {
  computeDiscoveryConfidence,
  DISCOVERY_CONFIDENCE_THRESHOLD,
  isDiscoveryComplete,
  type DiscoveryConfidence,
  type DiscoverySession,
  type DiscoveryTopic,
  type DiscoveryTurnResult,
  type EstateDiscoveryReadyAction,
} from "./discoveryTypes";
import {
  formatEstateCoachingMenu,
  focusCoachingMenuForObstacle,
  resolveEstateCoachingMenu,
} from "./estateCoaching";
import { resolveIntentFirstRoute } from "./routeIntentFirstNavigation";
import { resolveImmediateResearchOpen } from "./routeEstateIntelligence";
import { isResearchIntent } from "./researchRouting";
import { resolveImmediateCreateAction } from "@/lib/createExperience/createExperienceRouting";
import { detectEstateIntent } from "./intentCategories";
import {
  prefillDiscoveryFromAdaptiveMemory,
  recordSignalsFromDiscoveryAnswer,
} from "./adaptiveIntelligence";
import { adaptiveEstateHintForChat } from "./adaptiveIntelligence";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";

const STORAGE_KEY = "estate-discovery-session-v1";

const EXPLICIT_ROOM_NAV_RE =
  /\b(?:take me to|bring me to|go to|open|show me|step into)\b/i;

const SOP_DISCOVERY_RE =
  /\b(?:help me (?:create|write|build|make)|create|write|draft|need).*\bsop\b|\bsop\b.*(?:help|create|write)/i;

const FOCUS_DISCOVERY_RE =
  /\b(?:need to focus|help me focus|can'?t concentrate|distracted|procrastinat|can'?t get started|keep getting interrupted|need to get (?:something|this) done|hard to focus)\b/i;

const BUSINESS_GROWTH_RE =
  /\b(?:grow my business|grow (?:the|my) company|scale my business|help growing|business growth|take my business)\b/i;

const DISCOVERY_MARKER_RE =
  /let me understand what you'?re trying to build|what do you think is making it hardest|what feels most important right now|what kind of research would help most|what would success look like/i;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function detectDiscoveryTopic(userText: string): DiscoveryTopic | null {
  const t = userText.trim();
  if (!t) return null;
  if (SOP_DISCOVERY_RE.test(t)) return "create_sop";
  if (FOCUS_DISCOVERY_RE.test(t) && !/\boverwhelm/i.test(t)) return "focus";
  if (BUSINESS_GROWTH_RE.test(t)) return "business_growth";
  if (isResearchIntent(t) && /\bresearch\b/i.test(t)) return "research";
  return null;
}

export function shouldEnterDiscoveryMode(userText: string): boolean {
  const t = userText.trim();
  if (!t || EXPLICIT_ROOM_NAV_RE.test(t)) return false;
  if (shouldEnterUniversalCreation(t)) return false;
  const topic = detectDiscoveryTopic(t);
  if (!topic) return false;

  const session = buildInitialSession(t, topic, 0);
  return !isDiscoveryComplete(session.confidence);
}

export function isDiscoveryMessage(text: string): boolean {
  return DISCOVERY_MARKER_RE.test(text);
}

export function saveDiscoverySession(session: DiscoverySession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadDiscoverySession(): DiscoverySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiscoverySession;
  } catch {
    return null;
  }
}

function initialConfidenceForTopic(
  topic: DiscoveryTopic,
  userText: string,
): Omit<DiscoveryConfidence, "score"> {
  const flags = {
    goal: false,
    obstacle: false,
    outcome: false,
    context: false,
  };

  switch (topic) {
    case "create_sop":
      flags.goal = true;
      applySignals(userText, DISCOVERY_QUESTIONS.create_sop, flags);
      break;
    case "focus":
      flags.goal = true;
      applySignals(userText, DISCOVERY_QUESTIONS.focus, flags);
      break;
    case "business_growth":
      applySignals(userText, DISCOVERY_QUESTIONS.business_growth, flags);
      break;
    case "research":
      flags.goal = true;
      flags.context = true;
      applySignals(userText, DISCOVERY_QUESTIONS.research, flags);
      break;
  }

  return flags;
}

function applySignals(
  text: string,
  questions: readonly { id: string; slot: keyof Omit<DiscoveryConfidence, "score">; signalPatterns?: readonly RegExp[] }[],
  flags: Omit<DiscoveryConfidence, "score">,
) {
  for (const q of questions) {
    if (!q.signalPatterns) continue;
    if (q.signalPatterns.some((re) => re.test(text))) {
      flags[q.slot] = true;
    }
  }
}

function buildInitialSession(
  userText: string,
  topic: DiscoveryTopic,
  turn: number,
): DiscoverySession {
  const memoryAnswers = prefillDiscoveryFromAdaptiveMemory(topic);
  const extracted = extractPrefilledAnswers(userText, topic);
  const answers = { ...memoryAnswers, ...extracted };
  const flags = initialConfidenceForTopic(topic, userText);
  for (const q of questionsForTopic(topic)) {
    if (answers[q.id]) flags[q.slot] = true;
  }
  let questionIndex = 0;
  const questions = questionsForTopic(topic);
  while (questionIndex < questions.length && answers[questions[questionIndex]!.id]) {
    questionIndex += 1;
  }
  return {
    topic,
    confidence: computeDiscoveryConfidence(flags),
    answers,
    questionIndex,
    originalUserText: userText,
    startedAtTurn: turn,
  };
}

function extractPrefilledAnswers(
  userText: string,
  topic: DiscoveryTopic,
): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const q of questionsForTopic(topic)) {
    if (q.signalPatterns?.some((re) => re.test(userText))) {
      answers[q.id] = userText.trim();
    }
  }
  return answers;
}

function nextUnansweredQuestion(session: DiscoverySession) {
  const questions = questionsForTopic(session.topic);
  for (let i = session.questionIndex; i < questions.length; i++) {
    const q = questions[i]!;
    if (!session.answers[q.id]) return { question: q, index: i };
  }
  return null;
}

function applyAnswer(
  session: DiscoverySession,
  questionId: string,
  answer: string,
): DiscoverySession {
  const questions = questionsForTopic(session.topic);
  const question = questions.find((q) => q.id === questionId);
  if (!question) return session;

  const answers = { ...session.answers, [questionId]: answer.trim() };
  recordSignalsFromDiscoveryAnswer(questionId, answer);
  const flags = {
    goal: session.confidence.goal,
    obstacle: session.confidence.obstacle,
    outcome: session.confidence.outcome,
    context: session.confidence.context,
  };
  flags[question.slot] = true;

  if (session.topic === "focus" && questionId === "focus-obstacle") {
    flags.outcome = true;
    flags.context = true;
  }

  return {
    ...session,
    answers,
    questionIndex: session.questionIndex + 1,
    confidence: computeDiscoveryConfidence(flags),
  };
}

function readyMessage(
  session: DiscoverySession,
  action: EstateDiscoveryReadyAction,
): string {
  const prep = preparationLineForSession(session);
  switch (action.kind) {
    case "coaching_menu":
      return [prep, "", formatEstateCoachingMenu(action.menu)].join("\n");
    case "create_open":
      return [action.preparationLine, "", action.payload.followUpLine].join(
        "\n",
      );
    case "research_open":
      return [action.preparationLine, "", action.payload.followUpLine].join(
        "\n",
      );
    case "navigate":
      return [action.preparationLine, "", action.payload.followUpLine].join(
        "\n",
      );
  }
}

function resolveReadyAction(
  session: DiscoverySession,
): EstateDiscoveryReadyAction | null {
  switch (session.topic) {
    case "create_sop": {
      const combined = Object.values(session.answers).join(" ");
      const text = `${session.originalUserText} ${combined}`;
      const payload = resolveImmediateCreateAction(text);
      if (!payload) return null;
      const preparationLine = preparationLineForSession(session);
      return { kind: "create_open", payload, preparationLine };
    }
    case "focus": {
      const obstacle =
        session.answers["focus-obstacle"] ?? session.originalUserText;
      const menu = focusCoachingMenuForObstacle(obstacle);
      return {
        kind: "coaching_menu",
        menu,
        preparationLine: preparationLineForSession(session),
      };
    }
    case "business_growth": {
      const combined = Object.values(session.answers).join(" ");
      const route = resolveIntentFirstRoute(
        `${session.originalUserText} ${combined}`,
      );
      if (!route) {
        const menu = resolveEstateCoachingMenu(session.originalUserText);
        if (!menu) return null;
        return { kind: "coaching_menu", menu };
      }
      const menu = resolveEstateCoachingMenu(
        `${session.originalUserText} ${combined}`,
      );
      if (menu) {
        return {
          kind: "coaching_menu",
          menu,
          preparationLine: preparationLineForSession(session),
        };
      }
      return null;
    }
    case "research": {
      const depth = session.answers["research-depth"] ?? "";
      const combined = `${session.originalUserText} ${depth}`;
      const payload = resolveImmediateResearchOpen(combined);
      if (!payload) {
        const route = resolveIntentFirstRoute(combined);
        if (!route?.answerInConversation) return null;
      }
      const researchPayload =
        payload ?? resolveImmediateResearchOpen(session.originalUserText);
      if (!researchPayload) return null;
      return {
        kind: "research_open",
        payload: researchPayload,
        preparationLine: preparationLineForSession(session),
      };
    }
    default:
      return null;
  }
}

export function advanceDiscoverySession(
  session: DiscoverySession,
  userReply: string,
): DiscoveryTurnResult | null {
  const next = nextUnansweredQuestion(session);
  if (!next) {
    if (!isDiscoveryComplete(session.confidence)) {
      session = {
        ...session,
        confidence: computeDiscoveryConfidence({
          goal: true,
          obstacle: true,
          outcome: true,
          context: true,
        }),
      };
    }
    const action = resolveReadyAction(session);
    if (!action) return null;
    return {
      kind: "ready",
      session,
      message: readyMessage(session, action),
      action,
    };
  }

  const updated = applyAnswer(session, next.question.id, userReply);
  if (isDiscoveryComplete(updated.confidence)) {
    const action = resolveReadyAction(updated);
    if (!action) return null;
    return {
      kind: "ready",
      session: updated,
      message: readyMessage(updated, action),
      action,
    };
  }

  const upcoming = nextUnansweredQuestion(updated);
  if (!upcoming) return null;

  return {
    kind: "question",
    question: upcoming.question.prompt,
    session: { ...updated, questionIndex: upcoming.index },
  };
}

export function startDiscoveryTurn(
  userText: string,
  currentTurn: number,
): DiscoveryTurnResult | null {
  const topic = detectDiscoveryTopic(userText);
  if (!topic) return null;

  const session = buildInitialSession(userText, topic, currentTurn);
  if (isDiscoveryComplete(session.confidence)) {
    const action = resolveReadyAction(session);
    if (!action) return null;
    return {
      kind: "ready",
      session,
      message: readyMessage(session, action),
      action,
    };
  }

  const next = nextUnansweredQuestion(session);
  if (!next) return null;

  return {
    kind: "question",
    intro: DISCOVERY_INTROS[topic],
    question: next.question.prompt,
    session: { ...session, questionIndex: next.index },
  };
}

const FOCUS_SUPPORT_FOLLOW_UP_RE =
  /choose one focus thread|what needs your attention most/i;

function resolveFocusSupportDiscoveryFollowUp(
  userText: string,
  currentTurn: number,
  lastAssistantText: string,
): DiscoveryTurnResult | null {
  if (!FOCUS_SUPPORT_FOLLOW_UP_RE.test(lastAssistantText)) return null;

  const session = buildInitialSession("I need to focus", "focus", currentTurn);
  const updated = applyAnswer(session, "focus-obstacle", userText);
  if (!isDiscoveryComplete(updated.confidence)) return null;

  const action = resolveReadyAction(updated);
  if (!action) return null;

  return {
    kind: "ready",
    session: updated,
    message: readyMessage(updated, action),
    action,
  };
}

export function resolveDiscoveryTurn(
  userText: string,
  currentTurn: number,
  lastAssistantText?: string,
): DiscoveryTurnResult | null {
  if (lastAssistantText && isDiscoveryMessage(lastAssistantText)) {
    const stored = loadDiscoverySession();
    if (stored) {
      return advanceDiscoverySession(stored, userText);
    }
  }

  if (lastAssistantText) {
    const focusFollowUp = resolveFocusSupportDiscoveryFollowUp(
      userText,
      currentTurn,
      lastAssistantText,
    );
    if (focusFollowUp) return focusFollowUp;
  }

  if (!shouldEnterDiscoveryMode(userText)) return null;
  return startDiscoveryTurn(userText, currentTurn);
}

export function discoveryHint(
  session: DiscoverySession,
  turn: DiscoveryTurnResult,
): string {
  const experts = discoveryExpertHint(session);
  const adaptive = adaptiveEstateHintForChat();
  if (turn.kind === "question") {
    return (
      `DISCOVERY MODE: Topic=${session.topic} · Confidence=${session.confidence.score}% · ` +
      `Ask ONE thoughtful question — never a form. ${experts}\n${adaptive}`
    );
  }
  return (
    `DISCOVERY MODE COMPLETE: Confidence=${session.confidence.score}% · ` +
    `Prepare environment before navigate. ${experts}\n${adaptive}`
  );
}

export function formatDiscoveryQuestion(turn: DiscoveryTurnResult): string {
  if (turn.kind === "ready") return turn.message;
  const parts: string[] = [];
  if (turn.intro) parts.push(turn.intro, "");
  parts.push(turn.question);
  return parts.join("\n");
}

export function clearDiscoverySession(): void {
  saveDiscoverySession(null);
}

/** Enough context in one message to skip discovery (e.g. highly specific email). */
export function hasSufficientDiscoveryContext(userText: string): boolean {
  const topic = detectDiscoveryTopic(userText);
  if (!topic) return false;
  const session = buildInitialSession(userText, topic, 0);
  return isDiscoveryComplete(session.confidence);
}

export function discoveryTopicLabel(topic: DiscoveryTopic): string {
  const intent = detectEstateIntent(
    topic === "create_sop" ? "create sop" : topic.replace("_", " "),
  );
  return intent?.category ?? topic;
}
